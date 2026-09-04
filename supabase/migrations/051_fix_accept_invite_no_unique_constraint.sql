-- Migration 051: corrige accept_company_invite.
-- A função original usava "on conflict (user_id, company_id) do nothing",
-- assumindo a constraint unique(user_id, company_id) prevista na migration
-- 001_initial_schema.sql. Essa constraint não existe na tabela user_companies
-- deste projeto (só há PK em id + check de role) — descoberto ao testar o
-- fluxo de aceite de convite, que falhava com 42P10 (no unique or exclusion
-- constraint matching ON CONFLICT). Troca por um check explícito de
-- existência, que não depende de constraint nenhuma.

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

revoke execute on function public.accept_company_invite(uuid) from public;
revoke execute on function public.accept_company_invite(uuid) from anon;
grant execute on function public.accept_company_invite(uuid) to authenticated;
