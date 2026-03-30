DELETE FROM staff_members
WHERE id NOT IN (
  SELECT DISTINCT ON (full_name) id
  FROM staff_members
  ORDER BY full_name, created_at ASC
);