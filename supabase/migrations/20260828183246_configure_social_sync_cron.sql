-- The matching SYNC_CRON_SECRET must be provisioned separately in both the
-- Edge Function environment and Supabase Vault. Never commit its value.

create extension if not exists pg_net;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists supabase_vault;

do $migration$
begin
  if not exists (
    select 1 from vault.secrets
    where name = 'studio_social_sync_project_url'
  ) then
    perform vault.create_secret(
      'https://rucqvvollyrlgyekoelq.supabase.co',
      'studio_social_sync_project_url'
    );
  end if;

  if exists (
    select 1 from vault.secrets
    where name = 'studio_social_sync_cron_secret'
  ) then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'studio-social-sync-hourly';

    perform cron.schedule(
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
  else
    raise warning
      'studio_social_sync_cron_secret is absent; hourly social sync was not scheduled.';
  end if;
end
$migration$;
