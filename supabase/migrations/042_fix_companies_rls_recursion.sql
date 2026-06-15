-- Migration 042: corrige recursão infinita nas policies de companies/user_companies
--
-- A migration 040 recriou policies que se referenciam mutuamente:
--   companies.user_can_see_own_companies / user_can_update_own_companies
--     -> subquery em user_companies
--   user_companies.dpo_can_read_managed_company_users
--     -> subquery em companies
--
-- O Postgres não suporta esse ciclo de RLS e passa a retornar
-- "infinite recursion detected in policy for relation companies" (42P17)
-- em qualquer select/insert/update nessas duas tabelas — quebrando o
-- cadastro de empresas para todos os usuários.
--
-- Esta migration introduz funções SECURITY DEFINER que leem a tabela "do
-- outro lado" sem reaplicar RLS, quebrando o ciclo, e reaponta as policies
-- afetadas para usá-las.

create or replace function public.user_company_ids(p_user_id uuid)
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select company_id from public.user_companies where user_id = p_user_id;
$$;

create or replace function public.dpo_company_ids(p_user_id uuid)
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from public.companies where dpo_id = p_user_id;
$$;

-- companies: select/update do próprio usuário (via user_companies ou owner_id)
drop policy if exists "user_can_see_own_companies" on public.companies;
create policy "user_can_see_own_companies" on public.companies
  for select using (
    id in (select public.user_company_ids(auth.uid()))
    or owner_id = auth.uid()
  );

drop policy if exists "user_can_update_own_companies" on public.companies;
create policy "user_can_update_own_companies" on public.companies
  for update using (
    id in (select public.user_company_ids(auth.uid()))
    or owner_id = auth.uid()
  );

-- user_companies: DPO consegue ver vínculos das empresas que atende
drop policy if exists "dpo_can_read_managed_company_users" on public.user_companies;
create policy "dpo_can_read_managed_company_users" on public.user_companies
  for select using (
    company_id in (select public.dpo_company_ids(auth.uid()))
  );
