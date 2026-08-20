-- Hardening: close the storage authorization bypass on the vehicle-images bucket.
--
-- Context: the earlier "Admins can ..." policies (see
-- 20260813190000_enable_authenticated_admin.sql) were created alongside legacy
-- permissive policies from 20260807192709 (create_vehicle_images_storage).
-- Because RLS lets a row through when ANY policy permits it, those legacy
-- policies still allow any anonymous visitor (insert) and any authenticated
-- user (insert/update/delete) to write to the bucket — bypassing the intended
-- admin-only restriction.
--
-- Fix: drop the legacy permissive write policies and revoke the anonymous
-- write grants on storage.objects. Public read is intentional (public bucket).

drop policy if exists "vehicle_images_public_insert" on storage.objects;
drop policy if exists "vehicle_images_authenticated_write" on storage.objects;
drop policy if exists "vehicle_images_authenticated_update" on storage.objects;
drop policy if exists "vehicle_images_authenticated_delete" on storage.objects;

-- Anonymous role should never write to storage; only read (public bucket).
revoke insert, update, delete
on table storage.objects
from anon;
