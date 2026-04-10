import Link from 'next/link'
import { Shield, Building2, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
          <p className="text-sm text-gray-500">Comece sua adequação à LGPD hoje</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tipo de conta</CardTitle>
            <CardDescription>Escolha como você usará a plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo de usuário */}
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="tipo" value="empresa" className="sr-only peer" defaultChecked />
                <div className="border-2 border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 rounded-xl p-4 text-center space-y-2 transition-colors hover:border-blue-300">
                  <Building2 className="h-7 w-7 text-blue-600 mx-auto" />
                  <p className="font-semibold text-sm text-gray-900">Empresa</p>
                  <p className="text-xs text-gray-500">Quero adequar minha empresa</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="tipo" value="dpo" className="sr-only peer" />
                <div className="border-2 border-gray-200 peer-checked:border-purple-500 peer-checked:bg-purple-50 rounded-xl p-4 text-center space-y-2 transition-colors hover:border-purple-300">
                  <UserCheck className="h-7 w-7 text-purple-600 mx-auto" />
                  <p className="font-semibold text-sm text-gray-900">DPO / Advogado</p>
                  <p className="text-xs text-gray-500">Gerencio múltiplas empresas</p>
                </div>
              </label>
            </div>

            <form className="space-y-4" action="/api/auth/register" method="POST">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" name="name" placeholder="Seu nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa_nome">Nome da empresa</Label>
                  <Input id="empresa_nome" name="empresa_nome" placeholder="Razão social" required />
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

              <Button type="submit" className="w-full">Criar conta grátis</Button>
            </form>

            <p className="text-xs text-center text-gray-400">
              Ao criar sua conta, você concorda com nossos{' '}
              <Link href="/termos" className="text-blue-600 hover:underline">Termos de Uso</Link>
              {' '}e{' '}
              <Link href="/privacidade" className="text-blue-600 hover:underline">Política de Privacidade</Link>
            </p>

            <div className="text-center text-sm text-gray-500">
              Já tem conta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">Entrar</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
