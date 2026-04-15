-- Site Verifier / Cookie Scanner Module

create table public.site_scans (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,

  -- Target
  url text not null,
  domain text not null,

  -- Status
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'error')),
  error_message text,

  -- Results
  cookies jsonb default '[]',           -- list of detected cookies
  technologies jsonb default '[]',      -- CMS, analytics, ads detected
  has_cookie_banner boolean,
  has_privacy_policy boolean,
  privacy_policy_url text,
  compliance_score integer,             -- 0-100
  issues jsonb default '[]',            -- list of issues found
  recommendations jsonb default '[]',  -- list of recommendations

  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null
);

alter table public.site_scans enable row level security;

create policy "user_can_manage_scans" on public.site_scans
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );
