-- Evaluate the JWT once per statement rather than once per candidate row.

drop policy if exists "Admins can insert vehicles" on public.custom_vehicles;
drop policy if exists "Admins can update vehicles" on public.custom_vehicles;
drop policy if exists "Admins can delete vehicles" on public.custom_vehicles;
drop policy if exists "Authenticated users can read visible vehicles or administer" on public.custom_vehicles;

create policy "Authenticated users can read visible vehicles or administer"
on public.custom_vehicles
for select
to authenticated
using (
  status in ('published', 'reserved')
  or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins can insert vehicles"
on public.custom_vehicles
for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update vehicles"
on public.custom_vehicles
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete vehicles"
on public.custom_vehicles
for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
