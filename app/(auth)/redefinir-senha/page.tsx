import { resetPasswordAfterRecovery } from '@/app/actions/auth-recovery'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

const ERRORS: Record<string, string> = {
  short: 'A nova senha deve ter pelo menos 6 caracteres.',
  mismatch: 'As senhas não coincidem.',
  '1': 'Não foi possível redefinir a senha. Peça um novo link de recuperação.',
}

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

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
            <CardTitle style={{ color: '#0f2d5e' }}>Definir nova senha</CardTitle>
            <CardDescription>Escolha uma nova senha para sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {ERRORS[error] ?? ERRORS['1']}
              </p>
            )}
            <form className="space-y-4" action={resetPasswordAfterRecovery}>
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar nova senha</Label>
                <Input id="confirm_password" name="confirm_password" type="password" required />
              </div>
              <Button
                type="submit"
                className="w-full text-white font-semibold"
                style={{ background: 'linear-gradient(90deg, #0f2d5e, #00bcd4)', border: 'none' }}
              >
                Salvar nova senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
