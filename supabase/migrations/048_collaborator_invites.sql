-- Migration 048: papel "collaborator" (somente leitura) + fluxo de convite
--
-- O valor 'collaborator' já existe na constraint de user_companies.role (migration
-- 031_rename_role_values.sql) mas nunca foi utilizado. Esta migration:
--   1) cria a tabela de convites (company_invites) usada pelo fluxo de
--      convite de colaboradores (não há Admin API/service_role no projeto);
--   2) cria funções security definer para o preview público do convite e para
--      o aceite (única forma de inserir uma linha em user_companies com
--      role='collaborator');
--   3) adiciona policies restritivas que bloqueiam insert/update/delete para
--      quem estiver vinculado à empresa como 'collaborator', sem tocar nas
--      policies permissivas existentes (histórico de bugs de recursão nelas —
--      ver migrations 040-042).

-- =============================================
-- TABLE: company_invites
-- =============================================
create table public.company_invites (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  email text not null,
  role text not null default 'collaborator' check (role in ('collaborator')),
  token uuid default gen_random_uuid() not null unique,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '7 days') not null,
  accepted_at timestamptz
);

alter table public.company_invites enable row level security;

-- Só membros não-collaborator da empresa podem ver/criar/revogar convites.
create policy "company_admins_can_manage_invites" on public.company_invites
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid() and role <> 'collaborator'
    )
  ) with check (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid() and role <> 'collaborator'
    )
  );

-- Não existe policy pública de select nessa tabela: o preview e o aceite do
-- convite (usuário ainda não autenticado ou recém-autenticado) passam pelas
-- funções security definer abaixo, que só devolvem exatamente o convite cujo
-- token foi informado — nunca uma listagem.

-- =============================================
-- FUNCTION: get_invite_preview
-- Usada pela página pública /invite/[token] antes do login.
-- =============================================
create or replace function public.get_invite_preview(p_token uuid)
returns table (
  company_name text,
  email text,
  role text,
  valid boolean
)
language sql
security definer
stable
set search_path = public
as $$
  select
    c.name as company_name,
    ci.email,
    ci.role,
    (ci.accepted_at is null and ci.expires_at > now()) as valid
  from public.company_invites ci
  join public.companies c on c.id = ci.company_id
  where ci.token = p_token;
$$;

grant execute on function public.get_invite_preview(uuid) to anon, authenticated;

-- =============================================
-- FUNCTION: accept_company_invite
-- Chamada logo após o cadastro (auth.signUp) do convidado. Único caminho
-- que popula user_companies com role='collaborator'.
-- =============================================
create or replace function public.accept_company_invite(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.company_invites%rowtype;
begin
  select * into v_invite
  from public.company_invites
  where token = p_token
    and accepted_at is null
    and expires_at > now()
  for update;

  if not found then
    return false;
  end if;

  if not exists (
    select 1 from public.user_companies
    where user_id = auth.uid() and company_id = v_invite.company_id
  ) then
    insert into public.user_companies (user_id, company_id, role)
    values (auth.uid(), v_invite.company_id, v_invite.role);
  end if;

  update public.company_invites set accepted_at = now() where id = v_invite.id;

  return true;
end;
$$;

grant execute on function public.accept_company_invite(uuid) to authenticated;

-- =============================================
-- Helper: verifica se o usuário atual é 'collaborator' na empresa informada.
-- security definer para não reintroduzir recursão nas policies (padrão já
-- usado em user_company_ids/dpo_company_ids, migration 042).
-- =============================================
create or replace function public.is_collaborator_for_company(p_company_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_companies
    where user_id = auth.uid()
      and company_id = p_company_id
      and role = 'collaborator'
  );
$$;

grant execute on function public.is_collaborator_for_company(uuid) to authenticated;

-- =============================================
-- Policies restritivas: bloqueiam escrita de 'collaborator' independente
-- do que as policies permissivas de cada tabela liberam.
-- =============================================
do $$
declare
  t text;
  tables text[] := array[
    'checklist_items',
    'site_scans',
    'consent_purposes',
    'risks',
    'suppliers',
    'retention_disposals',
    'data_inventory',
    'incidents',
    'documents',
    'data_subject_requests',
    'trainings',
    'complaints'
  ];
begin
  foreach t in array tables loop
    execute format(
      'create policy "collaborator_no_insert_%1$s" on public.%1$s as restrictive for insert
         with check (not public.is_collaborator_for_company(company_id));',
      t
    );
    execute format(
      'create policy "collaborator_no_update_%1$s" on public.%1$s as restrictive for update
         using (not public.is_collaborator_for_company(company_id))
         with check (not public.is_collaborator_for_company(company_id));',
      t
    );
    execute format(
      'create policy "collaborator_no_delete_%1$s" on public.%1$s as restrictive for delete
         using (not public.is_collaborator_for_company(company_id));',
      t
    );
  end loop;
end $$;

-- training_employees não tem company_id direto (escopo via trainings.company_id).
create policy "collaborator_no_insert_training_employees" on public.training_employees
  as restrictive for insert
  with check (
    not exists (
      select 1 from public.trainings t
      where t.id = training_id and public.is_collaborator_for_company(t.company_id)
    )
  );

create policy "collaborator_no_update_training_employees" on public.training_employees
  as restrictive for update
  using (
    not exists (
      select 1 from public.trainings t
      where t.id = training_id and public.is_collaborator_for_company(t.company_id)
    )
  )
  with check (
    not exists (
      select 1 from public.trainings t
      where t.id = training_id and public.is_collaborator_for_company(t.company_id)
    )
  );

create policy "collaborator_no_delete_training_employees" on public.training_employees
  as restrictive for delete
  using (
    not exists (
      select 1 from public.trainings t
      where t.id = training_id and public.is_collaborator_for_company(t.company_id)
    )
  );

-- companies: 'collaborator' nunca deve editar dados da empresa
-- (user_can_update_own_companies, migration 042, é "for all" via user_companies).
create policy "collaborator_no_update_companies" on public.companies
  as restrictive for update
  using (not public.is_collaborator_for_company(id))
  with check (not public.is_collaborator_for_company(id));
