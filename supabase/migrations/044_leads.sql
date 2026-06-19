create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefone text not null,
  cargo text not null,
  site_empresa text,
  assunto text not null,
  aceite_comercial boolean not null default false,
  aceite_privacidade boolean not null default true,
  source_ip text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "leads_insert_anon"
  on public.leads for insert
  to anon
  with check (true);

create policy "leads_insert_authenticated"
  on public.leads for insert
  to authenticated
  with check (true);

create policy "leads_select_authenticated"
  on public.leads for select
  to authenticated
  using (true);
