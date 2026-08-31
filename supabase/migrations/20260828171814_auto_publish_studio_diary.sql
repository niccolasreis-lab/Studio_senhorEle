-- Auto-publicacao do Diario do Studio.
-- Apply only to the Studio SenhorEle project (rucqvvollyrlgyekoelq).

begin;

-- New rows are public by default. The Edge Function and the manual editor also
-- send this state explicitly; the default protects future server-side writers.
alter table public.studio_updates
  alter column editorial_status set default 'published';

-- Publish only recent social imports from active configured sources. Rejected
-- rows, manual drafts and social rows older than the agreed 30-day backfill are
-- intentionally preserved without a state transition.
update public.studio_updates as update_row
set editorial_status = 'published'
from public.social_sources as source
where update_row.source_id = source.id
  and source.is_active
  and update_row.editorial_status = 'pending'
  and update_row.published_at >= now() - interval '30 days';

-- Supports both featured and archive queries without indexing hidden rows.
create index if not exists studio_updates_public_featured_idx
  on public.studio_updates (featured_until desc, published_at desc)
  where editorial_status = 'published';

create index if not exists social_sync_runs_started_idx
  on public.social_sync_runs (started_at desc);

commit;
