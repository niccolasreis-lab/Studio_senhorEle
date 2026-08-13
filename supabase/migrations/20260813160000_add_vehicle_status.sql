alter table public.custom_vehicles
  add column if not exists status text;

update public.custom_vehicles
set status = 'published'
where status is null;

alter table public.custom_vehicles
  alter column status set default 'draft',
  alter column status set not null;

alter table public.custom_vehicles
  drop constraint if exists custom_vehicles_status_check;

alter table public.custom_vehicles
  add constraint custom_vehicles_status_check
  check (status in ('draft', 'published', 'reserved', 'sold'));
