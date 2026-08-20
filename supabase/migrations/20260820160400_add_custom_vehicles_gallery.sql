-- Adds a JSONB gallery column to custom_vehicles so a single post can hold
-- more than 3 images. The first three slots keep image/image2/image3 for
-- backwards compatibility; additional images live in the gallery array.

alter table public.custom_vehicles
  add column if not exists gallery jsonb not null default '[]'::jsonb;