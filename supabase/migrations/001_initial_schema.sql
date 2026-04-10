-- LGPD Platform — Schema Inicial
-- Executar no Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TABELA: empresas
-- =============================================
create table public.empresas (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  cnpj text,
  slug text unique not null,
  setor text,
  owner_id uuid references auth.users(id) on delete set null,
  dpo_id uuid references auth.users(id) on delete set null,
  dpo_nome text,
  dpo_email text,
  dpo_telefone text,
  percentual_adequacao integer default 0,
  politica_privacidade_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABELA: user_empresas (multi-tenant: DPO gerencia várias empresas)
-- =============================================
create table public.user_empresas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  role text not null check (role in ('admin', 'dpo', 'empresa', 'colaborador')),
  created_at timestamptz default now() not null,
  unique(user_id, empresa_id)
);

-- =============================================
-- TABELA: inventario_dados
-- =============================================
create table public.inventario_dados (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  tipo_dado text not null,
  finalidade text not null,
  base_legal text not null,
  local_armazenamento text not null,
  prazo_retencao text,
  responsavel text,
  medidas_seguranca text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABELA: treinamentos
-- =============================================
create table public.treinamentos (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  titulo text not null,
  descricao text,
  video_url text,
  pdf_url text,
  perguntas jsonb, -- array de perguntas com alternativas
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABELA: treinamento_colaboradores
-- =============================================
create table public.treinamento_colaboradores (
  id uuid default uuid_generate_v4() primary key,
  treinamento_id uuid references public.treinamentos(id) on delete cascade not null,
  colaborador_id uuid references auth.users(id) on delete cascade,
  colaborador_nome text not null,
  colaborador_email text,
  colaborador_whatsapp text,
  link_acesso text unique not null,
  status text default 'nao_iniciado' check (status in ('nao_iniciado', 'em_andamento', 'concluido')),
  progresso integer default 0,
  certificado_url text,
  concluido_em timestamptz,
  created_at timestamptz default now() not null
);

-- =============================================
-- TABELA: denuncias
-- =============================================
create table public.denuncias (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  anonimo boolean default true not null,
  nome text,
  email text,
  tipo text not null,
  descricao text not null,
  status text default 'recebido' check (status in ('recebido', 'em_analise', 'resolvido')) not null,
  resposta text,
  respondido_por uuid references auth.users(id),
  ip_origem text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABELA: solicitacoes_titulares
-- =============================================
create table public.solicitacoes_titulares (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  tipo text not null check (tipo in ('acesso', 'exclusao', 'correcao', 'portabilidade', 'oposicao')),
  nome text not null,
  email text not null,
  cpf text,
  descricao text not null,
  status text default 'pendente' check (status in ('pendente', 'em_analise', 'concluido', 'recusado')) not null,
  resposta text,
  respondido_por uuid references auth.users(id),
  prazo_resposta date not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABELA: logs_auditoria
-- =============================================
create table public.logs_auditoria (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  acao text not null,
  recurso text not null,
  detalhes text,
  ip text,
  created_at timestamptz default now() not null
);

-- Logs são imutáveis (sem update/delete permitido via RLS)

-- =============================================
-- TABELA: notificacoes
-- =============================================
create table public.notificacoes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  mensagem text not null,
  tipo text default 'info' check (tipo in ('info', 'alerta', 'erro', 'sucesso')),
  lida boolean default false,
  created_at timestamptz default now() not null
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table public.empresas enable row level security;
alter table public.user_empresas enable row level security;
alter table public.inventario_dados enable row level security;
alter table public.treinamentos enable row level security;
alter table public.treinamento_colaboradores enable row level security;
alter table public.denuncias enable row level security;
alter table public.solicitacoes_titulares enable row level security;
alter table public.logs_auditoria enable row level security;
alter table public.notificacoes enable row level security;

-- Políticas básicas: usuário acessa apenas empresas onde tem vínculo
create policy "user_can_see_own_empresas" on public.empresas
  for select using (
    id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );

create policy "user_can_manage_inventario" on public.inventario_dados
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

create policy "user_can_manage_denuncias" on public.denuncias
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

create policy "user_can_manage_titulares" on public.solicitacoes_titulares
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

-- Logs: apenas leitura para membros da empresa
create policy "user_can_read_logs" on public.logs_auditoria
  for select using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

-- Notificações: apenas o próprio usuário
create policy "user_can_see_own_notifications" on public.notificacoes
  for all using (user_id = auth.uid());

-- =============================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- =============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_empresas_updated_at before update on public.empresas
  for each row execute function public.set_updated_at();

create trigger set_inventario_updated_at before update on public.inventario_dados
  for each row execute function public.set_updated_at();

create trigger set_denuncias_updated_at before update on public.denuncias
  for each row execute function public.set_updated_at();

create trigger set_titulares_updated_at before update on public.solicitacoes_titulares
  for each row execute function public.set_updated_at();
