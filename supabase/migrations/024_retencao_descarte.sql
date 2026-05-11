-- Módulo Retenção, Guarda e Descarte de Dados
-- Conforme politica_retencao_dados.pdf

create table if not exists public.retencao_descarte (
  id                    uuid default gen_random_uuid() primary key,
  company_id            uuid references public.companies(id) on delete cascade not null,

  -- Identificação do item
  tipo_dado             text not null,
  categoria             text not null,

  -- Política de retenção
  prazo_retencao        text not null,
  evento_inicial        text not null,
  data_evento           date,
  data_vencimento       date,
  fundamento_juridico   text not null,

  -- Prescrição / decadência
  prazo_prescricional   text,
  prazo_decadencial     text,

  -- Destinação e bloqueio
  possibilidade_bloqueio boolean default false,
  destinacao_final      text,
  bloqueio_ativo        boolean default false,
  motivo_bloqueio       text,

  -- Notas e histórico
  notas                 text,
  historico_acoes       jsonb default '[]',

  -- Status calculado (regular | proximo_vencimento | vencido | bloqueado)
  status_calculado      text generated always as (
    case
      when bloqueio_ativo then 'bloqueado'
      when data_vencimento is null then 'regular'
      when data_vencimento < current_date then 'vencido'
      when data_vencimento < current_date + interval '60 days' then 'proximo_vencimento'
      else 'regular'
    end
  ) stored,

  created_by            uuid references auth.users(id),
  created_at            timestamptz default now() not null,
  updated_at            timestamptz default now() not null
);

-- Trigger updated_at
create trigger set_retencao_descarte_updated_at
  before update on public.retencao_descarte
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.retencao_descarte enable row level security;

create policy "user_can_manage_retencao_descarte" on public.retencao_descarte
  for all using (
    company_id in (
      select company_id from public.user_companies
      where user_id = auth.uid()
    )
  );
