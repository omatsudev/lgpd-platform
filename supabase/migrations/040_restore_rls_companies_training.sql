-- Migration 040: restaura RLS em companies, training_employees, user_companies e data_inventory
--
-- Essas tabelas estavam com row level security DESABILITADA em produção e, em
-- companies/training_employees/user_companies, sem nenhuma policy — qualquer
-- usuário autenticado (de qualquer app que compartilhe este projeto Supabase)
-- conseguia ler/editar/apagar todas as linhas, expondo dados de DPO, empresas
-- e colaboradores de todos os tenants.
--
-- Esta migration recria as policies originais (001/002/016/019) e adiciona
-- uma policy baseada em org_id para preservar o acesso do app multi-org que
-- também usa a tabela companies (via lgpd_privacy_requests / current_org_id()).

-- =============================================
-- companies
-- =============================================

drop policy if exists "user_can_see_own_companies" on public.companies;
create policy "user_can_see_own_companies" on public.companies
  for select using (
    id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );

drop policy if exists "dpo_can_see_assigned_companies" on public.companies;
create policy "dpo_can_see_assigned_companies" on public.companies
  for select using (dpo_id = auth.uid());

drop policy if exists "user_can_insert_companies" on public.companies;
create policy "user_can_insert_companies" on public.companies
  for insert with check (owner_id = auth.uid());

drop policy if exists "user_can_update_own_companies" on public.companies;
create policy "user_can_update_own_companies" on public.companies
  for update using (
    id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );

drop policy if exists "dpo_can_update_assigned_companies" on public.companies;
create policy "dpo_can_update_assigned_companies" on public.companies
  for update using (dpo_id = auth.uid());

-- Compatibilidade com o app multi-org que usa companies.org_id
drop policy if exists "org_can_manage_companies" on public.companies;
create policy "org_can_manage_companies" on public.companies
  for all using (org_id = current_org_id());

alter table public.companies enable row level security;

-- =============================================
-- training_employees
-- =============================================

drop policy if exists "user_can_manage_training_employees" on public.training_employees;
create policy "user_can_manage_training_employees" on public.training_employees
  for all using (
    training_id in (
      select t.id from public.trainings t
      join public.user_companies uc on uc.company_id = t.company_id
      where uc.user_id = auth.uid()
    )
  );

drop policy if exists "dpo_can_manage_training_employees" on public.training_employees;
create policy "dpo_can_manage_training_employees" on public.training_employees
  for all using (
    training_id in (
      select t.id from public.trainings t
      join public.companies c on c.id = t.company_id
      where c.dpo_id = auth.uid()
    )
  );

alter table public.training_employees enable row level security;

-- =============================================
-- user_companies
-- =============================================

drop policy if exists "user_can_insert_user_companies" on public.user_companies;
create policy "user_can_insert_user_companies" on public.user_companies
  for insert with check (user_id = auth.uid());

drop policy if exists "user_can_read_own_user_companies" on public.user_companies;
create policy "user_can_read_own_user_companies" on public.user_companies
  for select using (user_id = auth.uid());

drop policy if exists "user_can_update_own_user_companies" on public.user_companies;
create policy "user_can_update_own_user_companies" on public.user_companies
  for update using (user_id = auth.uid());

drop policy if exists "dpo_can_read_managed_company_users" on public.user_companies;
create policy "dpo_can_read_managed_company_users" on public.user_companies
  for select using (
    company_id in (
      select id from public.companies where dpo_id = auth.uid()
    )
  );

alter table public.user_companies enable row level security;

-- =============================================
-- data_inventory
-- =============================================

drop policy if exists "user_can_manage_data_inventory" on public.data_inventory;
create policy "user_can_manage_data_inventory" on public.data_inventory
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

alter table public.data_inventory enable row level security;
