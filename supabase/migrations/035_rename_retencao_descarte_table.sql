-- Migration 035: cria tabela retention_disposals com nomes em inglês
-- (tabela retencao_descarte nunca foi aplicada em produção)

create table if not exists public.retention_disposals (
  id                  uuid default gen_random_uuid() primary key,
  company_id          uuid references public.companies(id) on delete cascade not null,

  -- Item identification
  data_type           text not null,
  category            text not null,

  -- Retention policy
  retention_period    text not null,
  start_event         text not null,
  event_date          date,
  expiration_date     date,
  legal_basis         text not null,

  -- Prescription / decadence
  prescription_period text,
  decadence_period    text,

  -- Disposition and hold
  hold_possible       boolean default false,
  final_disposition   text,
  hold_active         boolean default false,
  hold_reason         text,

  -- Notes and history
  notes               text,
  action_history      jsonb default '[]',

  -- Calculated status (regular | expiring_soon | overdue | hold)
  -- computed via trigger instead of generated column (current_date is not immutable)
  calculated_status   text not null default 'regular',

  created_by          uuid references auth.users(id),
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

create trigger set_retention_disposals_updated_at
  before update on public.retention_disposals
  for each row execute function public.set_updated_at();

-- Trigger to keep calculated_status in sync
create or replace function public.sync_retention_disposal_status()
returns trigger language plpgsql as $$
begin
  new.calculated_status :=
    case
      when new.hold_active then 'hold'
      when new.expiration_date is null then 'regular'
      when new.expiration_date < current_date then 'overdue'
      when new.expiration_date < current_date + interval '60 days' then 'expiring_soon'
      else 'regular'
    end;
  return new;
end;
$$;

create trigger calc_retention_disposal_status
  before insert or update on public.retention_disposals
  for each row execute function public.sync_retention_disposal_status();

alter table public.retention_disposals enable row level security;

create policy "user_can_manage_retention_disposals" on public.retention_disposals
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );
