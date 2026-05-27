export type UserRole = 'admin' | 'dpo' | 'company' | 'collaborator'

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  company_id?: string
  created_at: string
}

export type Company = {
  id: string
  name: string
  tax_id: string
  slug: string
  sector: string
  dpo_id?: string
  dpo_name?: string
  dpo_email?: string
  dpo_phone?: string
  compliance_percentage: number
  created_at: string
  updated_at: string
}

export type InventoryItem = {
  id: string
  company_id: string
  data_type: string
  purpose: string
  legal_basis: string
  storage_location: string
  retention_period?: string
  responsible?: string
  created_at: string
  updated_at: string
}

export type Training = {
  id: string
  company_id: string
  title: string
  description?: string
  video_url?: string
  pdf_url?: string
  created_at: string
}

export type TrainingEmployee = {
  id: string
  training_id: string
  collaborator_id: string
  collaborator_name: string
  collaborator_whatsapp: string
  status: 'not_started' | 'in_progress' | 'completed'
  access_link: string
  progress: number
  certificate_url?: string
  completed_at?: string
  created_at: string
}

export type Complaint = {
  id: string
  company_id: string
  anonymous: boolean
  name?: string
  email?: string
  type: string
  description: string
  status: 'received' | 'under_review' | 'resolved'
  response?: string
  created_at: string
  updated_at: string
}

export type DataSubjectRequest = {
  id: string
  company_id: string
  type: 'access' | 'deletion' | 'correction' | 'portability' | 'objection'
  name: string
  email: string
  cpf?: string
  description: string
  status: 'pending' | 'under_review' | 'completed' | 'rejected'
  response?: string
  response_deadline: string
  created_at: string
  updated_at: string
}

export type AuditLog = {
  id: string
  company_id: string
  user_id: string
  user_email: string
  action: string
  resource: string
  details?: string
  ip?: string
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  created_at: string
}
