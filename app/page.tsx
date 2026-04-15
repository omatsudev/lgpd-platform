import Link from 'next/link'
import Image from 'next/image'
import { Database, GraduationCap, AlertTriangle, Users, CheckCircle, ArrowRight, Building2, Shield, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  { icon: Database, title: 'Inventário de Dados', description: 'Mapeie todos os dados pessoais tratados com base legal e finalidade.', color: '#0f2d5e', bg: '#e8eef7' },
  { icon: GraduationCap, title: 'Treinamentos', description: 'Treine colaboradores com vídeos e PDFs. Envio automático via WhatsApp.', color: '#0097a7', bg: '#e0f7fa' },
  { icon: AlertTriangle, title: 'Canal de Denúncias', description: 'Canal público para reporte de violações com anonimato garantido.', color: '#0f2d5e', bg: '#e8eef7' },
  { icon: Users, title: 'Direitos dos Titulares', description: 'Gerencie solicitações de acesso, exclusão e correção com controle de prazo.', color: '#0097a7', bg: '#e0f7fa' },
  { icon: Shield, title: 'Página Pública LGPD', description: 'Cada empresa recebe uma página com QR Code e formulários prontos.', color: '#0f2d5e', bg: '#e8eef7' },
  { icon: Building2, title: 'Multi-Empresa (DPO)', description: 'DPOs e advogados gerenciam múltiplas empresas em um único painel.', color: '#0097a7', bg: '#e0f7fa' },
]

const planos = [
  {
    nome: 'Starter', preco: 'R$ 149', periodo: '/mês',
    descricao: 'Ideal para pequenas empresas',
    features: ['1 empresa', '5 usuários', 'Inventário de dados', 'Canal de denúncias', 'Página pública LGPD'],
    cta: 'Começar grátis', destaque: false,
  },
  {
    nome: 'Business', preco: 'R$ 349', periodo: '/mês',
    descricao: 'Para empresas em crescimento',
    features: ['1 empresa', 'Usuários ilimitados', 'Todos os módulos', 'Treinamentos + WhatsApp', 'Logs jurídicos', 'Suporte prioritário'],
    cta: 'Escolher Business', destaque: true,
  },
  {
    nome: 'DPO Pro', preco: 'R$ 799', periodo: '/mês',
    descricao: 'Para DPOs e escritórios jurídicos',
    features: ['Até 10 empresas', 'Usuários ilimitados', 'Todos os módulos', 'Relatórios avançados', 'White-label', 'API de integração'],
    cta: 'Falar com consultor', destaque: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.jpg" alt="Serra Privacy" width={130} height={46} className="object-contain rounded-lg" priority />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-gray-900 transition-colors">Funcionalidades</Link>
            <Link href="#planos" className="hover:text-gray-900 transition-colors">Planos</Link>
            <Link href="/sobre" className="hover:text-gray-900 transition-colors">Sobre</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" style={{ color: '#0f2d5e' }}>Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm" className="text-white" style={{ background: 'linear-gradient(90deg, #0f2d5e, #00bcd4)', border: 'none' }}>
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #0a1f42 60%, #001133 100%)' }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-cyan-400 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border" style={{ background: 'rgba(0,188,212,0.15)', borderColor: 'rgba(0,188,212,0.4)', color: '#00bcd4' }}>
              <Lock className="h-3.5 w-3.5" />
              Plataforma certificada de adequação LGPD
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Sua empresa em conformidade com a{' '}
              <span style={{ color: '#00bcd4' }}>LGPD</span>{' '}
              de forma simples
            </h1>
            <p className="text-lg text-blue-200 max-w-xl">
              Plataforma SaaS completa para adequação à Lei Geral de Proteção de Dados. Para empresas e DPOs que gerenciam múltiplos clientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/cadastro">
                <Button size="lg" className="gap-2 text-white font-semibold px-8" style={{ background: 'linear-gradient(90deg, #00bcd4, #0097a7)', border: 'none' }}>
                  Começar grátis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Ver funcionalidades
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-300">Sem cartão de crédito • 14 dias grátis</p>
          </div>
          <div className="flex-shrink-0">
            <Image src="/logo.jpg" alt="Serra Privacy" width={320} height={115} className="object-contain rounded-2xl shadow-2xl" priority />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold" style={{ color: '#0f2d5e' }}>Uma nova forma inteligente e ágil para viabilizar a governança de dados.</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Nossa plataforma integra conformidade, tecnologia e inteligência em um único ambiente, permitindo que sua empresa tenha controle total, segurança e visão estratégica sobre os dados.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
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
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-bold" style={{ color: '#0f2d5e' }}>Planos e preços</h2>
            <p className="text-gray-500">Escolha o plano ideal para o tamanho da sua empresa</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {planos.map((plano) => (
              <Card key={plano.nome} className={`relative ${plano.destaque ? 'shadow-xl' : ''}`} style={plano.destaque ? { borderColor: '#00bcd4', borderWidth: 2 } : {}}>
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-white text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'linear-gradient(90deg, #0f2d5e, #00bcd4)' }}>Mais popular</span>
                  </div>
                )}
                <CardContent className="pt-8 pb-6 space-y-5">
                  <div>
                    <p className="font-bold text-lg" style={{ color: '#0f2d5e' }}>{plano.nome}</p>
                    <p className="text-sm text-gray-400">{plano.descricao}</p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold" style={{ color: '#0f2d5e' }}>{plano.preco}</span>
                      <span className="text-gray-400 text-sm">{plano.periodo}</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plano.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#00bcd4' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/cadastro">
                    <Button
                      className="w-full font-semibold"
                      style={plano.destaque
                        ? { background: 'linear-gradient(90deg, #0f2d5e, #00bcd4)', color: 'white', border: 'none' }
                        : { borderColor: '#0f2d5e', color: '#0f2d5e' }
                      }
                      variant={plano.destaque ? 'default' : 'outline'}
                    >
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
      <footer className="border-t border-gray-100 py-8" style={{ background: '#0f2d5e' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Image src="/logo.jpg" alt="Serra Privacy" width={110} height={40} className="object-contain rounded-lg" />
          <p className="text-sm text-blue-200">© 2026 Serra Privacy. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm text-blue-300">
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/contato" className="hover:text-white transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
