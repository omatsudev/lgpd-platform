-- LGPD Document Management Module

create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,

  -- Identification
  title text not null,
  type text not null check (type in (
    'privacy_policy', 'privacy_notice', 'security_policy',
    'consent_form', 'dpa_contract', 'dpia', 'internal_procedure',
    'audit_report', 'other'
  )),
  description text,
  version text not null default '1.0',

  -- Content
  content text,
  file_url text,
  file_name text,

  -- Control
  status text not null default 'draft' check (status in ('draft', 'under_review', 'approved', 'published', 'obsolete')),
  responsible text,
  approval_date date,
  review_date date,
  expiration_date date,

  -- Metadata
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.documents enable row level security;

create policy "user_can_manage_documents" on public.documents
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

-- Updated_at trigger
create trigger set_documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();
