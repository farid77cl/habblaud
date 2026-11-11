import { afterEach, describe, expect, it } from 'vitest';
import { FURNITURE, TILE, type FurnitureKind } from './api';
import { renderFurniture } from './furniture';
import { VOUTE_SWAP } from './furniture/cabaret';
import { setVouteMode } from './voute';

const EXPECTED_SWAPS: readonly FurnitureKind[] = [
  'desk',
  'desk_back',
  'office_chair',
  'office_chair_front',
  'meeting_table',
  'whiteboard',
  'bookshelf',
  'binder_shelf',
  'filing_cabinet',
  'printer',
  'trash_bin',
  'water_cooler',
  'coffee_machine',
  'vending_machine',
  'fridge',
  'microwave',
  'counter',
  'counter_sink',
  'cafe_table',
  'cafe_chair',
  'sofa',
  'armchair',
  'coffee_table',
  'beanbag',
  'pingpong_table',
  'arcade',
  'reception_desk',
  'bench',
  'toilet_stall',
  'sink',
  'floor_lamp',
  'glass_partition',
  'stool',
  'plant_small',
  'plant_tall',
  'window',
  'clock',
  'poster',
  'painting',
  'tv',
  'light_switch',
  'elevator',
  'door_frame',
  'sign',
  'mirror',
  'shelf_wall',
];

describe('La Voûte — catálogo de muebles cabaret (VOUTE_SWAP)', () => {
  afterEach(() => {
    setVouteMode(false);
  });

  it('define VOUTE_SWAP para todos los muebles del catálogo', () => {
    for (const kind of EXPECTED_SWAPS) {
      expect(typeof VOUTE_SWAP[kind], `falta VOUTE_SWAP[${kind}]`).toBe('function');
    }
  });

  it('respeta footprints, anclas (ax, ay), capas front y rects dinámicos en modo Voûte', () => {
    setVouteMode(true);
    for (const [kind, def] of Object.entries(FURNITURE) as [FurnitureKind, (typeof FURNITURE)[FurnitureKind]][]) {
      const variants = def.variants ?? [undefined];
      const states = def.states ?? 1;
      for (const v of variants) {
        for (let st = 0; st < states; st++) {
          const f = renderFurniture(kind, v, st, 3);
          for (const s of [f.base, f.front]) {
            if (!s) continue;
            expect(s.buf.countOpaque(), `${kind}/${v}/${st} vacío`).toBeGreaterThan(8);
            expect(s.ax).toBeGreaterThanOrEqual(0);
            expect(s.ax).toBeLessThanOrEqual(s.buf.w);
            for (const r of Object.values(s.rects ?? {})) {
              if (!r) continue;
              expect(r.x).toBeGreaterThanOrEqual(0);
              expect(r.y).toBeGreaterThanOrEqual(0);
              expect(r.x + r.w).toBeLessThanOrEqual(s.buf.w);
              expect(r.y + r.h).toBeLessThanOrEqual(s.buf.h);
            }
          }
          if (def.mount === 'floor') {
            for (const s of [f.base, f.front]) {
              if (!s) continue;
              expect(s.buf.h - s.ay, `${kind}/${v}`).toBeLessThanOrEqual(5);
              expect(s.ay - s.buf.h, `${kind}/${v}`).toBeLessThan(def.footprint.h * TILE);
            }
          } else {
            expect(f.base.ay).toBeGreaterThan(0);
            expect(f.base.ay - f.base.buf.h).toBeLessThanOrEqual(2 * TILE);
          }
        }
      }
    }

    // Asientos de espaldas y cabine tienen front.
    expect(renderFurniture('office_chair', 'black', 0).front).toBeDefined();
    expect(renderFurniture('cafe_chair', 'up', 0).front).toBeDefined();
    expect(renderFurniture('sofa', 'up', 0).front).toBeDefined();
    expect(renderFurniture('armchair', 'up', 0).front).toBeDefined();
    expect(renderFurniture('toilet_stall', undefined, 0).front).toBeDefined();

    // Rects dinámicos requeridos por el renderer.
    const requiredRects: [FurnitureKind, string][] = [
      ['desk', 'screen'],
      ['whiteboard', 'board'],
      ['window', 'glass'],
      ['clock', 'face'],
      ['tv', 'tv'],
      ['sign', 'sign'],
      ['painting', 'art'],
      ['floor_lamp', 'glow'],
      ['arcade', 'screen'],
      ['mirror', 'glass'],
      ['vending_machine', 'glow'],
    ];
    for (const [k, name] of requiredRects) {
      const sp = renderFurniture(k);
      const r = sp.base.rects?.[name as keyof NonNullable<typeof sp.base.rects>];
      expect(r, `${k} sin rect ${name}`).toBeDefined();
      expect(r!.w).toBeGreaterThan(2);
      expect(r!.h).toBeGreaterThan(2);
    }
  });

  it('produce sprites cabaret distintos a los de oficina cuando isVoute() está activo', () => {
    for (const kind of ['desk', 'sofa', 'reception_desk', 'pingpong_table', 'toilet_stall', 'sign'] as const) {
      setVouteMode(false);
      const office = renderFurniture(kind, undefined, 0, 1).base.buf.data;
      setVouteMode(true);
      const cabaret = renderFurniture(kind, undefined, 0, 1).base.buf.data;
      let diff = 0;
      const len = Math.min(office.length, cabaret.length);
      for (let i = 0; i < len; i++) {
        if (office[i] !== cabaret[i]) diff++;
      }
      expect(diff, `${kind} debería cambiar visualmente en modo Voûte`).toBeGreaterThan(50);
    }
  });
});
