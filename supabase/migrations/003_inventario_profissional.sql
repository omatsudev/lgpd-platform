-- Expansão da tabela inventario_dados para suportar o wizard profissional

alter table public.inventario_dados
  add column if not exists nome_processo text,
  add column if not exists setor_responsavel text,
  add column if not exists descricao_processo text,
  add column if not exists fases_ciclo_vida jsonb default '{}',
  add column if not exists categorias_dados jsonb default '[]',
  add column if not exists descricao_dados text,
  add column if not exists frequencia_tratamento text,
  add column if not exists dados_compartilhados boolean default false,
  add column if not exists com_quem_compartilhado text,
  add column if not exists forma_coleta_consentimento text,
  add column if not exists fonte_dados text,
  add column if not exists categoria_titular text,
  add column if not exists local_tipo text,
  add column if not exists necessita_ripd text default 'automatico',
  add column if not exists nivel_risco text default 'baixo',
  add column if not exists status_registro text default 'rascunho';

-- Trigger para atualizar updated_at já existe (set_inventario_updated_at)
-- Nenhuma migração adicional necessária
