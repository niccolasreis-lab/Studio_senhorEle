-- Convidados do Studio + Diario do Studio.
-- This migration is intentionally self-contained and safe for repeated local
-- resets. Apply only to the Studio SenhorEle project (rucqvvollyrlgyekoelq).

alter table public.custom_vehicles
  add column if not exists collection_kind text not null default 'studio';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'custom_vehicles_collection_kind_check'
      and conrelid = 'public.custom_vehicles'::regclass
  ) then
    alter table public.custom_vehicles
      add constraint custom_vehicles_collection_kind_check
      check (collection_kind in ('studio', 'guest'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'custom_vehicles_guest_status_check'
      and conrelid = 'public.custom_vehicles'::regclass
  ) then
    alter table public.custom_vehicles
      add constraint custom_vehicles_guest_status_check
      check (collection_kind <> 'guest' or status in ('draft', 'published'));
  end if;
end
$$;

create table if not exists public.social_sources (
  id bigint generated always as identity primary key,
  source_key text not null unique,
  platform text not null check (platform in ('instagram', 'youtube')),
  handle text not null,
  display_name text not null,
  description text not null default '',
  editorial_role text not null check (editorial_role in ('official', 'partner')),
  public_url text not null check (public_url ~ '^https://'),
  avatar_url text,
  external_channel_id text,
  uploads_playlist_id text,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  last_sync_status text check (last_sync_status is null or last_sync_status in ('ok', 'error')),
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_updates (
  id bigint generated always as identity primary key,
  source_id bigint references public.social_sources(id) on delete set null,
  share_id text not null unique,
  external_id text,
  platform text not null check (platform in ('instagram', 'youtube', 'manual')),
  editorial_role text not null check (editorial_role in ('official', 'partner', 'manual')),
  content_type text not null check (content_type in ('image', 'carousel', 'reel', 'video', 'event', 'note')),
  display_aspect text not null default 'landscape'
    check (display_aspect in ('portrait', 'landscape', 'square')),
  author_name text not null,
  title text not null check (char_length(title) between 1 and 180),
  summary text not null default '' check (char_length(summary) <= 5000),
  thumbnail_url text,
  canonical_url text check (canonical_url is null or canonical_url ~ '^https://'),
  published_at timestamptz not null,
  imported_at timestamptz not null default now(),
  editorial_status text not null default 'pending'
    check (editorial_status in ('pending', 'published', 'rejected')),
  approved_at timestamptz,
  featured_until timestamptz,
  event_starts_at timestamptz,
  event_ends_at timestamptz,
  location text,
  cta_label text,
  cta_url text check (cta_url is null or cta_url ~ '^https://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (event_ends_at is null or event_starts_at is null or event_ends_at >= event_starts_at),
  check (
    (platform = 'manual' and source_id is null and external_id is null)
    or
    (platform <> 'manual' and source_id is not null and external_id is not null)
  )
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'studio_updates_source_external_unique'
      and conrelid = 'public.studio_updates'::regclass
  ) then
    alter table public.studio_updates
      add constraint studio_updates_source_external_unique unique (source_id, external_id);
  end if;
end
$$;

create index if not exists studio_updates_public_date_idx
  on public.studio_updates (published_at desc)
  where editorial_status = 'published';

create index if not exists studio_updates_pending_import_idx
  on public.studio_updates (imported_at desc)
  where editorial_status = 'pending';

create table if not exists public.social_sync_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'ok', 'partial', 'error')),
  imported_count integer not null default 0 check (imported_count >= 0),
  source_results jsonb not null default '[]'::jsonb check (jsonb_typeof(source_results) = 'array'),
  error_message text
);

insert into public.social_sources
  (source_key, platform, handle, display_name, editorial_role, public_url)
values
  ('instagram-studiosenhorele', 'instagram', '@studiosenhorele', 'Studio SenhorEle', 'official', 'https://www.instagram.com/studiosenhorele/'),
  ('youtube-studiosenhorele', 'youtube', '@studiosenhorele', 'Studio SenhorEle', 'official', 'https://www.youtube.com/@studiosenhorele'),
  ('youtube-fuscanafoto', 'youtube', '@FuscanaFoto', 'Fusca na Foto', 'partner', 'https://www.youtube.com/@FuscanaFoto')
on conflict (source_key) do update set
  handle = excluded.handle,
  display_name = excluded.display_name,
  editorial_role = excluded.editorial_role,
  public_url = excluded.public_url,
  updated_at = now();

-- The public API may only transition editorial state through this invariant.
-- featured_until is anchored to the original publication time, not approval
-- time, so late approvals correctly enter the archive immediately.
create or replace function public.normalize_studio_update_editorial_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();

  if new.editorial_status = 'published' then
    if tg_op = 'INSERT' or old.editorial_status is distinct from 'published' then
      new.approved_at := now();
    else
      new.approved_at := coalesce(new.approved_at, old.approved_at, now());
    end if;
    new.featured_until := new.published_at + interval '30 days';
  else
    new.approved_at := null;
    new.featured_until := null;
  end if;

  return new;
end;
$$;

drop trigger if exists normalize_studio_update_editorial_state on public.studio_updates;
create trigger normalize_studio_update_editorial_state
before insert or update on public.studio_updates
for each row execute function public.normalize_studio_update_editorial_state();

alter table public.social_sources enable row level security;
alter table public.social_sources force row level security;
alter table public.studio_updates enable row level security;
alter table public.studio_updates force row level security;
alter table public.social_sync_runs enable row level security;
alter table public.social_sync_runs force row level security;

revoke all on public.social_sources, public.studio_updates, public.social_sync_runs from anon, authenticated;
grant select on public.studio_updates to anon, authenticated;
grant select on public.social_sources to authenticated;
grant select (id, source_key, platform, handle, display_name, description, editorial_role, public_url, avatar_url, is_active)
  on public.social_sources to anon;
grant insert, update, delete on public.social_sources, public.studio_updates to authenticated;
grant select on public.social_sync_runs to authenticated;
grant usage, select on sequence public.social_sources_id_seq, public.studio_updates_id_seq to authenticated;

create policy "Public can read active source presentation"
on public.social_sources for select to anon
using (is_active);

create policy "Admins can read social sources"
on public.social_sources for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert social sources"
on public.social_sources for insert to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update social sources"
on public.social_sources for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete social sources"
on public.social_sources for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Public can read published studio updates"
on public.studio_updates for select to anon
using (editorial_status = 'published');

create policy "Authenticated can read published updates or administer"
on public.studio_updates for select to authenticated
using (
  editorial_status = 'published'
  or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins can insert studio updates"
on public.studio_updates for insert to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update studio updates"
on public.studio_updates for update to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete studio updates"
on public.studio_updates for delete to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can read social sync runs"
on public.social_sync_runs for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- The Edge Function uses service_role, which bypasses RLS. Explicit grants keep
-- the intended server-side contract visible and work with restricted projects.
grant all on public.social_sources, public.studio_updates, public.social_sync_runs to service_role;
grant usage, select on sequence public.social_sources_id_seq, public.studio_updates_id_seq, public.social_sync_runs_id_seq to service_role;

revoke all on function public.normalize_studio_update_editorial_state() from public, anon, authenticated;

-- Scheduling is installed separately by supabase/social-sync-setup.example.sql
-- after the function secrets exist. This prevents a partially configured
-- production database from generating a failing hourly job.
