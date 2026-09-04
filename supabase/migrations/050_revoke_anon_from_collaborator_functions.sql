-- Migration 050: o projeto tem "alter default privileges" concedendo execute
-- a anon/authenticated/service_role em toda função nova por padrão, então o
-- "revoke ... from public" da migration 049 não bastou — anon ainda tinha
-- grant direto. Revoga explicitamente de anon nas funções que só devem ser
-- chamadas por usuário autenticado.

revoke execute on function public.accept_company_invite(uuid) from anon;
revoke execute on function public.is_collaborator_for_company(uuid) from anon;
