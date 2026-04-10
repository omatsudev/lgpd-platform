import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #0a1f42 60%, #001133 100%)' }}>
      {/* Left — branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 text-white">
        <Image
          src="/logo.jpg"
          alt="Serra Privacy"
          width={280}
          height={100}
          className="object-contain rounded-xl mb-8"
          priority
        />
        <h2 className="text-2xl font-bold text-center mb-3">Plataforma de Adequação à LGPD</h2>
        <p className="text-blue-200 text-center max-w-sm text-sm leading-relaxed">
          Gerencie a conformidade da sua empresa com a Lei Geral de Proteção de Dados de forma simples e segura.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-xs">
          {['Inventário de Dados', 'Treinamentos', 'Canal de Denúncias', 'Logs Jurídicos'].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-blue-200">
              <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: '#00bcd4' }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex justify-center lg:hidden">
            <Image src="/logo.jpg" alt="Serra Privacy" width={180} height={65} className="object-contain rounded-xl" priority />
          </div>

          <Card className="shadow-2xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl" style={{ color: '#0f2d5e' }}>Entrar na plataforma</CardTitle>
              <CardDescription>Digite seu email e senha para acessar</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action="/api/auth/login" method="POST">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link href="/recuperar-senha" className="text-xs hover:underline" style={{ color: '#0097a7' }}>
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input id="password" name="password" type="password" placeholder="••••••••" required />
                </div>
                <Button
                  type="submit"
                  className="w-full text-white font-semibold"
                  style={{ background: 'linear-gradient(90deg, #0f2d5e, #00bcd4)', border: 'none' }}
                >
                  Entrar
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                Não tem conta?{' '}
                <Link href="/cadastro" className="font-semibold hover:underline" style={{ color: '#0097a7' }}>
                  Cadastre-se grátis
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
