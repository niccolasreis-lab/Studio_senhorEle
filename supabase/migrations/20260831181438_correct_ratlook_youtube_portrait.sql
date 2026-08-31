-- This YouTube upload was visually confirmed as native 9:16 media. YouTube's
-- public API does not expose source dimensions, so persist the editorial fact.
update public.studio_updates
set
  display_aspect = 'portrait',
  updated_at = now()
where platform = 'youtube'
  and external_id = 'dl3WJcEyr0Q'
  and display_aspect is distinct from 'portrait';
