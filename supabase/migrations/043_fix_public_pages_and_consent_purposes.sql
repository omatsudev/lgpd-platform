-- Migration 043: corrige acesso público às páginas/formulários LGPD
--
-- Com RLS agora habilitada em "companies" (migration 040) e em
-- "consent_purposes" (alguma correção aplicada em paralelo em produção,
-- que habilitou RLS mas não recriou a policy original da migration 006),
-- dois fluxos públicos pararam de funcionar para TODAS as empresas:
--
-- 1. /lgpd/[slug], /api/complaints/public, /api/consents/public e
--    /api/data-subjects/public fazem `select id from companies where slug = ...`
--    usando a chave anon (sem sessão). Sem uma policy de SELECT pública,
--    esse lookup retorna vazio -> "Company not found" em todos os formulários.
--
-- 2. /api/consents/public valida o purpose_id em consent_purposes usando a
--    chave anon. consent_purposes está com RLS habilitada e 0 policies
--    (lockout total) -> "Purpose not found or inactive" sempre, e o módulo
--    de Consentimentos no dashboard também ficou sem acesso de leitura/escrita.

-- Qualquer pessoa pode ver dados básicos de empresas que publicaram sua
-- página pública LGPD (têm slug definido) — é o propósito da própria página.
drop policy if exists "anyone_can_see_published_companies" on public.companies;
create policy "anyone_can_see_published_companies" on public.companies
  for select using (slug is not null);

-- Restaura a policy original da migration 006 para consent_purposes
drop policy if exists "user_can_manage_consent_purposes" on public.consent_purposes;
create policy "user_can_manage_consent_purposes" on public.consent_purposes
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );

-- Permite que o formulário público valide finalidades de consentimento ativas
drop policy if exists "anyone_can_read_active_consent_purposes" on public.consent_purposes;
create policy "anyone_can_read_active_consent_purposes" on public.consent_purposes
  for select using (active = true);
