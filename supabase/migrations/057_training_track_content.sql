-- Migration 057: conteúdo inicial da trilha "Treinamento LGPD" da Serra Privacy.
--
-- Fonte: "Estrutura do Treinamento LGPD" e "Quizzes e Banco de Questões do
-- Treinamento LGPD" (versão 1.0, outubro de 2026).
--
-- 3 módulos, 12 vídeos, 48 perguntas de quiz (4 por vídeo) e banco de 50
-- questões da avaliação final (5 + 4 + 6 sorteadas por módulo).
--
-- VÍDEOS PENDENTES: video_url, captions_url e transcript ficam null até os
-- vídeos serem gravados e hospedados (plataforma a definir: Vimeo, Bunny
-- Stream, Cloudflare Stream ou similar). Enquanto video_url for null, a página
-- do vídeo mostra a mensagem principal e o aluno confirma a leitura para
-- seguir; ao preencher a URL, o controle de percentual assistido passa a valer.
--
-- Parâmetros a confirmar antes do lançamento (editáveis em training_tracks):
-- nota mínima (70%), tentativas (ilimitadas), carga horária (60 min) e
-- validade do certificado (sem validade).

do $$
declare
  v_track_id uuid;
  v_module_ids uuid[] := array[]::uuid[];
  v_video_ids uuid[] := array[]::uuid[];
  v_module_id uuid;
  v_video_id uuid;
  v_question_id uuid;
  v_option_id uuid;
begin
  insert into public.training_tracks (
    slug, title, description, video_quiz_pass_ratio, final_exam_pass_ratio,
    final_exam_max_attempts, workload_minutes, certificate_validity_months
  ) values (
    'lgpd-awareness',
    'Treinamento LGPD',
    'Trilha de conscientização em LGPD para colaboradores: vídeos curtos, quiz de fixação e certificado ao final.',
    0.75, 0.70, null, 60, null
  ) returning id into v_track_id;

  insert into public.training_modules (track_id, position, title, objective, final_exam_question_count)
  values (v_track_id, 1, 'Fundamentos da LGPD', 'Ensinar os conceitos essenciais para que qualquer colaborador compreenda a proteção de dados.', 5)
  returning id into v_module_id;
  v_module_ids := v_module_ids || v_module_id;

  insert into public.training_modules (track_id, position, title, objective, final_exam_question_count)
  values (v_track_id, 2, 'Consciência e comportamento seguro', 'Transformar os conceitos jurídicos em atitudes concretas no trabalho e na vida digital.', 4)
  returning id into v_module_id;
  v_module_ids := v_module_ids || v_module_id;

  insert into public.training_modules (track_id, position, title, objective, final_exam_question_count)
  values (v_track_id, 3, 'Adequação à LGPD na prática', 'Explicar como a empresa organiza sua adequação e quais responsabilidades os colaboradores precisam observar.', 6)
  returning id into v_module_id;
  v_module_ids := v_module_ids || v_module_id;


  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[1], 1, 'O que é a LGPD e por que ela existe?', 'A LGPD não proíbe o uso de dados; exige uso responsável, com finalidade, segurança e transparência.', 90, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[1], 2, 'O que são dados pessoais?', 'Um dado aparentemente simples também pode identificar uma pessoa.', 90, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[1], 3, 'O que são dados pessoais sensíveis?', 'Quanto maior o impacto potencial sobre a pessoa, maior o cuidado com acesso e segurança.', 90, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[1], 4, 'Quem são os agentes de tratamento?', 'Saber quem decide, quem executa e quem orienta ajuda a encaminhar dúvidas e incidentes às pessoas certas.', 120, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[2], 5, 'Como seus dados são utilizados no dia a dia?', 'Ter acesso a uma informação não significa ter liberdade para usá-la de qualquer maneira.', 90, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[2], 6, 'Cuidados com crianças e dados de saúde', 'Dados de crianças e dados sensíveis exigem acesso restrito e respeito às condições legais.', 90, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[2], 7, 'Senhas, e-mails e compartilhamento de informações', 'Segurança da informação é uma prática diária de todos, não só da equipe de TI.', 90, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[3], 8, 'O que são os documentos de adequação à LGPD?', 'A documentação organiza as regras; a aplicação delas é que transforma a adequação em prática.', 120, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[3], 9, 'Medidas de segurança da informação', 'Segurança é a combinação de tecnologia, processos e comportamento humano.', 120, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[3], 10, 'Como agir diante de um incidente de segurança?', 'Comunicar rapidamente não é admitir culpa; é permitir que a organização aja.', 90, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[3], 11, 'Direitos dos titulares de dados', 'Pedidos de titulares devem ser encaminhados ao responsável, com seriedade e dentro dos requisitos legais.', 90, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  insert into public.training_videos (module_id, position, title, key_message, duration_seconds, status)
  values (v_module_ids[3], 12, 'O papel de cada colaborador na adequação', 'Proteger dados é respeitar pessoas.', 90, 'published')
  returning id into v_video_id;
  v_video_ids := v_video_ids || v_video_id;

  -- Parte A: quizzes por vídeo
  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '1.1', 'video_quiz', v_video_ids[1], null, 'Qual é o principal objetivo da LGPD?', 'A LGPD protege direitos fundamentais no tratamento de dados pessoais. Ela não proíbe o uso; exige regras.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Proibir as empresas de utilizarem dados pessoais');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Proteger a privacidade, a liberdade e os direitos fundamentais das pessoas no tratamento de dados') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Regular apenas dados coletados pela internet');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Substituir o Código de Defesa do Consumidor');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '1.2', 'video_quiz', v_video_ids[1], null, 'Qual afirmação sobre a LGPD está correta?', 'A lei vale para qualquer tratamento de dados pessoais, digital ou físico, por organizações de qualquer porte.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Só se aplica a empresas de tecnologia');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Permite o tratamento de dados pessoais, desde que siga as regras legais, com finalidade adequada, segurança e transparência') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Só vale para dados em meio digital');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Aplica-se somente a grandes empresas');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '1.3', 'video_quiz', v_video_ids[1], null, 'Qual é a lei que instituiu a LGPD?', 'A LGPD é a Lei nº 13.709/2018. As outras são o Marco Civil da Internet, o Código de Defesa do Consumidor e a Lei de Acesso à Informação.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Lei nº 12.965, de 2014');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Lei nº 8.078, de 1990');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Lei nº 13.709, de 2018') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Lei nº 12.527, de 2011');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '1.4', 'video_quiz', v_video_ids[1], null, 'Quem é responsável pela proteção de dados dentro da empresa?', 'A responsabilidade não é só da TI ou da direção. Cada colaborador que lida com dados participa da proteção.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Apenas o departamento de TI');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Apenas a direção');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Apenas o setor jurídico');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Todos os colaboradores, pois isso faz parte das atividades de cada um') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '2.1', 'video_quiz', v_video_ids[2], null, 'O que são dados pessoais?', 'Dado pessoal é qualquer informação que identifique ou possa identificar uma pessoa natural.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Informações de empresas (pessoas jurídicas)');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Informações relacionadas a uma pessoa natural identificada ou identificável') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Apenas documentos oficiais, como CPF e RG');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Somente informações sigilosas');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '2.2', 'video_quiz', v_video_ids[2], null, 'Qual alternativa traz exemplos de dados pessoais?', 'Dados pessoais vão além de documentos oficiais e incluem informações do dia a dia.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Apenas CPF e RG');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Apenas dados de saúde');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Apenas dados bancários');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Nome, telefone, e-mail, endereço, fotografia e localização') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '2.3', 'video_quiz', v_video_ids[2], null, 'Um endereço IP ou um identificador digital:', 'Informações que identificam alguém, sozinhas ou combinadas com outros dados, podem ser dados pessoais.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Pode ser dado pessoal, dependendo do contexto') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Nunca é dado pessoal');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'É sempre dado sensível');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Só é dado pessoal se estiver impresso');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '2.4', 'video_quiz', v_video_ids[2], null, 'Antes de compartilhar uma planilha com dados de clientes, qual é o hábito correto?', 'Antes de coletar, consultar, compartilhar ou armazenar, avalie a necessidade e a autorização.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Enviar pelo WhatsApp pessoal para ser mais rápido');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Enviar a todos, pois são dados simples');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Avaliar se a informação é necessária e se o destinatário está autorizado') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Aguardar o titular pedir');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '3.1', 'video_quiz', v_video_ids[3], null, 'Qual é um exemplo de dado pessoal sensível?', 'Dados de saúde são sensíveis e exigem cuidado especial.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Nome completo');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Endereço de e-mail');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Informação sobre a saúde de uma pessoa') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'CEP');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '3.2', 'video_quiz', v_video_ids[3], null, 'Qual item NÃO consta na lista de dados sensíveis da LGPD?', 'O telefone é dado pessoal comum. Os demais itens são sensíveis.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Convicção religiosa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Dado biométrico vinculado a uma pessoa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Filiação a sindicato');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Número de telefone') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '3.3', 'video_quiz', v_video_ids[3], null, 'Como devem ser tratados os exames médicos ocupacionais de colaboradores?', 'Dados de saúde não podem ser acessados livremente por todos.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Com acesso restrito a quem precisa deles para uma finalidade legítima') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Com acesso livre a todos os funcionários');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Divulgados em grupos de mensagens');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Guardados em pasta compartilhada aberta');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '3.4', 'video_quiz', v_video_ids[3], null, 'Qual é a orientação para dados sensíveis na rotina profissional?', 'Os dados sensíveis têm hipóteses legais próprias. Não basta presumir autorização.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Presumir que há autorização se o dado já está na empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Não consultar, copiar, divulgar ou compartilhar sem necessidade e autorização adequada') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Compartilhar com a equipe do mesmo setor');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Copiar para o dispositivo pessoal para trabalhar em casa');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '4.1', 'video_quiz', v_video_ids[4], null, 'Quem é o titular dos dados?', 'O titular pode ser cliente, colaborador, fornecedor ou candidato.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'A empresa que decide as finalidades do tratamento');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'O prestador que processa os dados em nome da empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'A pessoa natural a quem os dados se referem') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'A Autoridade Nacional de Proteção de Dados');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '4.2', 'video_quiz', v_video_ids[4], null, 'O que faz o controlador?', 'O controlador define, por exemplo, quais dados serão coletados e para quais finalidades.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Realiza o tratamento em nome de outra empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Toma as decisões referentes ao tratamento dos dados pessoais') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Fiscaliza o cumprimento da LGPD em todo o país');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Recebe e responde a todas as solicitações dos titulares');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '4.3', 'video_quiz', v_video_ids[4], null, 'Quem é o operador?', 'Um prestador que processa cadastros para a empresa contratante é um exemplo de operador.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Quem realiza o tratamento em nome do controlador, seguindo suas instruções legítimas') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Quem decide as finalidades do tratamento');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'A pessoa a quem os dados se referem');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'O órgão que aplica as sanções');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '4.4', 'video_quiz', v_video_ids[4], null, 'Como se define se uma parte é controladora ou operadora?', 'Os papéis não se definem só pelo contrato; é preciso observar o que cada parte realmente faz.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Apenas pelo nome que consta no contrato');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Pelo tamanho da empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Pela quantidade de dados que trata');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Pelas atividades efetivamente realizadas por cada parte') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '5.1', 'video_quiz', v_video_ids[5], null, 'Quando um dado pode ser usado para outras finalidades, além da inicial?', 'O uso depende de base legal adequada e de respeito às regras aplicáveis.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Desde que exista base legal adequada e as regras aplicáveis sejam respeitadas') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Sempre que o dado já estiver no sistema');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Nunca, em nenhuma hipótese');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Apenas se o cliente não reclamar');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '5.2', 'video_quiz', v_video_ids[5], null, 'Segundo o vídeo, quando o problema começa?', 'Coletar sem necessidade, desviar a finalidade e compartilhar sem avaliação geram risco.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Quando o cliente informa o CPF em uma compra');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Quando a empresa mantém um cadastro de clientes');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Quando os dados são coletados sem necessidade, usados de forma incompatível com a finalidade ou compartilhados sem avaliação') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Quando a empresa emite uma nota fiscal');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '5.3', 'video_quiz', v_video_ids[5], null, 'Um colaborador recebe uma lista de contatos de clientes para uma atividade. Ele pode usá-la para fins pessoais?', 'O acesso é concedido para uma atividade. Usar fora dela é uso indevido.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Sim, pois já tem acesso à lista');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Sim, desde que ocasionalmente');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Sim, se avisar um colega');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Não. Ter acesso a uma informação não significa liberdade para usá-la de qualquer maneira') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '5.4', 'video_quiz', v_video_ids[5], null, 'Qual pergunta ajuda a reduzir riscos antes de usar um dado pessoal?', 'São as três perguntas do vídeo: necessidade, autorização e destinatário.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'O dado é antigo?');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Preciso dessa informação para minha atividade, estou autorizado a acessá-la e posso compartilhá-la com esse destinatário?') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'O dado está salvo na minha área de trabalho?');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Outros colegas também usam esse dado?');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '6.1', 'video_quiz', v_video_ids[6], null, 'O tratamento de dados de crianças e adolescentes deve observar:', 'A LGPD determina que o tratamento observe o melhor interesse da criança e do adolescente.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'A conveniência da empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'O interesse do responsável financeiro');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'O melhor interesse da criança ou do adolescente') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'O volume de dados disponível');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '6.2', 'video_quiz', v_video_ids[6], null, 'Para tratar dados de crianças com base no consentimento, a LGPD exige:', 'Existem exceções legais, mas a regra é o consentimento específico e em destaque de um dos pais ou responsável.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Consentimento específico e em destaque de pelo menos um dos pais ou responsável legal, ressalvadas as exceções legais') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Consentimento da própria criança');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Nenhum consentimento, pois são dados públicos');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Consentimento de qualquer funcionário da escola');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '6.3', 'video_quiz', v_video_ids[6], null, 'Você viu o atestado médico de um colega. Qual é a conduta correta?', 'Dados de saúde exigem acesso restrito e respeito à dignidade e à privacidade.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Comentar no grupo para a equipe se organizar');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Compartilhar com gestores de outras áreas');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Guardar em pasta aberta a todos');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Não comentar nem compartilhar com quem não precisa conhecer a informação para uma finalidade legítima') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '6.4', 'video_quiz', v_video_ids[6], null, 'Como são classificados exames, diagnósticos e informações médicas?', 'São dados sensíveis e têm regras próprias de tratamento.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Dados comuns');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Dados pessoais sensíveis, com regras próprias') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Dados públicos');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Dados anônimos');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '7.1', 'video_quiz', v_video_ids[7], null, 'Qual é uma boa prática para senhas?', 'Senhas fracas ou compartilhadas abrem caminho para acessos indevidos.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Usar a mesma senha em todos os sistemas');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Compartilhar com um colega de confiança');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Usar senhas fortes e exclusivas, não compartilhá-las e ativar a autenticação multifator') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Anotar a senha em um papel junto ao monitor');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '7.2', 'video_quiz', v_video_ids[7], null, 'Você recebe um e-mail inesperado pedindo atualização de cadastro. O que fazer?', 'E-mails inesperados podem ser tentativas de golpe. Confirme por outro canal confiável.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Verificar o remetente e confirmar a solicitação por um canal confiável antes de agir') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Clicar no link para conferir');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Responder pedindo mais informações');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Encaminhar a colegas');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '7.3', 'video_quiz', v_video_ids[7], null, 'Antes de enviar documentos e planilhas, o que se deve fazer?', 'Erros de envio são causa comum de incidentes.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Usar uma conta pessoal para agilizar');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Enviar a lista inteira a todos');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Conferir apenas o assunto');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Conferir o destinatário e os anexos e usar os canais aprovados pela empresa') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '7.4', 'video_quiz', v_video_ids[7], null, 'Você percebe que enviou informações para a pessoa errada. O que fazer?', 'A comunicação rápida ajuda a reduzir os danos.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Apagar tudo e não comentar com ninguém');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Comunicar imediatamente pelo canal interno, sem esconder o problema nem apagar evidências') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Aguardar para ver se alguém reclama');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Avisar apenas um amigo da equipe');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '8.1', 'video_quiz', v_video_ids[8], null, 'O que envolve a adequação à LGPD?', 'A adequação vai além de um documento: envolve entender o uso dos dados, avaliar riscos e aplicar medidas.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Apenas publicar uma política de privacidade no site');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Compreender como a empresa usa dados pessoais, identificar riscos e estabelecer regras e procedimentos, com medidas efetivas') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Apenas contratar um software');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Apenas nomear um responsável');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '8.2', 'video_quiz', v_video_ids[8], null, 'Para que serve o inventário de dados pessoais?', 'O inventário é a base para entender o tratamento realizado pela empresa.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Para cadastrar clientes');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Para divulgar a empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Para calcular impostos');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Para identificar quais dados são tratados, de onde vêm, para que são usados, onde ficam armazenados e com quem são compartilhados') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '8.3', 'video_quiz', v_video_ids[8], null, 'Que característica um documento de adequação deve ter?', 'Os documentos não são peças isoladas e precisam refletir a prática.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Refletir a realidade da empresa, estar atualizado e ser acompanhado de medidas efetivas') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Ser o mais longo possível');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Ser copiado de outra empresa, sem adaptações');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Ficar guardado apenas com a diretoria');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '8.4', 'video_quiz', v_video_ids[8], null, 'Por que a participação dos colaboradores é essencial quando a empresa levanta informações para a adequação?', 'Os colaboradores conhecem as rotinas reais com dados pessoais.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Porque substitui a necessidade de contratos');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Porque o RH exige presença');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Porque conhecem muitas das atividades realizadas no dia a dia') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Porque só eles podem assinar os documentos');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '9.1', 'video_quiz', v_video_ids[9], null, 'Qual é um exemplo de medida de segurança técnica?', 'Autenticação multifator, criptografia, backup e controle de acesso são medidas técnicas. As demais são administrativas.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Política interna');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Treinamento de colaboradores');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Autenticação multifator') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Definição de responsabilidades');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '9.2', 'video_quiz', v_video_ids[9], null, 'Qual prática de controle de acesso é mais adequada?', 'Acesso irrestrito aumenta o risco de consulta, alteração ou compartilhamento inadequado.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Cada pessoa acessa apenas as informações necessárias para suas funções') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Todos os funcionários acessam todas as pastas');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'O acesso é liberado por antiguidade');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'O acesso é liberado para quem pedir primeiro');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '9.3', 'video_quiz', v_video_ids[9], null, 'O que se espera das cópias de segurança (backups)?', 'Backups ajudam na recuperação, mas precisam de planejamento, proteção e testes.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Que não precisem de proteção');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Que existam, mesmo sem teste');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Que fiquem em qualquer dispositivo');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Que sejam planejadas, protegidas e testadas') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '9.4', 'video_quiz', v_video_ids[9], null, 'Qual é um cuidado de segurança física?', 'Segurança também envolve documentos impressos.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Deixar documentos impressos sobre a mesa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Não deixar documentos expostos e descartar informações confidenciais de forma adequada') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Descartar documentos no lixo comum');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Levar documentos para casa');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '10.1', 'video_quiz', v_video_ids[10], null, 'Qual situação pode ser um incidente de segurança?', 'Perda de equipamento, envio ao destinatário errado, acesso indevido e exposição de planilhas são exemplos.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Uma reunião cancelada');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'A perda de um notebook com dados pessoais') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'A troca de uma cadeira');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Uma atualização de software agendada');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '10.2', 'video_quiz', v_video_ids[10], null, 'Qual é a primeira atitude ao perceber um incidente?', 'Não espere nem esconda. A comunicação rápida permite que a organização aja.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Investigar sozinho toda a extensão do problema');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Esperar para ver se alguém percebe');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Esconder o ocorrido por medo de consequências');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Comunicar imediatamente pelo canal definido pela empresa') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '10.3', 'video_quiz', v_video_ids[10], null, 'O que fazer com mensagens, arquivos e registros relacionados ao incidente?', 'Não se deve apagar evidências.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Preservá-los, pois podem ajudar na investigação') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Apagá-los para evitar problemas');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Editá-los para corrigir erros');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Enviá-los a colegas para opinarem');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '10.4', 'video_quiz', v_video_ids[10], null, 'Quem faz comunicações externas sobre o incidente em nome da empresa?', 'Quando há risco ou dano relevante, o controlador avalia a comunicação à ANPD e aos titulares.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Qualquer colaborador, imediatamente');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Quem perceber o incidente, pelas redes sociais');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Apenas quem tiver autorização da empresa; o controlador avalia as obrigações de comunicação') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'O colaborador que causou o incidente');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '11.1', 'video_quiz', v_video_ids[11], null, 'Qual é um direito do titular previsto na LGPD?', 'O titular pode confirmar o tratamento e acessar seus dados.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Receber desconto em produtos');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Obter cópia dos dados de outras pessoas');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Alterar cláusulas de contratos');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Confirmar a existência de tratamento e solicitar acesso aos seus dados') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '11.2', 'video_quiz', v_video_ids[11], null, 'Um titular pede a eliminação de seus dados. Como a empresa deve agir?', 'O direito não significa que todo dado deve ser apagado de imediato.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Atender sempre imediatamente, sem análise');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Avaliar o pedido conforme as circunstâncias e as hipóteses legais aplicáveis') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Ignorar o pedido');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Atender apenas se o titular for menor de idade');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '11.3', 'video_quiz', v_video_ids[11], null, 'Um cliente pergunta a um funcionário quais informações a empresa mantém sobre ele. O que fazer?', 'O pedido deve ser tratado com seriedade, segurança e dentro dos requisitos legais.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Informar tudo por telefone, na hora');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Ignorar a pergunta');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Seguir o procedimento interno e encaminhar ao responsável, sem fornecer dados antes de verificar a identidade') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Orientar o cliente a procurar a ANPD');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '11.4', 'video_quiz', v_video_ids[11], null, 'O que o titular pode pedir em relação a dados incompletos, inexatos ou desatualizados?', 'A correção é um direito do titular, nas condições legais.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'A correção desses dados') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'A demissão do colaborador');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'A venda dos dados');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Nada, pois a empresa decide');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '12.1', 'video_quiz', v_video_ids[12], null, 'De que depende a proteção de dados?', 'Documentos e tecnologia ajudam, mas as atitudes diárias fazem a diferença.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Apenas de documentos');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Apenas de ferramentas tecnológicas');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Também das decisões tomadas todos os dias por quem trabalha com as informações') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Apenas do encarregado');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '12.2', 'video_quiz', v_video_ids[12], null, 'O que fazer antes de compartilhar um arquivo?', 'Conferir o destinatário evita incidentes.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Verificar o destinatário') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Compartilhar com todos por precaução');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Compartilhar e verificar depois');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Compartilhar apenas por conta pessoal');

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '12.3', 'video_quiz', v_video_ids[12], null, 'O que fazer antes de acessar um cadastro?', 'O acesso deve ter relação com a atividade profissional.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Verificar se é de alguém conhecido');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Acessar por curiosidade');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Acessar e fechar rapidamente');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Confirmar se existe necessidade profissional') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, video_id, difficulty, prompt, explanation)
  values (v_track_id, '12.4', 'video_quiz', v_video_ids[12], null, 'Diante de um incidente ou de uma dúvida, qual é a atitude correta?', 'Os canais internos existem para encaminhar dúvidas e incidentes às pessoas certas.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Resolver sozinho e não avisar');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Procurar o canal interno responsável') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Aguardar que alguém note');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Comentar com colegas de outra área');

  -- Parte B: banco da avaliação final
  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B1', 'final_exam', v_module_ids[1], 'easy', 'Qual situação está dentro do alcance da LGPD?', 'A LGPD se aplica a qualquer operação de tratamento de dados pessoais, em meio físico ou digital.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Tratamento de dados pessoais por uma empresa, inclusive em arquivos físicos') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Apenas bancos de dados em nuvem');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Apenas dados de menores');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Apenas dados de empresas de tecnologia');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B2', 'final_exam', v_module_ids[1], 'easy', 'O que é tratamento de dados pessoais?', 'Tratamento abrange todo o ciclo de vida do dado, da coleta à eliminação.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Apenas a coleta');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Apenas o armazenament o');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Qualquer operação com dados pessoais, como coleta, uso, compartilhamento, armazenament o e eliminação') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Apenas o envio a terceiros');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B3', 'final_exam', v_module_ids[1], 'medium', 'Qual princípio da LGPD determina limitar o tratamento ao mínimo necessário para atingir a finalidade?', 'O princípio da necessidade (art. 6º, III) orienta a coletar e usar apenas o indispensável.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Transparência');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Qualidade dos dados');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Prevenção');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Necessidade') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B4', 'final_exam', v_module_ids[1], 'medium', 'O princípio da finalidade exige que o tratamento tenha propósitos:', 'A finalidade deve ser clara desde a coleta e não pode ser desviada (art. 6º, I).')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Genéricos, para permitir qualquer uso futuro');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Legítimos, específicos, explícitos e informados ao titular, sem tratamento posterior incompatível') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Definidos somente pelo operador');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Definidos apenas após a coleta');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B5', 'final_exam', v_module_ids[1], 'medium', 'O princípio da transparência garante ao titular:', 'O titular tem direito a saber como seus dados são tratados (art. 6º, VI).')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Informações claras, precisas e facilmente acessíveis sobre o tratamento e os agentes envolvidos') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Sigilo absoluto sobre tudo o que a empresa faz');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Acesso aos dados de outros titulares');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Gratuidade de todos os serviços da empresa');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B6', 'final_exam', v_module_ids[1], 'hard', 'Em regra, um dado anonimizado:', 'O art. 12 prevê essa regra e a ressalva da reversão.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Continua sendo dado pessoal em qualquer hipótese');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Não é considerado dado pessoal, salvo se a anonimização puder ser revertida com esforços razoáveis') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'É sempre dado sensível');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Só pode ser tratado com consentiment o');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B7', 'final_exam', v_module_ids[1], 'easy', 'A LGPD protege os dados de:', 'A proteção é das pessoas naturais, independente mente de serem clientes, colaboradores ou fornecedores.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Apenas consumidores');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Empresas e outras pessoas jurídicas');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Qualquer pessoa natural, titular dos dados') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Apenas brasileiros residentes no país');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B8', 'final_exam', v_module_ids[1], 'medium', 'O e-mail corporativo nome.sobrenome@empresa. com.br de um colaborador é:', 'Informação que leva a uma pessoa natural pode ser dado pessoal, mesmo em contexto profissional.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Dado pessoal, pois identifica ou torna identificável uma pessoa natural') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Dado da empresa, nunca pessoal');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Dado sensível');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Dado anonimizado');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B9', 'final_exam', v_module_ids[1], 'easy', 'Qual alternativa traz apenas dados pessoais sensíveis?', 'Esses dois itens constam na lista de dados sensíveis (art. 5º, II). Os demais são dados comuns.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'CPF e endereço');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Nome e e-mail');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Placa do veículo e telefone');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Opinião política e filiação a sindicato') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B10', 'final_exam', v_module_ids[1], 'medium', 'A biometria usada para identificar colaboradores no controle de acesso é:', 'Dado biométrico vinculado a uma pessoa natural é sensível.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Dado pessoal sensível') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Dado comum, sem restrições');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Dado público');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Dado anonimizado');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B11', 'final_exam', v_module_ids[1], 'medium', 'Sobre os dados pessoais sensíveis, é correto afirmar que:', 'O art. 11 traz hipóteses específicas, mais restritas.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Podem ser tratados pelas mesmas hipóteses dos dados comuns');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Nunca podem ser tratados');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Dispensam qualquer base legal');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Têm hipóteses legais próprias, e não basta presumir autorização') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B12', 'final_exam', v_module_ids[1], 'easy', 'Quem toma as decisões referentes ao tratamento dos dados pessoais?', 'O controlador define, por exemplo, quais dados coletar e para que fins.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'O operador');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'O controlador') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'A ANPD');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'O titular');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B13', 'final_exam', v_module_ids[1], 'medium', 'Uma empresa contrata um prestador para processar a folha de pagamento, seguindo as instruções dela. Em regra, o prestador atua como:', 'O operador trata dados em nome do controlador, seguindo suas instruções.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Controlador');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Titular');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Encarregado');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Operador') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B14', 'final_exam', v_module_ids[1], 'easy', 'Qual é o papel do encarregado (DPO)?', 'O encarregado é o canal de comunicação e exerce as atribuições previstas na regulamentação.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Decidir sozinho as finalidades do tratamento');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Ser o titular dos dados da empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Atuar como canal de comunicação entre a organização, os titulares e a ANPD') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Auditar as contas da empresa');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B15', 'final_exam', v_module_ids[1], 'hard', 'Quando um operador descumpre a legislação ou as instruções lícitas do controlador e causa dano, em regra:', 'O art. 42, § 1º, prevê a responsabilidade solidária do operador nessas hipóteses.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Não pode ser responsabiliza do');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Responde solidariamente pelos danos causados') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Só responde se houver contrato escrito');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Responde apenas administrativa mente');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B16', 'final_exam', v_module_ids[1], 'medium', 'Qual é o papel da ANPD?', 'A ANPD é a autoridade nacional responsável por fiscalizar e orientar sobre a LGPD.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Zelar pela proteção de dados pessoais, implementar e fiscalizar o cumprimento da LGPD') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Certificar empresas privadas mediante pagamento');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Julgar todas as ações judiciais sobre dados');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Representar sindicatos de trabalhadores');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B17', 'final_exam', v_module_ids[1], 'hard', 'Qual é o limite da multa simples prevista na LGPD?', 'O art. 52 estabelece esse limite. Há também outras sanções, como advertência e publicização da infração.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Até R$ 5 mil por infração');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Até 10% do patrimônio da empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Até 2% do faturamento da pessoa jurídica no último exercício, limitada a R$ 50 milhões por infração') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Até 20% do faturamento, sem limite');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B18', 'final_exam', v_module_ids[1], 'medium', 'Para saber se uma empresa é controladora ou operadora, deve-se observar principalmente:', 'Os papéis dependem das atividades realmente exercidas.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'O nome que consta no contrato');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'O porte da empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'O setor de atuação');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Quem efetivamente decide sobre o tratamento e quem o executa em nome de outro') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B19', 'final_exam', v_module_ids[2], 'easy', 'Qual situação representa uso incompatível com a finalidade informada ao titular?', 'O dado foi coletado para uma finalidade e usado para outra, incompatível com a primeira.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Usar o CPF informado para emitir a nota fiscal da compra');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Usar o e-mail fornecido para receber a nota fiscal para enviar publicidade de parceiros, sem base legal adequada') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Guardar o contrato pelo prazo exigido em lei');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Usar o endereço para entregar a compra');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B20', 'final_exam', v_module_ids[2], 'medium', 'Em um formulário de cadastro para receber uma newsletter, quais dados devem ser solicitados?', 'O princípio da necessidade orienta a coletar o mínimo indispensável.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Nome, e-mail, CPF, renda e religião');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Todos os dados que a empresa possa vir a usar no futuro');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Apenas os dados necessários, como nome e e-mail') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Apenas dados sensíveis');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B21', 'final_exam', v_module_ids[2], 'easy', 'Um colaborador usa a lista de contatos de clientes para divulgar seu negócio pessoal. Essa conduta:', 'Ter acesso não significa poder usar para qualquer fim.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'É permitida, pois ele tem acesso à lista');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'É permitida se enviar poucas mensagens');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'É permitida fora do expediente');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Viola a finalidade e o dever de usar os dados apenas nas atividades autorizadas') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B22', 'final_exam', v_module_ids[2], 'medium', 'Uma escola pretende publicar a foto de um aluno de 8 anos nas redes sociais. Qual é o cuidado adequado?', 'Dados de crianças exigem atenção redobrada (art. 14).')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Nenhum, pois fotos são sempre públicas');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Verificar a base legal e, se for consentimento, obter consentimento específico e em destaque de um dos pais ou responsável, observando o melhor interesse da criança') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Bastar a autorização verbal de qualquer funcionário');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Avisar em um mural');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B23', 'final_exam', v_module_ids[2], 'hard', 'O consentimento dos pais para dados de crianças pode ser dispensado:', 'O art. 14, § 3º, prevê essas exceções.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Quando a coleta for necessária para contatar os pais ou para a proteção da criança, nas hipóteses legais, sem repasse a terceiros') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Sempre que a empresa preferir');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Quando a criança disser que concorda');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Quando a empresa for pequena');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B24', 'final_exam', v_module_ids[2], 'easy', 'Um colega pergunta no grupo da equipe por que outro faltou, e você viu o atestado. Qual é a melhor conduta?', 'Informações de saúde são sensíveis e não devem ser comentadas em grupos.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Informar o diagnóstico');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Enviar uma foto do atestado');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Não divulgar a informação e orientar que o assunto seja tratado com o RH ou o gestor') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Comentar apenas o período de afastamento');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B25', 'final_exam', v_module_ids[2], 'medium', 'Qual senha é a mais adequada?', 'Senhas fortes, exclusivas e com MFA reduzem o risco de acesso indevido.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Uma frase longa e exclusiva, combinada com autenticação multifator') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'A data de nascimento');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'O nome da empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'A mesma senha usada em outros serviços');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B26', 'final_exam', v_module_ids[2], 'easy', 'Qual é um sinal de e-mail suspeito?', 'Esses sinais são comuns em golpes de phishing. Confirme por um canal confiável.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Remetente conhecido e assunto de rotina');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Urgência incomum, pedido de senha ou pagamento e link para endereço estranho') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Assinatura institucional padrão');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Mensagem enviada no horário comercial');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B27', 'final_exam', v_module_ids[2], 'medium', 'Qual é a orientação sobre armazenar arquivos profissionais em contas pessoais?', 'Dispositivos e contas não autorizados escapam dos controles de segurança da empresa.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Recomendado, para ter backup');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Aceitável nos fins de semana');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Aceitável em nuvem gratuita');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Deve ser evitado; use apenas contas e dispositivos autorizados pela empresa') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B28', 'final_exam', v_module_ids[2], 'medium', 'Você enviou uma planilha ao destinatário errado. O que NÃO se deve fazer?', 'Esconder o problema e apagar evidências atrapalha a resposta ao incidente.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Comunicar o canal interno');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Guardar o e-mail enviado');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Tentar apagar tudo e não contar a ninguém') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Anotar o horário e o destinatário');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B29', 'final_exam', v_module_ids[2], 'medium', 'Por que a autenticação multifator aumenta a segurança?', 'O segundo fator dificulta o acesso indevido, mas não elimina todos os riscos.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Dispensa o uso de senha');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Exige mais de um fator, mesmo se a senha for descoberta') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Criptografa todos os e-mails');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Impede qualquer tentativa de golpe');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B30', 'final_exam', v_module_ids[2], 'easy', 'Ao trabalhar fora do escritório, qual cuidado é adequado?', 'Redes e ambientes não confiáveis aumentam o risco de exposição.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Evitar acessar dados pessoais em redes públicas sem proteção e usar apenas recursos autorizados pela empresa') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Usar qualquer Wi-Fi aberto');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Deixar o notebook com um desconhecido');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Compartilhar a senha com quem estiver por perto');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B31', 'final_exam', v_module_ids[2], 'medium', 'Você precisa enviar exames de um colaborador ao médico do trabalho. Qual é o procedimento adequado?', 'Dados de saúde exigem canais seguros e acesso restrito.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Enviar pelo WhatsApp pessoal');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Deixar uma cópia sobre a mesa da equipe');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Usar apenas canal aprovado pela empresa, com envio ao destinatário autorizado') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Enviar a todos para agilizar');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B32', 'final_exam', v_module_ids[2], 'medium', 'Qual afirmação descreve corretamente a diferença entre ter acesso a um dado e poder usá-lo?', 'O acesso tem finalidade definida. Usos fora dela devem ser avaliados.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Quem tem acesso pode usar para qualquer fim');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'O acesso implica autorização para compartilhar');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'O acesso a dados dispensa registro');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'O acesso é concedido para uma atividade; usar fora dela exige base e autorização') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B33', 'final_exam', v_module_ids[3], 'easy', 'Para que serve o inventário de dados pessoais?', 'O inventário mostra como a empresa trata dados e embasa as demais medidas de adequação.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Identificar quais dados são tratados, de onde vêm, para que são usados, onde ficam armazenados e com quem são compartilhados') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Registrar as vendas da empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Substituir a política de privacidade');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Medir o desempenho dos sistemas');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B34', 'final_exam', v_module_ids[3], 'medium', 'A política de privacidade publicada no site, isoladamente:', 'A adequação envolve diagnóstico, regras, procedimentos e medidas efetivas.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Conclui a adequação à LGPD');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Dispensa contratos com fornecedores');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Não esgota a adequação; é um dos documentos e precisa refletir a realidade da empresa') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Substitui o treinamento dos colaboradores');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B35', 'final_exam', v_module_ids[3], 'medium', 'Por que um documento de adequação copiado de outra empresa, sem adaptações, é problemático?', 'Documentos desconectados da prática não protegem os dados nem demonstram conformidade.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Porque a lei proíbe qualquer modelo');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Porque fica mais caro');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Porque o layout pode ser diferente');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Porque precisa refletir as atividades, os riscos e a realidade da própria empresa') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B36', 'final_exam', v_module_ids[3], 'easy', 'Quais documentos podem ser necessários na adequação?', 'Os documentos variam conforme atividades, porte e riscos.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Apenas balanços contábeis');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Inventário de dados, políticas internas, contratos com fornecedores, procedimento para solicitações de titulares e plano de resposta a incidentes') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Apenas o contrato de trabalho');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Apenas o manual de marca');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B37', 'final_exam', v_module_ids[3], 'easy', 'Qual é o papel do colaborador quando a empresa levanta informações para a adequação?', 'Os colaboradores conhecem as rotinas reais. Sem a participação deles, os documentos não refletem a prática.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Informar com precisão como realiza suas atividades com dados pessoais') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Aguardar sem participar');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Informar apenas o que for conveniente');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Delegar a resposta a terceiros');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B38', 'final_exam', v_module_ids[3], 'easy', 'Qual é um exemplo de medida administrativa de segurança?', 'Políticas, treinamentos e definição de responsabilidades são medidas administrativas. As demais são técnicas.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Criptografia');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Backup');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Autenticação multifator');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Política interna e treinamento de colaboradores') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B39', 'final_exam', v_module_ids[3], 'medium', 'Qual prática de controle de acesso é mais adequada?', 'Acesso restrito reduz o risco de consulta, alteração ou compartilhamento inadequado.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Todos acessam todas as pastas');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'O acesso é definido por antiguidade');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Cada pessoa acessa apenas o que precisa para suas funções, conforme as autorizações') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Compartilhar um login entre a equipe');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B40', 'final_exam', v_module_ids[3], 'medium', 'Sobre cópias de segurança (backups), é correto afirmar que:', 'Um backup não testado ou desprotegido pode falhar ou gerar novos riscos.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Dispensam outras medidas de segurança');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Ajudam na recuperação em certas situações, mas precisam ser planejadas, protegidas e testadas') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Podem ficar sem proteção');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Não são medida de segurança');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B41', 'final_exam', v_module_ids[3], 'medium', 'Não existe uma única medida capaz de eliminar todos os riscos. Isso significa que:', 'A segurança combina tecnologia, processos e comportamento humano.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'A proteção depende de um conjunto de controles proporcionais ao contexto e aos riscos') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'A segurança é impossível');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Basta instalar um antivírus');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Só sistemas de pagamento precisam de proteção');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B42', 'final_exam', v_module_ids[3], 'medium', 'Qual situação NÃO configura, por si só, um incidente de segurança com dados pessoais?', 'As demais situações podem comprometer a confidencialidade, a integridade ou a disponibilidade dos dados.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Planilha enviada a destinatário errado');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Acesso estranho a uma conta');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Reunião remarcada, sem relação com dados pessoais') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Perda de notebook com dados de clientes');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B43', 'final_exam', v_module_ids[3], 'easy', 'Ao perceber um incidente, o que o colaborador NÃO deve fazer?', 'Apagar registros prejudica a investigação e a resposta.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Comunicar pelo canal definido');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Interromper a ação indevida, se for seguro');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Preservar os registros');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Apagar mensagens e arquivos para limpar evidências') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B44', 'final_exam', v_module_ids[3], 'medium', 'Quem avalia as obrigações de comunicar o incidente à ANPD e aos titulares, quando há risco ou dano relevante?', 'O controlador responde pela avaliação e pela comunicação (art. 48). O colaborador não deve fazer comunicações externas sem autorização.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Qualquer colaborador');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'O controlador, observados os requisitos e prazos aplicáveis') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Apenas o operador');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'O próprio titular');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B45', 'final_exam', v_module_ids[3], 'easy', 'O que significa comunicar rapidamente um incidente?', 'A comunicação rápida protege as pessoas e permite a resposta da empresa.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Contribuir para que a organização aja e reduza os impactos, sem que isso signifique admitir culpa') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Assumir a culpa pelo ocorrido');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Dispensar a investigação');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Expor o caso publicamente');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B46', 'final_exam', v_module_ids[3], 'easy', 'Qual é um direito do titular previsto na LGPD?', 'O art. 18 lista os direitos, como confirmação, acesso, correção e eliminação, nas condições legais.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Ser contratado pela empresa');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Exigir a exclusão de qualquer dado, em qualquer circunstância');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Obter a confirmação da existência de tratamento e o acesso aos seus dados') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Definir o preço dos produtos');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B47', 'final_exam', v_module_ids[3], 'medium', 'Um titular pede a eliminação de todos os seus dados. Qual é a resposta correta?', 'Algumas informações precisam ser mantidas, por exemplo, por obrigação legal.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Atender sempre, de imediato, sem análise');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Negar sempre');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Ignorar o pedido');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Avaliar o pedido conforme as hipóteses legais, pois nem todo dado pode ser eliminado de imediato') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B48', 'final_exam', v_module_ids[3], 'hard', 'Para pedidos de acesso, a LGPD prevê resposta imediata em formato simplificado ou declaração clara e completa em até:', 'O art. 19 prevê o prazo de até 15 dias, contado do requerimento do titular, para a declaração completa.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, '5 dias');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, '10 dias');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, '15 dias') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, '30 dias');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B49', 'final_exam', v_module_ids[3], 'medium', 'Um cliente liga e pede ao colaborador que informe quais dados a empresa mantém sobre ele. O que fazer?', 'Os pedidos precisam de verificação de identidade e de tratamento seguro.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Encaminhar ao responsável, seguindo o procedimento interno, sem fornecer dados antes de verificar a identidade') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'Informar na hora, por telefone');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Pedir que ligue em outro dia');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Orientar o cliente a procurar a ANPD');

  insert into public.training_questions (track_id, code, kind, module_id, difficulty, prompt, explanation)
  values (v_track_id, 'B50', 'final_exam', v_module_ids[3], 'easy', 'Qual afirmação resume melhor o papel dos colaboradores na adequação?', 'Documentos, controles e treinamentos só funcionam com atitudes diárias responsáveis.')
  returning id into v_question_id;
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 1, 'Só a equipe de TI é responsável');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 2, 'A proteção depende também das decisões diárias: verificar destinatários, confirmar a necessidade de acesso, seguir as regras de segurança e usar o canal interno') returning id into v_option_id;
  insert into public.training_answer_keys (question_id, option_id) values (v_question_id, v_option_id);
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 3, 'Basta a empresa ter documentos');
  insert into public.training_question_options (question_id, position, label)
  values (v_question_id, 4, 'Apenas o encarregado precisa conhecer a LGPD');

end $$;
