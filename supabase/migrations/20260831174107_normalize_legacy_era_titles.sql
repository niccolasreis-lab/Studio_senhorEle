-- Normalize date-only titles imported under a non-Gregorian locale and mark
-- those Studio YouTube uploads as vertical media. The predicate is deliberately
-- structural so the migration remains safe and idempotent.
update public.studio_updates
set
  title = concat(
    extract(day from published_at)::integer,
    ' de ',
    (array['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'])[extract(month from published_at)::integer],
    ' de ',
    extract(year from published_at)::integer
  ),
  display_aspect = case
    when platform = 'youtube' then 'portrait'
    else display_aspect
  end,
  updated_at = now()
where title ~* '^[0-9]{1,2}[[:space:]]+de[[:space:]]+[^0-9]+[[:space:]]+de[[:space:]]+[0-9]{1,3}[[:space:]]+[^0-9]+$';
