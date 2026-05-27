-- Migration 032: renomeia IDs de categorias de dados no JSONB de data_inventory
-- Coluna afetada: data_categories (jsonb array de strings)

-- Função auxiliar para substituir um valor em array jsonb
create or replace function replace_jsonb_array_value(arr jsonb, old_val text, new_val text)
returns jsonb language sql immutable as $$
  select jsonb_agg(case when elem::text = to_json(old_val)::text then to_json(new_val)::jsonb else elem end)
  from jsonb_array_elements(arr) as elem
$$;

-- Aplica substituições em sequência para data_categories
update public.data_inventory
set data_categories = (
  select replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
  replace_jsonb_array_value(
    data_categories,
    'identificacao_pessoal',       'personal_identification'),
    'dados_governamentais',        'government_data'),
    'identificacao_eletronica',    'electronic_identification'),
    'dados_financeiros',           'financial_data'),
    'consentimentos',              'consent_data'),
    'caracteristicas_pessoais',    'personal_characteristics'),
    'caracteristicas_psicologicas','psychological_characteristics'),
    'composicao_familiar',         'family_composition'),
    'educacao',                    'education'),
    'profissao',                   'occupation'),
    'imagem_video_voz',            'image_video_voice'),
    'dados_sensiveis',             'sensitive_data'),
    'outros',                      'other')
)
where data_categories is not null and jsonb_array_length(data_categories) > 0;

-- Remove função auxiliar após uso
drop function replace_jsonb_array_value(jsonb, text, text);
