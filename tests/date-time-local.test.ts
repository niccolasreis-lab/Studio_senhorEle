import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const originalTimezone = process.env.TZ;

describe('datetime-local conversion', () => {
  beforeEach(() => { process.env.TZ = 'America/Sao_Paulo'; });
  afterEach(() => {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  });

  it('round-trips São Paulo wall time without a three-hour drift', async () => {
    const { dateTimeLocalToIso, toDateTimeLocalInput } = await import('../src/utils/dateTimeLocal');
    const instant = '2026-08-28T15:00:00.000Z';
    const localInput = toDateTimeLocalInput(instant);

    expect(localInput).toBe('2026-08-28T12:00');
    expect(dateTimeLocalToIso(localInput)).toBe(instant);
  });
});
