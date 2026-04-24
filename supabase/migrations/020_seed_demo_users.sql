-- ============================================================
-- SEED: 3 usuários demo para demonstração de perfis
--
-- Senha de todos: Demo@2024
--
-- 1. empresa1@demo.lgpd   — Empresa sem DPO responsável
-- 2. empresa2@demo.lgpd   — Empresa com DPO próprio (User 3)
-- 3. dpo@demo.lgpd        — DPO externo com 2 empresas sob gestão
-- ============================================================

DO $$
DECLARE
  -- IDs fixos para facilitar referências cruzadas
  u1  uuid := 'a1000000-0000-0000-0000-000000000001'; -- empresa1
  u2  uuid := 'a2000000-0000-0000-0000-000000000002'; -- empresa2
  u3  uuid := 'a3000000-0000-0000-0000-000000000003'; -- dpo externo

  cA  uuid := 'c1000000-0000-0000-0000-000000000001'; -- Tech Alpha Ltda. (sem DPO)
  cB  uuid := 'c2000000-0000-0000-0000-000000000002'; -- Beta Corp Ltda.  (tem DPO = u3)
  cC  uuid := 'c3000000-0000-0000-0000-000000000003'; -- Gamma Serviços S.A. (gerida por u3)

  pwd text;
BEGIN

  pwd := crypt('Demo@2024', gen_salt('bf'));

  -- ── 1. Criar usuários em auth.users ──────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
  (
    '00000000-0000-0000-0000-000000000000', u1,
    'authenticated', 'authenticated', 'empresa1@demo.lgpd', pwd,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Empresa Alpha"}',
    false, now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', u2,
    'authenticated', 'authenticated', 'empresa2@demo.lgpd', pwd,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Beta Corp"}',
    false, now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', u3,
    'authenticated', 'authenticated', 'dpo@demo.lgpd', pwd,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Carlos DPO"}',
    false, now(), now(), '', '', '', ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- ── 2. Criar identidades (necessário para login por e-mail) ──
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
  (gen_random_uuid(), u1, 'empresa1@demo.lgpd',
   jsonb_build_object('sub', u1::text, 'email', 'empresa1@demo.lgpd'),
   'email', now(), now(), now()),
  (gen_random_uuid(), u2, 'empresa2@demo.lgpd',
   jsonb_build_object('sub', u2::text, 'email', 'empresa2@demo.lgpd'),
   'email', now(), now(), now()),
  (gen_random_uuid(), u3, 'dpo@demo.lgpd',
   jsonb_build_object('sub', u3::text, 'email', 'dpo@demo.lgpd'),
   'email', now(), now(), now())
  ON CONFLICT DO NOTHING;

  -- ── 3. Criar empresas ─────────────────────────────────────

  -- Empresa A: sem DPO atribuído
  INSERT INTO public.companies (
    id, name, tax_id, slug, sector,
    owner_id, dpo_id, dpo_name, dpo_email,
    compliance_score, created_at, updated_at
  ) VALUES (
    cA, 'Tech Alpha Ltda.', '11.222.333/0001-44', 'tech-alpha',
    'Tecnologia',
    u1, null, null, null,
    42, now(), now()
  ) ON CONFLICT (id) DO NOTHING;

  -- Empresa B: com DPO externo (u3)
  INSERT INTO public.companies (
    id, name, tax_id, slug, sector,
    owner_id, dpo_id, dpo_name, dpo_email, dpo_phone,
    compliance_score, created_at, updated_at
  ) VALUES (
    cB, 'Beta Corp Ltda.', '22.333.444/0001-55', 'beta-corp',
    'Financeiro',
    u2, u3, 'Carlos DPO', 'dpo@demo.lgpd', '(11) 98800-0003',
    71, now(), now()
  ) ON CONFLICT (id) DO NOTHING;

  -- Empresa C: gerida pelo DPO (u3 é o owner e o DPO)
  INSERT INTO public.companies (
    id, name, tax_id, slug, sector,
    owner_id, dpo_id, dpo_name, dpo_email, dpo_phone,
    compliance_score, created_at, updated_at
  ) VALUES (
    cC, 'Gamma Serviços S.A.', '33.444.555/0001-66', 'gamma-servicos',
    'Saúde',
    u3, u3, 'Carlos DPO', 'dpo@demo.lgpd', '(11) 98800-0003',
    58, now(), now()
  ) ON CONFLICT (id) DO NOTHING;

  -- ── 4. Vincular usuários ↔ empresas ──────────────────────

  -- u1 é admin da Empresa A
  INSERT INTO public.user_companies (user_id, company_id, role)
  SELECT u1, cA, 'admin'
  WHERE NOT EXISTS (SELECT 1 FROM public.user_companies WHERE user_id = u1 AND company_id = cA);

  -- u2 é admin da Empresa B
  INSERT INTO public.user_companies (user_id, company_id, role)
  SELECT u2, cB, 'admin'
  WHERE NOT EXISTS (SELECT 1 FROM public.user_companies WHERE user_id = u2 AND company_id = cB);

  -- u3 é DPO da Empresa B
  INSERT INTO public.user_companies (user_id, company_id, role)
  SELECT u3, cB, 'dpo'
  WHERE NOT EXISTS (SELECT 1 FROM public.user_companies WHERE user_id = u3 AND company_id = cB);

  -- u3 é DPO da Empresa C
  INSERT INTO public.user_companies (user_id, company_id, role)
  SELECT u3, cC, 'dpo'
  WHERE NOT EXISTS (SELECT 1 FROM public.user_companies WHERE user_id = u3 AND company_id = cC);

  -- ── 5. Checklist básico para cada empresa ─────────────────

  -- Empresa A: maioria pendente (sem DPO — baixa adequação)
  INSERT INTO public.checklist_items (company_id, category, item_key, status, responsible, updated_by)
  VALUES
  (cA, 'governanca', 'gov_dpo_nomeado',         'pending',     'Pendente',       u1),
  (cA, 'governanca', 'gov_politica_privacidade', 'pending',     'Pendente',       u1),
  (cA, 'governanca', 'gov_canal_titular',        'in_progress', 'TI',             u1),
  (cA, 'inventario', 'inv_mapeamento_completo',  'in_progress', 'TI',             u1),
  (cA, 'inventario', 'inv_base_legal_definida',  'pending',     'Pendente',       u1),
  (cA, 'seguranca',  'seg_medidas_tecnicas',      'completed',   'TI',             u1),
  (cA, 'seguranca',  'seg_gestao_acessos',        'in_progress', 'TI',             u1)
  ON CONFLICT DO NOTHING;

  -- Empresa B: boa adequação (tem DPO)
  INSERT INTO public.checklist_items (company_id, category, item_key, status, responsible, updated_by)
  VALUES
  (cB, 'governanca', 'gov_dpo_nomeado',          'completed',   'Carlos DPO',     u3),
  (cB, 'governanca', 'gov_politica_privacidade',  'completed',   'Carlos DPO',     u3),
  (cB, 'governanca', 'gov_canal_titular',         'completed',   'TI',             u3),
  (cB, 'governanca', 'gov_programa_privacidade',  'in_progress', 'Carlos DPO',     u3),
  (cB, 'inventario', 'inv_mapeamento_completo',   'completed',   'Carlos DPO',     u3),
  (cB, 'inventario', 'inv_base_legal_definida',   'completed',   'Carlos DPO',     u3),
  (cB, 'inventario', 'inv_finalidade_documentada','completed',   'Carlos DPO',     u3),
  (cB, 'seguranca',  'seg_medidas_tecnicas',       'completed',   'TI',             u3),
  (cB, 'seguranca',  'seg_politica_seguranca',     'completed',   'Carlos DPO',     u3),
  (cB, 'seguranca',  'seg_gestao_acessos',         'completed',   'TI',             u3),
  (cB, 'consentimento', 'con_coleta_valida',       'completed',   'TI',             u3),
  (cB, 'fornecedores',  'for_mapeamento_operadores','completed',  'Carlos DPO',     u3),
  (cB, 'fornecedores',  'for_contratos_dpa',        'in_progress','Carlos DPO',     u3)
  ON CONFLICT DO NOTHING;

  -- Empresa C: adequação parcial
  INSERT INTO public.checklist_items (company_id, category, item_key, status, responsible, updated_by)
  VALUES
  (cC, 'governanca', 'gov_dpo_nomeado',          'completed',   'Carlos DPO',     u3),
  (cC, 'governanca', 'gov_politica_privacidade',  'in_progress', 'Carlos DPO',     u3),
  (cC, 'governanca', 'gov_canal_titular',         'pending',     'Pendente',       u3),
  (cC, 'inventario', 'inv_mapeamento_completo',   'in_progress', 'Carlos DPO',     u3),
  (cC, 'inventario', 'inv_base_legal_definida',   'in_progress', 'Carlos DPO',     u3),
  (cC, 'seguranca',  'seg_medidas_tecnicas',       'completed',   'TI',             u3),
  (cC, 'seguranca',  'seg_gestao_acessos',         'in_progress', 'TI',             u3),
  (cC, 'fornecedores', 'for_mapeamento_operadores','pending',     'Carlos DPO',     u3)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed demo concluído — 3 usuários criados';
  RAISE NOTICE '  empresa1@demo.lgpd → Tech Alpha (sem DPO)';
  RAISE NOTICE '  empresa2@demo.lgpd → Beta Corp (DPO = dpo@demo.lgpd)';
  RAISE NOTICE '  dpo@demo.lgpd      → DPO de Beta Corp + Gamma Serviços';

END $$;
