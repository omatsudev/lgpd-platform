-- ============================================================
-- SEED: Dados completos para o usuário admin@lgpd.dev
-- Company ID: 093ee79e-0126-4616-9146-31cec08ad28a
-- User ID:    1f1f8a63-f99c-4946-9274-520529e5f2fb
-- ============================================================

DO $$
DECLARE
  v_user_id  uuid := '1f1f8a63-f99c-4946-9274-520529e5f2fb';
  v_cid      uuid := '093ee79e-0126-4616-9146-31cec08ad28a';

  inv1 uuid; inv2 uuid; inv3 uuid; inv4 uuid; inv5 uuid;
  sup1 uuid; sup2 uuid; sup3 uuid; sup4 uuid;
  doc1 uuid; doc2 uuid; doc3 uuid; doc4 uuid;
  risk1 uuid; risk2 uuid; risk3 uuid; risk4 uuid; risk5 uuid;
  inc1 uuid; inc2 uuid;
  req1 uuid; req2 uuid; req3 uuid; req4 uuid; req5 uuid;
  tr1 uuid; tr2 uuid;
  cp1 uuid; cp2 uuid; cp3 uuid;
  scan1 uuid; scan2 uuid;
BEGIN

  -- ── 0. Atualiza perfil da empresa ─────────────────────────
  UPDATE public.companies SET
    name                = 'Omatsu Technologies Ltda.',
    slug                = 'omatsu-technologies',
    sector              = 'Tecnologia',
    dpo_name            = 'Lauro Omatsu',
    dpo_email           = 'omatsu.technologies@gmail.com',
    dpo_phone           = '(11) 99000-0001',
    privacy_policy_url  = 'https://lgpd-platform.vercel.app/privacidade'
  WHERE id = v_cid;

  -- ── 1. Inventário de dados (5 processos) ─────────────────
  inv1 := gen_random_uuid(); inv2 := gen_random_uuid();
  inv3 := gen_random_uuid(); inv4 := gen_random_uuid();
  inv5 := gen_random_uuid();

  INSERT INTO public.data_inventory
    (id, company_id, data_type, process_name, responsible_department, process_description,
     lifecycle_phases, data_categories, data_description, processing_frequency,
     data_shared, shared_with, purpose, legal_basis,
     data_source, data_subject_category, storage_type, storage_location,
     retention_period, responsible, security_measures,
     requires_dpia, risk_level, record_status, created_by)
  VALUES
  (inv1, v_cid, 'identificacao pessoal',
   'Cadastro e Gestão de Clientes', 'Comercial',
   'Coleta e tratamento de dados pessoais de clientes para abertura de conta e prestação de serviços SaaS.',
   '{"coleta":{"ativo":true,"controlador":true,"operador":false},"retencao":{"ativo":true,"controlador":true,"operador":false},"processamento":{"ativo":true,"controlador":true,"operador":true},"compartilhamento":{"ativo":false,"controlador":false,"operador":false},"eliminacao":{"ativo":true,"controlador":true,"operador":false}}',
   '["identificacao_pessoal","dados_governamentais","dados_financeiros"]'::jsonb,
   'Nome completo, CPF/CNPJ, e-mail corporativo, telefone, endereço de cobrança, dados do cartão tokenizados.',
   'contínuo', false, null,
   'Gestão de contas, faturamento recorrente e suporte ao cliente.',
   'Execução de contrato',
   'direto', 'cliente', 'nuvem', 'Supabase (AWS sa-east-1)',
   '5 anos após encerramento do contrato',
   'Equipe de Produto e CS', 'Criptografia em repouso e trânsito, controle de acesso por perfil, logs de auditoria.',
   'nao', 'low', 'complete', v_user_id),

  (inv2, v_cid, 'dados sensiveis',
   'Folha de Pagamento e RH', 'Administrativo',
   'Processamento de dados de colaboradores para cumprimento de obrigações trabalhistas.',
   '{"coleta":{"ativo":true,"controlador":true,"operador":false},"retencao":{"ativo":true,"controlador":true,"operador":false},"processamento":{"ativo":true,"controlador":true,"operador":true},"compartilhamento":{"ativo":true,"controlador":true,"operador":false},"eliminacao":{"ativo":true,"controlador":true,"operador":false}}',
   '["identificacao_pessoal","dados_governamentais","dados_financeiros","dados_sensiveis"]'::jsonb,
   'CPF, PIS, CTPS, salário, dados bancários, informações de saúde para plano médico.',
   'contínuo', true, 'Escritório de contabilidade (Contábil SP), Operadora de saúde SulAmérica',
   'Cumprimento de obrigações trabalhistas, previdenciárias e pagamento de salários.',
   'Cumprimento de obrigação legal',
   'direto', 'funcionario', 'hibrido', 'Sistema Domínio + Google Workspace',
   '10 anos (prazo legal CAGED/eSocial)',
   'Gestão Administrativa', 'Acesso restrito, MFA obrigatório, criptografia de banco de dados.',
   'sim', 'high', 'complete', v_user_id),

  (inv3, v_cid, 'dados consentimento',
   'Marketing e Aquisição de Leads', 'Marketing',
   'Gestão de leads, campanhas de e-mail marketing e nutrição via automação.',
   '{"coleta":{"ativo":true,"controlador":true,"operador":false},"retencao":{"ativo":false,"controlador":false,"operador":false},"processamento":{"ativo":true,"controlador":true,"operador":true},"compartilhamento":{"ativo":true,"controlador":false,"operador":true},"eliminacao":{"ativo":true,"controlador":true,"operador":false}}',
   '["identificacao_pessoal","dados_eletronicos","dados_consentimento"]'::jsonb,
   'Nome, e-mail corporativo, cargo, empresa, histórico de interações com o site.',
   'contínuo', true, 'RD Station, Google Ads, LinkedIn Ads',
   'Nutrição de leads, envio de comunicações comerciais e campanhas segmentadas.',
   'Consentimento do titular',
   'direto', 'lead', 'nuvem', 'RD Station CRM',
   '2 anos ou até revogação do consentimento',
   'Equipe de Marketing', 'Opt-out em todas as comunicações, segmentação por consentimento explícito.',
   'nao', 'medium', 'complete', v_user_id),

  (inv4, v_cid, 'dados eletronicos',
   'Suporte e Atendimento (Help Desk)', 'Customer Success',
   'Registro e resolução de chamados de suporte técnico da plataforma LGPD.',
   '{"coleta":{"ativo":true,"controlador":true,"operador":false},"retencao":{"ativo":true,"controlador":true,"operador":false},"processamento":{"ativo":true,"controlador":true,"operador":false},"compartilhamento":{"ativo":false,"controlador":false,"operador":false},"eliminacao":{"ativo":true,"controlador":true,"operador":false}}',
   '["identificacao_pessoal","dados_eletronicos"]'::jsonb,
   'Nome, e-mail, histórico de chamados, logs de acesso ao sistema, screenshots enviados.',
   'contínuo', false, null,
   'Resolução de problemas técnicos e melhoria contínua do produto.',
   'Execução de contrato',
   'direto', 'cliente', 'nuvem', 'Linear + Notion',
   '3 anos após encerramento do contrato',
   'Customer Success', 'TLS em trânsito, dados mascarados em logs públicos, acesso por time exclusivo.',
   'nao', 'low', 'complete', v_user_id),

  (inv5, v_cid, 'dados eletronicos',
   'Telemetria e Analytics do Produto', 'Engenharia',
   'Coleta de eventos de uso da plataforma para análise de comportamento e melhoria de UX.',
   '{"coleta":{"ativo":true,"controlador":true,"operador":false},"retencao":{"ativo":true,"controlador":false,"operador":false},"processamento":{"ativo":true,"controlador":true,"operador":true},"compartilhamento":{"ativo":false,"controlador":false,"operador":false},"eliminacao":{"ativo":true,"controlador":true,"operador":false}}',
   '["dados_eletronicos","dados_consentimento"]'::jsonb,
   'User ID pseudoanonimizado, eventos de clique, tempo de sessão, funcionalidades acessadas.',
   'contínuo', false, null,
   'Análise de produto, priorização de roadmap e detecção de fricção na UX.',
   'Legítimo interesse',
   'indireto', 'cliente', 'nuvem', 'PostHog (EU)',
   '13 meses',
   'Engenharia de Produto', 'Pseudoanonimização no source, sem PII direto nos eventos.',
   'nao', 'low', 'draft', v_user_id);

  -- ── 2. Fornecedores (4 registros) ─────────────────────────
  sup1 := gen_random_uuid(); sup2 := gen_random_uuid();
  sup3 := gen_random_uuid(); sup4 := gen_random_uuid();

  INSERT INTO public.suppliers
    (id, company_id, name, tax_id, site, contact_name, contact_email, contact_phone,
     country, category, access_type, accessed_data, sharing_purpose, sharing_legal_basis,
     has_contract, has_dpa, dpa_signing_date,
     due_diligence_status, last_assessment_date, next_assessment_date,
     risk_level, international_transfer, active, created_by)
  VALUES
  (sup1, v_cid,
   'Supabase Inc.', null, 'https://supabase.com',
   'Suporte Enterprise', 'enterprise@supabase.com', '+1 (415) 000-0000',
   'Estados Unidos', 'technology', 'processor',
   '["Dados de clientes","Dados de colaboradores","Logs de aplicação","Dados da plataforma"]',
   'Banco de dados, autenticação e storage da plataforma',
   'Execução de contrato',
   true, true, (CURRENT_DATE - INTERVAL '6 months')::date,
   'approved', (CURRENT_DATE - INTERVAL '2 months')::date, (CURRENT_DATE + INTERVAL '10 months')::date,
   'medium', true, true, v_user_id),

  (sup2, v_cid,
   'Vercel Inc.', null, 'https://vercel.com',
   'Vercel Support', 'support@vercel.com', null,
   'Estados Unidos', 'technology', 'processor',
   '["Logs de acesso","Metadados de requisições"]',
   'Hospedagem e deploy da aplicação Next.js',
   'Execução de contrato',
   true, true, (CURRENT_DATE - INTERVAL '8 months')::date,
   'approved', (CURRENT_DATE - INTERVAL '3 months')::date, (CURRENT_DATE + INTERVAL '9 months')::date,
   'low', true, true, v_user_id),

  (sup3, v_cid,
   'Contábil SP Assessoria', '12.987.654/0001-11', null,
   'Dra. Regina Motta', 'regina@contabilsp.com.br', '(11) 3333-4444',
   'Brasil', 'accounting', 'processor',
   '["CPF de colaboradores","Dados bancários","Salários","Dados de saúde (plano)"]',
   'Processamento de folha de pagamento e obrigações fiscais',
   'Cumprimento de obrigação legal',
   true, false, null,
   'under_review', (CURRENT_DATE - INTERVAL '4 months')::date, (CURRENT_DATE + INTERVAL '2 months')::date,
   'high', false, true, v_user_id),

  (sup4, v_cid,
   'RD Station (TOTVS S.A.)', '53.113.791/0001-22', 'https://rdstation.com',
   'Gerente de Conta', 'account@rdstation.com', '(11) 3003-2414',
   'Brasil', 'marketing', 'processor',
   '["Nome e e-mail de leads","Histórico de interações","Dados de comportamento no site"]',
   'Automação de marketing e CRM de leads',
   'Consentimento do titular',
   true, true, (CURRENT_DATE - INTERVAL '5 months')::date,
   'approved', (CURRENT_DATE - INTERVAL '1 month')::date, (CURRENT_DATE + INTERVAL '11 months')::date,
   'low', false, true, v_user_id);

  -- ── 3. Documentos (4 registros) ───────────────────────────
  doc1 := gen_random_uuid(); doc2 := gen_random_uuid();
  doc3 := gen_random_uuid(); doc4 := gen_random_uuid();

  INSERT INTO public.documents
    (id, company_id, title, type, description, version, status, responsible,
     approval_date, review_date, expiration_date, created_by)
  VALUES
  (doc1, v_cid,
   'Política de Privacidade', 'privacy_policy',
   'Documento público informando titulares sobre coleta, uso e proteção de dados pessoais pela plataforma.',
   '1.3', 'published', 'Lauro Omatsu (DPO)',
   (CURRENT_DATE - INTERVAL '3 months')::date,
   (CURRENT_DATE + INTERVAL '9 months')::date,
   (CURRENT_DATE + INTERVAL '21 months')::date,
   v_user_id),

  (doc2, v_cid,
   'DPA — Supabase Inc.', 'dpa_contract',
   'Acordo de Processamento de Dados com Supabase conforme Art. 39 LGPD e GDPR.',
   '1.0', 'approved', 'Lauro Omatsu',
   (CURRENT_DATE - INTERVAL '6 months')::date,
   (CURRENT_DATE + INTERVAL '6 months')::date,
   (CURRENT_DATE + INTERVAL '18 months')::date,
   v_user_id),

  (doc3, v_cid,
   'Política de Segurança da Informação', 'security_policy',
   'Diretrizes técnicas e organizacionais de segurança para desenvolvimento seguro e proteção de dados.',
   '2.0', 'approved', 'Engenharia',
   (CURRENT_DATE - INTERVAL '5 months')::date,
   (CURRENT_DATE + INTERVAL '7 months')::date,
   (CURRENT_DATE + INTERVAL '19 months')::date,
   v_user_id),

  (doc4, v_cid,
   'RIPD — Folha de Pagamento', 'dpia',
   'Relatório de Impacto à Proteção de Dados para o processo de RH que trata dados sensíveis de saúde.',
   '1.0', 'under_review', 'Lauro Omatsu (DPO)',
   null,
   (CURRENT_DATE + INTERVAL '20 days')::date,
   null,
   v_user_id);

  -- ── 4. Riscos (5 registros) ───────────────────────────────
  risk1 := gen_random_uuid(); risk2 := gen_random_uuid(); risk3 := gen_random_uuid();
  risk4 := gen_random_uuid(); risk5 := gen_random_uuid();

  INSERT INTO public.risks
    (id, company_id, title, description, category, origin,
     inherent_probability, inherent_impact,
     residual_probability, residual_impact,
     strategy, action_plan, responsible, deadline, status, created_by)
  VALUES
  (risk1, v_cid,
   'Acesso não autorizado ao banco de dados de clientes',
   'Risco de vazamento de dados de clientes por credenciais comprometidas ou misconfiguration no Supabase.',
   'security', 'inventory',
   4, 5, 2, 3,
   'mitigate',
   'Habilitar RLS em todas as tabelas. Implementar rotação de service_role key. Ativar alertas de acesso anômalo.',
   'Engenharia / DPO',
   (CURRENT_DATE + INTERVAL '15 days')::date,
   'under_treatment', v_user_id),

  (risk2, v_cid,
   'Fornecedor de contabilidade sem DPA com dados sensíveis',
   'Contábil SP processa dados de saúde de colaboradores sem Acordo de Processamento formalizado.',
   'legal', 'supplier',
   3, 5, 3, 5,
   'mitigate',
   'Formalizar DPA com Contábil SP em 30 dias. Incluir cláusulas de sigilo e responsabilidade do operador.',
   'Lauro Omatsu (DPO)',
   (CURRENT_DATE + INTERVAL '30 days')::date,
   'identified', v_user_id),

  (risk3, v_cid,
   'Transferência internacional sem garantias formalizadas',
   'Dados de clientes trafegam para Supabase (EUA) e Vercel (EUA) sem Standard Contractual Clauses explicitamente documentadas.',
   'legal', 'supplier',
   3, 4, 2, 3,
   'mitigate',
   'Documentar SCCs nos contratos com Supabase e Vercel. Consultar ANPD sobre transferências para EUA pós-regulamentação.',
   'Lauro Omatsu',
   (CURRENT_DATE + INTERVAL '45 days')::date,
   'monitoring', v_user_id),

  (risk4, v_cid,
   'Ausência de processo formal de exclusão de dados',
   'Não há rotina documentada para exclusão de dados de clientes após término de contrato.',
   'privacy', 'audit',
   3, 3, 2, 2,
   'mitigate',
   'Implementar rotina automática de anonimização/exclusão após 5 anos. Definir ciclo semestral de revisão de retenção.',
   'Engenharia / DPO',
   (CURRENT_DATE + INTERVAL '60 days')::date,
   'under_treatment', v_user_id),

  (risk5, v_cid,
   'Equipe sem treinamento formal em LGPD',
   'Colaboradores e desenvolvedores não realizaram capacitação formal sobre privacidade e proteção de dados.',
   'operational', 'internal',
   4, 3, 2, 2,
   'mitigate',
   'Realizar treinamento LGPD para toda a equipe até fim do mês. Incluir módulo de segurança para devs.',
   'Lauro Omatsu (DPO)',
   (CURRENT_DATE + INTERVAL '30 days')::date,
   'under_treatment', v_user_id);

  -- ── 5. Incidentes (2 registros) ───────────────────────────
  inc1 := gen_random_uuid(); inc2 := gen_random_uuid();

  INSERT INTO public.incidents
    (id, company_id, title, type, severity, status,
     occurrence_date, discovery_date, description,
     affected_data, affected_data_categories, affected_subjects_count,
     root_cause, immediate_measures, corrective_measures, responsible,
     notified_anpd, notified_subjects, created_by)
  VALUES
  (inc1, v_cid,
   'Exposição acidental de endpoint de API sem autenticação',
   'unauthorized_access', 'medium', 'contained',
   (CURRENT_DATE - INTERVAL '10 days')::date,
   (CURRENT_DATE - INTERVAL '9 days')::date,
   'Endpoint de consulta de dados de uso ficou exposto sem middleware de autenticação por ~4h após deploy.',
   'Metadados de uso (user_id pseudoanonimizado, timestamps de ação)',
   '["dados_eletronicos"]', 0,
   'Deploy sem revisão de peer. Ausência de teste de autenticação no pipeline de CI.',
   'Endpoint desabilitado imediatamente. Logs de acesso analisados. Nenhum acesso externo identificado.',
   'Adicionado teste de autenticação obrigatório no CI/CD. Revisão de todos os endpoints públicos.',
   'Engenharia',
   false, false, v_user_id),

  (inc2, v_cid,
   'Conta de usuário acessada de IP não reconhecido',
   'phishing', 'low', 'resolved',
   (CURRENT_DATE - INTERVAL '30 days')::date,
   (CURRENT_DATE - INTERVAL '29 days')::date,
   'Login em conta de cliente detectado de país diferente do habitual. Confirmado pelo cliente como acesso legítimo em viagem.',
   'Nenhum dado comprometido — acesso legítimo confirmado',
   '[]', 0,
   'Ausência de alerta de geolocalização. Cliente não notificado proativamente.',
   'Sessão verificada com o cliente. Acesso confirmado como legítimo.',
   'Implementar notificação automática para logins de novos dispositivos/locais.',
   'Engenharia / CS',
   false, false, v_user_id);

  -- ── 6. Solicitações de titulares (5 registros) ────────────
  req1 := gen_random_uuid(); req2 := gen_random_uuid(); req3 := gen_random_uuid();
  req4 := gen_random_uuid(); req5 := gen_random_uuid();

  INSERT INTO public.data_subject_requests
    (id, company_id, type, name, email, cpf, description, status, response, response_deadline)
  VALUES
  (req1, v_cid,
   'access', 'Marcos Vinícius Carvalho', 'marcos.carvalho@empresa.com.br', '321.654.987-00',
   'Gostaria de saber quais dados pessoais meus vocês possuem e como são utilizados na plataforma.',
   'completed',
   'Prezado Marcos, em nossa base constam: nome, e-mail corporativo, dados de uso da plataforma (pseudoanonimizados). Tratamos com base em execução de contrato. Atenciosamente, DPO.',
   (CURRENT_DATE - INTERVAL '3 days')::date),

  (req2, v_cid,
   'deletion', 'Patrícia Andrade', 'patricia.andrade@gmail.com', '654.321.098-00',
   'Encerrei meu contrato há 30 dias e solicito a exclusão definitiva de todos os meus dados pessoais.',
   'under_review', null,
   (CURRENT_DATE + INTERVAL '10 days')::date),

  (req3, v_cid,
   'correction', 'Rafael Souza Mendes', 'rafael.souza@tech.io', null,
   'Meu CNPJ empresarial está cadastrado errado. O correto é 45.678.901/0001-23.',
   'pending', null,
   (CURRENT_DATE + INTERVAL '5 days')::date),

  (req4, v_cid,
   'portability', 'Juliana Freitas', 'juliana@startup.com.br', null,
   'Solicito exportação de todos os dados da minha empresa na plataforma em formato JSON para migração.',
   'pending', null,
   (CURRENT_DATE + INTERVAL '12 days')::date),

  (req5, v_cid,
   'objection', 'Thiago Nascimento', 'thiago.n@outlook.com', null,
   'Me oponho ao uso dos meus dados para envio de newsletters e e-mails de marketing. Quero ser removido.',
   'completed',
   'Opt-out realizado com sucesso. Removido de todas as listas de marketing. Descadastramento registrado com data e canal.',
   (CURRENT_DATE - INTERVAL '15 days')::date);

  -- ── 7. Treinamentos + Colaboradores ───────────────────────
  tr1 := gen_random_uuid(); tr2 := gen_random_uuid();

  INSERT INTO public.trainings (id, company_id, title, description, created_by)
  VALUES
  (tr1, v_cid,
   'LGPD na Prática — Módulo Básico',
   'Treinamento obrigatório para todos os colaboradores. Princípios da LGPD, direitos dos titulares, bases legais e boas práticas no dia a dia.',
   v_user_id),
  (tr2, v_cid,
   'Desenvolvimento Seguro e Privacy by Design',
   'Treinamento para equipe técnica. Cobre OWASP, LGPD aplicada ao desenvolvimento, gestão de incidentes e privacy by design.',
   v_user_id);

  INSERT INTO public.training_employees
    (training_id, employee_name, employee_email, employee_whatsapp,
     access_link, status, progress, completed_at)
  VALUES
  (tr1, 'Lauro Omatsu',         'omatsu.technologies@gmail.com', '(11)99000-0001', gen_random_uuid()::text, 'completed', 100, NOW() - INTERVAL '7 days'),
  (tr1, 'Ana Beatriz Costa',    'ana.costa@omatsu.dev',          '(11)99001-0002', gen_random_uuid()::text, 'completed', 100, NOW() - INTERVAL '5 days'),
  (tr1, 'Carlos Eduardo Lima',  'carlos.lima@omatsu.dev',        '(11)99002-0003', gen_random_uuid()::text, 'completed', 100, NOW() - INTERVAL '3 days'),
  (tr1, 'Daniela Ferreira',     'daniela.f@omatsu.dev',          '(11)99003-0004', gen_random_uuid()::text, 'in_progress', 65, null),
  (tr1, 'Eduardo Pires',        'eduardo.p@omatsu.dev',          '(11)99004-0005', gen_random_uuid()::text, 'in_progress', 40, null),
  (tr1, 'Fernanda Rocha',       'fernanda.r@omatsu.dev',         '(11)99005-0006', gen_random_uuid()::text, 'not_started', 0, null),
  (tr2, 'Lauro Omatsu',         'omatsu.technologies@gmail.com', '(11)99000-0001', gen_random_uuid()::text, 'completed', 100, NOW() - INTERVAL '4 days'),
  (tr2, 'Carlos Eduardo Lima',  'carlos.lima@omatsu.dev',        '(11)99002-0003', gen_random_uuid()::text, 'completed', 100, NOW() - INTERVAL '2 days'),
  (tr2, 'Gustavo Mendonça',     'gustavo.m@omatsu.dev',          '(11)99006-0007', gen_random_uuid()::text, 'in_progress', 80, null),
  (tr2, 'Helena Nunes',         'helena.n@omatsu.dev',           '(11)99007-0008', gen_random_uuid()::text, 'not_started', 0, null);

  -- ── 8. Consentimentos + Finalidades ──────────────────────
  cp1 := gen_random_uuid(); cp2 := gen_random_uuid(); cp3 := gen_random_uuid();

  INSERT INTO public.consent_purposes (id, company_id, name, description, legal_basis, required, active)
  VALUES
  (cp1, v_cid, 'Comunicações de Marketing e Produto',
   'Envio de e-mails, newsletters e notificações sobre novidades, releases e conteúdo relevante da plataforma.',
   'Consentimento do titular', false, true),
  (cp2, v_cid, 'Analytics e Melhoria de Produto',
   'Coleta de dados de uso para análise de comportamento, melhoria de UX e priorização de roadmap.',
   'Legítimo interesse', false, true),
  (cp3, v_cid, 'Prestação do Serviço Contratado',
   'Tratamento necessário para operação da plataforma, faturamento, suporte e execução do contrato SaaS.',
   'Execução de contrato', true, true);

  INSERT INTO public.consents
    (company_id, purpose_id, subject_name, subject_email, accepted, policy_version, channel, revoked, revoked_at, revocation_reason)
  VALUES
  (v_cid, cp1, 'Marcos Vinícius Carvalho', 'marcos.carvalho@empresa.com.br', true, '1.3', 'web', false, null, null),
  (v_cid, cp1, 'Patrícia Andrade', 'patricia.andrade@gmail.com', true, '1.3', 'web', true, NOW() - INTERVAL '30 days', 'Solicitação de exclusão de conta'),
  (v_cid, cp1, 'Rafael Souza Mendes', 'rafael.souza@tech.io', false, '1.3', 'email', false, null, null),
  (v_cid, cp1, 'Juliana Freitas', 'juliana@startup.com.br', true, '1.3', 'app', false, null, null),
  (v_cid, cp1, 'Thiago Nascimento', 'thiago.n@outlook.com', true, '1.3', 'web', true, NOW() - INTERVAL '15 days', 'Opt-out de marketing'),
  (v_cid, cp2, 'Marcos Vinícius Carvalho', 'marcos.carvalho@empresa.com.br', true, '1.3', 'web', false, null, null),
  (v_cid, cp2, 'Juliana Freitas', 'juliana@startup.com.br', true, '1.3', 'app', false, null, null),
  (v_cid, cp2, 'Patrícia Andrade', 'patricia.andrade@gmail.com', false, '1.3', 'web', false, null, null),
  (v_cid, cp3, 'Marcos Vinícius Carvalho', 'marcos.carvalho@empresa.com.br', true, '1.3', 'web', false, null, null),
  (v_cid, cp3, 'Patrícia Andrade', 'patricia.andrade@gmail.com', true, '1.3', 'web', false, null, null),
  (v_cid, cp3, 'Rafael Souza Mendes', 'rafael.souza@tech.io', true, '1.3', 'email', false, null, null),
  (v_cid, cp3, 'Juliana Freitas', 'juliana@startup.com.br', true, '1.3', 'app', false, null, null);

  -- ── 9. Denúncias (2 registros) ────────────────────────────
  INSERT INTO public.complaints
    (id, company_id, anonymous, name, email, type, description, status)
  VALUES
  (gen_random_uuid(), v_cid,
   true, null, null, 'data_misuse',
   'Recebi um e-mail de marketing da plataforma mesmo após solicitar descadastramento há duas semanas. Isso parece indevido.',
   'under_review'),
  (gen_random_uuid(), v_cid,
   false, 'Colaborador Dev', 'dev@omatsu.dev', 'privacy_violation',
   'Percebi que alguns logs de depuração em produção contêm e-mails de usuários em texto claro. Isso deveria ser mascarado.',
   'received');

  -- ── 10. Scans de site (2 registros) ─────────────────────
  scan1 := gen_random_uuid(); scan2 := gen_random_uuid();

  BEGIN
    INSERT INTO public.site_scans
      (id, empresa_id, company_id, url, dominio, domain, status, compliance_score,
       has_cookie_banner, has_privacy_policy, privacy_policy_url,
       cookies, technologies, issues, recommendations, created_by)
    VALUES
    (scan1, v_cid, v_cid,
     'https://lgpd-platform.vercel.app', 'lgpd-platform.vercel.app', 'lgpd-platform.vercel.app',
     'completed', 68,
     false, true, 'https://lgpd-platform.vercel.app/privacidade',
     '[{"name":"sb-utesgzaybftosklfuhnt-auth-token","domain":".vercel.app","type":"essential","duration":"1 ano"},{"name":"_vercel_no_cache","domain":".vercel.app","type":"technical","duration":"sessão"}]',
     '[{"name":"Next.js","category":"framework"},{"name":"Vercel Analytics","category":"analytics"},{"name":"Supabase","category":"backend"}]',
     '[{"severity":"high","description":"Ausência de banner de consentimento de cookies"},{"severity":"medium","description":"Cookie de analytics ativo sem aviso específico"}]',
     '[{"priority":"high","description":"Implementar banner de consentimento conforme Art. 8 LGPD"},{"priority":"medium","description":"Diferenciar cookies essenciais de analytics no aviso de privacidade"}]',
     v_user_id),
    (scan2, v_cid, v_cid,
     'https://lgpd-platform.vercel.app/cadastro', 'lgpd-platform.vercel.app', 'lgpd-platform.vercel.app',
     'completed', 82,
     false, true, 'https://lgpd-platform.vercel.app/privacidade',
     '[{"name":"sb-utesgzaybftosklfuhnt-auth-token","domain":".vercel.app","type":"essential","duration":"1 ano"}]',
     '[{"name":"Next.js","category":"framework"},{"name":"Supabase Auth","category":"authentication"}]',
     '[{"severity":"medium","description":"Formulário de cadastro sem link explícito para política de privacidade"}]',
     '[{"priority":"medium","description":"Adicionar checkbox de aceite da política de privacidade no formulário de cadastro"}]',
     v_user_id);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'site_scans seed ignorado (colunas incompatíveis): %', SQLERRM;
  END;

  -- ── 11. Checklist — todos os itens ──────────────────────
  INSERT INTO public.checklist_items (company_id, category, item_key, status, responsible, completion_date, updated_by)
  VALUES
  -- Governança
  (v_cid, 'governanca', 'gov_dpo_nomeado',          'completed',   'Lauro Omatsu',   CURRENT_DATE - 60, v_user_id),
  (v_cid, 'governanca', 'gov_politica_privacidade',  'completed',   'Lauro Omatsu',   CURRENT_DATE - 45, v_user_id),
  (v_cid, 'governanca', 'gov_canal_titular',         'completed',   'Engenharia',     CURRENT_DATE - 30, v_user_id),
  (v_cid, 'governanca', 'gov_programa_privacidade',  'in_progress', 'Lauro Omatsu',   null, v_user_id),
  (v_cid, 'governanca', 'gov_revisao_anual',         'pending',     'Lauro Omatsu',   null, v_user_id),
  -- Inventário
  (v_cid, 'inventario', 'inv_mapeamento_completo',   'completed',   'Lauro Omatsu',   CURRENT_DATE - 40, v_user_id),
  (v_cid, 'inventario', 'inv_base_legal_definida',   'completed',   'Lauro Omatsu',   CURRENT_DATE - 38, v_user_id),
  (v_cid, 'inventario', 'inv_finalidade_documentada','completed',   'Lauro Omatsu',   CURRENT_DATE - 35, v_user_id),
  (v_cid, 'inventario', 'inv_dados_sensiveis_mapeados','completed', 'Lauro Omatsu',   CURRENT_DATE - 33, v_user_id),
  (v_cid, 'inventario', 'inv_retencao_definida',     'in_progress', 'Engenharia',     null, v_user_id),
  -- Consentimento
  (v_cid, 'consentimento', 'con_coleta_valida',      'completed',   'Engenharia',     CURRENT_DATE - 25, v_user_id),
  (v_cid, 'consentimento', 'con_registros_mantidos', 'completed',   'Engenharia',     CURRENT_DATE - 24, v_user_id),
  (v_cid, 'consentimento', 'con_revogacao_facilitada','completed',  'Engenharia',     CURRENT_DATE - 22, v_user_id),
  (v_cid, 'consentimento', 'con_menores_protegidos',  'not_applicable', 'Lauro Omatsu', null, v_user_id),
  -- Direitos dos titulares
  (v_cid, 'direitos', 'dir_processo_resposta',       'completed',   'Lauro Omatsu',   CURRENT_DATE - 20, v_user_id),
  (v_cid, 'direitos', 'dir_prazo_15dias',             'completed',   'Lauro Omatsu',   CURRENT_DATE - 19, v_user_id),
  (v_cid, 'direitos', 'dir_portabilidade',            'in_progress', 'Engenharia',     null, v_user_id),
  (v_cid, 'direitos', 'dir_eliminacao_processo',      'in_progress', 'Engenharia',     null, v_user_id),
  -- Segurança
  (v_cid, 'seguranca', 'seg_medidas_tecnicas',        'completed',   'Engenharia',     CURRENT_DATE - 50, v_user_id),
  (v_cid, 'seguranca', 'seg_politica_seguranca',      'completed',   'Lauro Omatsu',   CURRENT_DATE - 48, v_user_id),
  (v_cid, 'seguranca', 'seg_gestao_acessos',          'completed',   'Engenharia',     CURRENT_DATE - 45, v_user_id),
  (v_cid, 'seguranca', 'seg_backup_teste',            'in_progress', 'Engenharia',     null, v_user_id),
  (v_cid, 'seguranca', 'seg_pen_test',                'pending',     'Engenharia',     null, v_user_id),
  (v_cid, 'seguranca', 'seg_plano_incidentes',        'completed',   'Engenharia',     CURRENT_DATE - 42, v_user_id),
  -- Fornecedores
  (v_cid, 'fornecedores', 'for_mapeamento_operadores','completed',   'Lauro Omatsu',   CURRENT_DATE - 15, v_user_id),
  (v_cid, 'fornecedores', 'for_contratos_dpa',        'in_progress', 'Lauro Omatsu',   null, v_user_id),
  (v_cid, 'fornecedores', 'for_due_diligence',        'in_progress', 'Lauro Omatsu',   null, v_user_id),
  (v_cid, 'fornecedores', 'for_transferencia_internacional', 'in_progress', 'Lauro Omatsu', null, v_user_id),
  -- Treinamento
  (v_cid, 'treinamento', 'tre_treinamento_todos',     'in_progress', 'Lauro Omatsu',   null, v_user_id),
  (v_cid, 'treinamento', 'tre_treinamento_areas_criticas','in_progress','Lauro Omatsu', null, v_user_id),
  (v_cid, 'treinamento', 'tre_cultura_privacidade',   'pending',     'Lauro Omatsu',   null, v_user_id),
  (v_cid, 'treinamento', 'tre_registros_treinamentos','completed',   'Lauro Omatsu',   CURRENT_DATE - 7, v_user_id),
  -- RIPD
  (v_cid, 'ripd', 'ripd_identificacao',               'completed',   'Lauro Omatsu',   CURRENT_DATE - 10, v_user_id),
  (v_cid, 'ripd', 'ripd_elaborado',                   'in_progress', 'Lauro Omatsu',   null, v_user_id),
  (v_cid, 'ripd', 'ripd_privacy_by_design',           'in_progress', 'Engenharia',     null, v_user_id)
  ON CONFLICT (company_id, item_key) DO NOTHING;

  RAISE NOTICE 'Seed admin concluído para company_id: %', v_cid;

END $$;
