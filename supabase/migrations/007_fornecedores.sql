-- LGPD Supplier Management and Due Diligence Module

create table public.suppliers (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,

  -- Identification
  name text not null,
  tax_id text,
  site text,
  contact_name text,
  contact_email text,
  contact_phone text,
  country text not null default 'Brasil',

  -- Classification
  category text not null check (category in (
    'technology', 'healthcare', 'financial', 'hr', 'marketing',
    'legal', 'accounting', 'logistics', 'other'
  )),
  access_type text not null check (access_type in (
    'processor', 'joint_controller', 'sub_processor', 'no_data_access'
  )),

  -- Data processed
  accessed_data jsonb default '[]',
  sharing_purpose text,
  sharing_legal_basis text,

  -- Contract / DPA
  has_contract boolean default false,
  has_dpa boolean default false,
  dpa_signing_date date,
  contract_url text,

  -- Due diligence
  due_diligence_status text not null default 'pending' check (due_diligence_status in (
    'pending', 'under_review', 'approved', 'rejected', 'expired'
  )),
  last_assessment_date date,
  next_assessment_date date,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  notes text,

  -- International transfer
  international_transfer boolean default false,
  destination_country text,
  transfer_mechanism text,

  -- Status
  active boolean default true,

  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.suppliers enable row level security;

create policy "user_can_manage_suppliers" on public.suppliers
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

-- Updated_at trigger
create trigger set_suppliers_updated_at before update on public.suppliers
  for each row execute function public.set_updated_at();
