-- Run only in the Studio SenhorEle project after deploying sync-social.
-- Replace the placeholder with the same high-entropy value configured as the
-- Edge Function secret SYNC_CRON_SECRET. Never commit the real value.
-- Deploy with `supabase functions deploy sync-social --no-verify-jwt`: the
-- function performs its own cron-secret/admin-JWT authorization, while a
-- gateway JWT requirement would reject the cron request before it gets there.

create extension if not exists pg_net;
create extension if not exists pg_cron;
create extension if not exists supabase_vault;

do $$
begin
  if 'REPLACE_WITH_SYNC_CRON_SECRET' = 'REPLACE_WITH_' || 'SYNC_CRON_SECRET' then
    raise exception 'Substitua REPLACE_WITH_SYNC_CRON_SECRET antes de executar este arquivo.';
  end if;
end
$$;

select vault.create_secret(
  'https://rucqvvollyrlgyekoelq.supabase.co',
  'studio_social_sync_project_url'
)
where not exists (
  select 1 from vault.secrets where name = 'studio_social_sync_project_url'
);

select vault.create_secret(
  'REPLACE_WITH_SYNC_CRON_SECRET',
  'studio_social_sync_cron_secret'
)
where not exists (
  select 1 from vault.secrets where name = 'studio_social_sync_cron_secret'
);

select cron.unschedule(jobid)
from cron.job
where jobname = 'studio-social-sync-hourly';

select cron.schedule(
  'studio-social-sync-hourly',
  '7 * * * *',
  $schedule$
  select net.http_post(
    url := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'studio_social_sync_project_url'
    ) || '/functions/v1/sync-social',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-sync-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'studio_social_sync_cron_secret'
      )
    ),
    body := '{"trigger":"cron"}'::jsonb,
    timeout_milliseconds := 120000
  );
  $schedule$
);
