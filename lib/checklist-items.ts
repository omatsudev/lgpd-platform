// Itens fixos do checklist de adequação LGPD
// item_key é imutável — identifica o item entre empresas

export type ChecklistItem = {
  key: string
  title: string
  description: string
  referencia?: string // artigo da LGPD
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export type ChecklistCategory = {
  id: string
  label: string
  icon: string
  items: ChecklistItem[]
}

export const CHECKLIST: ChecklistCategory[] = [
  {
    id: 'governanca',
    label: 'Governança e Responsabilidade',
    icon: 'Shield',
    items: [
      {
        key: 'gov_dpo_nomeado',
        title: 'DPO nomeado e publicado',
        description:
          'Encarregado de proteção de dados designado e comunicado à ANPD e aos titulares.',
        referencia: 'Art. 41',
        priority: 'critical',
      },
      {
        key: 'gov_politica_privacidade',
        title: 'Política de Privacidade publicada',
        description: 'Política acessível, clara e atualizada no site e sistemas da empresa.',
        referencia: 'Art. 9',
        priority: 'critical',
      },
      {
        key: 'gov_canal_titular',
        title: 'Canal para titulares disponível',
        description:
          'Mecanismo para exercício de direitos dos titulares (acesso, exclusão, correção etc).',
        referencia: 'Art. 18',
        priority: 'critical',
      },
      {
        key: 'gov_programa_privacidade',
        title: 'Programa de privacidade implementado',
        description:
          'Estrutura de governança documentada com políticas, processos e responsabilidades.',
        referencia: 'Art. 50',
        priority: 'high',
      },
      {
        key: 'gov_revisao_anual',
        title: 'Revisão anual do programa',
        description: 'Avaliação periódica das práticas e atualização do programa de privacidade.',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'inventario',
    label: 'Inventário e Mapeamento',
    icon: 'Database',
    items: [
      {
        key: 'inv_mapeamento_completo',
        title: 'Mapeamento de dados concluído',
        description:
          'Todos os processos de tratamento de dados pessoais identificados e documentados.',
        referencia: 'Art. 37',
        priority: 'critical',
      },
      {
        key: 'inv_base_legal_definida',
        title: 'Base legal definida para cada tratamento',
        description: 'Cada atividade de tratamento possui base legal identificada e documentada.',
        referencia: 'Art. 7',
        priority: 'critical',
      },
      {
        key: 'inv_finalidade_documentada',
        title: 'Finalidades documentadas',
        description: 'Finalidade específica e explícita registrada para cada tratamento de dados.',
        referencia: 'Art. 6',
        priority: 'high',
      },
      {
        key: 'inv_dados_sensiveis_mapeados',
        title: 'Dados sensíveis mapeados',
        description:
          'Tratamentos envolvendo dados sensíveis identificados com controles reforçados.',
        referencia: 'Art. 11',
        priority: 'high',
      },
      {
        key: 'inv_retencao_definida',
        title: 'Prazos de retenção definidos',
        description:
          'Período de guarda e critérios de eliminação definidos para cada tipo de dado.',
        referencia: 'Art. 15',
        priority: 'high',
      },
    ],
  },
  {
    id: 'consentimento',
    label: 'Consentimento e Base Legal',
    icon: 'ClipboardCheck',
    items: [
      {
        key: 'con_coleta_valida',
        title: 'Coleta de consentimento válida',
        description:
          'Consentimento livre, informado, inequívoco e específico para finalidade declarada.',
        referencia: 'Art. 8',
        priority: 'critical',
      },
      {
        key: 'con_registros_mantidos',
        title: 'Registros de consentimento mantidos',
        description:
          'Evidências do consentimento coletado armazenadas com data, canal e versão da política.',
        referencia: 'Art. 8 §5',
        priority: 'critical',
      },
      {
        key: 'con_revogacao_facilitada',
        title: 'Revogação facilitada',
        description:
          'Mecanismo simples e gratuito para revogação do consentimento a qualquer momento.',
        referencia: 'Art. 8 §5',
        priority: 'high',
      },
      {
        key: 'con_menores_protegidos',
        title: 'Proteção de dados de menores',
        description: 'Consentimento dos pais/responsáveis para dados de crianças e adolescentes.',
        referencia: 'Art. 14',
        priority: 'high',
      },
    ],
  },
  {
    id: 'direitos',
    label: 'Direitos dos Titulares',
    icon: 'Users',
    items: [
      {
        key: 'dir_processo_resposta',
        title: 'Processo de resposta a solicitações',
        description:
          'Fluxo definido para atender pedidos de acesso, exclusão, correção e portabilidade.',
        referencia: 'Art. 18',
        priority: 'critical',
      },
      {
        key: 'dir_prazo_15dias',
        title: 'Prazo de 15 dias respeitado',
        description: 'Respostas a solicitações de titulares entregues em até 15 dias.',
        referencia: 'Art. 19',
        priority: 'critical',
      },
      {
        key: 'dir_portabilidade',
        title: 'Portabilidade de dados implementada',
        description:
          'Capacidade de exportar dados do titular em formato estruturado e interoperável.',
        referencia: 'Art. 18 V',
        priority: 'medium',
      },
      {
        key: 'dir_eliminacao_processo',
        title: 'Processo de eliminação de dados',
        description: 'Procedimento documentado para exclusão segura de dados a pedido do titular.',
        referencia: 'Art. 18 VI',
        priority: 'high',
      },
    ],
  },
  {
    id: 'seguranca',
    label: 'Segurança da Informação',
    icon: 'Lock',
    items: [
      {
        key: 'seg_medidas_tecnicas',
        title: 'Medidas técnicas de segurança',
        description:
          'Criptografia, controle de acesso, autenticação forte e demais controles implementados.',
        referencia: 'Art. 46',
        priority: 'critical',
      },
      {
        key: 'seg_politica_seguranca',
        title: 'Política de Segurança da Informação',
        description: 'PSI documentada, aprovada e comunicada a todos os colaboradores.',
        priority: 'high',
      },
      {
        key: 'seg_gestao_acessos',
        title: 'Gestão de acessos por privilégio mínimo',
        description: 'Colaboradores acessam apenas os dados necessários para suas funções.',
        referencia: 'Art. 46',
        priority: 'high',
      },
      {
        key: 'seg_backup_teste',
        title: 'Backup e recuperação testados',
        description: 'Plano de backup com testes periódicos de restauração documentados.',
        priority: 'medium',
      },
      {
        key: 'seg_pen_test',
        title: 'Testes de segurança realizados',
        description:
          'Testes de penetração ou varredura de vulnerabilidades executados no último ano.',
        priority: 'medium',
      },
      {
        key: 'seg_plano_incidentes',
        title: 'Plano de resposta a incidentes',
        description:
          'Procedimento documentado para detecção, contenção e notificação de incidentes.',
        referencia: 'Art. 48',
        priority: 'high',
      },
    ],
  },
  {
    id: 'fornecedores',
    label: 'Fornecedores e Terceiros',
    icon: 'Truck',
    items: [
      {
        key: 'for_mapeamento_operadores',
        title: 'Operadores mapeados',
        description:
          'Todos os fornecedores com acesso a dados pessoais identificados e documentados.',
        referencia: 'Art. 39',
        priority: 'critical',
      },
      {
        key: 'for_contratos_dpa',
        title: 'DPAs assinados com operadores',
        description:
          'Acordo de processamento de dados incluído em contratos com todos os operadores.',
        referencia: 'Art. 39',
        priority: 'critical',
      },
      {
        key: 'for_due_diligence',
        title: 'Due diligence de fornecedores',
        description:
          'Avaliação de conformidade LGPD realizada antes da contratação e periodicamente.',
        priority: 'high',
      },
      {
        key: 'for_international_transfers',
        title: 'Transferências internacionais adequadas',
        description:
          'Mecanismo legal (SCC, decisão de adequação) para transferências fora do Brasil.',
        referencia: 'Art. 33',
        priority: 'high',
      },
    ],
  },
  {
    id: 'treinamento',
    label: 'Treinamento e Cultura',
    icon: 'GraduationCap',
    items: [
      {
        key: 'tre_treinamento_todos',
        title: 'Treinamento LGPD para todos os colaboradores',
        description: 'Capacitação sobre proteção de dados realizada por toda a equipe.',
        referencia: 'Art. 50',
        priority: 'high',
      },
      {
        key: 'tre_treinamento_areas_criticas',
        title: 'Treinamento específico para áreas críticas',
        description:
          'Treinamento aprofundado para TI, RH, jurídico e demais áreas que tratam dados sensíveis.',
        priority: 'high',
      },
      {
        key: 'tre_cultura_privacidade',
        title: 'Cultura de privacidade disseminada',
        description:
          'Comunicações internas, campanhas e sensibilização contínua sobre proteção de dados.',
        priority: 'medium',
      },
      {
        key: 'tre_registros_treinamentos',
        title: 'Registros de treinamento mantidos',
        description: 'Evidências de participação e conclusão dos treinamentos armazenadas.',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'ripd',
    label: 'RIPD e Avaliação de Impacto',
    icon: 'FileSearch',
    items: [
      {
        key: 'ripd_identificacao',
        title: 'Processos que requerem RIPD identificados',
        description:
          'Tratamentos de alto risco identificados e avaliação de necessidade de RIPD realizada.',
        referencia: 'Art. 38',
        priority: 'high',
      },
      {
        key: 'ripd_elaborado',
        title: 'RIPD elaborado para processos críticos',
        description: 'Relatório de Impacto à Proteção de Dados concluído onde exigido.',
        referencia: 'Art. 38',
        priority: 'high',
      },
      {
        key: 'ripd_privacy_by_design',
        title: 'Privacy by Design nos novos projetos',
        description:
          'Privacidade considerada desde o início no desenvolvimento de produtos e sistemas.',
        referencia: 'Art. 46 §2',
        priority: 'medium',
      },
    ],
  },
]

export const TOTAL_ITENS = CHECKLIST.reduce((acc, cat) => acc + cat.items.length, 0)
