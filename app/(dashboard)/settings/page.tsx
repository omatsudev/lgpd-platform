import { inviteCollaborator, revokeInvite } from '@/app/actions/collaborators'
import { updatePassword, updateProfile } from '@/app/actions/profile'
import { saveCompanyData, saveDpo, savePrivacyPolicy } from '@/app/actions/settings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getUserCompany } from '@/lib/supabase/queries'
import { ExternalLink, QrCode, Shield, UserPlus, X } from 'lucide-react'
import Link from 'next/link'

const PROFILE_ERRORS: Record<string, string> = {
  empty: 'Informe seu nome.',
  '1': 'Não foi possível atualizar o perfil. Tente novamente.',
}

const PASSWORD_ERRORS: Record<string, string> = {
  short: 'A nova senha deve ter pelo menos 6 caracteres.',
  mismatch: 'As senhas não coincidem.',
  '1': 'Não foi possível atualizar a senha. Tente novamente.',
}

const COMPANY_ERRORS: Record<string, string> = {
  duplicate_name: 'Você já tem uma empresa ativa com esse nome. Escolha um nome diferente.',
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    profile_ok?: string
    profile_error?: string
    password_ok?: string
    password_error?: string
    company_ok?: string
    company_error?: string
    invite_ok?: string
    invite_error?: string
  }>
}) {
  const { user, company, companyId, role, supabase } = await getUserCompany()
  const {
    profile_ok,
    profile_error,
    password_ok,
    password_error,
    company_ok,
    company_error,
    invite_ok,
    invite_error,
  } = await searchParams

  const isCollaborator = role === 'collaborator'
  const slug = company?.slug ?? ''
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://serraprivacy.com'}/lgpd/${slug}`

  const { data: pendingInvites } =
    !isCollaborator && companyId
      ? await supabase
          .from('company_invites')
          .select('id, email, token, created_at, expires_at, accepted_at')
          .eq('company_id', companyId)
          .is('accepted_at', null)
          .order('created_at', { ascending: false })
      : { data: [] }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://serraprivacy.com'

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Configure sua empresa e página pública LGPD</p>
      </div>

      {/* Meu Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Suas informações pessoais de acesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile_ok && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              Perfil atualizado com sucesso.
            </p>
          )}
          {profile_error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {PROFILE_ERRORS[profile_error] ?? PROFILE_ERRORS['1']}
            </p>
          )}
          <form action={updateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  name="name"
                  defaultValue={(user?.user_metadata?.name as string) ?? ''}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email ?? ''} disabled />
              </div>
            </div>
            <Button type="submit">Salvar Perfil</Button>
          </form>

          <div className="border-t border-gray-100 pt-6">
            {password_ok && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
                Senha atualizada com sucesso.
              </p>
            )}
            {password_error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
                {PASSWORD_ERRORS[password_error] ?? PASSWORD_ERRORS['1']}
              </p>
            )}
            <form action={updatePassword} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nova senha</Label>
                  <Input name="password" type="password" minLength={6} required />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar nova senha</Label>
                  <Input name="confirm_password" type="password" minLength={6} required />
                </div>
              </div>
              <Button type="submit">Alterar Senha</Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {!isCollaborator && (
        <>
          {/* Visualizadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Visualizadores
              </CardTitle>
              <CardDescription>
                Convide pessoas para acessar Dashboard e Relatório LGPD, sem editar dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {invite_ok && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                  Convite criado. Copie o link abaixo e envie para a pessoa.
                </p>
              )}
              {invite_error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  Não foi possível criar o convite. Verifique o e-mail e tente novamente.
                </p>
              )}
              <form action={inviteCollaborator} className="flex gap-2">
                <Input name="email" type="email" placeholder="email@empresa.com" required />
                <Button type="submit">Convidar Visualizador</Button>
              </form>

              {pendingInvites && pendingInvites.length > 0 && (
                <div className="space-y-2 pt-2">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{invite.email}</p>
                        <code className="text-xs text-blue-600 truncate block">
                          {appUrl}/invite/{invite.token}
                        </code>
                      </div>
                      <form action={revokeInvite}>
                        <input type="hidden" name="id" value={invite.id} />
                        <Button variant="ghost" size="icon" type="submit">
                          <X className="h-4 w-4 text-gray-400" />
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              {company_ok && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
                  Dados da empresa atualizados com sucesso.
                </p>
              )}
              {company_error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
                  {COMPANY_ERRORS[company_error] ?? 'Não foi possível salvar. Tente novamente.'}
                </p>
              )}
              <form action={saveCompanyData} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input
                      name="name"
                      defaultValue={company?.name ?? ''}
                      placeholder="Minha Empresa Ltda"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input
                      name="tax_id"
                      defaultValue={company?.tax_id ?? ''}
                      placeholder="12.345.678/0001-90"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Setor de Atuação</Label>
                    <Input
                      name="sector"
                      defaultValue={company?.sector ?? ''}
                      placeholder="Tecnologia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (URL pública)</Label>
                    <Input
                      name="slug"
                      defaultValue={company?.slug ?? ''}
                      placeholder="minha-empresa"
                      required
                    />
                  </div>
                </div>
                <Button type="submit">Salvar Dados</Button>
              </form>
            </CardContent>
          </Card>

          {/* DPO */}
          <Card>
            <CardHeader>
              <CardTitle>Encarregado de Dados (DPO)</CardTitle>
              <CardDescription>Informações do responsável pela proteção de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveDpo} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do DPO</Label>
                    <Input
                      name="dpo_name"
                      defaultValue={company?.dpo_name ?? ''}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email do DPO</Label>
                    <Input
                      name="dpo_email"
                      type="email"
                      defaultValue={company?.dpo_email ?? ''}
                      placeholder="dpo@empresa.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Telefone do DPO</Label>
                  <Input
                    name="dpo_phone"
                    defaultValue={company?.dpo_phone ?? ''}
                    placeholder="(11) 99999-0000"
                  />
                </div>
                <Button type="submit">Salvar DPO</Button>
              </form>
            </CardContent>
          </Card>

          {/* Política de Privacidade */}
          <Card>
            <CardHeader>
              <CardTitle>Política de Privacidade</CardTitle>
              <CardDescription>
                URL do documento que será exibido na sua página pública LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={savePrivacyPolicy} className="space-y-4">
                <div className="space-y-2">
                  <Label>URL do documento (PDF)</Label>
                  <Input
                    name="privacy_policy_url"
                    defaultValue={company?.privacy_policy_url ?? ''}
                    placeholder="https://..."
                  />
                </div>
                <Button type="submit">Salvar Política</Button>
              </form>
            </CardContent>
          </Card>

          {/* Página Pública */}
          {slug && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Página Pública LGPD
                </CardTitle>
                <CardDescription>
                  Compartilhe este link com seus clientes e funcionários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <code className="flex-1 text-sm text-blue-600 truncate">{publicUrl}</code>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`/lgpd/${slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-28 w-28 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                      <QrCode className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-1">QR Code</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Embed no seu site</p>
                    <p className="text-xs text-gray-500">
                      Cole este script no seu site para adicionar o botão de privacidade LGPD:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <code className="text-xs text-green-400">{`<script src="${publicUrl.replace('/lgpd/', '/widget/')}.js"></script>`}</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrações */}
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>
                Configure APIs externas para notificações via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>WhatsApp (Z-API)</Label>
                  <Badge variant="secondary">Em breve</Badge>
                </div>
                <Input placeholder="Instance ID" disabled />
                <Input placeholder="Token" type="password" disabled />
              </div>
            </CardContent>
          </Card>

          {/* Zona de Perigo */}
          {company && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Zona de Perigo</CardTitle>
                <CardDescription>Ações que exigem um administrador da empresa</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Desativar esta empresa</p>
                  <p className="text-sm text-gray-500">
                    Oculta {company.name} das empresas ativas. Os dados ficam salvos e podem ser
                    restaurados depois em{' '}
                    <Link href="/companies/inactive" className="underline">
                      Empresas Inativas
                    </Link>
                    .
                  </p>
                </div>
                <Link href="/settings/delete-company">
                  <Button variant="destructive">Desativar empresa</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
