import Link from 'next/link'
import Image from 'next/image'
import { Building2, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #0a1f42 60%, #001133 100%)' }}>
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center">
          <Image src="/logo.jpg" alt="Serra Privacy" width={180} height={65} className="object-contain rounded-xl" priority />
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle style={{ color: '#0f2d5e' }}>Criar conta</CardTitle>
            <CardDescription>Comece sua adequação à LGPD hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" action="/api/auth/register" method="POST">
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="empresa" className="sr-only peer" defaultChecked />
                  <div className="border-2 border-gray-200 peer-checked:border-blue-800 peer-checked:bg-blue-50 rounded-xl p-4 text-center space-y-2 transition-colors hover:border-blue-300">
                    <Building2 className="h-7 w-7 mx-auto" style={{ color: '#0f2d5e' }} />
                    <p className="font-semibold text-sm text-gray-900">Empresa</p>
                    <p className="text-xs text-gray-500">Quero adequar minha empresa</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="dpo" className="sr-only peer" />
                  <div className="border-2 border-gray-200 peer-checked:border-cyan-500 peer-checked:bg-cyan-50 rounded-xl p-4 text-center space-y-2 transition-colors hover:border-cyan-300">
                    <UserCheck className="h-7 w-7 mx-auto" style={{ color: '#0097a7' }} />
                    <p className="font-semibold text-sm text-gray-900">DPO / Advogado</p>
                    <p className="text-xs text-gray-500">Gerencio múltiplas empresas</p>
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" name="name" placeholder="Seu nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa_nome">Nome da empresa</Label>
                  <Input id="empresa_nome" name="empresa_nome" placeholder="Razão social" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" required />
              </div>
              <Button
                type="submit"
                className="w-full text-white font-semibold"
                style={{ background: 'linear-gradient(90deg, #0f2d5e, #00bcd4)', border: 'none' }}
              >
                Criar conta grátis
              </Button>
            </form>

            <p className="text-xs text-center text-gray-400">
              Ao criar sua conta, você concorda com nossos{' '}
              <Link href="/termos" className="hover:underline" style={{ color: '#0097a7' }}>Termos de Uso</Link>
              {' '}e{' '}
              <Link href="/privacidade" className="hover:underline" style={{ color: '#0097a7' }}>Política de Privacidade</Link>
            </p>
            <div className="text-center text-sm text-gray-500">
              Já tem conta?{' '}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: '#0097a7' }}>Entrar</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
