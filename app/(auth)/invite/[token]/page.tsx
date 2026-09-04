import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

const REGISTER_ERRORS: Record<string, string> = {
  invalid: 'Convite inválido ou expirado. Peça um novo link ao administrador.',
  '1': 'Não foi possível criar sua conta. Tente novamente.',
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { token } = await params
  const { error } = await searchParams

  const supabase = await createClient()
  const { data } = (await supabase
    .rpc('get_invite_preview', { p_token: token })
    .maybeSingle()) as {
    data: { company_name: string; email: string; role: string; valid: boolean } | null
  }

  const invalid = !data || !data.valid

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
            <CardTitle style={{ color: '#0f2d5e' }}>Convite de acesso</CardTitle>
            <CardDescription>
              {invalid
                ? 'Este convite não é mais válido.'
                : `Você foi convidado para acessar ${data?.company_name} como visualizador (somente leitura de Dashboard e Relatório LGPD).`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error || invalid) && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {REGISTER_ERRORS[error ?? 'invalid'] ?? REGISTER_ERRORS['1']}
              </p>
            )}

            {!invalid && (
              <form className="space-y-4" action="/api/auth/accept-invite" method="POST">
                <input type="hidden" name="token" value={token} />
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" name="name" placeholder="Seu nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={data?.email ?? ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full text-white font-semibold"
                  style={{ background: 'linear-gradient(90deg, #0f2d5e, #00bcd4)', border: 'none' }}
                >
                  Criar acesso
                </Button>
              </form>
            )}

            <div className="text-center text-sm text-gray-500">
              Já tem conta?{' '}
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
