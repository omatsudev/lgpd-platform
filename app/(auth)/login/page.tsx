import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">LGPD Platform</h1>
          <p className="text-sm text-gray-500">Adequação à LGPD simplificada</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Entrar na plataforma</CardTitle>
            <CardDescription>Digite seu email e senha para acessar</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" action="/api/auth/login" method="POST">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="/recuperar-senha" className="text-xs text-blue-600 hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Entrar</Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Não tem conta?{' '}
              <Link href="/cadastro" className="text-blue-600 hover:underline font-medium">
                Cadastre-se grátis
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
