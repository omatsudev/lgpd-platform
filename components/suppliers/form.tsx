'use client'

import { deleteSupplier, saveSupplier } from '@/app/actions/suppliers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Database, FileCheck, Globe, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

// ─── Constantes ────────────────────────────────────────────────────────────

const CATEGORIAS = [
  { value: 'technology', label: 'Tecnologia (SaaS, cloud, TI)' },
  { value: 'healthcare', label: 'Saúde (plano, clínica, lab)' },
  { value: 'financial', label: 'Financeiro (banco, pagamentos)' },
  { value: 'rh', label: 'RH (folha, recrutamento)' },
  { value: 'marketing', label: 'Marketing (CRM, e-mail, ads)' },
  { value: 'legal', label: 'Jurídico' },
  { value: 'accounting', label: 'Contabilidade' },
  { value: 'logistics', label: 'Logística' },
  { value: 'other', label: 'Outro' },
]

const TIPOS_ACESSO = [
  { value: 'processor', label: 'Operador', desc: 'Trata dados em nome da sua empresa' },
  {
    value: 'joint_controller',
    label: 'Controlador Conjunto',
    desc: 'Decide junto sobre o tratamento',
  },
  {
    value: 'sub_processor',
    label: 'Suboperador',
    desc: 'Contratado pelo operador para tratar dados',
  },
  { value: 'no_data_access', label: 'Sem acesso a dados', desc: 'Não acessa dados pessoais' },
]

const DADOS_CATEGORIAS = [
  'Dados de identificação (nome, e-mail, telefone)',
  'Dados governamentais (CPF, RG)',
  'Dados financeiros (conta, cartão)',
  'Dados de saúde',
  'Dados de localização',
  'Dados de acesso e navegação',
  'Dados sensíveis (biometria, origem racial)',
  'Dados de colaboradores',
  'Dados de menores',
]

const MECANISMOS_TRANSFERENCIA = [
  'Cláusulas Contratuais Padrão (SCC)',
  'Decisão de adequação da ANPD',
  'Consentimento do titular',
  'Necessidade de execução de contrato',
  'Certificação ou código de conduta aprovado',
]

const BASES_LEGAIS = [
  'Execução de contrato',
  'Legítimo interesse',
  'Cumprimento de obrigação legal',
  'Consentimento do titular',
  'Exercício regular de direitos',
]

type FormState = {
  name: string
  tax_id: string
  site: string
  contact_name: string
  contact_email: string
  contact_phone: string
  country: string
  category: string
  access_type: string
  accessed_data: string[]
  sharing_purpose: string
  sharing_legal_basis: string
  has_contract: boolean
  has_dpa: boolean
  dpa_signing_date: string
  contract_url: string
  due_diligence_status: string
  last_assessment_date: string
  next_assessment_date: string
  risk_level: string
  notes: string
  international_transfer: boolean
  destination_country: string
  transfer_mechanism: string
  active: boolean
}

function defaultState(): FormState {
  return {
    name: '',
    tax_id: '',
    site: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    country: 'Brasil',
    category: '',
    access_type: 'processor',
    accessed_data: [],
    sharing_purpose: '',
    sharing_legal_basis: '',
    has_contract: false,
    has_dpa: false,
    dpa_signing_date: '',
    contract_url: '',
    due_diligence_status: 'pending',
    last_assessment_date: '',
    next_assessment_date: '',
    risk_level: 'medium',
    notes: '',
    international_transfer: false,
    destination_country: '',
    transfer_mechanism: '',
    active: true,
  }
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

function CheckBox({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  sub?: string
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span>
        <span className="text-sm text-gray-700">{label}</span>
        {sub && <span className="block text-xs text-gray-400">{sub}</span>}
      </span>
    </label>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────

interface SupplierFormProps {
  companyId: string
  id?: string
  initialData?: any
}

export function SupplierForm({ companyId, id, initialData }: SupplierFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState<FormState>(() => {
    if (!initialData) return defaultState()
    return {
      name: initialData.name ?? '',
      tax_id: initialData.tax_id ?? '',
      site: initialData.site ?? '',
      contact_name: initialData.contact_name ?? '',
      contact_email: initialData.contact_email ?? '',
      contact_phone: initialData.contact_phone ?? '',
      country: initialData.country ?? 'Brasil',
      category: initialData.category ?? '',
      access_type: initialData.access_type ?? 'processor',
      accessed_data: initialData.accessed_data ?? [],
      sharing_purpose: initialData.sharing_purpose ?? '',
      sharing_legal_basis: initialData.sharing_legal_basis ?? '',
      has_contract: initialData.has_contract ?? false,
      has_dpa: initialData.has_dpa ?? false,
      dpa_signing_date: initialData.dpa_signing_date ?? '',
      contract_url: initialData.contract_url ?? '',
      due_diligence_status: initialData.due_diligence_status ?? 'pending',
      last_assessment_date: initialData.last_assessment_date ?? '',
      next_assessment_date: initialData.next_assessment_date ?? '',
      risk_level: initialData.risk_level ?? 'medium',
      notes: initialData.notes ?? '',
      international_transfer: initialData.international_transfer ?? false,
      destination_country: initialData.destination_country ?? '',
      transfer_mechanism: initialData.transfer_mechanism ?? '',
      active: initialData.active ?? true,
    }
  })

  const update = (field: keyof FormState, value: any) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const toggleDataItem = (dataItem: string) => {
    setData((prev) => ({
      ...prev,
      accessed_data: prev.accessed_data.includes(dataItem)
        ? prev.accessed_data.filter((d) => d !== dataItem)
        : [...prev.accessed_data, dataItem],
    }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.name.trim()) errs.name = 'Nome é obrigatório'
    if (!data.category) errs.category = 'Categoria é obrigatória'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSaving(true)
    try {
      await saveSupplier({
        id,
        company_id: companyId,
        name: data.name,
        tax_id: data.tax_id,
        site: data.site,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        country: data.country,
        category: data.category,
        access_type: data.access_type,
        accessed_data: data.accessed_data,
        sharing_purpose: data.sharing_purpose,
        sharing_legal_basis: data.sharing_legal_basis,
        has_contract: data.has_contract,
        has_dpa: data.has_dpa,
        dpa_signing_date: data.dpa_signing_date,
        contract_url: data.contract_url,
        due_diligence_status: data.due_diligence_status,
        last_assessment_date: data.last_assessment_date,
        next_assessment_date: data.next_assessment_date,
        risk_level: data.risk_level,
        notes: data.notes,
        international_transfer: data.international_transfer,
        destination_country: data.destination_country,
        transfer_mechanism: data.transfer_mechanism,
        active: data.active,
      })
    } catch {
      setSaving(false)
    }
  }

  const handleDelete = (formData: FormData) => {
    startDeleting(async () => {
      await deleteSupplier(formData)
    })
  }

  const accessesData = data.access_type !== 'no_data_access'

  return (
    <div className="space-y-6">
      {/* Seção 1: Identificação */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Building2}
            title="Identificação"
            subtitle="Dados básicos do fornecedor"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Razão social ou nome comercial"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tax_id">CNPJ</Label>
              <Input
                id="tax_id"
                value={data.tax_id}
                onChange={(e) => update('tax_id', e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={data.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="site">Site</Label>
              <Input
                id="site"
                value={data.site}
                onChange={(e) => update('site', e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact_name">Contato</Label>
              <Input
                id="contact_name"
                value={data.contact_name}
                onChange={(e) => update('contact_name', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_email">E-mail</Label>
              <Input
                id="contact_email"
                value={data.contact_email}
                onChange={(e) => update('contact_email', e.target.value)}
                placeholder="contato@fornecedor.com"
                type="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_phone">Telefone</Label>
              <Input
                id="contact_phone"
                value={data.contact_phone}
                onChange={(e) => update('contact_phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <CheckBox
              checked={data.active}
              onChange={(v) => update('active', v)}
              label="Fornecedor ativo"
              sub="Desmarcado para fornecedores encerrados"
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Acesso a Dados */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Database}
            title="Acesso a Dados Pessoais"
            subtitle="Que dados o fornecedor acessa e com qual papel"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo de acesso</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TIPOS_ACESSO.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => update('access_type', t.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    data.access_type === t.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs mt-0.5 opacity-75">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {accessesData && (
            <>
              <div className="space-y-1.5">
                <Label>Categorias de dados acessados</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {DADOS_CATEGORIAS.map((d) => (
                    <label
                      key={d}
                      className="flex items-center gap-2 cursor-pointer select-none p-2 rounded hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={data.accessed_data.includes(d)}
                        onChange={() => toggleDataItem(d)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sharing_purpose">Finalidade do compartilhamento</Label>
                  <Textarea
                    id="sharing_purpose"
                    value={data.sharing_purpose}
                    onChange={(e) => update('sharing_purpose', e.target.value)}
                    placeholder="Para que o fornecedor usa os dados?"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Base legal</Label>
                  <Select
                    value={data.sharing_legal_basis}
                    onValueChange={(v) => update('sharing_legal_basis', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {BASES_LEGAIS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Seção 3: Contrato / DPA */}
      {accessesData && (
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader
              icon={FileCheck}
              title="Contrato e DPA"
              subtitle="Acordo de processamento de dados"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6">
              <CheckBox
                checked={data.has_contract}
                onChange={(v) => update('has_contract', v)}
                label="Possui contrato assinado"
                sub="Contrato de prestação de serviços"
              />
              <CheckBox
                checked={data.has_dpa}
                onChange={(v) => update('has_dpa', v)}
                label="Possui DPA assinado"
                sub="Data Processing Agreement / Anexo LGPD"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dpa_signing_date">Data de assinatura do DPA</Label>
                <Input
                  id="dpa_signing_date"
                  type="date"
                  value={data.dpa_signing_date}
                  onChange={(e) => update('dpa_signing_date', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contract_url">URL do contrato/DPA</Label>
                <Input
                  id="contract_url"
                  value={data.contract_url}
                  onChange={(e) => update('contract_url', e.target.value)}
                  placeholder="Link para o documento assinado"
                  type="url"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção 4: Due Diligence */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={ShieldCheck}
            title="Due Diligence LGPD"
            subtitle="Avaliação de conformidade do fornecedor"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status da diligência</Label>
              <Select
                value={data.due_diligence_status}
                onValueChange={(v) => update('due_diligence_status', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: 'pending', label: 'Pendente' },
                    { value: 'under_review', label: 'Em Análise' },
                    { value: 'approved', label: 'Aprovado' },
                    { value: 'rejected', label: 'Reprovado' },
                    { value: 'expired', label: 'Expirado' },
                  ].map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Nível de risco</Label>
              <Select value={data.risk_level} onValueChange={(v) => update('risk_level', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['low', 'medium', 'high', 'critical'].map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="last_assessment_date">Última avaliação</Label>
              <Input
                id="last_assessment_date"
                type="date"
                value={data.last_assessment_date}
                onChange={(e) => update('last_assessment_date', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next_assessment_date">Próxima avaliação</Label>
              <Input
                id="next_assessment_date"
                type="date"
                value={data.next_assessment_date}
                onChange={(e) => update('next_assessment_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={data.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Pontos de atenção, histórico de avaliações, questões pendentes..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 5: Transferência Internacional */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Globe}
            title="Transferência Internacional"
            subtitle="LGPD Cap. V — dados enviados para fora do Brasil"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <CheckBox
            checked={data.international_transfer}
            onChange={(v) => update('international_transfer', v)}
            label="Envolve transferência internacional de dados"
            sub="O fornecedor processa dados em servidores ou equipes fora do Brasil"
          />
          {data.international_transfer && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="destination_country">País de destino</Label>
                <Input
                  id="destination_country"
                  value={data.destination_country}
                  onChange={(e) => update('destination_country', e.target.value)}
                  placeholder="Ex: Estados Unidos, União Europeia"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mecanismo de transferência</Label>
                <Select
                  value={data.transfer_mechanism}
                  onValueChange={(v) => update('transfer_mechanism', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MECANISMOS_TRANSFERENCIA.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {id && (
          <form action={handleDelete}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive" size="sm" disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir Fornecedor'}
            </Button>
          </form>
        )}
        <div className="flex gap-3 sm:ml-auto">
          <Button variant="outline" onClick={() => router.push('/suppliers')} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : id ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
          </Button>
        </div>
      </div>
    </div>
  )
}
