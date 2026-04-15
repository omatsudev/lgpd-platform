-- Security Incident Management Module (LGPD Art. 48)

create table public.incidents (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,

  -- Identification
  title text not null,
  type text not null check (type in (
    'data_breach', 'unauthorized_access', 'data_loss',
    'improper_modification', 'misuse', 'ransomware', 'phishing', 'other'
  )),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'identified' check (status in (
    'identified', 'under_investigation', 'contained', 'resolved', 'closed'
  )),

  -- Dates
  occurrence_date date,
  discovery_date date not null,

  -- Detail
  description text not null,
  affected_data text,
  affected_data_categories jsonb default '[]',
  affected_subjects_count text,
  root_cause text,

  -- Response
  immediate_measures text,
  corrective_measures text,
  responsible text,

  -- Regulatory notifications (Art. 48 LGPD)
  notified_anpd boolean default false,
  anpd_notification_date date,
  anpd_protocol text,
  notified_subjects boolean default false,
  subjects_notification_date date,

  -- Metadata
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.incidents enable row level security;

create policy "user_can_manage_incidents" on public.incidents
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

-- Updated_at trigger
create trigger set_incidents_updated_at before update on public.incidents
  for each row execute function public.set_updated_at();
