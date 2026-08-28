import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeVehicleForCollection } from '../src/services/customVehicleService';

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260828101459_add_guests_and_studio_diary.sql'),
  'utf8',
);
const autoPublishMigration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260828114542_auto_publish_studio_diary.sql'),
  'utf8',
);
const edgeFunction = readFileSync(
  resolve(process.cwd(), 'supabase/functions/sync-social/index.ts'),
  'utf8',
);
const cronSetup = readFileSync(
  resolve(process.cwd(), 'supabase/social-sync-setup.example.sql'),
  'utf8',
);
const ogHandler = readFileSync(resolve(process.cwd(), 'api/og.ts'), 'utf8');
const ogImageHandler = readFileSync(resolve(process.cwd(), 'api/og-image.ts'), 'utf8');
const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const adminModal = readFileSync(resolve(process.cwd(), 'src/components/AdminModal.tsx'), 'utf8');
const vehicleService = readFileSync(resolve(process.cwd(), 'src/services/customVehicleService.ts'), 'utf8');

describe('guest vehicle persistence contract', () => {
  it('coerces commercial guest states to draft and assigns the auditable share prefix', () => {
    const vehicle = normalizeVehicleForCollection({
      collectionKind: 'guest',
      status: 'sold',
      shareId: 'SRL-FSC-1970',
    });

    expect(vehicle).toMatchObject({
      collectionKind: 'guest',
      status: 'draft',
      shareId: 'CONV-FSC-1970',
    });
  });

  it('enforces the same guest/status invariant in Postgres', () => {
    expect(migration).toMatch(/collection_kind <> 'guest' or status in \('draft', 'published'\)/);
  });
});

describe('studio diary database contract', () => {
  it('persists a constrained, auditable display aspect', () => {
    expect(migration).toMatch(/display_aspect text not null default 'landscape'/);
    expect(migration).toMatch(/display_aspect in \('portrait', 'landscape', 'square'\)/);
  });

  it('prevents duplicate imports and calculates the 30-day window in the database', () => {
    expect(migration).toMatch(/unique \(source_id, external_id\)/);
    expect(migration).toContain("new.featured_until := new.published_at + interval '30 days'");
    expect(migration).toMatch(/new\.approved_at := null;[\s\S]*?new\.featured_until := null;/);
  });

  it('auto-publishes only the agreed recent social backfill and preserves rejected/manual rows', () => {
    expect(autoPublishMigration).toContain("alter column editorial_status set default 'published'");
    expect(autoPublishMigration).toMatch(/update_row\.source_id = source\.id[\s\S]*?source\.is_active[\s\S]*?editorial_status = 'pending'[\s\S]*?interval '30 days'/);
    expect(autoPublishMigration).not.toMatch(/editorial_status = 'rejected'/);
  });

  it('allows anonymous readers to see only published diary entries', () => {
    expect(migration).toMatch(/Public can read published studio updates[\s\S]*?to anon[\s\S]*?editorial_status = 'published'/);
    expect(migration).toMatch(/grant select \(id, source_key,[\s\S]*?description,[\s\S]*?avatar_url, is_active\)[\s\S]*?to anon/);
    expect(migration).toMatch(/Public can read active source presentation[\s\S]*?to anon[\s\S]*?using \(is_active\)/);
    expect(migration).not.toMatch(/grant select on public\.social_sources to anon/);
  });

  it('uses only the server-controlled app_metadata role for administration', () => {
    expect(migration).toContain("'app_metadata' ->> 'role') = 'admin'");
    expect(migration).not.toMatch(/user_metadata/);
  });
});

describe('social synchronization contract', () => {
  it('marks the user-confirmed 9:16 YouTube video as portrait without thumbnail inference', () => {
    expect(edgeFunction).toContain("['zpCgm9P83Iw', 'portrait']");
    expect(edgeFunction).toContain("display_aspect: youtubeAspectOverrides.get(externalId) || 'landscape'");
  });

  it('uses conflict-safe idempotent writes and independent per-source failures', () => {
    expect(edgeFunction).toContain("onConflict: 'source_id,external_id'");
    expect(edgeFunction).toContain('ignoreDuplicates: true');
    expect(edgeFunction).toMatch(/Promise\.all\([\s\S]*?map\(async \(source\)[\s\S]*?try \{[\s\S]*?catch \(error\)/);
    expect(edgeFunction).toContain("editorial_status: 'published'");
  });

  it('paginates both platforms through the full 30-day window', () => {
    expect(edgeFunction).toContain("playlistUrl.searchParams.set('maxResults', '50')");
    expect(edgeFunction).toContain("playlistUrl.searchParams.set('pageToken', pageToken)");
    expect(edgeFunction).toContain('playlistPayload.nextPageToken');
    expect(edgeFunction).toContain('payload.paging?.next');
  });

  it('accepts only a cron secret or an authenticated admin and documents gateway configuration', () => {
    expect(edgeFunction).toContain("Deno.env.get('SYNC_CRON_SECRET')");
    expect(edgeFunction).toContain("data.user?.app_metadata?.role === 'admin'");
    expect(cronSetup).toContain('--no-verify-jwt');
    expect(cronSetup).toContain("'x-sync-secret'");
  });
});

describe('exact share-link contract', () => {
  it('resolves Studio and guest vehicles from persisted collection kind and their own image', () => {
    expect(ogHandler).toContain("collection_kind === 'guest'");
    expect(ogHandler).toContain('siteUrl: `${origin}/?v=${encodedShareId}`');
    expect(ogImageHandler).toContain(".from('custom_vehicles')");
    expect(ogImageHandler).toContain("srlfsc1968: { image: '/assets/images/vw-fusca-cal-style-1968.jpg'");
    expect(ogImageHandler).toContain("srlfsc1994: { image: '/assets/images/vw-fusca-cal-style-1968.jpg'");
    expect(ogImageHandler).not.toContain('srljfsc');
    expect(ogHandler.indexOf('const customItem = await findCustomVehicle')).toBeLessThan(ogHandler.indexOf('const staticItem = findStaticShareItem'));
    expect(ogImageHandler.indexOf(".from('custom_vehicles')")).toBeLessThan(ogImageHandler.indexOf('const staticItem = STATIC_ITEM_BY_KEY[key]'));
    expect(ogImageHandler).toContain("vehicle.collection_kind === 'guest' ? 'Convidado do Studio' : 'Coleção'");
  });

  it('resolves a published Diary item to its exact deep link and thumbnail', () => {
    expect(ogHandler).toContain("kind: 'diary'");
    expect(ogHandler).toContain('siteUrl: `${origin}/?d=${encodeURIComponent(shareId)}#diario`');
    expect(ogImageHandler).toContain(".from('studio_updates')");
    expect(ogImageHandler).toContain("update.title || 'Diário do Studio', 'Diário do Studio'");
    expect(ogHandler).not.toContain('.limit(200)');
    expect(ogImageHandler).not.toContain('.limit(200)');
  });

  it('waits for Supabase before resolving a dynamic vehicle deep link', () => {
    expect(app).toContain('await CustomVehicleService.syncWithSupabase()');
    expect(app).toContain('setSelectedVehicleDetail(dynamicMatch.id)');
  });

  it('does not confirm a guest locally before cloud persistence or assign another car photo', () => {
    expect(vehicleService).toContain('const persisted = await SupabaseService.insertVehicle(newVehicle)');
    expect(vehicleService).toContain('if (!persisted) throw new Error');
    expect(adminModal).toContain('await CustomVehicleService.addCustomVehicle');
    expect(adminModal).toContain('Adicione uma foto principal real antes de publicar ou salvar um convidado.');
    expect(adminModal).not.toMatch(/registrationKind === 'guest'[\s\S]{0,500}vw-fusca-cal-style-1968/);
  });
});
