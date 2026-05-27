-- Migration 034: renomeia valores de storage_types no JSONB de data_inventory
-- nuvem→cloud, servidor_local→local_server, papel→paper, terceiro→third_party, hibrido→hybrid
-- 'erp' já é inglês, não precisa renomear

create or replace function replace_jsonb_array_value(arr jsonb, old_val text, new_val text)
returns jsonb language sql immutable as $$
  select jsonb_agg(case when elem::text = to_json(old_val)::text then to_json(new_val)::jsonb else elem end)
  from jsonb_array_elements(arr) as elem
$$;

-- Aplica substituições em storage_types
update public.data_inventory
set storage_types = (
  select replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
    storage_types,
    'nuvem',          'cloud'),
    'servidor_local', 'local_server'),
    'papel',          'paper'),
    'terceiro',       'third_party'),
    'hibrido',        'hybrid')
)
where storage_types is not null and jsonb_array_length(storage_types) > 0;

-- Também o campo legado storage_type (texto simples)
update public.data_inventory
set storage_type = case storage_type
  when 'nuvem'          then 'cloud'
  when 'servidor_local' then 'local_server'
  when 'papel'          then 'paper'
  when 'terceiro'       then 'third_party'
  when 'hibrido'        then 'hybrid'
  else storage_type
end
where storage_type in ('nuvem', 'servidor_local', 'papel', 'terceiro', 'hibrido');

drop function replace_jsonb_array_value(jsonb, text, text);
