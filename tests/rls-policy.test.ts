import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260820154036_optimize_custom_vehicles_rls.sql'),
  'utf8',
);

const adminPolicyMigration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260820154126_optimize_custom_vehicles_admin_rls_claim.sql'),
  'utf8',
);

describe('custom_vehicles RLS contract', () => {
  it('limits anonymous reads to published and reserved vehicles', () => {
    expect(migration).toMatch(/"Public can read visible vehicles"[\s\S]*?to anon[\s\S]*?status in \('published', 'reserved'\)/);
  });

  it('allows authenticated readers only public vehicles unless they are admins', () => {
    expect(migration).toMatch(/to authenticated[\s\S]*?status in \('published', 'reserved'\)[\s\S]*?auth\.jwt\(\).*?'admin'/);
  });

  it('authorizes every write operation with the server-controlled admin claim', () => {
    for (const operation of ['insert', 'update', 'delete']) {
      expect(adminPolicyMigration).toMatch(
        new RegExp(`for ${operation}[\\s\\S]*?to authenticated[\\s\\S]*?app_metadata[\\s\\S]*?'admin'`),
      );
    }
  });

  it('never uses user_metadata for authorization', () => {
    expect(`${migration}\n${adminPolicyMigration}`).not.toMatch(/auth\.jwt\(\)[\s\S]{0,100}user_metadata/);
  });

  it('evaluates the JWT once per statement in every current admin policy', () => {
    expect(adminPolicyMigration).toContain('(select auth.jwt())');
    expect(adminPolicyMigration).not.toMatch(/[^\w]auth\.jwt\(\)\s*->/);
  });
});
