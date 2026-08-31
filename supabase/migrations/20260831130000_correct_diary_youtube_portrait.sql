-- The YouTube Data API thumbnails do not preserve the source video's aspect.
-- This post is the 9:16 publication used by the approved Diary layout brief.
update public.studio_updates
set
  display_aspect = 'portrait',
  updated_at = now()
where platform = 'youtube'
  and external_id = 'zM4Xta25FZk'
  and display_aspect is distinct from 'portrait';
