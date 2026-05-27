-- Migration 039: convert Portuguese DPIA values to English identifiers
-- requires_dpia column: 'sim' → 'yes', 'nao' → 'no'
UPDATE public.data_inventory SET requires_dpia = 'yes' WHERE requires_dpia = 'sim';
UPDATE public.data_inventory SET requires_dpia = 'no'  WHERE requires_dpia = 'nao';

-- data_categories_detail JSONB array: update dpiaRequired field inside each element
UPDATE public.data_inventory
SET data_categories_detail = (
  SELECT jsonb_agg(
    CASE
      WHEN elem->>'dpiaRequired' = 'sim'       THEN elem || '{"dpiaRequired":"yes"}'
      WHEN elem->>'dpiaRequired' = 'nao'       THEN elem || '{"dpiaRequired":"no"}'
      WHEN elem->>'dpiaRequired' = 'a_avaliar' THEN elem || '{"dpiaRequired":"to_evaluate"}'
      ELSE elem
    END
  )
  FROM jsonb_array_elements(data_categories_detail) AS elem
)
WHERE data_categories_detail IS NOT NULL
  AND data_categories_detail != '[]'::jsonb
  AND data_categories_detail::text ~ '("sim"|"nao"|"a_avaliar")';
