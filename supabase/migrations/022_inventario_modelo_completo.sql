-- Expande data_inventory para cobrir o modelo completo de inventário LGPD:
-- Identificação (controlador, DPO, representante legal), detalhe por categoria,
-- compartilhamento estruturado, medidas de segurança estruturadas,
-- transferência internacional e contratos.

alter table public.data_inventory
  add column if not exists identificacao             jsonb default '{}',
  add column if not exists data_categories_detail   jsonb default '[]',
  add column if not exists shared_details           jsonb default '[]',
  add column if not exists security_measures_detail jsonb default '[]',
  add column if not exists transferencia_internacional jsonb default '[]',
  add column if not exists contratos                jsonb default '[]';
