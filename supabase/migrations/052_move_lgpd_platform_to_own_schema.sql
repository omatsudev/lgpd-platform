-- Migration 052: move todas as tabelas/funções do lgpd-platform de public
-- para um schema dedicado (lgpd_platform), seguindo o mesmo padrão já usado
-- por boaclinica-app (schema "boaclinica") e roupas (schema "fe_que_veste")
-- neste projeto Supabase compartilhado. Objetivo: nenhum sistema usar a
-- mesma tabela/migration que outro, preparando terreno para a separação
-- futura em projetos Supabase individuais por sistema.
--
-- Seguro: ALTER TABLE/FUNCTION ... SET SCHEMA é operação de metadado só —
-- preserva dados, RLS policies, triggers e FKs (resolvidos por OID interno,
-- não por nome). O que PRECISA ser reescrito é o corpo das funções que
-- citam "public.xxx" explicitamente no texto SQL.
--
-- IMPORTANTE: após aplicar, é preciso adicionar "lgpd_platform" na lista de
-- "Exposed schemas" em Project Settings > API no Dashboard do Supabase —
-- isso não é configurável via SQL/migration.

create schema if not exists lgpd_platform;
grant usage on schema lgpd_platform to anon, authenticated, service_role;

-- ---------- 1. Mover tabelas ----------
alter table public.checklist_items set schema lgpd_platform;
alter table public.companies set schema lgpd_platform;
alter table public.complaints set schema lgpd_platform;
alter table public.consent_purposes set schema lgpd_platform;
alter table public.consents set schema lgpd_platform;
alter table public.data_inventory set schema lgpd_platform;
alter table public.data_subject_requests set schema lgpd_platform;
alter table public.documents set schema lgpd_platform;
alter table public.incidents set schema lgpd_platform;
alter table public.retention_disposals set schema lgpd_platform;
alter table public.risks set schema lgpd_platform;
alter table public.site_scans set schema lgpd_platform;
alter table public.suppliers set schema lgpd_platform;
alter table public.trainings set schema lgpd_platform;
alter table public.training_employees set schema lgpd_platform;
alter table public.user_companies set schema lgpd_platform;
alter table public.audit_logs set schema lgpd_platform;
alter table public.company_invites set schema lgpd_platform;

-- ---------- 2. Mover funções (preserva OID/grants/dependentes) ----------
alter function public.get_invite_preview(uuid) set schema lgpd_platform;
alter function public.accept_company_invite(uuid) set schema lgpd_platform;
alter function public.is_collaborator_for_company(uuid) set schema lgpd_platform;
alter function public.user_company_ids(uuid) set schema lgpd_platform;
alter function public.dpo_company_ids(uuid) set schema lgpd_platform;
alter function public.admin_company_ids(uuid) set schema lgpd_platform;
alter function public.sync_retention_disposal_status() set schema lgpd_platform;

-- ---------- 3. Reescrever corpo das funções (citavam "public.xxx") ----------
create or replace function lgpd_platform.get_invite_preview(p_token uuid)
returns table (company_name text, email text, role text, valid boolean)
language sql
security definer
stable
set search_path = lgpd_platform
as $$
  select
    c.name as company_name,
    ci.email,
    ci.role,
    (ci.accepted_at is null and ci.expires_at > now()) as valid
  from lgpd_platform.company_invites ci
  join lgpd_platform.companies c on c.id = ci.company_id
  where ci.token = p_token;
$$;

create or replace function lgpd_platform.accept_company_invite(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = lgpd_platform
as $$
declare
  v_invite lgpd_platform.company_invites%rowtype;
begin
  select * into v_invite
  from lgpd_platform.company_invites
  where token = p_token
    and accepted_at is null
    and expires_at > now()
  for update;

  if not found then
    return false;
  end if;

  if not exists (
    select 1 from lgpd_platform.user_companies
    where user_id = auth.uid() and company_id = v_invite.company_id
  ) then
    insert into lgpd_platform.user_companies (user_id, company_id, role)
    values (auth.uid(), v_invite.company_id, v_invite.role);
  end if;

  update lgpd_platform.company_invites set accepted_at = now() where id = v_invite.id;

  return true;
end;
$$;

create or replace function lgpd_platform.is_collaborator_for_company(p_company_id uuid)
returns boolean
language sql
security definer
stable
set search_path = lgpd_platform
as $$
  select exists (
    select 1 from lgpd_platform.user_companies
    where user_id = auth.uid()
      and company_id = p_company_id
      and role = 'collaborator'
  );
$$;

create or replace function lgpd_platform.user_company_ids(p_user_id uuid)
returns setof uuid
language sql
security definer
stable
set search_path = lgpd_platform
as $$
  select company_id from lgpd_platform.user_companies where user_id = p_user_id;
$$;

create or replace function lgpd_platform.dpo_company_ids(p_user_id uuid)
returns setof uuid
language sql
security definer
stable
set search_path = lgpd_platform
as $$
  select id from lgpd_platform.companies where dpo_id = p_user_id;
$$;

create or replace function lgpd_platform.admin_company_ids(p_user_id uuid)
returns setof uuid
language sql
security definer
stable
set search_path = lgpd_platform
as $$
  select company_id from lgpd_platform.user_companies where user_id = p_user_id and role = 'admin';
$$;

-- ---------- 4. Duplicar trigger genérico de updated_at (era compartilhado com edu-nota) ----------
create or replace function lgpd_platform.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_retention_disposals_updated_at on lgpd_platform.retention_disposals;
create trigger set_retention_disposals_updated_at
  before update on lgpd_platform.retention_disposals
  for each row execute function lgpd_platform.set_updated_at();
