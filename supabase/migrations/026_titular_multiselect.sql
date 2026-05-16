-- Suporte a múltiplas fontes e categorias de titulares no inventário
-- Mantém colunas legado (data_source / data_subject_category) para compatibilidade

alter table public.data_inventory
  add column if not exists data_sources            jsonb default '[]',
  add column if not exists data_subject_categories jsonb default '[]';
