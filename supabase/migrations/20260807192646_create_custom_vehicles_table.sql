-- Studio SenhorEle: cat\u00e1logo de ve\u00edculos customizados
create table if not exists public.custom_vehicles (
  id            text primary key,
  share_id      text not null,
  title         text not null,
  subtitle      text not null default '',
  image         text not null default '',
  image2        text not null default '',
  image3        text not null default '',
  year          text not null default '',
  engine        text not null default '',
  transmission  text not null default '',
  color         text not null default '',
  power         text not null default '',
  condition     text not null default '',
  description   text not null default '',
  is_custom     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.custom_vehicles is 'Catálogo de veículos curados do Studio SenhorEle';

-- índice para busca por código único
create unique index if not exists custom_vehicles_share_id_idx on public.custom_vehicles (share_id);

-- RLS: leitura pública do catálogo; escrita restrita a usuário autenticado/curador
alter table public.custom_vehicles enable row level security;

create policy "custom_vehicles_public_select"
  on public.custom_vehicles for select
  to anon, authenticated
  using (true);

create policy "custom_vehicles_authenticated_insert"
  on public.custom_vehicles for insert
  to authenticated
  with check (true);

create policy "custom_vehicles_authenticated_update"
  on public.custom_vehicles for update
  to authenticated
  using (true)
  with check (true);

create policy "custom_vehicles_authenticated_delete"
  on public.custom_vehicles for delete
  to authenticated
  using (true);

-- trigger para atualizar updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists custom_vehicles_set_updated_at on public.custom_vehicles;
create trigger custom_vehicles_set_updated_at
  before update on public.custom_vehicles
  for each row
  execute function public.set_updated_at();
