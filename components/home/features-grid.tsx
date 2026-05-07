'use client'

import { useState } from 'react'
import {
  BarChart2, GraduationCap, UserCheck, FolderOpen, AlertOctagon,
  ClipboardCheck, Globe, Search, Megaphone, ClipboardList, TriangleAlert, ScrollText,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const VISIBLE = [
  { icon: BarChart2,       title: 'Data Mapping Pro',                      description: 'Mapeie, organize e visualize os dados da sua empresa com total controle.',                           color: '#0f2d5e', bg: '#e8eef7' },
  { icon: GraduationCap,  title: 'Academy LGPD',                           description: 'Capacite sua equipe de forma prática, automatizada e em conformidade com a lei.',                    color: '#0097a7', bg: '#e0f7fa' },
  { icon: UserCheck,      title: 'Direitos dos Titulares',                 description: 'Gerencie solicitações de titulares com agilidade e segurança jurídica.',                            color: '#0f2d5e', bg: '#e8eef7' },
  { icon: FolderOpen,     title: 'Governança de Documentos',               description: 'Centralize e organize documentos essenciais da sua estrutura de compliance.',                       color: '#0097a7', bg: '#e0f7fa' },
  { icon: AlertOctagon,   title: 'Gestão de Incidentes',                   description: 'Registre, acompanhe e responda incidentes com rapidez e controle.',                                color: '#0f2d5e', bg: '#e8eef7' },
  { icon: ClipboardCheck, title: 'ConsentFlow',                            description: 'Gerencie consentimentos de forma simples, rastreável e automatizada.',                             color: '#0097a7', bg: '#e0f7fa' },
  { icon: Globe,          title: 'Gestão de Cookies & Adequação de Sites', description: 'Garanta que seu site esteja conforme a LGPD com gestão eficiente de cookies.',                     color: '#0f2d5e', bg: '#e8eef7' },
  { icon: Search,         title: 'Due Diligence',                          description: 'Avalie riscos e parceiros com mais segurança e padronização.',                                      color: '#0097a7', bg: '#e0f7fa' },
  { icon: Megaphone,      title: 'Canal de Denúncias',                     description: 'Receba relatos com sigilo e fortaleça a integridade da sua organização.',                          color: '#0f2d5e', bg: '#e8eef7' },
]

const HIDDEN = [
  { icon: ClipboardList,  title: 'Checklist LGPD',    description: 'Acompanhe o progresso de adequação com checklist interativo e indicadores por módulo.',       color: '#0097a7', bg: '#e0f7fa' },
  { icon: TriangleAlert,  title: 'Gestão de Riscos',  description: 'Identifique, avalie e mitigue riscos à proteção de dados com matriz visual de probabilidade.',  color: '#0f2d5e', bg: '#e8eef7' },
  { icon: BarChart2,      title: 'Relatório LGPD',    description: 'Gere relatórios completos de conformidade para apresentar a auditorias, clientes e ANPD.',     color: '#0097a7', bg: '#e0f7fa' },
  { icon: ScrollText,     title: 'Logs de Auditoria', description: 'Trilha de auditoria completa de todas as ações realizadas na plataforma para conformidade.',    color: '#0f2d5e', bg: '#e8eef7' },
]

export function FeaturesGrid() {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? [...VISIBLE, ...HIDDEN] : VISIBLE

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map((f) => (
          <Card key={f.title} className="hover:shadow-lg transition-shadow border-gray-100">
            <CardContent className="pt-6 space-y-3">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: f.bg }}>
                <f.icon className="h-6 w-6" style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setExpanded(e => !e)}
          className="gap-2 font-medium"
          style={{ borderColor: '#0097a7', color: '#0097a7' }}
        >
          {expanded ? (
            <><ChevronUp className="h-4 w-4" /> Ver menos</>
          ) : (
            <><ChevronDown className="h-4 w-4" /> Ver mais {HIDDEN.length} funcionalidades</>
          )}
        </Button>
      </div>
    </div>
  )
}
