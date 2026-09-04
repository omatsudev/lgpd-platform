-- Soft delete de empresas: em vez de apagar, marcamos deleted_at e escondemos das listagens ativas.
alter table public.companies add column if not exists deleted_at timestamptz;

-- Nenhum usuário pode ter duas empresas ativas com o mesmo nome (case-insensitive).
-- Escopado por owner_id: cada dono só é comparado com as próprias empresas.
create unique index if not exists companies_owner_active_name_idx
  on public.companies (owner_id, lower(name))
  where deleted_at is null;

-- Ids das empresas em que o usuário é admin (para restringir exclusão/reativação a admins).
create or replace function public.admin_company_ids(p_user_id uuid)
returns setof uuid
language sql stable security definer
set search_path = public
as $$
  select company_id from public.user_companies where user_id = p_user_id and role = 'admin';
$$;

drop policy if exists "user_can_delete_own_companies" on public.companies;
create policy "user_can_delete_own_companies" on public.companies
  for delete using (
    (id in (select admin_company_ids(auth.uid()))) or (owner_id = auth.uid())
  );

drop policy if exists "user_can_delete_company_memberships" on public.user_companies;
create policy "user_can_delete_company_memberships" on public.user_companies
  for delete using (company_id in (select admin_company_ids(auth.uid())));
