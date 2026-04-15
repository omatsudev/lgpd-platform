-- LGPD Compliance Checklist Module

create table public.checklist_items (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  category text not null,
  item_key text not null, -- fixed item identifier (does not change between companies)
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'not_applicable')),
  notes text,
  responsible text,
  completion_date date,
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now() not null,
  unique(company_id, item_key)
);

alter table public.checklist_items enable row level security;

create policy "user_can_manage_checklist" on public.checklist_items
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

create trigger set_checklist_updated_at before update on public.checklist_items
  for each row execute function public.set_updated_at();
