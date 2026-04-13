'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { salvarFornecedor, deletarFornecedor, type FornecedorData } from '@/app/actions/fornecedores'
import { Building2, Database, FileCheck, ShieldCheck, Globe } from 'lucide-react'

// ─── Constantes ────────────────────────────────────────────────────────────

const CATEGORIAS = [
  { value: 'tecnologia', label: 'Tecnologia (SaaS, cloud, TI)' },
  { value: 'saude', label: 'Saúde (plano, clínica, lab)' },
  { value: 'financeiro', label: 'Financeiro (banco, pagamentos)' },
  { value: 'rh', label: 'RH (folha, recrutamento)' },
  { value: 'marketing', label: 'Marketing (CRM, e-mail, ads)' },
  { value: 'juridico', label: 'Jurídico' },
  { value: 'contabilidade', label: 'Contabilidade' },
  { value: 'logistica', label: 'Logística' },
  { value: 'outro', label: 'Outro' },
]

const TIPOS_ACESSO = [
  { value: 'operador', label: 'Operador', desc: 'Trata dados em nome da sua empresa' },
  { value: 'controlador_conjunto', label: 'Controlador Conjunto', desc: 'Decide junto sobre o tratamento' },
  { value: 'suboperador', label: 'Suboperador', desc: 'Contratado pelo operador para tratar dados' },
  { value: 'sem_acesso_dados', label: 'Sem acesso a dados', desc: 'Não acessa dados pessoais' },
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

type FormState = Omit<FornecedorData, 'empresa_id' | 'id'>

function defaultState(): FormState {
  return {
    nome: '', cnpj: '', site: '', contato_nome: '', contato_email: '', contato_telefone: '',
    pais: 'Brasil', categoria: '', tipo_acesso: 'operador',
    dados_acessados: [], finalidade_compartilhamento: '', base_legal_compartilhamento: '',
    possui_contrato: false, possui_dpa: false, data_assinatura_dpa: '', url_contrato: '',
    status_diligencia: 'pendente', data_ultima_avaliacao: '', data_proxima_avaliacao: '',
    nivel_risco: 'medio', observacoes: '',
    transferencia_internacional: false, pais_destino: '', mecanismo_transferencia: '',
    ativo: true,
  }
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-50 rounded-lg"><Icon className="h-5 w-5 text-blue-600" /></div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

function CheckBox({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
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

interface FornecedorFormProps {
  empresaId: string
  id?: string
  initialData?: any
}

export function FornecedorForm({ empresaId, id, initialData }: FornecedorFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState<FormState>(() => {
    if (!initialData) return defaultState()
    return {
      nome: initialData.nome ?? '',
      cnpj: initialData.cnpj ?? '',
      site: initialData.site ?? '',
      contato_nome: initialData.contato_nome ?? '',
      contato_email: initialData.contato_email ?? '',
      contato_telefone: initialData.contato_telefone ?? '',
      pais: initialData.pais ?? 'Brasil',
      categoria: initialData.categoria ?? '',
      tipo_acesso: initialData.tipo_acesso ?? 'operador',
      dados_acessados: initialData.dados_acessados ?? [],
      finalidade_compartilhamento: initialData.finalidade_compartilhamento ?? '',
      base_legal_compartilhamento: initialData.base_legal_compartilhamento ?? '',
      possui_contrato: initialData.possui_contrato ?? false,
      possui_dpa: initialData.possui_dpa ?? false,
      data_assinatura_dpa: initialData.data_assinatura_dpa ?? '',
      url_contrato: initialData.url_contrato ?? '',
      status_diligencia: initialData.status_diligencia ?? 'pendente',
      data_ultima_avaliacao: initialData.data_ultima_avaliacao ?? '',
      data_proxima_avaliacao: initialData.data_proxima_avaliacao ?? '',
      nivel_risco: initialData.nivel_risco ?? 'medio',
      observacoes: initialData.observacoes ?? '',
      transferencia_internacional: initialData.transferencia_internacional ?? false,
      pais_destino: initialData.pais_destino ?? '',
      mecanismo_transferencia: initialData.mecanismo_transferencia ?? '',
      ativo: initialData.ativo ?? true,
    }
  })

  const update = (field: keyof FormState, value: any) =>
    setData(prev => ({ ...prev, [field]: value }))

  const toggleDado = (dado: string) => {
    setData(prev => ({
      ...prev,
      dados_acessados: prev.dados_acessados.includes(dado)
        ? prev.dados_acessados.filter(d => d !== dado)
        : [...prev.dados_acessados, dado],
    }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.nome.trim()) errs.nome = 'Nome é obrigatório'
    if (!data.categoria) errs.categoria = 'Categoria é obrigatória'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      await salvarFornecedor({ ...data, empresa_id: empresaId, id })
    } catch { setSaving(false) }
  }

  const handleDelete = (formData: FormData) => {
    startDeleting(async () => { await deletarFornecedor(formData) })
  }

  const acessaDados = data.tipo_acesso !== 'sem_acesso_dados'

  return (
    <div className="space-y-6">
      {/* Seção 1: Identificação */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Building2} title="Identificação" subtitle="Dados básicos do fornecedor" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" value={data.nome} onChange={e => update('nome', e.target.value)} placeholder="Razão social ou nome comercial" />
              {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={data.cnpj} onChange={e => update('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={data.categoria} onValueChange={v => update('categoria', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              {errors.categoria && <p className="text-xs text-red-500">{errors.categoria}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="site">Site</Label>
              <Input id="site" value={data.site} onChange={e => update('site', e.target.value)} placeholder="https://..." type="url" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contato_nome">Contato</Label>
              <Input id="contato_nome" value={data.contato_nome} onChange={e => update('contato_nome', e.target.value)} placeholder="Nome do responsável" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contato_email">E-mail</Label>
              <Input id="contato_email" value={data.contato_email} onChange={e => update('contato_email', e.target.value)} placeholder="contato@fornecedor.com" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contato_telefone">Telefone</Label>
              <Input id="contato_telefone" value={data.contato_telefone} onChange={e => update('contato_telefone', e.target.value)} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <CheckBox checked={data.ativo} onChange={v => update('ativo', v)} label="Fornecedor ativo" sub="Desmarcado para fornecedores encerrados" />
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Acesso a Dados */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Database} title="Acesso a Dados Pessoais" subtitle="Que dados o fornecedor acessa e com qual papel" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo de acesso</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TIPOS_ACESSO.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => update('tipo_acesso', t.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    data.tipo_acesso === t.value
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

          {acessaDados && (
            <>
              <div className="space-y-1.5">
                <Label>Categorias de dados acessados</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {DADOS_CATEGORIAS.map(d => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer select-none p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={data.dados_acessados.includes(d)}
                        onChange={() => toggleDado(d)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="finalidade">Finalidade do compartilhamento</Label>
                  <Textarea
                    id="finalidade"
                    value={data.finalidade_compartilhamento}
                    onChange={e => update('finalidade_compartilhamento', e.target.value)}
                    placeholder="Para que o fornecedor usa os dados?"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Base legal</Label>
                  <Select value={data.base_legal_compartilhamento} onValueChange={v => update('base_legal_compartilhamento', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{BASES_LEGAIS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Seção 3: Contrato / DPA */}
      {acessaDados && (
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={FileCheck} title="Contrato e DPA" subtitle="Acordo de processamento de dados" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6">
              <CheckBox
                checked={data.possui_contrato}
                onChange={v => update('possui_contrato', v)}
                label="Possui contrato assinado"
                sub="Contrato de prestação de serviços"
              />
              <CheckBox
                checked={data.possui_dpa}
                onChange={v => update('possui_dpa', v)}
                label="Possui DPA assinado"
                sub="Data Processing Agreement / Anexo LGPD"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="data_assinatura_dpa">Data de assinatura do DPA</Label>
                <Input
                  id="data_assinatura_dpa"
                  type="date"
                  value={data.data_assinatura_dpa}
                  onChange={e => update('data_assinatura_dpa', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="url_contrato">URL do contrato/DPA</Label>
                <Input
                  id="url_contrato"
                  value={data.url_contrato}
                  onChange={e => update('url_contrato', e.target.value)}
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
          <SectionHeader icon={ShieldCheck} title="Due Diligence LGPD" subtitle="Avaliação de conformidade do fornecedor" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status da diligência</Label>
              <Select value={data.status_diligencia} onValueChange={v => update('status_diligencia', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[
                    { value: 'pendente', label: 'Pendente' },
                    { value: 'em_analise', label: 'Em Análise' },
                    { value: 'aprovado', label: 'Aprovado' },
                    { value: 'reprovado', label: 'Reprovado' },
                    { value: 'expirado', label: 'Expirado' },
                  ].map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Nível de risco</Label>
              <Select value={data.nivel_risco} onValueChange={v => update('nivel_risco', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['baixo', 'medio', 'alto', 'critico'].map(r => (
                    <SelectItem key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="data_ultima_avaliacao">Última avaliação</Label>
              <Input id="data_ultima_avaliacao" type="date" value={data.data_ultima_avaliacao} onChange={e => update('data_ultima_avaliacao', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_proxima_avaliacao">Próxima avaliação</Label>
              <Input id="data_proxima_avaliacao" type="date" value={data.data_proxima_avaliacao} onChange={e => update('data_proxima_avaliacao', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={data.observacoes}
              onChange={e => update('observacoes', e.target.value)}
              placeholder="Pontos de atenção, histórico de avaliações, questões pendentes..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 5: Transferência Internacional */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Globe} title="Transferência Internacional" subtitle="LGPD Cap. V — dados enviados para fora do Brasil" />
        </CardHeader>
        <CardContent className="space-y-4">
          <CheckBox
            checked={data.transferencia_internacional}
            onChange={v => update('transferencia_internacional', v)}
            label="Envolve transferência internacional de dados"
            sub="O fornecedor processa dados em servidores ou equipes fora do Brasil"
          />
          {data.transferencia_internacional && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="pais_destino">País de destino</Label>
                <Input
                  id="pais_destino"
                  value={data.pais_destino}
                  onChange={e => update('pais_destino', e.target.value)}
                  placeholder="Ex: Estados Unidos, União Europeia"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mecanismo de transferência</Label>
                <Select value={data.mecanismo_transferencia} onValueChange={v => update('mecanismo_transferencia', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {MECANISMOS_TRANSFERENCIA.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
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
          <Button variant="outline" onClick={() => router.push('/fornecedores')} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : id ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
          </Button>
        </div>
      </div>
    </div>
  )
}
