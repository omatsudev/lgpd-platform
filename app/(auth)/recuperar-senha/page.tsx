import { requestPasswordReset } from '@/app/actions/auth-recovery'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'

export default async function RecuperarSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const { ok, error } = await searchParams

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f2d5e 0%, #0a1f42 60%, #001133 100%)' }}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Image
            src="/logo-serra-privacy.png"
            alt="Serra Privacy"
            width={90}
            height={90}
            className="object-contain"
            priority
          />
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle style={{ color: '#0f2d5e' }}>Recuperar senha</CardTitle>
            <CardDescription>
              Informe seu e-mail e enviaremos um link para redefinir sua senha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ok && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                Se esse e-mail estiver cadastrado, você vai receber um link para redefinir a senha.
              </p>
            )}
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                Informe um e-mail válido.
              </p>
            )}
            <form className="space-y-4" action={requestPasswordReset}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
              </div>
              <Button
                type="submit"
                className="w-full text-white font-semibold"
                style={{ background: 'linear-gradient(90deg, #0f2d5e, #00bcd4)', border: 'none' }}
              >
                Enviar link de recuperação
              </Button>
            </form>

            <div className="text-center text-sm text-gray-500">
              Lembrou a senha?{' '}
              <Link
                href="/login"
                className="font-semibold hover:underline"
                style={{ color: '#0097a7' }}
              >
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
