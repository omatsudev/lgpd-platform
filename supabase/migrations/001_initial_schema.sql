-- LGPD Platform — Initial Schema (English identifiers)
-- Run in Supabase SQL Editor

-- Enable UUID extension

-- =============================================
-- TABLE: companies
-- =============================================
create table public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  tax_id text,
  slug text unique not null,
  sector text,
  owner_id uuid references auth.users(id) on delete set null,
  dpo_id uuid references auth.users(id) on delete set null,
  dpo_name text,
  dpo_email text,
  dpo_phone text,
  compliance_score integer default 0,
  privacy_policy_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABLE: user_companies (multi-tenant: DPO manages multiple companies)
-- =============================================
create table public.user_companies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  role text not null check (role in ('admin', 'dpo', 'empresa', 'colaborador')),
  created_at timestamptz default now() not null,
  unique(user_id, company_id)
);

-- =============================================
-- TABLE: data_inventory
-- =============================================
create table public.data_inventory (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  data_type text not null,
  purpose text not null,
  legal_basis text not null,
  storage_location text not null,
  retention_period text,
  responsible text,
  security_measures text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABLE: trainings
-- =============================================
create table public.trainings (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  title text not null,
  description text,
  video_url text,
  pdf_url text,
  questions jsonb, -- array of questions with answer options
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABLE: training_employees
-- =============================================
create table public.training_employees (
  id uuid default gen_random_uuid() primary key,
  training_id uuid references public.trainings(id) on delete cascade not null,
  employee_id uuid references auth.users(id) on delete cascade,
  employee_name text not null,
  employee_email text,
  employee_whatsapp text,
  access_link text unique not null,
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  progress integer default 0,
  certificate_url text,
  completed_at timestamptz,
  created_at timestamptz default now() not null
);

-- =============================================
-- TABLE: complaints
-- =============================================
create table public.complaints (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  anonymous boolean default true not null,
  name text,
  email text,
  type text not null,
  description text not null,
  status text default 'received' check (status in ('received', 'under_review', 'resolved')) not null,
  response text,
  responded_by uuid references auth.users(id),
  source_ip text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABLE: data_subject_requests
-- =============================================
create table public.data_subject_requests (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  type text not null check (type in ('access', 'deletion', 'correction', 'portability', 'objection')),
  name text not null,
  email text not null,
  cpf text,
  description text not null,
  status text default 'pending' check (status in ('pending', 'under_review', 'completed', 'rejected')) not null,
  response text,
  responded_by uuid references auth.users(id),
  response_deadline date not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABLE: audit_logs
-- =============================================
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  action text not null,
  resource text not null,
  details text,
  ip text,
  created_at timestamptz default now() not null
);

-- Logs are immutable (no update/delete allowed via RLS)

-- =============================================
-- TABLE: notifications
-- =============================================
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info', 'warning', 'error', 'success')),
  read boolean default false,
  created_at timestamptz default now() not null
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table public.companies enable row level security;
alter table public.user_companies enable row level security;
alter table public.data_inventory enable row level security;
alter table public.trainings enable row level security;
alter table public.training_employees enable row level security;
alter table public.complaints enable row level security;
alter table public.data_subject_requests enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- Policies: user can only access companies they are linked to
create policy "user_can_see_own_companies" on public.companies
  for select using (
    id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );

create policy "user_can_manage_data_inventory" on public.data_inventory
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

create policy "user_can_manage_complaints" on public.complaints
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

create policy "user_can_manage_data_subject_requests" on public.data_subject_requests
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

-- Logs: read-only for company members
create policy "user_can_read_logs" on public.audit_logs
  for select using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

-- Notifications: only the owner
create policy "user_can_see_own_notifications" on public.notifications
  for all using (user_id = auth.uid());

-- =============================================
-- FUNCTION: auto-update updated_at
-- =============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_companies_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

create trigger set_data_inventory_updated_at before update on public.data_inventory
  for each row execute function public.set_updated_at();

create trigger set_complaints_updated_at before update on public.complaints
  for each row execute function public.set_updated_at();

create trigger set_data_subject_requests_updated_at before update on public.data_subject_requests
  for each row execute function public.set_updated_at();
