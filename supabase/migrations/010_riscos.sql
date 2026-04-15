-- LGPD Risk Management Module

create table if not exists public.risks (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,

  -- Identification
  title text not null,
  description text,
  category text not null check (category in (
    'privacy', 'security', 'legal', 'operational', 'reputational', 'technological'
  )),

  -- Origin
  origin text check (origin in ('inventory', 'incident', 'audit', 'supplier', 'internal', 'other')),

  -- UUIDs without direct FK to avoid migration order dependency
  inventory_id uuid,
  incident_id uuid,

  -- Inherent assessment (before controls)
  inherent_probability integer not null check (inherent_probability between 1 and 5),
  inherent_impact integer not null check (inherent_impact between 1 and 5),

  -- Residual assessment (after controls)
  residual_probability integer check (residual_probability between 1 and 5),
  residual_impact integer check (residual_impact between 1 and 5),

  -- Treatment
  strategy text check (strategy in ('accept', 'mitigate', 'transfer', 'avoid')),
  action_plan text,
  responsible text,
  deadline date,

  -- Status
  status text not null default 'identified' check (status in (
    'identified', 'under_treatment', 'monitoring', 'closed'
  )),

  -- Metadata
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.risks enable row level security;

create policy "user_can_manage_risks" on public.risks
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

create trigger set_risks_updated_at before update on public.risks
  for each row execute function public.set_updated_at();
