'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2, XCircle, AlertTriangle, Shield, Cookie,
  Globe, Zap, Search, ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react'

// ─── Tipos (espelham lib/site-scanner.ts) ────────────────────────────────

type CookieCat = 'necessario' | 'funcional' | 'analitico' | 'marketing' | 'desconhecido'
type TechCat = 'analytics' | 'advertising' | 'social' | 'cms' | 'framework' | 'chat' | 'outro'
type Nivel = 'critico' | 'alto' | 'medio' | 'baixo'
type TechRisco = 'alto' | 'medio' | 'baixo'

type ScanResultado = {
  cookies: Array<{ nome: string; categoria: CookieCat; secure?: boolean; httpOnly?: boolean; sameSite?: string; expiracao?: string }>
  tecnologias: Array<{ nome: string; categoria: TechCat; risco: TechRisco; descricao: string }>
  tem_banner_cookies: boolean
  tem_politica_privacidade: boolean
  url_politica_privacidade: string | null
  score_conformidade: number
  problemas: Array<{ nivel: Nivel; titulo: string; descricao: string }>
  recomendacoes: Array<{ titulo: string; descricao: string }>
}

// ─── Helpers visuais ─────────────────────────────────────────────────────

const catCookieLabel: Record<CookieCat, string> = {
  necessario: 'Necessário', funcional: 'Funcional',
  analitico: 'Analítico', marketing: 'Marketing', desconhecido: 'Desconhecido',
}
const catCookieVariant: Record<CookieCat, 'success' | 'default' | 'warning' | 'destructive' | 'secondary'> = {
  necessario: 'success', funcional: 'default',
  analitico: 'warning', marketing: 'destructive', desconhecido: 'secondary',
}

const catTechLabel: Record<TechCat, string> = {
  analytics: 'Analytics', advertising: 'Publicidade', social: 'Social',
  cms: 'CMS', framework: 'Framework', chat: 'Chat', outro: 'Outro',
}

const nivelVariant: Record<Nivel, 'destructive' | 'warning' | 'default' | 'secondary'> = {
  critico: 'destructive', alto: 'destructive', medio: 'warning', baixo: 'secondary',
}
const nivelLabel: Record<Nivel, string> = {
  critico: 'Crítico', alto: 'Alto', medio: 'Médio', baixo: 'Baixo',
}

const riscoVariant: Record<TechRisco, 'destructive' | 'warning' | 'success'> = {
  alto: 'destructive', medio: 'warning', baixo: 'success',
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
  const label = score >= 80 ? 'Bom' : score >= 50 ? 'Regular' : 'Crítico'
  return (
    <div className="flex flex-col items-center">
      <div className={`text-5xl font-bold ${color}`}>{score}</div>
      <div className={`text-sm font-medium mt-1 ${color}`}>{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">de 100</div>
    </div>
  )
}

function BoolCheck({ ok, labelOk, labelNao }: { ok: boolean; labelOk: string; labelNao: string }) {
  return ok
    ? <span className="flex items-center gap-1 text-green-700 text-sm"><CheckCircle2 className="h-4 w-4" />{labelOk}</span>
    : <span className="flex items-center gap-1 text-red-600 text-sm"><XCircle className="h-4 w-4" />{labelNao}</span>
}

function CollapsibleSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  const [aberto, setAberto] = useState(true)
  return (
    <div>
      <button
        type="button"
        className="w-full flex items-center justify-between py-2 text-left"
        onClick={() => setAberto(p => !p)}
      >
        <span className="font-semibold text-gray-900 text-sm">{title} <span className="text-gray-400 font-normal">({count})</span></span>
        {aberto ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {aberto && <div className="mt-2">{children}</div>}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────

export function ScanForm({ scanId, resultado: resultadoInicial }: { scanId?: string; resultado?: ScanResultado }) {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ScanResultado | null>(resultadoInicial ?? null)
  const [urlEscaneada, setUrlEscaneada] = useState('')

  const handleScan = async () => {
    if (!url.trim()) return
    setLoading(true)
    setErro(null)
    setResultado(null)

    try {
      const res = await fetch('/api/cookies/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        setErro(json.error ?? 'Erro ao escanear o site')
      } else {
        setResultado(json.resultado)
        setUrlEscaneada(url.trim())
        router.refresh()
      }
    } catch {
      setErro('Não foi possível conectar ao servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulário de scan */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://seusite.com.br"
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                disabled={loading}
              />
            </div>
            <Button onClick={handleScan} disabled={loading || !url.trim()}>
              {loading ? (
                <><Zap className="h-4 w-4 mr-1 animate-pulse" /> Analisando...</>
              ) : (
                <><Search className="h-4 w-4 mr-1" /> Escanear</>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Analisa cookies, scripts de terceiros, banner de consentimento e política de privacidade.
          </p>
          {erro && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded p-3">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {erro}
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Globe className="h-10 w-10 text-blue-400 mx-auto animate-spin" />
            <p className="text-gray-600 font-medium">Escaneando o site...</p>
            <p className="text-sm text-gray-400">Analisando cookies, scripts e conformidade LGPD</p>
            <Progress value={undefined} className="h-1.5 mx-auto max-w-xs" />
          </CardContent>
        </Card>
      )}

      {resultado && (
        <div className="space-y-4">
          {/* Resumo */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreCircle score={resultado.score_conformidade} />
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Conformidade</p>
                    <Progress value={resultado.score_conformidade} className="h-2.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <BoolCheck ok={resultado.tem_politica_privacidade} labelOk="Política de Privacidade" labelNao="Sem Política de Privacidade" />
                    <BoolCheck ok={resultado.tem_banner_cookies} labelOk="Banner de cookies" labelNao="Sem banner de cookies" />
                  </div>
                  {urlEscaneada && (
                    <a href={urlEscaneada} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline">
                      <ExternalLink className="h-3 w-3" />{urlEscaneada}
                    </a>
                  )}
                  {resultado.url_politica_privacidade && (
                    <a href={resultado.url_politica_privacidade} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline ml-3">
                      <ExternalLink className="h-3 w-3" />Ver Política
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problemas */}
          {resultado.problemas.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <CollapsibleSection title="Problemas identificados" count={resultado.problemas.length}>
                  <div className="space-y-2">
                    {resultado.problemas.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${p.nivel === 'critico' || p.nivel === 'alto' ? 'text-red-500' : p.nivel === 'medio' ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-gray-900">{p.titulo}</p>
                            <Badge variant={nivelVariant[p.nivel]} className="text-xs">{nivelLabel[p.nivel]}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{p.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              </CardContent>
            </Card>
          )}

          {/* Recomendações */}
          {resultado.recomendacoes.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <CollapsibleSection title="Recomendações" count={resultado.recomendacoes.length}>
                  <div className="space-y-2">
                    {resultado.recomendacoes.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                        <Shield className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">{r.titulo}</p>
                          <p className="text-xs text-blue-700 mt-0.5">{r.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              </CardContent>
            </Card>
          )}

          {/* Tecnologias */}
          {resultado.tecnologias.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <CollapsibleSection title="Tecnologias e scripts detectados" count={resultado.tecnologias.length}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {resultado.tecnologias.map((t, i) => (
                      <div key={i} className="flex items-start justify-between gap-2 p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t.nome}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{t.descricao}</p>
                          <span className="text-xs text-gray-400">{catTechLabel[t.categoria]}</span>
                        </div>
                        <Badge variant={riscoVariant[t.risco]} className="text-xs shrink-0">
                          {t.risco}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              </CardContent>
            </Card>
          )}

          {/* Cookies */}
          {resultado.cookies.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <CollapsibleSection title="Cookies detectados nos headers" count={resultado.cookies.length}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 px-2 text-gray-500 font-medium">Nome</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-medium">Categoria</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-medium">Secure</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-medium">HttpOnly</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-medium">SameSite</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {resultado.cookies.map((c, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-2 px-2 font-mono text-gray-700">{c.nome}</td>
                            <td className="py-2 px-2">
                              <Badge variant={catCookieVariant[c.categoria]} className="text-xs">
                                {catCookieLabel[c.categoria]}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">
                              {c.secure ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                            </td>
                            <td className="py-2 px-2">
                              {c.httpOnly ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-gray-300" />}
                            </td>
                            <td className="py-2 px-2 text-gray-500">{c.sameSite ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleSection>
              </CardContent>
            </Card>
          )}

          {resultado.cookies.length === 0 && resultado.tecnologias.length === 0 && (
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Nenhum cookie de terceiros detectado nos headers</p>
                    <p className="text-xs text-gray-500 mt-0.5">Cookies client-side (JavaScript) não são visíveis sem um browser headless.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
