export type LockedFeatureKey =
  | 'checklist'
  | 'cookies'
  | 'inventory'
  | 'retention-disposal'
  | 'risks'
  | 'incidents'
  | 'documents'
  | 'consents'
  | 'suppliers'
  | 'trainings'
  | 'complaints'
  | 'data-subjects'
  | 'audit-logs'

export const LOCKED_FEATURE_CONTENT: Record<
  LockedFeatureKey,
  { title: string; description: string; bullets: string[] }
> = {
  checklist: {
    title: 'Checklist LGPD',
    description:
      'Acompanha o nível de adequação da empresa à LGPD item a item, com pendências e prazos.',
    bullets: [
      'Lista de requisitos legais organizados por tema',
      'Marcação de itens concluídos, pendentes e em andamento',
      'Cálculo automático do percentual de conformidade',
    ],
  },
  cookies: {
    title: 'Verificador de Site',
    description:
      'Escaneia o site da empresa em busca de cookies e trackers que exigem consentimento.',
    bullets: [
      'Varredura automática de cookies e scripts de terceiros',
      'Classificação por categoria (necessários, analíticos, marketing)',
      'Histórico de verificações anteriores',
    ],
  },
  inventory: {
    title: 'Inventário de Dados',
    description: 'Mapeia quais dados pessoais a empresa coleta, onde ficam armazenados e por quê.',
    bullets: [
      'Cadastro de cada tipo de dado pessoal tratado',
      'Base legal e finalidade de cada tratamento',
      'Sistemas e fornecedores envolvidos no armazenamento',
    ],
  },
  'retention-disposal': {
    title: 'Retenção e Descarte',
    description:
      'Define por quanto tempo cada tipo de dado deve ser mantido e como deve ser descartado.',
    bullets: [
      'Prazos de retenção por categoria de dado',
      'Regras de descarte seguro ao fim do prazo',
      'Alertas de vencimento de prazo',
    ],
  },
  risks: {
    title: 'Gestão de Riscos',
    description: 'Identifica e acompanha riscos relacionados ao tratamento de dados pessoais.',
    bullets: [
      'Cadastro de riscos com probabilidade e impacto',
      'Planos de ação para mitigação',
      'Acompanhamento do status de cada risco',
    ],
  },
  incidents: {
    title: 'Gestão de Incidentes',
    description: 'Registra e trata incidentes de segurança e vazamentos de dados pessoais.',
    bullets: [
      'Registro do incidente com linha do tempo',
      'Avaliação de gravidade e titulares afetados',
      'Controle de notificação à ANPD e aos titulares',
    ],
  },
  documents: {
    title: 'Documentos',
    description:
      'Centraliza políticas, contratos e demais documentos relacionados à LGPD da empresa.',
    bullets: [
      'Upload e versionamento de documentos',
      'Política de privacidade e termos de uso',
      'Contratos com cláusulas de proteção de dados',
    ],
  },
  consents: {
    title: 'Consentimentos',
    description: 'Mostra os consentimentos coletados dos titulares de dados e seu status.',
    bullets: [
      'Histórico de consentimentos aceitos e revogados',
      'Finalidades configuradas para coleta de consentimento',
      'Rastreabilidade de canal, data e versão da política',
    ],
  },
  suppliers: {
    title: 'Fornecedores',
    description: 'Cadastra fornecedores que têm acesso a dados pessoais da empresa.',
    bullets: [
      'Lista de fornecedores e serviços contratados',
      'Avaliação de risco de cada fornecedor',
      'Controle de contratos e cláusulas de proteção de dados',
    ],
  },
  trainings: {
    title: 'Treinamentos',
    description: 'Organiza treinamentos de conscientização sobre LGPD para os colaboradores.',
    bullets: [
      'Criação de treinamentos e materiais',
      'Convite de colaboradores por e-mail/WhatsApp',
      'Acompanhamento de conclusão por colaborador',
    ],
  },
  complaints: {
    title: 'Canal de Denúncias',
    description: 'Recebe e trata denúncias e reclamações relacionadas à privacidade de dados.',
    bullets: [
      'Canal para recebimento de denúncias',
      'Fluxo de apuração e resposta',
      'Histórico de denúncias e status',
    ],
  },
  'data-subjects': {
    title: 'Direitos dos Titulares',
    description:
      'Gerencia as solicitações dos titulares de dados (acesso, correção, exclusão etc.).',
    bullets: [
      'Recebimento de solicitações via formulário público',
      'Controle de prazo legal de resposta',
      'Histórico de solicitações atendidas',
    ],
  },
  'audit-logs': {
    title: 'Logs de Auditoria',
    description: 'Registra as ações realizadas por usuários da empresa dentro da plataforma.',
    bullets: [
      'Trilha de auditoria de criações, edições e exclusões',
      'Identificação de usuário, data e hora',
      'Consulta e filtro por módulo',
    ],
  },
}
