import { afterEach, describe, expect, it } from 'vitest';
import * as art from '../art/index';
import { setVouteMode } from '../art/voute';
import { DEFAULT_WORLD_OPTIONS } from './api';
import { Sim } from './sim/sim';
import {
  VOUTE_AMBIENT,
  cabaretBoothLedColor,
  cabaretNeonAlpha,
  Lighting,
} from './render/lighting';

describe('cabaret night lighting (La Voûte)', () => {
  afterEach(() => {
    setVouteMode(false);
  });

  it('forces permanent nocturnal cabaret ambient in Voûte mode even at noon in day mode', () => {
    const sim = new Sim(art, () => DEFAULT_WORLD_OPTIONS);
    const lighting = new Lighting(art, sim);

    setVouteMode(true);
    const noon = new Date(2026, 10, 11, 12, 0, 0);
    const hour = lighting.update(1000, 'day', 12, noon);

    expect(hour).toBe(23);
    expect(lighting.night).toBe(1);
    expect(lighting.ambient).toEqual(VOUTE_AMBIENT);
    expect(lighting.ambient.outside).toEqual([58, 26, 58]);
  });

  it('flickers neon sign alpha for 120ms every 6000ms unless reducedMotion is enabled', () => {
    expect(cabaretNeonAlpha(50, false)).toBeLessThan(1);
    expect(cabaretNeonAlpha(50, false)).toBeGreaterThan(0.3);
    expect(cabaretNeonAlpha(500, false)).toBe(1);
    expect(cabaretNeonAlpha(6050, false)).toBeLessThan(1);
    expect(cabaretNeonAlpha(50, true)).toBe(1);
  });

  it('alternates booth LED colors every 500ms between #ff3fa4 and #ffe08a unless reducedMotion is enabled', () => {
    const c0 = cabaretBoothLedColor(100, 0, false);
    const c1 = cabaretBoothLedColor(600, 0, false);
    expect(c0).toBe('#ff3fa4');
    expect(c1).toBe('#ffe08a');
    expect(cabaretBoothLedColor(100, 1, false)).toBe('#ffe08a');

    // Reduced motion keeps color static across time
    expect(cabaretBoothLedColor(100, 0, true)).toBe('#ff3fa4');
    expect(cabaretBoothLedColor(600, 0, true)).toBe('#ff3fa4');
  });
});
