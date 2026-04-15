-- LGPD Consent Management Module

-- Consent purposes configured by the company
create table public.consent_purposes (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  description text not null,
  legal_basis text not null default 'consent',
  required boolean default false,
  active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Consent records from data subjects
create table public.consents (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  purpose_id uuid references public.consent_purposes(id) on delete cascade not null,

  -- Data subject
  subject_name text,
  subject_email text not null,
  subject_tax_id text,

  -- Consent
  accepted boolean not null,
  policy_version text,
  channel text not null default 'web' check (channel in ('web', 'app', 'in_person', 'email', 'api')),
  source_ip text,
  user_agent text,

  -- Revocation
  revoked boolean default false,
  revoked_at timestamptz,
  revocation_reason text,

  created_at timestamptz default now() not null
);

-- RLS — consent_purposes
alter table public.consent_purposes enable row level security;

create policy "user_can_manage_consent_purposes" on public.consent_purposes
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

-- RLS — consents (authenticated read + public insert via API)
alter table public.consents enable row level security;

create policy "user_can_read_consents" on public.consents
  for select using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

create policy "public_can_insert_consent" on public.consents
  for insert with check (true);

create policy "public_can_update_revocation" on public.consents
  for update using (true) with check (true);

-- Updated_at trigger for consent_purposes
create trigger set_consent_purposes_updated_at before update on public.consent_purposes
  for each row execute function public.set_updated_at();
