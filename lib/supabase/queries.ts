import { createClient } from '@/lib/supabase/server'

export async function getUserEmpresa() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, empresa: null, empresaId: null, supabase }

  const { data } = await supabase
    .from('user_empresas')
    .select(`
      empresa_id,
      role,
      empresas (
        id, nome, cnpj, slug, setor,
        dpo_nome, dpo_email, dpo_telefone,
        percentual_adequacao, politica_privacidade_url,
        created_at, updated_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at')
    .limit(1)
    .single()

  return {
    user,
    empresa: (data?.empresas as any) ?? null,
    empresaId: data?.empresa_id ?? null,
    supabase,
  }
}
