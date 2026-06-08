# Ambientes: Sandbox (staging) e Produção

Este projeto usa dois ambientes totalmente isolados, sem custo adicional, combinando
Vercel Preview Deployments + dois projetos Supabase gratuitos.

## Visão geral

| | Produção | Sandbox / Staging |
|---|---|---|
| Branch | `main` | `staging` |
| Deploy | Vercel Production (domínio principal) | Vercel Preview Deployment (URL `*-git-staging-*.vercel.app`) |
| Banco de dados | Projeto Supabase de produção | Projeto Supabase de staging (free tier separado) |
| Variáveis de ambiente na Vercel | escopo **Production** | escopo **Preview** |

## Passo a passo (configuração única, feita pelo painel)

### 1. Criar o segundo projeto Supabase
No [dashboard do Supabase](https://supabase.com/dashboard), crie um novo projeto
(ex: `lgpd-platform-staging`) na mesma organização — o plano gratuito permite
múltiplos projetos ativos. Rode todas as migrations de `supabase/migrations/`
nesse novo projeto (mesma ordem, mesmo schema).

### 2. Configurar variáveis de ambiente na Vercel por escopo
No painel do projeto na Vercel → **Settings → Environment Variables**, cadastre
as mesmas chaves duas vezes, cada uma com um escopo diferente:

- **Production**: aponta para o projeto Supabase real
  - `NEXT_PUBLIC_SUPABASE_URL` = URL do projeto de produção
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key de produção
  - `NEXT_PUBLIC_APP_URL` = domínio de produção

- **Preview**: aponta para o projeto Supabase de staging
  - `NEXT_PUBLIC_SUPABASE_URL` = URL do projeto de staging
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key de staging
  - `NEXT_PUBLIC_APP_URL` = deixe em branco ou aponte para a URL de preview

A Vercel aplica automaticamente o conjunto certo de variáveis dependendo se o
deploy é de produção (`main`) ou preview (qualquer outra branch/PR).

## Fluxo do dia a dia

```
git checkout staging
# ... altere, teste localmente com .env.local apontando pro Supabase de staging ...
git push origin staging
```

Cada push em `staging` gera automaticamente uma URL de preview isolada na
Vercel, usando o banco de staging — sem afetar produção. Quando estiver
validado, abra PR de `staging` para `main`; o merge dispara o deploy de
produção (banco real).

## Ambiente local

Use `.env.local` (nunca commitado — está no `.gitignore`) apontando para o
projeto Supabase de staging durante o desenvolvimento, evitando tocar em
dados reais. Veja `.env.local.example` como referência de variáveis.
