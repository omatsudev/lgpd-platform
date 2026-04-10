import Link from 'next/link'
import { Shield, Database, GraduationCap, AlertTriangle, Users, CheckCircle, ArrowRight, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Database,
    title: 'Inventário de Dados',
    description: 'Mapeie todos os dados pessoais tratados pela sua empresa com base legal e finalidade.',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    icon: GraduationCap,
    title: 'Treinamentos',
    description: 'Treine colaboradores com vídeos, PDFs e questionários. Envio automático via WhatsApp.',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    icon: AlertTriangle,
    title: 'Canal de Denúncias',
    description: 'Canal público para reporte de violações, com gestão interna e anonimato garantido.',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  {
    icon: Users,
    title: 'Direitos dos Titulares',
    description: 'Gerencie solicitações de acesso, exclusão e correção com controle de prazo legal.',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    icon: Shield,
    title: 'Página Pública LGPD',
    description: 'Cada empresa recebe uma página pública com QR Code, política de privacidade e formulários.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    icon: Building2,
    title: 'Multi-Empresa (DPO)',
    description: 'DPOs e advogados gerenciam múltiplas empresas em um único painel centralizado.',
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
]

const planos = [
  {
    nome: 'Starter',
    preco: 'R$ 149',
    periodo: '/mês',
    descricao: 'Ideal para pequenas empresas',
    features: ['1 empresa', '5 usuários', 'Inventário de dados', 'Canal de denúncias', 'Página pública LGPD'],
    cta: 'Começar grátis',
    destaque: false,
  },
  {
    nome: 'Business',
    preco: 'R$ 349',
    periodo: '/mês',
    descricao: 'Para empresas em crescimento',
    features: ['1 empresa', 'Usuários ilimitados', 'Todos os módulos', 'Treinamentos + WhatsApp', 'Logs jurídicos', 'Suporte prioritário'],
    cta: 'Escolher Business',
    destaque: true,
  },
  {
    nome: 'DPO Pro',
    preco: 'R$ 799',
    periodo: '/mês',
    descricao: 'Para DPOs e escritórios jurídicos',
    features: ['Até 10 empresas', 'Usuários ilimitados', 'Todos os módulos', 'Relatórios avançados', 'White-label', 'API de integração'],
    cta: 'Falar com consultor',
    destaque: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 z-50 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">LGPD Platform</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-gray-900">Funcionalidades</Link>
            <Link href="#planos" className="hover:text-gray-900">Planos</Link>
            <Link href="/sobre" className="hover:text-gray-900">Sobre</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 border border-blue-200">
          <CheckCircle className="h-3.5 w-3.5" />
          Plataforma certificada de adequação LGPD
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          Sua empresa em conformidade com a{' '}
          <span className="text-blue-600">LGPD</span>{' '}
          de forma simples
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Plataforma SaaS completa para adequação à Lei Geral de Proteção de Dados. Para empresas e DPOs que gerenciam múltiplos clientes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/cadastro">
            <Button size="lg" className="gap-2">
              Começar grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg">Ver funcionalidades</Button>
          </Link>
        </div>
        <p className="text-sm text-gray-400">Sem cartão de crédito • 14 dias grátis</p>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">Tudo que você precisa para se adequar</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Módulos completos que cobrem todos os requisitos da LGPD, desde o mapeamento de dados até a gestão de titulares.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 space-y-3">
                  <div className={`h-11 w-11 rounded-xl ${f.bg} flex items-center justify-center`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">Planos e preços</h2>
            <p className="text-gray-500">Escolha o plano ideal para o tamanho da sua empresa</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {planos.map((plano) => (
              <Card key={plano.nome} className={`relative ${plano.destaque ? 'border-blue-500 shadow-lg' : ''}`}>
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Mais popular</span>
                  </div>
                )}
                <CardContent className="pt-8 pb-6 space-y-5">
                  <div>
                    <p className="font-bold text-lg text-gray-900">{plano.nome}</p>
                    <p className="text-sm text-gray-400">{plano.descricao}</p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">{plano.preco}</span>
                      <span className="text-gray-400 text-sm">{plano.periodo}</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plano.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/cadastro">
                    <Button className="w-full" variant={plano.destaque ? 'default' : 'outline'}>
                      {plano.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2024 LGPD Platform. Todos os direitos reservados.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/privacidade" className="hover:text-gray-600">Privacidade</Link>
          <Link href="/termos" className="hover:text-gray-600">Termos</Link>
          <Link href="/contato" className="hover:text-gray-600">Contato</Link>
        </div>
      </footer>
    </div>
  )
}
