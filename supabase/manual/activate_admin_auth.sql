-- Studio SenhorEle — ativação segura do administrador
--
-- Antes de executar:
-- 1. Crie o usuário em Authentication > Users no painel do Supabase.
-- 2. Confirme que assistentedoni@gmail.com já existe no Supabase Auth.
-- 3. Execute este arquivo inteiro no SQL Editor.
-- 4. Depois, encerre a sessão do painel e faça login novamente para renovar o JWT.

begin;

do $$
declare
  admin_email constant text := 'ADMIN_EMAIL_AQUI';
  affected_rows integer;
begin
  if admin_email = 'ADMIN_EMAIL_AQUI' or admin_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Substitua ADMIN_EMAIL_AQUI por um e-mail válido antes de executar.';
  end if;

  update auth.users
  set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb,
    true
  )
  where lower(email) = lower(admin_email);

  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception
      'Esperado exatamente um usuário Auth para %, mas foram encontrados %.',
      admin_email,
      affected_rows;
  end if;
end
$$;

alter table public.custom_vehicles enable row level security;
alter table public.custom_vehicles force row level security;

revoke insert, update, delete, truncate, references, trigger
on table public.custom_vehicles
from anon;

grant select
on table public.custom_vehicles
to anon, authenticated;

grant insert, update, delete
on table public.custom_vehicles
to authenticated;

-- Remove todas as políticas anteriores desta tabela para impedir que uma
-- regra permissiva antiga continue liberando escritas ou rascunhos.
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

-- Políticas do Storage. O bucket continua público somente para leitura das
-- imagens; listar, enviar, substituir e excluir exige o papel administrativo.
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

commit;

-- Resultado esperado: uma linha com role = admin.
select
  id,
  email,
  raw_app_meta_data ->> 'role' as role,
  email_confirmed_at is not null as email_confirmed
from auth.users
where raw_app_meta_data ->> 'role' = 'admin'
order by created_at;

-- Auditoria das políticas efetivas na tabela e no bucket.
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where (schemaname = 'public' and tablename = 'custom_vehicles')
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;
