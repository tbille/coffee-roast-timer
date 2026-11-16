-- Repair legacy Gene Cafe rows labelled 'F' whose temperatures are really °C.
--
-- The old Gene Cafe timer converted readings to °C but saved
-- temperature_unit = 'F' when the °F toggle was on. Same rule as the frontend's
-- storedTempUnit(): a non-v2 row labelled 'F' whose recorded temperatures
-- (positive currentTemp/targetTemp in temperature_data, crack_events,
-- roaster_data.temperatureData and roaster_data.crackEvents) are ALL < 300 is °C.
-- Genuine °F roasts reach first crack around 380-400 °F, so they never match.
--
-- Only the label changes; numbers are already °C and are not converted.
-- updated_at is preserved (the updated_at trigger is disabled for this
-- statement only) so sitemap lastmod / sync ordering are not disturbed.
-- Idempotent: once relabelled to 'C' a row no longer matches.
--
-- Applied to production on 2026-11-16 scoped to the 6 ids from the dry run
-- (a11d0c5c, 0bc56c01, e1b44e59, fa542c52, 6555f943, 1fe7cd4a).

BEGIN;

ALTER TABLE public.roast_profiles DISABLE TRIGGER update_roast_profiles_updated_at;

WITH temps AS (
  SELECT p.id, (e->>k)::numeric AS v
  FROM public.roast_profiles p
  CROSS JOIN LATERAL (
    SELECT e FROM jsonb_array_elements(CASE WHEN jsonb_typeof(p.temperature_data) = 'array' THEN p.temperature_data ELSE '[]'::jsonb END) e
    UNION ALL
    SELECT e FROM jsonb_array_elements(CASE WHEN jsonb_typeof(p.crack_events) = 'array' THEN p.crack_events ELSE '[]'::jsonb END) e
    UNION ALL
    SELECT e FROM jsonb_array_elements(CASE WHEN jsonb_typeof(p.roaster_data->'temperatureData') = 'array' THEN p.roaster_data->'temperatureData' ELSE '[]'::jsonb END) e
    UNION ALL
    SELECT e FROM jsonb_array_elements(CASE WHEN jsonb_typeof(p.roaster_data->'crackEvents') = 'array' THEN p.roaster_data->'crackEvents' ELSE '[]'::jsonb END) e
  ) s(e)
  CROSS JOIN unnest(ARRAY['currentTemp', 'targetTemp']) k
  WHERE p.temperature_unit = 'F'
    AND jsonb_typeof(e) = 'object'
    AND jsonb_typeof(e->k) = 'number'
    AND (e->>k)::numeric > 0
),
mislabelled AS (
  SELECT p.id
  FROM public.roast_profiles p
  JOIN temps t ON t.id = p.id
  WHERE p.temperature_unit = 'F'
    -- legacy (non-v2) rows only; a non-integer schema_version is treated as v2+ and skipped
    AND (CASE WHEN COALESCE(p.roaster_data->>'schema_version', '0') ~ '^[0-9]+$'
              THEN COALESCE(p.roaster_data->>'schema_version', '0')::int ELSE 99 END) < 2
    AND (CASE WHEN COALESCE(p.roaster_settings->>'schema_version', '0') ~ '^[0-9]+$'
              THEN COALESCE(p.roaster_settings->>'schema_version', '0')::int ELSE 99 END) < 2
  GROUP BY p.id
  HAVING max(t.v) < 300
)
UPDATE public.roast_profiles p
SET temperature_unit = 'C'
FROM mislabelled m
WHERE p.id = m.id;

ALTER TABLE public.roast_profiles ENABLE TRIGGER update_roast_profiles_updated_at;

COMMIT;
