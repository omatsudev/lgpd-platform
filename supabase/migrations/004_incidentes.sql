-- Módulo de Gestão de Incidentes de Segurança (LGPD Art. 48)

create table public.incidentes (
  id uuid default uuid_generate_v4() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade not null,

  -- Identificação
  titulo text not null,
  tipo text not null check (tipo in (
    'vazamento_dados', 'acesso_nao_autorizado', 'perda_dados',
    'alteracao_indevida', 'uso_indevido', 'ransomware', 'phishing', 'outro'
  )),
  severidade text not null default 'media' check (severidade in ('baixa', 'media', 'alta', 'critica')),
  status text not null default 'identificado' check (status in (
    'identificado', 'em_investigacao', 'contido', 'resolvido', 'encerrado'
  )),

  -- Datas
  data_ocorrencia date,
  data_descoberta date not null,

  -- Detalhamento
  descricao text not null,
  dados_afetados text,
  categorias_dados_afetados jsonb default '[]',
  numero_titulares_afetados text,
  causa_raiz text,

  -- Resposta
  medidas_imediatas text,
  medidas_corretivas text,
  responsavel text,

  -- Notificações regulatórias (Art. 48 LGPD)
  notificou_anpd boolean default false,
  data_notificacao_anpd date,
  protocolo_anpd text,
  notificou_titulares boolean default false,
  data_notificacao_titulares date,

  -- Metadados
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.incidentes enable row level security;

create policy "user_can_manage_incidentes" on public.incidentes
  for all using (
    empresa_id in (
      select empresa_id from public.user_empresas
      where user_id = auth.uid()
    )
  );

-- Updated_at trigger
create trigger set_incidentes_updated_at before update on public.incidentes
  for each row execute function public.set_updated_at();
