-- ============================================================
-- Trigger: semeia dados de demonstração automaticamente
-- quando uma nova empresa é criada via cadastro.
-- ============================================================

-- Função auxiliar (chamada pelo trigger e pelo DO block)
CREATE OR REPLACE FUNCTION public.insert_demo_data(p_company_id uuid, p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_empresa_id uuid;
  inv1 uuid; inv2 uuid; inv3 uuid; inv4 uuid; inv5 uuid;
  sup1 uuid; sup2 uuid; sup3 uuid; sup4 uuid;
  doc1 uuid; doc2 uuid; doc3 uuid; doc4 uuid;
  risk1 uuid; risk2 uuid; risk3 uuid; risk4 uuid; risk5 uuid;
  inc1 uuid; inc2 uuid;
  req1 uuid; req2 uuid; req3 uuid; req4 uuid; req5 uuid;
  tr1 uuid; tr2 uuid;
  cp1 uuid; cp2 uuid; cp3 uuid;
BEGIN
  -- Preencher DPO padrão se vazio
  UPDATE public.companies SET
    dpo_name  = COALESCE(NULLIF(dpo_name,''),  'Ana Carolina Mendes'),
    dpo_email = COALESCE(NULLIF(dpo_email,''), 'dpo@empresa.com.br'),
    dpo_phone = COALESCE(NULLIF(dpo_phone,''), '(11) 99876-5432')
  WHERE id = p_company_id;

  -- Inventário de dados (5 processos)
  inv1:=gen_random_uuid();inv2:=gen_random_uuid();inv3:=gen_random_uuid();
  inv4:=gen_random_uuid();inv5:=gen_random_uuid();

  INSERT INTO public.data_inventory
    (id,company_id,data_type,process_name,responsible_department,process_description,
     lifecycle_phases,data_categories,data_description,processing_frequency,
     data_shared,shared_with,purpose,legal_basis,
     data_source,data_subject_category,storage_type,storage_location,
     retention_period,responsible,security_measures,
     requires_dpia,risk_level,record_status,created_by)
  VALUES
  (inv1,p_company_id,'identificacao pessoal','Cadastro e Gestão de Clientes','Comercial',
   'Coleta e tratamento de dados pessoais de clientes para abertura de conta e relacionamento.',
   '{"coleta":{"ativo":true,"controlador":true,"operador":false},"retencao":{"ativo":true,"controlador":true,"operador":false},"processamento":{"ativo":true,"controlador":true,"operador":true},"compartilhamento":{"ativo":false,"controlador":false,"operador":false},"eliminacao":{"ativo":true,"controlador":true,"operador":false}}',
   '["identificacao_pessoal","dados_governamentais","dados_financeiros"]'::jsonb,
   'Nome completo, CPF, RG, endereço, e-mail, telefone, dados bancários.',
   'contínuo',false,null,'Gestão de relacionamento com clientes, faturamento e contratos.','Execução de contrato',
   'direto','cliente','nuvem','AWS S3 — região sa-east-1','5 anos após encerramento do contrato',
   'Equipe Comercial','Criptografia AES-256, controle de acesso por perfil, backup diário.',
   'nao','low','complete',p_user_id),

  (inv2,p_company_id,'dados sensiveis','Folha de Pagamento e RH','Recursos Humanos',
   'Processamento de dados de colaboradores para fins trabalhistas e previdenciários.',
   '{"coleta":{"ativo":true,"controlador":true,"operador":false},"retencao":{"ativo":true,"controlador":true,"operador":false},"processamento":{"ativo":true,"controlador":true,"operador":true},"compartilhamento":{"ativo":true,"controlador":true,"operador":false},"eliminacao":{"ativo":true,"controlador":true,"operador":false}}',
   '["identificacao_pessoal","dados_governamentais","dados_financeiros","dados_sensiveis"]'::jsonb,
   'CPF, PIS, CTPS, salário, dados bancários, informações de saúde.',
   'contínuo',true,'Contabilidade externa, Operadora de saúde',
   'Cumprimento de obrigações trabalhistas e pagamento de salários.','Cumprimento de obrigação legal',
   'direto','funcionario','hibrido','Sistema ERP + servidor local','10 anos (prazo legal CAGED/eSocial)',
   'Departamento de RH','Acesso restrito ao RH, autenticação dupla fator, logs de acesso.',
   'sim','high','complete',p_user_id),

  (inv3,p_company_id,'dados consentimento','Marketing e Comunicações','Marketing',
   'Envio de comunicações comerciais e campanhas para leads e clientes.',
   '{"coleta":{"ativo":true,"controlador":true,"operador":false},"retencao":{"ativo":true,"controlador":false,"operador":false},"processamento":{"ativo":true,"controlador":true,"operador":true},"compartilhamento":{"ativo":true,"controlador":false,"operador":true},"eliminacao":{"ativo":true,"controlador":true,"operador":false}}',
   '["identificacao_pessoal","dados_eletronicos","dados_consentimento"]'::jsonb,
   'Nome, e-mail, telefone, histórico de navegação, preferências de produto.',
   'contínuo',true,'Plataforma CRM, Meta Ads, Google Ads',
   'Envio de newsletters, ofertas personalizadas e anúncios segmentados.','Consentimento do titular',
   'direto','lead','nuvem','CRM + Google Analytics','2 anos ou até revogação do consentimento',
   'Equipe de Marketing','Opt-out em todas as comunicações, segmentação por consentimento.',
   'nao','medium','complete',p_user_id),

  (inv4,p_company_id,'dados eletronicos','Suporte e Atendimento ao Cliente','Customer Success',
   'Registro e resolução de chamados de suporte técnico e atendimento.',
   '{"coleta":{"ativo":true,"controlador":true,"operador":false},"retencao":{"ativo":true,"controlador":true,"operador":false},"processamento":{"ativo":true,"controlador":true,"operador":false},"compartilhamento":{"ativo":false,"controlador":false,"operador":false},"eliminacao":{"ativo":true,"controlador":true,"operador":false}}',
   '["identificacao_pessoal","dados_eletronicos"]'::jsonb,
   'Nome, e-mail, histórico de chamados, logs de acesso.',
   'contínuo',false,null,'Resolução de problemas técnicos, melhoria de produto.','Execução de contrato',
   'direto','cliente','nuvem','Zendesk Cloud','3 anos após encerramento do contrato',
   'Customer Success','TLS em trânsito, dados mascarados em logs públicos.',
   'nao','low','complete',p_user_id),

  (inv5,p_company_id,'imagem video voz','Monitoramento de Acesso Físico','Segurança Corporativa',
   'Registro de entrada e saída de colaboradores e visitantes.',
   '{"coleta":{"ativo":true,"controlador":true,"operador":false},"retencao":{"ativo":true,"controlador":true,"operador":false},"processamento":{"ativo":true,"controlador":false,"operador":false},"compartilhamento":{"ativo":false,"controlador":false,"operador":false},"eliminacao":{"ativo":true,"controlador":true,"operador":false}}',
   '["identificacao_pessoal","imagem_video_voz"]'::jsonb,
   'Nome, RG, foto, horário de entrada/saída, imagens de câmeras.',
   'contínuo',false,null,'Segurança patrimonial e controle de acesso.','Legítimo interesse',
   'direto','funcionario','fisico','DVR local + controle de acesso',
   '90 dias para imagens; 5 anos para registros','Segurança Corporativa',
   'Acesso físico restrito à sala de servidores.','nao','low','draft',p_user_id);

  -- Fornecedores
  sup1:=gen_random_uuid();sup2:=gen_random_uuid();sup3:=gen_random_uuid();sup4:=gen_random_uuid();

  INSERT INTO public.suppliers
    (id,company_id,name,tax_id,site,contact_name,contact_email,contact_phone,
     country,category,access_type,accessed_data,sharing_purpose,sharing_legal_basis,
     has_contract,has_dpa,dpa_signing_date,
     due_diligence_status,last_assessment_date,next_assessment_date,
     risk_level,international_transfer,active,created_by)
  VALUES
  (sup1,p_company_id,'Amazon Web Services (AWS)','03.467.321/0001-99','https://aws.amazon.com',
   'Gerente de Conta AWS','aws-account@amazon.com','0800 777 9944','Brasil','technology','processor',
   '["Dados de clientes","Dados de colaboradores","Logs de aplicação"]',
   'Hospedagem de infraestrutura','Execução de contrato',
   true,true,(CURRENT_DATE-INTERVAL '8 months')::date,
   'approved',(CURRENT_DATE-INTERVAL '3 months')::date,(CURRENT_DATE+INTERVAL '9 months')::date,
   'low',false,true,p_user_id),
  (sup2,p_company_id,'RD Station (TOTVS)','53.113.791/0001-22','https://rdstation.com',
   'Lucas Ferreira','lucas.ferreira@rdstation.com','(11) 3003-2414','Brasil','marketing','processor',
   '["Dados de leads","E-mails de clientes"]','Automação de marketing e CRM','Consentimento do titular',
   true,true,(CURRENT_DATE-INTERVAL '6 months')::date,
   'approved',(CURRENT_DATE-INTERVAL '2 months')::date,(CURRENT_DATE+INTERVAL '10 months')::date,
   'low',false,true,p_user_id),
  (sup3,p_company_id,'Contabilidade Parceira Ltda.','12.345.678/0001-90',null,
   'Maria Souza','maria@contabilidade.com.br','(11) 3456-7890','Brasil','accounting','processor',
   '["CPF de colaboradores","Dados bancários","Salários","Dados de saúde"]',
   'Processamento de folha de pagamento','Cumprimento de obrigação legal',
   true,false,null,'under_review',
   (CURRENT_DATE-INTERVAL '5 months')::date,(CURRENT_DATE+INTERVAL '1 month')::date,
   'high',false,true,p_user_id),
  (sup4,p_company_id,'Zendesk Inc.',null,'https://zendesk.com',
   'Support Team','support@zendesk.com','+1 (415) 418-7506','Estados Unidos','technology','processor',
   '["Dados de clientes","Histórico de chamados"]',
   'Plataforma de suporte ao cliente','Execução de contrato',
   true,true,(CURRENT_DATE-INTERVAL '1 year')::date,
   'approved',(CURRENT_DATE-INTERVAL '4 months')::date,(CURRENT_DATE+INTERVAL '8 months')::date,
   'medium',true,true,p_user_id);

  -- Documentos
  doc1:=gen_random_uuid();doc2:=gen_random_uuid();doc3:=gen_random_uuid();doc4:=gen_random_uuid();

  INSERT INTO public.documents
    (id,company_id,title,type,description,version,status,responsible,
     approval_date,review_date,expiration_date,created_by)
  VALUES
  (doc1,p_company_id,'Política de Privacidade','privacy_policy',
   'Documento público que informa aos titulares como seus dados são coletados e protegidos.',
   '2.1','published','DPO',
   (CURRENT_DATE-INTERVAL '4 months')::date,(CURRENT_DATE+INTERVAL '8 months')::date,
   (CURRENT_DATE+INTERVAL '20 months')::date,p_user_id),
  (doc2,p_company_id,'DPA — Amazon Web Services','dpa_contract',
   'Acordo de Processamento de Dados com a AWS conforme Art. 39 da LGPD.',
   '1.0','approved','Jurídico',
   (CURRENT_DATE-INTERVAL '8 months')::date,(CURRENT_DATE+INTERVAL '4 months')::date,
   (CURRENT_DATE+INTERVAL '16 months')::date,p_user_id),
  (doc3,p_company_id,'Política de Segurança da Informação','security_policy',
   'Diretrizes técnicas e organizacionais para proteção de dados e sistemas.',
   '3.0','approved','TI / Segurança',
   (CURRENT_DATE-INTERVAL '6 months')::date,(CURRENT_DATE+INTERVAL '6 months')::date,
   (CURRENT_DATE+INTERVAL '18 months')::date,p_user_id),
  (doc4,p_company_id,'Relatório de Impacto à Proteção de Dados — RH','dpia',
   'RIPD para o processo de Folha de Pagamento que trata dados sensíveis de saúde.',
   '1.2','under_review','DPO',null,(CURRENT_DATE+INTERVAL '15 days')::date,null,p_user_id);

  -- Riscos
  risk1:=gen_random_uuid();risk2:=gen_random_uuid();risk3:=gen_random_uuid();
  risk4:=gen_random_uuid();risk5:=gen_random_uuid();

  INSERT INTO public.risks
    (id,company_id,title,description,category,origin,
     inherent_probability,inherent_impact,residual_probability,residual_impact,
     strategy,action_plan,responsible,deadline,status,created_by)
  VALUES
  (risk1,p_company_id,'Acesso não autorizado a dados de clientes',
   'Risco de colaboradores ou terceiros acessarem dados pessoais sem autorização.',
   'security','inventory',4,5,2,4,'mitigate',
   'Implementar MFA em todos os sistemas. Revisar permissões trimestralmente.',
   'TI / Segurança',(CURRENT_DATE+INTERVAL '30 days')::date,'under_treatment',p_user_id),
  (risk2,p_company_id,'Fornecedor sem DPA processa dados sensíveis',
   'Fornecedor de contabilidade processa dados de saúde sem DPA assinado.',
   'legal','supplier',3,5,3,5,'mitigate',
   'Formalizar DPA com fornecedor até 30 dias.',
   'Jurídico / DPO',(CURRENT_DATE+INTERVAL '30 days')::date,'identified',p_user_id),
  (risk3,p_company_id,'Ausência de processo de anonimização pós-retenção',
   'Dados de clientes encerrados armazenados além do prazo de retenção.',
   'privacy','audit',3,3,2,2,'mitigate',
   'Criar rotina automática de anonimização/exclusão.',
   'TI / DPO',(CURRENT_DATE+INTERVAL '60 days')::date,'under_treatment',p_user_id),
  (risk4,p_company_id,'Transferência internacional sem garantias suficientes',
   'Dados trafegam para servidores internacionais sem cláusulas contratuais padrão.',
   'legal','supplier',2,4,2,3,'mitigate',
   'Verificar Standard Contractual Clauses nos contratos.',
   'Jurídico',(CURRENT_DATE+INTERVAL '45 days')::date,'monitoring',p_user_id),
  (risk5,p_company_id,'Colaboradores sem treinamento LGPD',
   'Parte dos colaboradores não concluiu treinamento obrigatório.',
   'operational','internal',4,3,2,2,'mitigate',
   'Concluir programa de treinamentos até fim do trimestre.',
   'RH / DPO',(CURRENT_DATE+INTERVAL '45 days')::date,'under_treatment',p_user_id);

  -- Incidentes
  inc1:=gen_random_uuid();inc2:=gen_random_uuid();

  INSERT INTO public.incidents
    (id,company_id,title,type,severity,status,occurrence_date,discovery_date,description,
     affected_data,affected_data_categories,affected_subjects_count,
     root_cause,immediate_measures,corrective_measures,responsible,
     notified_anpd,notified_subjects,created_by)
  VALUES
  (inc1,p_company_id,'Tentativa de Phishing — Credenciais de Colaborador',
   'phishing','medium','contained',
   (CURRENT_DATE-INTERVAL '12 days')::date,(CURRENT_DATE-INTERVAL '11 days')::date,
   'Colaborador recebeu e-mail fraudulento e inseriu credenciais. Acesso bloqueado em 2h.',
   'Credenciais de acesso ao ERP','["dados_eletronicos","identificacao_pessoal"]',1,
   'E-mail de phishing passou pelos filtros. Colaborador sem treinamento atualizado.',
   'Senha redefinida. Sessões encerradas. MFA habilitado.',
   'Treinamento de conscientização. Revisão das regras de filtro.',
   'Equipe de Segurança TI',false,false,p_user_id),
  (inc2,p_company_id,'Vazamento de Planilha de Leads — Canal Não Autorizado',
   'unauthorized_access','high','resolved',
   (CURRENT_DATE-INTERVAL '45 days')::date,(CURRENT_DATE-INTERVAL '44 days')::date,
   'Planilha com 1.200 e-mails foi compartilhada via WhatsApp por ex-colaborador.',
   'Nome, e-mail e telefone de 1.200 leads','["identificacao_pessoal"]',1200,
   'Acesso ao CRM não foi revogado após desligamento.',
   'Acesso revogado. Usuário notificado juridicamente.',
   'Checklist de offboarding com revogação imediata. DLP ativado.',
   'RH / Jurídico / TI',true,false,p_user_id);

  -- Solicitações de titulares
  req1:=gen_random_uuid();req2:=gen_random_uuid();req3:=gen_random_uuid();
  req4:=gen_random_uuid();req5:=gen_random_uuid();

  INSERT INTO public.data_subject_requests
    (id,company_id,type,name,email,cpf,description,status,response,response_deadline)
  VALUES
  (req1,p_company_id,'access','Carlos Eduardo Martins','carlos.martins@email.com','123.456.789-00',
   'Gostaria de saber quais dados pessoais meus a empresa possui.',
   'completed','Prezado Carlos, seus dados: nome, e-mail, telefone, histórico de compras.',
   (CURRENT_DATE-INTERVAL '5 days')::date),
  (req2,p_company_id,'deletion','Mariana Costa Oliveira','mariana.costa@gmail.com','987.654.321-00',
   'Solicito a exclusão de todos os meus dados pessoais.',
   'under_review',null,(CURRENT_DATE+INTERVAL '8 days')::date),
  (req3,p_company_id,'correction','Roberto Alves da Silva','roberto.alves@empresa.com','456.789.123-00',
   'Meu endereço está incorreto. O correto é Rua das Flores, 123, Apt 45, São Paulo/SP.',
   'pending',null,(CURRENT_DATE+INTERVAL '3 days')::date),
  (req4,p_company_id,'portability','Fernanda Lima','fernanda.lima@outlook.com',null,
   'Solicito portabilidade dos meus dados em formato JSON ou CSV.',
   'pending',null,(CURRENT_DATE+INTERVAL '10 days')::date),
  (req5,p_company_id,'objection','Paulo Henrique Rocha','paulo.rocha@yahoo.com',null,
   'Me oponho ao uso dos meus dados para campanhas de marketing.',
   'completed','Opt-out realizado. Dados removidos de todas as listas.',
   (CURRENT_DATE-INTERVAL '20 days')::date);

  -- Treinamentos + Colaboradores
  tr1:=gen_random_uuid();tr2:=gen_random_uuid();

  INSERT INTO public.trainings(id,company_id,title,description,created_by)VALUES
  (tr1,p_company_id,'LGPD na Prática — Módulo Básico',
   'Treinamento obrigatório sobre princípios da LGPD, direitos dos titulares e bases legais.',p_user_id),
  (tr2,p_company_id,'Segurança da Informação e Proteção de Dados',
   'Treinamento avançado para TI e líderes sobre gestão de incidentes e controles técnicos.',p_user_id);

  INSERT INTO public.training_employees
    (training_id,employee_name,employee_email,employee_whatsapp,access_link,status,progress,completed_at)
  VALUES
  (tr1,'Ana Paula Ferreira','ana.ferreira@empresa.com.br','(11)99111-1111',gen_random_uuid()::text,'completed',100,NOW()-INTERVAL '5 days'),
  (tr1,'Bruno Carvalho','bruno.carvalho@empresa.com.br','(11)99222-2222',gen_random_uuid()::text,'completed',100,NOW()-INTERVAL '3 days'),
  (tr1,'Camila Santos','camila.santos@empresa.com.br','(11)99333-3333',gen_random_uuid()::text,'completed',100,NOW()-INTERVAL '1 day'),
  (tr1,'Diego Mendonça','diego.mendonca@empresa.com.br','(11)99444-4444',gen_random_uuid()::text,'in_progress',60,null),
  (tr1,'Eduarda Pinto','eduarda.pinto@empresa.com.br','(11)99555-5555',gen_random_uuid()::text,'in_progress',30,null),
  (tr1,'Felipe Torres','felipe.torres@empresa.com.br','(11)99666-6666',gen_random_uuid()::text,'not_started',0,null),
  (tr1,'Gabriela Rodrigues','gabriela.rodrigues@empresa.com.br','(11)99777-7777',gen_random_uuid()::text,'not_started',0,null),
  (tr2,'Ana Paula Ferreira','ana.ferreira@empresa.com.br','(11)99111-1111',gen_random_uuid()::text,'completed',100,NOW()-INTERVAL '2 days'),
  (tr2,'Henrique Bastos','henrique.bastos@empresa.com.br','(11)99888-8888',gen_random_uuid()::text,'completed',100,NOW()-INTERVAL '1 day'),
  (tr2,'Isabela Nunes','isabela.nunes@empresa.com.br','(11)99999-9999',gen_random_uuid()::text,'in_progress',75,null),
  (tr2,'João Victor Lima','joao.lima@empresa.com.br','(11)98111-0000',gen_random_uuid()::text,'not_started',0,null);

  -- Consentimentos + Finalidades
  cp1:=gen_random_uuid();cp2:=gen_random_uuid();cp3:=gen_random_uuid();

  INSERT INTO public.consent_purposes(id,company_id,name,description,legal_basis,required,active)VALUES
  (cp1,p_company_id,'Comunicações de Marketing',
   'Envio de e-mails, SMS e notificações sobre ofertas e novidades.','Consentimento do titular',false,true),
  (cp2,p_company_id,'Melhoria de Produto e Analytics',
   'Coleta de dados de uso para análise de comportamento.','Legítimo interesse',false,true),
  (cp3,p_company_id,'Execução do Contrato de Serviço',
   'Tratamento necessário para prestação dos serviços contratados.','Execução de contrato',true,true);

  INSERT INTO public.consents
    (company_id,purpose_id,subject_name,subject_email,accepted,policy_version,channel,revoked,revoked_at,revocation_reason)
  VALUES
  (p_company_id,cp1,'Carlos Eduardo Martins','carlos.martins@email.com',true,'2.1','web',false,null,null),
  (p_company_id,cp1,'Mariana Costa Oliveira','mariana.costa@gmail.com',true,'2.1','web',true,NOW()-INTERVAL '2 days','Solicitação de exclusão'),
  (p_company_id,cp1,'Roberto Alves da Silva','roberto.alves@empresa.com',false,'2.1','email',false,null,null),
  (p_company_id,cp1,'Fernanda Lima','fernanda.lima@outlook.com',true,'2.1','app',false,null,null),
  (p_company_id,cp1,'Paulo Henrique Rocha','paulo.rocha@yahoo.com',true,'2.1','web',true,NOW()-INTERVAL '20 days','Opt-out de marketing'),
  (p_company_id,cp2,'Carlos Eduardo Martins','carlos.martins@email.com',true,'2.1','web',false,null,null),
  (p_company_id,cp2,'Fernanda Lima','fernanda.lima@outlook.com',true,'2.1','app',false,null,null),
  (p_company_id,cp2,'Mariana Costa Oliveira','mariana.costa@gmail.com',false,'2.1','web',false,null,null),
  (p_company_id,cp3,'Carlos Eduardo Martins','carlos.martins@email.com',true,'2.1','web',false,null,null),
  (p_company_id,cp3,'Mariana Costa Oliveira','mariana.costa@gmail.com',true,'2.1','web',false,null,null),
  (p_company_id,cp3,'Roberto Alves da Silva','roberto.alves@empresa.com',true,'2.1','email',false,null,null),
  (p_company_id,cp3,'Fernanda Lima','fernanda.lima@outlook.com',true,'2.1','app',false,null,null);

  -- Denúncias
  INSERT INTO public.complaints(company_id,anonymous,name,email,type,description,status)VALUES
  (p_company_id,true,null,null,'data_misuse',
   'Percebi que dados de clientes estão sendo compartilhados com terceiros sem consentimento.','under_review'),
  (p_company_id,false,'Colaboradora do RH','colaboradora.rh@interno.com','privacy_violation',
   'Alguns gestores têm acesso às informações de saúde dos colaboradores sem necessidade.','received');

  -- Site Scans
  SELECT id INTO v_empresa_id FROM public.empresas ORDER BY created_at LIMIT 1;
  BEGIN
    INSERT INTO public.site_scans
      (id,empresa_id,company_id,url,dominio,domain,status,compliance_score,
       has_cookie_banner,has_privacy_policy,privacy_policy_url,
       cookies,technologies,issues,recommendations,created_by)
    VALUES
    (gen_random_uuid(),COALESCE(v_empresa_id,p_company_id),p_company_id,
     'https://seusite.com.br','seusite.com.br','seusite.com.br','completed',72,
     true,true,'https://seusite.com.br/privacidade',
     '[{"name":"_ga","type":"analytics","duration":"2 anos"},{"name":"_fbp","type":"marketing","duration":"90 dias"},{"name":"session_id","type":"essential","duration":"sessão"}]'::jsonb,
     '[{"name":"Google Analytics","category":"analytics"},{"name":"Facebook Pixel","category":"marketing"}]'::jsonb,
     '[{"severity":"high","description":"Cookies de marketing carregados antes do consentimento"},{"severity":"medium","description":"Banner sem opção de rejeitar todos"}]'::jsonb,
     '[{"priority":"high","description":"Bloquear cookies de marketing até consentimento explícito"},{"priority":"medium","description":"Adicionar botão Rejeitar Todos no banner"}]'::jsonb,
     p_user_id);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Checklist
  INSERT INTO public.checklist_items(company_id,category,item_key,status,responsible,completion_date,updated_by)VALUES
  (p_company_id,'mapeamento','mapeamento_1','completed','DPO',CURRENT_DATE-30,p_user_id),
  (p_company_id,'mapeamento','mapeamento_2','completed','DPO',CURRENT_DATE-28,p_user_id),
  (p_company_id,'mapeamento','mapeamento_3','completed','TI',CURRENT_DATE-25,p_user_id),
  (p_company_id,'mapeamento','mapeamento_4','in_progress','DPO',null,p_user_id),
  (p_company_id,'bases_legais','bases_legais_1','completed','Jurídico',CURRENT_DATE-20,p_user_id),
  (p_company_id,'bases_legais','bases_legais_2','completed','DPO',CURRENT_DATE-18,p_user_id),
  (p_company_id,'bases_legais','bases_legais_3','in_progress','Jurídico',null,p_user_id),
  (p_company_id,'direitos_titulares','direitos_titulares_1','completed','DPO',CURRENT_DATE-15,p_user_id),
  (p_company_id,'direitos_titulares','direitos_titulares_2','completed','TI',CURRENT_DATE-14,p_user_id),
  (p_company_id,'direitos_titulares','direitos_titulares_3','completed','DPO',CURRENT_DATE-12,p_user_id),
  (p_company_id,'seguranca','seguranca_1','completed','TI',CURRENT_DATE-22,p_user_id),
  (p_company_id,'seguranca','seguranca_2','completed','TI',CURRENT_DATE-20,p_user_id),
  (p_company_id,'seguranca','seguranca_3','in_progress','TI',null,p_user_id),
  (p_company_id,'seguranca','seguranca_4','pending','TI',null,p_user_id),
  (p_company_id,'governanca','governanca_1','completed','DPO',CURRENT_DATE-35,p_user_id),
  (p_company_id,'governanca','governanca_2','completed','Diretoria',CURRENT_DATE-33,p_user_id),
  (p_company_id,'governanca','governanca_3','in_progress','DPO',null,p_user_id),
  (p_company_id,'fornecedores','fornecedores_1','completed','Jurídico',CURRENT_DATE-10,p_user_id),
  (p_company_id,'fornecedores','fornecedores_2','in_progress','Jurídico',null,p_user_id),
  (p_company_id,'treinamento','treinamento_1','completed','RH',CURRENT_DATE-8,p_user_id),
  (p_company_id,'treinamento','treinamento_2','in_progress','RH',null,p_user_id),
  (p_company_id,'consentimento','consentimento_1','completed','TI',CURRENT_DATE-16,p_user_id),
  (p_company_id,'consentimento','consentimento_2','completed','Marketing',CURRENT_DATE-14,p_user_id),
  (p_company_id,'consentimento','consentimento_3','in_progress','Marketing',null,p_user_id),
  (p_company_id,'incidentes','incidentes_1','completed','TI',CURRENT_DATE-40,p_user_id),
  (p_company_id,'incidentes','incidentes_2','in_progress','TI',null,p_user_id)
  ON CONFLICT (company_id,item_key) DO NOTHING;

END;
$$;

-- ── Trigger: chama insert_demo_data após criar empresa ──────
CREATE OR REPLACE FUNCTION public.seed_demo_for_company()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.owner_id IS NOT NULL THEN
    PERFORM public.insert_demo_data(NEW.id, NEW.owner_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_seed_demo_company ON public.companies;

CREATE TRIGGER trigger_seed_demo_company
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_demo_for_company();

-- ── Seed para empresas existentes sem dados de inventário ───
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT c.id AS company_id, c.owner_id AS user_id
    FROM public.companies c
    WHERE NOT EXISTS (
      SELECT 1 FROM public.data_inventory di WHERE di.company_id = c.id
    )
    AND c.owner_id IS NOT NULL
  LOOP
    RAISE NOTICE 'Semeando demo para company_id: %', rec.company_id;
    PERFORM public.insert_demo_data(rec.company_id, rec.user_id);
  END LOOP;
END $$;
