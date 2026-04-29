-- Fix for Historical Analytics Discrepancy
-- This ensures both functions use the exact same NOW() - INTERVAL logic 
-- and properly calculate DISTINCT session_ids across both global and country levels.

-- 1. Global Stats RPC
CREATE OR REPLACE FUNCTION public.get_prayer_stats(interval_hours INT)
RETURNS TABLE (
  total_prayers BIGINT,
  unique_prayers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(id) AS total_prayers,
    COUNT(DISTINCT session_id) AS unique_prayers
  FROM public.prayers
  WHERE started_at >= NOW() - (interval_hours || ' hours')::interval;
END;
$$ LANGUAGE plpgsql;


-- 2. Country Stats RPC
CREATE OR REPLACE FUNCTION public.get_country_stats(interval_hours INT)
RETURNS TABLE (
  country TEXT,
  total_prayers BIGINT,
  unique_prayers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.country,
    COUNT(p.id) AS total_prayers,
    COUNT(DISTINCT p.session_id) AS unique_prayers
  FROM public.prayers p
  WHERE p.started_at >= NOW() - (interval_hours || ' hours')::interval
  GROUP BY p.country
  ORDER BY unique_prayers DESC, total_prayers DESC;
END;
$$ LANGUAGE plpgsql;
