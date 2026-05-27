// Tabela base de retenção conforme politica_retencao_dados.pdf
// Pré-populada com 8 categorias padrão para uso como ponto de partida

export type RetencaoBaseItem = {
  tipo_dado: string
  categoria: string
  prazo_retencao: string
  retention_start_event: string
  fundamento_juridico: string
  prazo_prescricional?: string
  prazo_decadencial?: string
  possibilidade_bloqueio: boolean
  final_disposition: string
}

export const RETENCAO_BASE_TABLE: RetencaoBaseItem[] = [
  {
    tipo_dado: 'Documentos Trabalhistas',
    categoria: 'Trabalhistas',
    prazo_retencao: '5 anos',
    retention_start_event: 'Rescisão do contrato de trabalho',
    fundamento_juridico: 'CLT Art. 11; Lei 9.029/1995',
    prazo_prescricional: '5 anos',
    possibilidade_bloqueio: false,
    final_disposition: 'Descarte seguro',
  },
  {
    tipo_dado: 'Documentos Previdenciários e SST',
    categoria: 'Previdenciários/SST',
    prazo_retencao: '10 anos (ou enquanto o trabalhador estiver ativo + 10 anos)',
    retention_start_event: 'Data do documento ou término do vínculo empregatício',
    fundamento_juridico: 'NR-07; NR-09; Lei 8.213/1991; Decreto 3.048/1999',
    prazo_prescricional: '10 anos',
    possibilidade_bloqueio: false,
    final_disposition: 'Descarte seguro',
  },
  {
    tipo_dado: 'FGTS e Previdência',
    categoria: 'FGTS/Previdência',
    prazo_retencao: '30 anos',
    retention_start_event: 'Data do depósito / competência',
    fundamento_juridico: 'Lei 8.036/1990 Art. 23; Decreto 99.684/1990',
    prazo_prescricional: '30 anos',
    possibilidade_bloqueio: false,
    final_disposition: 'Descarte seguro',
  },
  {
    tipo_dado: 'Documentos Fiscais e Contábeis',
    categoria: 'Fiscais/Contábeis',
    prazo_retencao: '5 anos (federal) / pode variar por estado',
    retention_start_event: 'Encerramento do exercício fiscal',
    fundamento_juridico: 'CTN Art. 174; Lei 9.430/1996; CFC NBC TG 1000',
    prazo_prescricional: '5 anos',
    prazo_decadencial: '5 anos',
    possibilidade_bloqueio: false,
    final_disposition: 'Descarte seguro',
  },
  {
    tipo_dado: 'Dados de Clientes',
    categoria: 'Dados de Clientes',
    prazo_retencao: '5 anos após o encerramento da relação contratual',
    retention_start_event: 'Término da relação contratual',
    fundamento_juridico: 'CDC Art. 27; LGPD Art. 16; CC Art. 205',
    prazo_prescricional: '5 anos',
    possibilidade_bloqueio: true,
    final_disposition: 'Anonimização ou descarte seguro',
  },
  {
    tipo_dado: 'Currículos e Dados de Recrutamento',
    categoria: 'Currículos/Recrutamento',
    prazo_retencao: '1 ano (candidatos não selecionados) / 2 anos (candidatos selecionados)',
    retention_start_event: 'Data de encerramento do processo seletivo',
    fundamento_juridico: 'LGPD Art. 7º, I e IX; Art. 16',
    possibilidade_bloqueio: true,
    final_disposition: 'Descarte seguro',
  },
  {
    tipo_dado: 'Imagens e Gravações (CFTV)',
    categoria: 'Imagens/CFTV',
    prazo_retencao: '30 dias (uso geral) / até 5 anos (envolvidos em sinistros)',
    retention_start_event: 'Data da gravação',
    fundamento_juridico: 'LGPD Art. 7º, IX; Lei 13.022/2014 (uso policial)',
    possibilidade_bloqueio: true,
    final_disposition: 'Descarte seguro (sobrescrita automática)',
  },
  {
    tipo_dado: 'Dados Médicos e Sensíveis',
    categoria: 'Médicos/Sensíveis',
    prazo_retencao: '20 anos após o último atendimento (prontuários)',
    retention_start_event: 'Data do último atendimento ou prestação de serviço',
    fundamento_juridico: 'CFM Res. 1.821/2007; LGPD Art. 11; Lei 8.078/1990',
    prazo_prescricional: '20 anos',
    possibilidade_bloqueio: true,
    final_disposition: 'Descarte seguro com certificado de destruição',
  },
]

export const EVENTOS_INICIAIS = [
  'Rescisão do contrato de trabalho',
  'Término da relação contratual',
  'Data do documento',
  'Encerramento do exercício fiscal',
  'Data do último atendimento',
  'Data de encerramento do processo seletivo',
  'Data da gravação',
  'Data do depósito / competência',
  'Data de nascimento do titular',
  'Outro',
]

export const DESTINACOES_FINAIS = [
  'Descarte seguro',
  'Anonimização',
  'Devolução ao titular',
  'Retenção estendida com justificativa',
  'Descarte seguro com certificado de destruição',
  'Anonimização ou descarte seguro',
  'Sobrescrita automática',
]

export const FUNDAMENTOS_JURIDICOS = [
  'LGPD Art. 7º, I (consentimento)',
  'LGPD Art. 7º, II (cumprimento de obrigação legal)',
  'LGPD Art. 7º, III (políticas públicas)',
  'LGPD Art. 7º, V (execução de contrato)',
  'LGPD Art. 7º, IX (legítimo interesse)',
  'LGPD Art. 16 (término do tratamento)',
  'CLT Art. 11',
  'CTN Art. 174',
  'CC Art. 205',
  'CDC Art. 27',
  'Lei 8.036/1990 (FGTS)',
  'Lei 8.213/1991 (Previdência)',
  'NR-07 / NR-09',
  'CFM Res. 1.821/2007',
]

export const CATEGORIAS_DADOS = [
  'Trabalhistas',
  'Previdenciários/SST',
  'FGTS/Previdência',
  'Fiscais/Contábeis',
  'Dados de Clientes',
  'Currículos/Recrutamento',
  'Imagens/CFTV',
  'Médicos/Sensíveis',
  'Consentimentos',
  'Dados Financeiros',
  'Dados Eletrônicos',
  'Outros',
]
