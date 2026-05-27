-- Rename Portuguese complaint type values to English identifiers
UPDATE public.complaints SET type = 'data_breach'                WHERE type = 'Vazamento de dados';
UPDATE public.complaints SET type = 'data_misuse'                WHERE type = 'Uso indevido de dados';
UPDATE public.complaints SET type = 'unauthorized_access'        WHERE type = 'Acesso não autorizado';
UPDATE public.complaints SET type = 'collection_without_consent' WHERE type = 'Coleta sem consentimento';
UPDATE public.complaints SET type = 'other'                      WHERE type = 'Outro';
