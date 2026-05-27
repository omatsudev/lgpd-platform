-- Rename Portuguese incident columns to English
alter table public.incidents
  rename column operadores_envolvidos to operators_involved;

alter table public.incidents
  rename column relatorio_impacto to impact_report;
