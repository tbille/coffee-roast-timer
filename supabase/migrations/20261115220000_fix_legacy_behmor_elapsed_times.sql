-- Fix Behmor roasts saved before 2026-11-15 (commit 9fff26c).
--
-- The Behmor mode stored the countdown ("time remaining") instead of seconds
-- elapsed for crack events and extensions. Each event also carries a wall-clock
-- `timestamp`, and roaster_data holds `startTime`, so the true elapsed time is
-- (timestamp - startTime) / 1000.
--
-- Safe to re-run: values are recomputed from timestamps, so a second run is a
-- no-op. An event is only changed when the recomputed time falls within the
-- roast (0 .. duration + 5s).

CREATE OR REPLACE FUNCTION pg_temp.behmor_elapsed(events jsonb, start_ms numeric, max_s numeric)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(
      CASE
        WHEN e ? 'timestamp'
         AND round(((e->>'timestamp')::numeric - start_ms) / 1000) BETWEEN 0 AND max_s
        THEN jsonb_set(e, '{time}', to_jsonb(round(((e->>'timestamp')::numeric - start_ms) / 1000)::int))
        ELSE e
      END
      ORDER BY ord
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements(COALESCE(events, '[]'::jsonb)) WITH ORDINALITY AS t(e, ord)
$$;

UPDATE public.roast_profiles p
SET
  crack_events = pg_temp.behmor_elapsed(p.crack_events, (p.roaster_data->>'startTime')::numeric, p.duration_seconds + 5),
  roaster_data = p.roaster_data
    || jsonb_build_object(
         'crackEvents', pg_temp.behmor_elapsed(p.roaster_data->'crackEvents', (p.roaster_data->>'startTime')::numeric, p.duration_seconds + 5),
         'extensions',  pg_temp.behmor_elapsed(p.roaster_data->'extensions',  (p.roaster_data->>'startTime')::numeric, p.duration_seconds + 5)
       )
WHERE p.roaster_type = 'behmor-2000ab'
  AND p.created_at < '2026-11-15 21:18:15+00'
  AND p.roaster_data ? 'startTime'
  AND jsonb_typeof(p.roaster_data->'startTime') = 'number';
