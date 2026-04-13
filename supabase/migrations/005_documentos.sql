-- Módulo de Gestão de Documentos LGPD

create table public.documentos (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,

  -- Identificação
  titulo text not null,
  tipo text not null check (tipo in (
    'politica_privacidade', 'aviso_privacidade', 'politica_seguranca',
    'termo_consentimento', 'contrato_dpa', 'ripd', 'procedimento_interno',
    'relatorio_auditoria', 'outro'
  )),
  descricao text,
  versao text not null default '1.0',

  -- Conteúdo
  conteudo text,
  arquivo_url text,
  arquivo_nome text,

  -- Controle
  status text not null default 'rascunho' check (status in ('rascunho', 'em_revisao', 'aprovado', 'publicado', 'obsoleto')),
  responsavel text,
  data_aprovacao date,
  data_revisao date,
  data_expiracao date,

  -- Metadados
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.documentos enable row level security;

create policy "user_can_manage_documentos" on public.documentos
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

-- Updated_at trigger
create trigger set_documentos_updated_at before update on public.documentos
  for each row execute function public.set_updated_at();
