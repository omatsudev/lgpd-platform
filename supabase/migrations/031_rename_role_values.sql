-- Migration 031: renomeia valores de role de português para inglês
-- 'empresa' → 'company', 'colaborador' → 'collaborator'

-- 1. Remove a constraint existente
alter table public.user_companies
  drop constraint if exists user_companies_role_check;

-- 2. Atualiza os dados existentes
update public.user_companies set role = 'company'       where role = 'empresa';
update public.user_companies set role = 'collaborator'  where role = 'colaborador';

-- 3. Recria a constraint com os novos valores
alter table public.user_companies
  add constraint user_companies_role_check
  check (role in ('admin', 'dpo', 'company', 'collaborator'));
