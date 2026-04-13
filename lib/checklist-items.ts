// Itens fixos do checklist de adequação LGPD
// item_key é imutável — identifica o item entre empresas

export type ChecklistItem = {
  key: string
  titulo: string
  descricao: string
  referencia?: string // artigo da LGPD
  prioridade: 'critica' | 'alta' | 'media' | 'baixa'
}

export type ChecklistCategoria = {
  id: string
  label: string
  icon: string
  itens: ChecklistItem[]
}

export const CHECKLIST: ChecklistCategoria[] = [
  {
    id: 'governanca',
    label: 'Governança e Responsabilidade',
    icon: 'Shield',
    itens: [
      { key: 'gov_dpo_nomeado', titulo: 'DPO nomeado e publicado', descricao: 'Encarregado de proteção de dados designado e comunicado à ANPD e aos titulares.', referencia: 'Art. 41', prioridade: 'critica' },
      { key: 'gov_politica_privacidade', titulo: 'Política de Privacidade publicada', descricao: 'Política acessível, clara e atualizada no site e sistemas da empresa.', referencia: 'Art. 9', prioridade: 'critica' },
      { key: 'gov_canal_titular', titulo: 'Canal para titulares disponível', descricao: 'Mecanismo para exercício de direitos dos titulares (acesso, exclusão, correção etc).', referencia: 'Art. 18', prioridade: 'critica' },
      { key: 'gov_programa_privacidade', titulo: 'Programa de privacidade implementado', descricao: 'Estrutura de governança documentada com políticas, processos e responsabilidades.', referencia: 'Art. 50', prioridade: 'alta' },
      { key: 'gov_revisao_anual', titulo: 'Revisão anual do programa', descricao: 'Avaliação periódica das práticas e atualização do programa de privacidade.', prioridade: 'media' },
    ],
  },
  {
    id: 'inventario',
    label: 'Inventário e Mapeamento',
    icon: 'Database',
    itens: [
      { key: 'inv_mapeamento_completo', titulo: 'Mapeamento de dados concluído', descricao: 'Todos os processos de tratamento de dados pessoais identificados e documentados.', referencia: 'Art. 37', prioridade: 'critica' },
      { key: 'inv_base_legal_definida', titulo: 'Base legal definida para cada tratamento', descricao: 'Cada atividade de tratamento possui base legal identificada e documentada.', referencia: 'Art. 7', prioridade: 'critica' },
      { key: 'inv_finalidade_documentada', titulo: 'Finalidades documentadas', descricao: 'Finalidade específica e explícita registrada para cada tratamento de dados.', referencia: 'Art. 6', prioridade: 'alta' },
      { key: 'inv_dados_sensiveis_mapeados', titulo: 'Dados sensíveis mapeados', descricao: 'Tratamentos envolvendo dados sensíveis identificados com controles reforçados.', referencia: 'Art. 11', prioridade: 'alta' },
      { key: 'inv_retencao_definida', titulo: 'Prazos de retenção definidos', descricao: 'Período de guarda e critérios de eliminação definidos para cada tipo de dado.', referencia: 'Art. 15', prioridade: 'alta' },
    ],
  },
  {
    id: 'consentimento',
    label: 'Consentimento e Base Legal',
    icon: 'ClipboardCheck',
    itens: [
      { key: 'con_coleta_valida', titulo: 'Coleta de consentimento válida', descricao: 'Consentimento livre, informado, inequívoco e específico para finalidade declarada.', referencia: 'Art. 8', prioridade: 'critica' },
      { key: 'con_registros_mantidos', titulo: 'Registros de consentimento mantidos', descricao: 'Evidências do consentimento coletado armazenadas com data, canal e versão da política.', referencia: 'Art. 8 §5', prioridade: 'critica' },
      { key: 'con_revogacao_facilitada', titulo: 'Revogação facilitada', descricao: 'Mecanismo simples e gratuito para revogação do consentimento a qualquer momento.', referencia: 'Art. 8 §5', prioridade: 'alta' },
      { key: 'con_menores_protegidos', titulo: 'Proteção de dados de menores', descricao: 'Consentimento dos pais/responsáveis para dados de crianças e adolescentes.', referencia: 'Art. 14', prioridade: 'alta' },
    ],
  },
  {
    id: 'direitos',
    label: 'Direitos dos Titulares',
    icon: 'Users',
    itens: [
      { key: 'dir_processo_resposta', titulo: 'Processo de resposta a solicitações', descricao: 'Fluxo definido para atender pedidos de acesso, exclusão, correção e portabilidade.', referencia: 'Art. 18', prioridade: 'critica' },
      { key: 'dir_prazo_15dias', titulo: 'Prazo de 15 dias respeitado', descricao: 'Respostas a solicitações de titulares entregues em até 15 dias.', referencia: 'Art. 19', prioridade: 'critica' },
      { key: 'dir_portabilidade', titulo: 'Portabilidade de dados implementada', descricao: 'Capacidade de exportar dados do titular em formato estruturado e interoperável.', referencia: 'Art. 18 V', prioridade: 'media' },
      { key: 'dir_eliminacao_processo', titulo: 'Processo de eliminação de dados', descricao: 'Procedimento documentado para exclusão segura de dados a pedido do titular.', referencia: 'Art. 18 VI', prioridade: 'alta' },
    ],
  },
  {
    id: 'seguranca',
    label: 'Segurança da Informação',
    icon: 'Lock',
    itens: [
      { key: 'seg_medidas_tecnicas', titulo: 'Medidas técnicas de segurança', descricao: 'Criptografia, controle de acesso, autenticação forte e demais controles implementados.', referencia: 'Art. 46', prioridade: 'critica' },
      { key: 'seg_politica_seguranca', titulo: 'Política de Segurança da Informação', descricao: 'PSI documentada, aprovada e comunicada a todos os colaboradores.', prioridade: 'alta' },
      { key: 'seg_gestao_acessos', titulo: 'Gestão de acessos por privilégio mínimo', descricao: 'Colaboradores acessam apenas os dados necessários para suas funções.', referencia: 'Art. 46', prioridade: 'alta' },
      { key: 'seg_backup_teste', titulo: 'Backup e recuperação testados', descricao: 'Plano de backup com testes periódicos de restauração documentados.', prioridade: 'media' },
      { key: 'seg_pen_test', titulo: 'Testes de segurança realizados', descricao: 'Testes de penetração ou varredura de vulnerabilidades executados no último ano.', prioridade: 'media' },
      { key: 'seg_plano_incidentes', titulo: 'Plano de resposta a incidentes', descricao: 'Procedimento documentado para detecção, contenção e notificação de incidentes.', referencia: 'Art. 48', prioridade: 'alta' },
    ],
  },
  {
    id: 'fornecedores',
    label: 'Fornecedores e Terceiros',
    icon: 'Truck',
    itens: [
      { key: 'for_mapeamento_operadores', titulo: 'Operadores mapeados', descricao: 'Todos os fornecedores com acesso a dados pessoais identificados e documentados.', referencia: 'Art. 39', prioridade: 'critica' },
      { key: 'for_contratos_dpa', titulo: 'DPAs assinados com operadores', descricao: 'Acordo de processamento de dados incluído em contratos com todos os operadores.', referencia: 'Art. 39', prioridade: 'critica' },
      { key: 'for_due_diligence', titulo: 'Due diligence de fornecedores', descricao: 'Avaliação de conformidade LGPD realizada antes da contratação e periodicamente.', prioridade: 'alta' },
      { key: 'for_transferencia_internacional', titulo: 'Transferências internacionais adequadas', descricao: 'Mecanismo legal (SCC, decisão de adequação) para transferências fora do Brasil.', referencia: 'Art. 33', prioridade: 'alta' },
    ],
  },
  {
    id: 'treinamento',
    label: 'Treinamento e Cultura',
    icon: 'GraduationCap',
    itens: [
      { key: 'tre_treinamento_todos', titulo: 'Treinamento LGPD para todos os colaboradores', descricao: 'Capacitação sobre proteção de dados realizada por toda a equipe.', referencia: 'Art. 50', prioridade: 'alta' },
      { key: 'tre_treinamento_areas_criticas', titulo: 'Treinamento específico para áreas críticas', descricao: 'Treinamento aprofundado para TI, RH, jurídico e demais áreas que tratam dados sensíveis.', prioridade: 'alta' },
      { key: 'tre_cultura_privacidade', titulo: 'Cultura de privacidade disseminada', descricao: 'Comunicações internas, campanhas e sensibilização contínua sobre proteção de dados.', prioridade: 'media' },
      { key: 'tre_registros_treinamentos', titulo: 'Registros de treinamento mantidos', descricao: 'Evidências de participação e conclusão dos treinamentos armazenadas.', prioridade: 'media' },
    ],
  },
  {
    id: 'ripd',
    label: 'RIPD e Avaliação de Impacto',
    icon: 'FileSearch',
    itens: [
      { key: 'ripd_identificacao', titulo: 'Processos que requerem RIPD identificados', descricao: 'Tratamentos de alto risco identificados e avaliação de necessidade de RIPD realizada.', referencia: 'Art. 38', prioridade: 'alta' },
      { key: 'ripd_elaborado', titulo: 'RIPD elaborado para processos críticos', descricao: 'Relatório de Impacto à Proteção de Dados concluído onde exigido.', referencia: 'Art. 38', prioridade: 'alta' },
      { key: 'ripd_privacy_by_design', titulo: 'Privacy by Design nos novos projetos', descricao: 'Privacidade considerada desde o início no desenvolvimento de produtos e sistemas.', referencia: 'Art. 46 §2', prioridade: 'media' },
    ],
  },
]

export const TOTAL_ITENS = CHECKLIST.reduce((acc, cat) => acc + cat.itens.length, 0)
