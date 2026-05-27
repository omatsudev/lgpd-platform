-- Migration 030: renomeia colunas em português para inglês em data_inventory
-- Colunas afetadas: identificacao, transferencia_internacional, contratos,
--   evento_inicial, destinacao_final, bloqueio_possivel

alter table public.data_inventory
  rename column identificacao              to identification;

alter table public.data_inventory
  rename column transferencia_internacional to international_transfers;

alter table public.data_inventory
  rename column contratos                  to contracts;

alter table public.data_inventory
  rename column evento_inicial             to retention_start_event;

alter table public.data_inventory
  rename column destinacao_final           to final_disposition;

alter table public.data_inventory
  rename column bloqueio_possivel          to disposal_hold_possible;
