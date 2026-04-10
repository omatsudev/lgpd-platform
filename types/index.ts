export type UserRole = 'admin' | 'dpo' | 'empresa' | 'colaborador'

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  empresa_id?: string
  created_at: string
}

export type Empresa = {
  id: string
  nome: string
  cnpj: string
  slug: string
  setor: string
  dpo_id?: string
  dpo_nome?: string
  dpo_email?: string
  dpo_telefone?: string
  percentual_adequacao: number
  created_at: string
  updated_at: string
}

export type InventarioItem = {
  id: string
  empresa_id: string
  tipo_dado: string
  finalidade: string
  base_legal: string
  local_armazenamento: string
  prazo_retencao?: string
  responsavel?: string
  created_at: string
  updated_at: string
}

export type Treinamento = {
  id: string
  empresa_id: string
  titulo: string
  descricao?: string
  video_url?: string
  pdf_url?: string
  created_at: string
}

export type TreinamentoFuncionario = {
  id: string
  treinamento_id: string
  colaborador_id: string
  colaborador_nome: string
  colaborador_whatsapp: string
  status: 'nao_iniciado' | 'em_andamento' | 'concluido'
  link_acesso: string
  progresso: number
  certificado_url?: string
  concluido_em?: string
  created_at: string
}

export type Denuncia = {
  id: string
  empresa_id: string
  anonimo: boolean
  nome?: string
  email?: string
  tipo: string
  descricao: string
  status: 'recebido' | 'em_analise' | 'resolvido'
  resposta?: string
  created_at: string
  updated_at: string
}

export type SolicitacaoTitular = {
  id: string
  empresa_id: string
  tipo: 'acesso' | 'exclusao' | 'correcao' | 'portabilidade' | 'oposicao'
  nome: string
  email: string
  cpf?: string
  descricao: string
  status: 'pendente' | 'em_analise' | 'concluido' | 'recusado'
  resposta?: string
  prazo_resposta: string
  created_at: string
  updated_at: string
}

export type LogAuditoria = {
  id: string
  empresa_id: string
  user_id: string
  user_email: string
  acao: string
  recurso: string
  detalhes?: string
  ip?: string
  created_at: string
}

export type Notificacao = {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  tipo: 'info' | 'alerta' | 'erro' | 'sucesso'
  lida: boolean
  created_at: string
}
