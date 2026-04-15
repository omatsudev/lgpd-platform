-- Site Verifier / Cookie Scanner Module

create table if not exists public.site_scans (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  created_at timestamptz default now() not null
);

-- Add missing columns if they don't exist
alter table public.site_scans
  add column if not exists company_id uuid references public.companies(id) on delete cascade,
  add column if not exists domain text,
  add column if not exists status text not null default 'pending',
  add column if not exists error_message text,
  add column if not exists cookies jsonb default '[]',
  add column if not exists technologies jsonb default '[]',
  add column if not exists has_cookie_banner boolean,
  add column if not exists has_privacy_policy boolean,
  add column if not exists privacy_policy_url text,
  add column if not exists compliance_score integer,
  add column if not exists issues jsonb default '[]',
  add column if not exists recommendations jsonb default '[]',
  add column if not exists created_by uuid references auth.users(id);

-- Add check constraint if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'site_scans' and constraint_name = 'site_scans_status_check'
  ) then
    alter table public.site_scans
      add constraint site_scans_status_check check (status in ('pending', 'processing', 'completed', 'error'));
  end if;
end $$;

alter table public.site_scans enable row level security;

-- Drop and recreate policy to ensure it's up to date
drop policy if exists "user_can_manage_scans" on public.site_scans;
create policy "user_can_manage_scans" on public.site_scans
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );
