import Link from 'next/link'
import Image from 'next/image'
import { Database, GraduationCap, AlertTriangle, Users, CheckCircle, ArrowRight, Building2, Shield, Lock, Megaphone, Scale, DollarSign, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedBadges } from '@/components/home/animated-badges'

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

const navLinks = [
  { label: 'Inicio', href: '#' },
  { label: 'Produtos', href: '#features' },
  { label: 'Soluções', href: '#features' },
  { label: 'Sobre nós', href: '#sobre' },
  { label: 'Case de sucesso', href: '#cases' },
  { label: 'Contato', href: '#contato' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.jpg" alt="Serra Privacy" width={130} height={46} className="object-contain" priority />
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
            {navLinks.map(l => (
              <Link key={l.label} href={l.href} className="hover:text-gray-900 transition-colors whitespace-nowrap">
                {l.label}
              </Link>
            ))}
            <Link href="/login" className="hover:text-gray-900 transition-colors">Login</Link>
          </div>

          <Link href="/cadastro" className="flex-shrink-0">
            <Button size="sm" className="rounded-full px-5 font-semibold text-white" style={{ background: '#111827', border: 'none' }}>
              Demonstração
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #0a1f42 60%, #001133 100%)' }}>
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 h-80 w-80 rounded-full opacity-10 blur-3xl" style={{ background: '#00bcd4' }} />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full opacity-10 blur-3xl" style={{ background: '#0097a7' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
          {/* Left */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Sua Plataforma Inteligente<br />de Governança de Dados
            </h1>

            <AnimatedBadges />

            <p className="text-base text-blue-200 max-w-md leading-relaxed">
              Gerencie, proteja e transforme seus dados em vantagem competitiva – tudo em uma única plataforma.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Link href="/cadastro">
                <Button size="lg" className="gap-2 font-semibold text-white px-8" style={{ background: 'linear-gradient(90deg, #00bcd4, #0097a7)', border: 'none' }}>
                  Começar grátis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-white hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.6)', background: 'transparent', color: 'white' }}>
                  Ver funcionalidades
                </Button>
              </Link>
            </div>

            <p className="text-xs text-blue-400">Sem cartão de crédito • 14 dias grátis</p>
          </div>

          {/* Right — shield illustration */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full opacity-20 blur-2xl" style={{ background: 'radial-gradient(circle, #00bcd4, transparent 70%)' }} />
              {/* Shield emoji as large illustration */}
              <div className="relative flex flex-col items-center justify-center rounded-full"
                style={{ width: 220, height: 220, background: 'radial-gradient(circle at 40% 35%, #1e4fa8, #0a1f42)' }}>
                <span style={{ fontSize: 110, lineHeight: 1, filter: 'drop-shadow(0 8px 24px rgba(0,188,212,0.4))' }}>🛡️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Riscos */}
      <section id="riscos" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-start justify-between mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Riscos que sua empresa está correndo:
            </h2>
            <span className="text-5xl ml-4 flex-shrink-0">⚠️</span>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Megaphone,
                title: 'Danos à Reputação e Marca:',
                text: 'Vazamento de dados pode destruir a confiança do cliente, resultando em perda de mercado e valor da marca.',
              },
              {
                icon: Scale,
                title: 'Ações Judiciais:',
                text: 'Clientes podem mover ações individuais ou coletivas por danos materiais ou morais decorrentes de uso indevido de seus dados.',
              },
              {
                icon: AlertTriangle,
                title: 'Operações Interrompidas:',
                text: 'A paralisação da base de dados pode travar o funcionamento da empresa.',
              },
              {
                icon: DollarSign,
                title: 'Sanções Administrativas (ANPD):',
                text: 'Além de multas pecuniárias de 2% do faturamento (até R$ 50 milhões por infração), a ANPD pode emitir advertências, bloqueio de dados ou interrupção do tratamento de dados.',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 rounded-xl px-6 py-5" style={{ background: '#b2ebf2' }}>
                {/* Arrow */}
                <ChevronRight className="h-8 w-8 flex-shrink-0" style={{ color: '#00838f' }} strokeWidth={3} />
                {/* Text */}
                <p className="flex-1 text-sm text-gray-800 leading-relaxed">
                  <span className="font-bold">{item.title}</span>{' '}{item.text}
                </p>
                {/* Icon */}
                <item.icon className="h-7 w-7 flex-shrink-0" style={{ color: '#00838f' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
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
        <div className="max-w-7xl mx-auto px-6">
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
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
