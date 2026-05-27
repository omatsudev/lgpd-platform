// Tabela base de retenção conforme politica_retencao_dados.pdf
// Pré-populada com 8 categorias padrão para uso como ponto de partida

export type RetentionBaseItem = {
  dataType: string
  category: string
  retentionPeriod: string
  startEvent: string
  legalBasis: string
  prescriptionPeriod?: string
  decadencePeriod?: string
  holdPossible: boolean
  finalDisposition: string
}

export const RETENTION_BASE_TABLE: RetentionBaseItem[] = [
  {
    dataType: 'Documentos Trabalhistas',
    category: 'Trabalhistas',
    retentionPeriod: '5 anos',
    startEvent: 'Rescisão do contrato de trabalho',
    legalBasis: 'CLT Art. 11; Lei 9.029/1995',
    prescriptionPeriod: '5 anos',
    holdPossible: false,
    finalDisposition: 'Descarte seguro',
  },
  {
    dataType: 'Documentos Previdenciários e SST',
    category: 'Previdenciários/SST',
    retentionPeriod: '10 anos (ou enquanto o trabalhador estiver ativo + 10 anos)',
    startEvent: 'Data do documento ou término do vínculo empregatício',
    legalBasis: 'NR-07; NR-09; Lei 8.213/1991; Decreto 3.048/1999',
    prescriptionPeriod: '10 anos',
    holdPossible: false,
    finalDisposition: 'Descarte seguro',
  },
  {
    dataType: 'FGTS e Previdência',
    category: 'FGTS/Previdência',
    retentionPeriod: '30 anos',
    startEvent: 'Data do depósito / competência',
    legalBasis: 'Lei 8.036/1990 Art. 23; Decreto 99.684/1990',
    prescriptionPeriod: '30 anos',
    holdPossible: false,
    finalDisposition: 'Descarte seguro',
  },
  {
    dataType: 'Documentos Fiscais e Contábeis',
    category: 'Fiscais/Contábeis',
    retentionPeriod: '5 anos (federal) / pode variar por estado',
    startEvent: 'Encerramento do exercício fiscal',
    legalBasis: 'CTN Art. 174; Lei 9.430/1996; CFC NBC TG 1000',
    prescriptionPeriod: '5 anos',
    decadencePeriod: '5 anos',
    holdPossible: false,
    finalDisposition: 'Descarte seguro',
  },
  {
    dataType: 'Dados de Clientes',
    category: 'Dados de Clientes',
    retentionPeriod: '5 anos após o encerramento da relação contratual',
    startEvent: 'Término da relação contratual',
    legalBasis: 'CDC Art. 27; LGPD Art. 16; CC Art. 205',
    prescriptionPeriod: '5 anos',
    holdPossible: true,
    finalDisposition: 'Anonimização ou descarte seguro',
  },
  {
    dataType: 'Currículos e Dados de Recrutamento',
    category: 'Currículos/Recrutamento',
    retentionPeriod: '1 ano (candidatos não selecionados) / 2 anos (candidatos selecionados)',
    startEvent: 'Data de encerramento do processo seletivo',
    legalBasis: 'LGPD Art. 7º, I e IX; Art. 16',
    holdPossible: true,
    finalDisposition: 'Descarte seguro',
  },
  {
    dataType: 'Imagens e Gravações (CFTV)',
    category: 'Imagens/CFTV',
    retentionPeriod: '30 dias (uso geral) / até 5 anos (envolvidos em sinistros)',
    startEvent: 'Data da gravação',
    legalBasis: 'LGPD Art. 7º, IX; Lei 13.022/2014 (uso policial)',
    holdPossible: true,
    finalDisposition: 'Descarte seguro (sobrescrita automática)',
  },
  {
    dataType: 'Dados Médicos e Sensíveis',
    category: 'Médicos/Sensíveis',
    retentionPeriod: '20 anos após o último atendimento (prontuários)',
    startEvent: 'Data do último atendimento ou prestação de serviço',
    legalBasis: 'CFM Res. 1.821/2007; LGPD Art. 11; Lei 8.078/1990',
    prescriptionPeriod: '20 anos',
    holdPossible: true,
    finalDisposition: 'Descarte seguro com certificado de destruição',
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
