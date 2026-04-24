import { Plus, CheckCircle2, XCircle, MinusCircle, ClipboardList, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDateTime } from '@/lib/utils'

const canalLabel: Record<string, string> = {
  web: 'Web', app: 'App', in_person: 'Presencial', email: 'E-mail', api: 'API',
}

export default async function ConsentimentosPage({ searchParams }: { searchParams: Promise<{ q?: string; aba?: string }> }) {
  const { companyId, company, supabase } = await getUserCompany()
  const { q, aba = 'registros' } = await searchParams

  // Finalidades
  const { data: finalidades } = companyId
    ? await supabase
        .from('consent_purposes')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Consentimentos com join de finalidade
  let registrosQuery = supabase
    .from('consents')
    .select('*, consent_purposes(name)')
    .eq('company_id', companyId ?? '')
  if (q) registrosQuery = registrosQuery.or(`subject_email.ilike.%${q}%,subject_name.ilike.%${q}%,subject_tax_id.ilike.%${q}%`)

  const { data: registros } = companyId
    ? await registrosQuery.order('created_at', { ascending: false }).limit(200)
    : { data: [] }

  const itens = finalidades ?? []
  const regs = registros ?? []
  const ativos = regs.filter((r: any) => r.accepted && !r.revoked).length
  const revogados = regs.filter((r: any) => r.revoked).length
  const recusados = regs.filter((r: any) => !r.accepted).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Consentimentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registro e rastreabilidade de consentimentos LGPD</p>
        </div>
        <Link href="/consentimentos/finalidades/nova">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nova Finalidade
          </Button>
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: regs.length, icon: ClipboardList, color: 'text-gray-600' },
          { label: 'Ativos', value: ativos, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Revogados', value: revogados, icon: XCircle, color: 'text-red-600' },
          { label: 'Recusados', value: recusados, icon: MinusCircle, color: 'text-yellow-600' },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <m.icon className={`h-5 w-5 ${m.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-500">{m.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'registros', label: `Registros (${regs.length})` },
          { key: 'finalidades', label: `Finalidades (${itens.length})` },
        ].map(tab => (
          <Link
            key={tab.key}
            href={`/consentimentos?aba=${tab.key}${q ? `&q=${q}` : ''}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              aba === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Aba: Registros de consentimento */}
      {aba === 'registros' && (
        <Card>
          <CardContent className="pt-4 pb-3">
            <SearchInput defaultValue={q ?? ''} placeholder="Buscar por e-mail, nome, CPF..." />
          </CardContent>
          <CardContent className="p-0">
            {regs.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhum consentimento registrado</p>
                <p className="text-sm text-gray-400 mt-1">Os consentimentos coletados aparecerão aqui</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Titular</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Finalidade</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Canal</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
                        <th className="py-3 px-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {regs.map((reg: any) => {
                        const status = reg.revoked ? 'revogado' : reg.accepted ? 'ativo' : 'recusado'
                        return (
                          <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900 text-xs">{reg.subject_email}</p>
                              {reg.subject_name && <p className="text-gray-500 text-xs">{reg.subject_name}</p>}
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-xs max-w-[160px] truncate">
                              {(reg.consent_purposes as any)?.name ?? '—'}
                            </td>
                            <td className="py-3 px-4">
                              {status === 'ativo' && <Badge variant="success">Ativo</Badge>}
                              {status === 'revogado' && <Badge variant="destructive">Revogado</Badge>}
                              {status === 'recusado' && <Badge variant="warning">Recusado</Badge>}
                            </td>
                            <td className="py-3 px-4 text-gray-500 text-xs">{canalLabel[reg.channel] ?? reg.channel}</td>
                            <td className="py-3 px-4 text-gray-500 text-xs font-mono">{formatDateTime(reg.created_at)}</td>
                            <td className="py-3 px-4 text-right">
                              <Link href={`/consentimentos/${reg.id}`}>
                                <Button variant="ghost" size="sm">Ver</Button>
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden divide-y divide-gray-100">
                  {regs.map((reg: any) => {
                    const status = reg.revoked ? 'revogado' : reg.accepted ? 'ativo' : 'recusado'
                    return (
                      <div key={reg.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{reg.subject_email}</p>
                            {reg.subject_name && <p className="text-xs text-gray-500">{reg.subject_name}</p>}
                          </div>
                          <Link href={`/consentimentos/${reg.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">Ver</Button>
                          </Link>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {status === 'ativo' && <Badge variant="success" className="text-xs">Ativo</Badge>}
                          {status === 'revogado' && <Badge variant="destructive" className="text-xs">Revogado</Badge>}
                          {status === 'recusado' && <Badge variant="warning" className="text-xs">Recusado</Badge>}
                          <span className="text-xs text-gray-400">{canalLabel[reg.channel] ?? reg.channel}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono">{formatDateTime(reg.created_at)}</p>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Aba: Finalidades */}
      {aba === 'finalidades' && (
        <div className="space-y-3">
          {itens.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 font-medium">Nenhuma finalidade cadastrada</p>
                <p className="text-sm text-gray-400 mt-1">Crie finalidades para começar a coletar consentimentos</p>
              </CardContent>
            </Card>
          ) : (
            itens.map((f: any) => {
              const consentUrl = company?.slug
                ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://lgpd-platform.vercel.app'}/lgpd/${company.slug}`
                : null
              const whatsappMsg = consentUrl
                ? encodeURIComponent(`Olá! Para regularizar seu consentimento conforme a LGPD, acesse o link abaixo:\n\n${consentUrl}\n\nFinalidade: ${f.name}`)
                : null
              return (
                <Card key={f.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900">{f.name}</p>
                          {f.required && <Badge variant="warning" className="text-xs">Obrigatório</Badge>}
                          {f.active
                            ? <Badge variant="success" className="text-xs">Ativa</Badge>
                            : <Badge variant="secondary" className="text-xs">Inativa</Badge>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{f.description}</p>
                        <p className="text-xs text-gray-400 mt-1">Base legal: {f.legal_basis}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {whatsappMsg && (
                          <a
                            href={`https://wa.me/?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-50">
                              <Send className="h-3 w-3 mr-1" /> WhatsApp
                            </Button>
                          </a>
                        )}
                        <Link href={`/consentimentos/finalidades/${f.id}`}>
                          <Button variant="ghost" size="sm">Editar</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
          <Link href="/consentimentos/finalidades/nova">
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Nova Finalidade
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
