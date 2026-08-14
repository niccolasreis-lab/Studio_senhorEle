-- Only identities carrying the server-controlled app_metadata role "admin"
-- can manage the collection. user_metadata is intentionally not trusted.

grant select, insert, update, delete
on table public.custom_vehicles
to authenticated;

drop policy if exists "Admins can read all vehicles" on public.custom_vehicles;
drop policy if exists "Admins can insert vehicles" on public.custom_vehicles;
drop policy if exists "Admins can update vehicles" on public.custom_vehicles;
drop policy if exists "Admins can delete vehicles" on public.custom_vehicles;

create policy "Admins can read all vehicles"
on public.custom_vehicles
for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert vehicles"
on public.custom_vehicles
for insert
to authenticated
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update vehicles"
on public.custom_vehicles
for update
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete vehicles"
on public.custom_vehicles
for delete
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can read vehicle images" on storage.objects;
drop policy if exists "Admins can upload vehicle images" on storage.objects;
drop policy if exists "Admins can update vehicle images" on storage.objects;
drop policy if exists "Admins can delete vehicle images" on storage.objects;

create policy "Admins can read vehicle images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'vehicle-images'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins can upload vehicle images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vehicle-images'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins can update vehicle images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'vehicle-images'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'vehicle-images'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins can delete vehicle images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vehicle-images'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
