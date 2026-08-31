-- Bucket de armazenamento das imagens dos veículos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-images',
  'vehicle-images',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif','image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública das imagens (browser <img>)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='vehicle_images_public_read'
  ) then
    create policy "vehicle_images_public_read"
      on storage.objects for select
      to public
      using (bucket_id = 'vehicle-images');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='vehicle_images_authenticated_write'
  ) then
    create policy "vehicle_images_authenticated_write"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'vehicle-images');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='vehicle_images_authenticated_update'
  ) then
    create policy "vehicle_images_authenticated_update"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'vehicle-images');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='vehicle_images_authenticated_delete'
  ) then
    create policy "vehicle_images_authenticated_delete"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'vehicle-images');
  end if;
end $$;
