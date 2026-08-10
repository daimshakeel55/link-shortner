CREATE OR REPLACE FUNCTION public.get_unique_visitor_count(link_uuids UUID[])
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT visitor_id)::BIGINT
  FROM click_events
  WHERE link_id = ANY(link_uuids)
    AND visitor_id IS NOT NULL;
$$;
