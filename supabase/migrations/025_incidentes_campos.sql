-- Adiciona campos faltantes na tabela de incidentes
-- conforme modelo de inventário LGPD: operadores envolvidos e relatório de impacto

alter table public.incidents
  add column if not exists operadores_envolvidos text,
  add column if not exists relatorio_impacto     text;
