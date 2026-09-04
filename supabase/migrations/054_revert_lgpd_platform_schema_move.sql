-- Migration 054: reverte a migration 052 (move de volta para public).
-- Motivo: o Dashboard confirma "lgpd_platform" nos Exposed schemas/tables/
-- functions, mas o PostgREST segue recusando ("Invalid schema: lgpd_platform")
-- mesmo após restart do projeto — usuário real (DPO, serralgpd@gmail.com,
-- 4 empresas) ficou sem acesso ao painel. Priorizando restaurar o serviço
-- agora; retomamos a separação de schema depois de entender a causa (ou com
-- suporte do Supabase), sem deixar o app fora do ar nesse meio tempo.

alter table lgpd_platform.checklist_items set schema public;
alter table lgpd_platform.companies set schema public;
alter table lgpd_platform.complaints set schema public;
alter table lgpd_platform.consent_purposes set schema public;
alter table lgpd_platform.consents set schema public;
alter table lgpd_platform.data_inventory set schema public;
alter table lgpd_platform.data_subject_requests set schema public;
alter table lgpd_platform.documents set schema public;
alter table lgpd_platform.incidents set schema public;
alter table lgpd_platform.retention_disposals set schema public;
alter table lgpd_platform.risks set schema public;
alter table lgpd_platform.site_scans set schema public;
alter table lgpd_platform.suppliers set schema public;
alter table lgpd_platform.trainings set schema public;
alter table lgpd_platform.training_employees set schema public;
alter table lgpd_platform.user_companies set schema public;
alter table lgpd_platform.audit_logs set schema public;
alter table lgpd_platform.company_invites set schema public;

alter function lgpd_platform.get_invite_preview(uuid) set schema public;
alter function lgpd_platform.accept_company_invite(uuid) set schema public;
alter function lgpd_platform.is_collaborator_for_company(uuid) set schema public;
alter function lgpd_platform.user_company_ids(uuid) set schema public;
alter function lgpd_platform.dpo_company_ids(uuid) set schema public;
alter function lgpd_platform.admin_company_ids(uuid) set schema public;
alter function lgpd_platform.sync_retention_disposal_status() set schema public;

-- Corrige de volta os corpos das funções para "public.xxx"
create or replace function public.get_invite_preview(p_token uuid)
returns table (company_name text, email text, role text, valid boolean)
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

create or replace function public.admin_company_ids(p_user_id uuid)
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select company_id from public.user_companies where user_id = p_user_id and role = 'admin';
$$;

-- Nome diferente de "public.set_updated_at" de propósito: aquela função
-- genérica também é usada pelo edu-nota (en_*), não queremos reacoplar.
create or replace function public.set_updated_at_lgpd_retention()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_retention_disposals_updated_at on public.retention_disposals;
create trigger set_retention_disposals_updated_at
  before update on public.retention_disposals
  for each row execute function public.set_updated_at_lgpd_retention();

create or replace function public.sync_retention_disposal_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.calculated_status :=
    case
      when new.hold_active then 'hold'
      when new.expiration_date is null then 'regular'
      when new.expiration_date < current_date then 'overdue'
      when new.expiration_date < current_date + interval '60 days' then 'expiring_soon'
      else 'regular'
    end;
  return new;
end;
$$;

drop function if exists lgpd_platform.set_updated_at();
