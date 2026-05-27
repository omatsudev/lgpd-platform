-- Migration 033: renomeia chaves de lifecycle_phases no JSONB de data_inventory
-- Chaves: coleta→collection, uso→use, armazenamento→storage,
--         compartilhamento→sharing, retencao→retention, descarte→disposal

update public.data_inventory
set lifecycle_phases = (
  -- Renomeia todas as 6 chaves de uma vez
  (lifecycle_phases - 'coleta'           || jsonb_build_object('collection', coalesce(lifecycle_phases->'coleta',           '{"active":false,"controller":false,"processor":false}'::jsonb)))
                     - 'uso'             || jsonb_build_object('use',        coalesce(lifecycle_phases->'uso',              '{"active":false,"controller":false,"processor":false}'::jsonb))
                     - 'armazenamento'   || jsonb_build_object('storage',    coalesce(lifecycle_phases->'armazenamento',    '{"active":false,"controller":false,"processor":false}'::jsonb))
                     - 'compartilhamento'|| jsonb_build_object('sharing',    coalesce(lifecycle_phases->'compartilhamento', '{"active":false,"controller":false,"processor":false}'::jsonb))
                     - 'retencao'        || jsonb_build_object('retention',  coalesce(lifecycle_phases->'retencao',         '{"active":false,"controller":false,"processor":false}'::jsonb))
                     - 'descarte'        || jsonb_build_object('disposal',   coalesce(lifecycle_phases->'descarte',         '{"active":false,"controller":false,"processor":false}'::jsonb))
)
where lifecycle_phases is not null
  and lifecycle_phases != '{}'::jsonb;

-- Também renomeia as chaves internas ativo→active, controlador→controller, operador→processor
-- dentro de cada fase (para registros antigos que ainda têm essas chaves)
update public.data_inventory
set lifecycle_phases = (
  select jsonb_object_agg(
    key,
    case
      when value ? 'ativo' or value ? 'controlador' or value ? 'operador' then
        (value - 'ativo' - 'controlador' - 'operador')
        || jsonb_build_object('active',     coalesce(value->'ativo',     value->'active',     'false'::jsonb))
        || jsonb_build_object('controller', coalesce(value->'controlador', value->'controller', 'false'::jsonb))
        || jsonb_build_object('processor',  coalesce(value->'operador',  value->'processor',  'false'::jsonb))
      else value
    end
  )
  from jsonb_each(lifecycle_phases)
)
where lifecycle_phases is not null
  and lifecycle_phases != '{}'::jsonb;
