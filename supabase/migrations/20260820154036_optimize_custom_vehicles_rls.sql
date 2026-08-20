-- Keep public access narrow while avoiding overlapping SELECT policies for
-- authenticated users. app_metadata is server-controlled; user_metadata is not.

drop policy if exists "Public can read visible vehicles" on public.custom_vehicles;
drop policy if exists "Admins can read all vehicles" on public.custom_vehicles;

create policy "Public can read visible vehicles"
on public.custom_vehicles
for select
to anon
using (status in ('published', 'reserved'));

create policy "Authenticated users can read visible vehicles or administer"
on public.custom_vehicles
for select
to authenticated
using (
  status in ('published', 'reserved')
  or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
