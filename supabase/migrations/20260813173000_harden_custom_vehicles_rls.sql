  -- Public visitors may only read vehicles intentionally exposed on the website.
  -- Administrative writes remain unavailable until the app adopts Supabase Auth.
  
  alter table public.custom_vehicles enable row level security;
  alter table public.custom_vehicles force row level security;
  
  revoke insert, update, delete, truncate, references, trigger
  on table public.custom_vehicles
  from anon, authenticated;
  
  grant select
  on table public.custom_vehicles
  to anon, authenticated;
  
  do $$
  declare
    existing_policy record;
  begin
    for existing_policy in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = 'custom_vehicles'
    loop
      execute format(
        'drop policy if exists %I on public.custom_vehicles',
        existing_policy.policyname
      );
    end loop;
  end
  $$;
  
  create policy "Public can read visible vehicles"
  on public.custom_vehicles
  for select
  to anon, authenticated
  using (status in ('published', 'reserved'));
