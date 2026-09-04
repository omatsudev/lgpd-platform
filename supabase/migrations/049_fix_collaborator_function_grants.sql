-- Migration 049: corrige grants padrão de PUBLIC criados junto das funções
-- da migration 048. CREATE FUNCTION concede EXECUTE a PUBLIC por padrão, o
-- que deixava accept_company_invite e is_collaborator_for_company chamáveis
-- pelo role anon mesmo sem termos concedido isso explicitamente.

revoke execute on function public.accept_company_invite(uuid) from public;
revoke execute on function public.is_collaborator_for_company(uuid) from public;

grant execute on function public.accept_company_invite(uuid) to authenticated;
grant execute on function public.is_collaborator_for_company(uuid) to authenticated;
