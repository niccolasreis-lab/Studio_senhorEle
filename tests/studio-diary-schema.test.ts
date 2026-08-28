import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(
  resolve('supabase/migrations/20260828101459_add_guests_and_studio_diary.sql'),
  'utf8',
).toLowerCase();

const edgeFunction = readFileSync(resolve('supabase/functions/sync-social/index.ts'), 'utf8');

describe('Convidados e Diário do Studio schema', () => {
  it('preserva veículos existentes como Studio e restringe convidados', () => {
    expect(migration).toContain("collection_kind text not null default 'studio'");
    expect(migration).toContain("collection_kind <> 'guest' or status in ('draft', 'published')");
  });

  it('garante idempotência por fonte e identificador externo', () => {
    expect(migration).toContain('studio_updates_source_external_unique unique');
    expect(migration).toContain('(source_id, external_id)');
  });

  it('expõe somente novidades publicadas ao visitante', () => {
    expect(migration).toContain('public can read published studio updates');
    expect(migration).toContain("using (editorial_status = 'published')");
    expect(migration).toContain("-> 'app_metadata' ->> 'role') = 'admin'");
  });

  it('mantém credenciais sociais exclusivamente no runtime da Edge Function', () => {
    expect(edgeFunction).toContain("Deno.env.get('YOUTUBE_API_KEY')");
    expect(edgeFunction).toContain("Deno.env.get('INSTAGRAM_ACCESS_TOKEN')");
    expect(edgeFunction).toContain("Deno.env.get('SYNC_CRON_SECRET')");
    expect(edgeFunction).not.toMatch(/sb_secret_[a-z0-9_-]{20,}/i);
  });
});
