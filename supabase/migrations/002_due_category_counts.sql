-- RPC function: returns count of due cards grouped by category
CREATE OR REPLACE FUNCTION get_due_category_counts(p_user_id uuid, p_now timestamptz)
RETURNS TABLE(category text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT c.category, count(*)
  FROM cards c
  JOIN card_fsrs_state s ON s.card_id = c.id
  WHERE c.user_id = p_user_id
    AND s.due <= p_now
  GROUP BY c.category;
$$;
