import { afterEach, describe, expect, it } from 'vitest';
import { FURNITURE } from '../art/api';
import { renderRug } from '../art/surfaces/rug';
import { roomTheme } from '../art/theme';
import { setVouteMode } from '../art/voute';
import { VOUTE_SALAS } from '../../../shared/voute-residentes';
import { assembleBuilding, coreAreas } from './layout/building';
import { CORE_WALLS, RECEPTION_ID, VOUTE_CORE_WALLS } from './layout/core';
import { layoutExterior } from './layout/exterior';
import { columnsFor } from './layout/geometry';
import { layoutProjectRoom } from './layout/room';
import { propSprite } from './render/props';
import { getSeason } from './render/seasonal';

describe('La Voûte — exterior nocturno, cartel de neón y supresión estacional', () => {
  afterEach(() => {
    setVouteMode(false);
  });

  it('reemplaza el pasto exterior por asfalto y coloca neon_sign, velvet_rope, car_limo y car_taxi', () => {
    setVouteMode(false);
    const officeExt = layoutExterior(5);
    expect(officeExt.floors.some((f) => f.kind === 'grass')).toBe(true);
    expect(officeExt.props.some((p) => p.kind === 'tree')).toBe(true);
    expect(officeExt.props.some((p) => p.kind === 'totem')).toBe(true);

    setVouteMode(true);
    const vouteExt = layoutExterior(5);
    expect(vouteExt.floors.some((f) => f.kind === 'grass')).toBe(false);
    expect(vouteExt.floors.some((f) => f.kind === 'asphalt')).toBe(true);
    expect(vouteExt.props.some((p) => p.kind === 'tree')).toBe(false);
    expect(vouteExt.props.some((p) => p.kind === 'totem')).toBe(false);
    expect(vouteExt.props.some((p) => p.kind === 'neon_sign')).toBe(true);
    expect(vouteExt.props.some((p) => p.kind === 'velvet_rope')).toBe(true);
    expect(vouteExt.props.some((p) => p.kind === 'car_limo')).toBe(true);
    expect(vouteExt.props.some((p) => p.kind === 'car_taxi')).toBe(true);
  });

  it('renderiza sprites válidos para neon_sign, velvet_rope, car_limo y car_taxi', () => {
    setVouteMode(true);
    for (const kind of ['neon_sign', 'velvet_rope', 'car_limo', 'car_taxi'] as const) {
      const sp = propSprite(kind);
      expect(sp.canvas.width, `${kind} width`).toBeGreaterThan(8);
      expect(sp.canvas.height, `${kind} height`).toBeGreaterThan(8);
      expect(sp.ax).toBeGreaterThan(0);
      expect(sp.ay).toBeGreaterThan(0);
    }
  });

  it('suprime temporadas (Halloween / Navidad) cuando isVoute() está activo', () => {
    const xmas = new Date(2026, 11, 24, 21, 0, 0);
    const hallow = new Date(2026, 9, 31, 21, 0, 0);
    setVouteMode(false);
    expect(getSeason(xmas)).toBe('christmas');
    expect(getSeason(hallow)).toBe('halloween');

    setVouteMode(true);
    expect(getSeason(xmas)).toBe('none');
    expect(getSeason(hallow)).toBe('none');
  });

  it('diseña los 5 espacios de La Voûte completamente distintos (Camarín ≠ Barra ≠ Salón, Mesa VIP ≠ Cabina) y todos caminables', () => {
    setVouteMode(true);
    const slots = VOUTE_SALAS.map((_, i) => i);
    const rooms = VOUTE_SALAS.map((s, slot) => {
      const th = roomTheme(100 + slot, s.id);
      return layoutProjectRoom({ id: s.id, slot, seed: 100 + slot }, th);
    });
    const b = assembleBuilding(columnsFor(slots), rooms);
    const reception = coreAreas().find((a) => a.id === RECEPTION_ID)!;
    const elevator = reception.spots.find((s) => s.kind === 'elevator')!;
    const reach = b.grid.reachableFrom(elevator.tx, elevator.ty);
    const reachable = (x: number, y: number) => reach[y * b.grid.w + x] === 1;

    // 1. Pisos distintos entre las 5 salas
    const floorKinds = rooms.map((r) => r.floors[0].kind);
    expect(new Set(floorKinds).size).toBe(5);

    // 2. Alfombras principales con colores y píxeles distintos entre las 5 salas
    const rugColors = rooms.map((r) => r.rugs[0].color);
    expect(new Set(rugColors).size).toBe(5);
    const rugHashes = rugColors.map((col, idx) => {
      const buf = renderRug(48, 32, col, idx + 1);
      let h = 2166136261;
      for (let i = 0; i < buf.data.length; i++) h = Math.imul(h ^ buf.data[i], 16777619);
      return h >>> 0;
    });
    expect(new Set(rugHashes).size).toBe(5);

    // 3. Firmas de mobiliario distintas (Camarín ≠ Barra ≠ Salón y Mesa VIP ≠ Cabina)
    const furnSignatures = rooms.map((r) =>
      r.furniture
        .map((f) => `${f.kind}@${f.tx - r.rect.x},${f.ty - r.rect.y}`)
        .sort()
        .join('|'),
    );
    expect(new Set(furnSignatures).size).toBe(5);

    // 4. Invariantes de simulación y caminabilidad sin solapes
    for (const room of rooms) {
      const desks = room.spots.filter((s) => s.kind === 'desk');
      expect(desks, `${room.id} desks`).toHaveLength(6);
      expect(new Set(desks.map((d) => d.rank))).toEqual(new Set([0, 1, 2, 3, 4, 5]));
      expect(room.spots.filter((s) => s.kind === 'stool' || s.kind === 'nook').length).toBeGreaterThanOrEqual(4);
      expect(room.spots.filter((s) => s.kind === 'stand').length).toBeGreaterThanOrEqual(3);
      expect(room.spots.filter((s) => s.kind === 'switch')).toHaveLength(1);

      const used = new Map<string, string>();
      for (const f of room.furniture) {
        const def = FURNITURE[f.kind];
        for (let y = f.ty; y < f.ty + def.footprint.h; y++) {
          for (let x = f.tx; x < f.tx + def.footprint.w; x++) {
            const key = `${x},${y}`;
            if (def.blocks) {
              expect(used.get(key), `${room.id}: ${f.id} sobre ${used.get(key)}`).toBeUndefined();
              used.set(key, f.id);
            }
          }
        }
      }
    }
    const unreachable = b.spots.filter((s) => !reachable(s.tx, s.ty)).map((s) => s.id);
    expect(unreachable).toEqual([]);
  });

  it('en la opción normal (!isVoute()), tanto el núcleo como las 5 salas se ven 100% como oficina normal sin restos de caché', () => {
    setVouteMode(true);
    expect(coreAreas()[0].walls[0].style.base).toBe(VOUTE_CORE_WALLS.reception.base);

    setVouteMode(false);
    expect(coreAreas()[0].walls[0].style.base).toBe(CORE_WALLS.reception.base);
    const normalRooms = VOUTE_SALAS.map((s, slot) => {
      const th = roomTheme(100 + slot, s.id);
      return layoutProjectRoom({ id: s.id, slot, seed: 100 + slot }, th);
    });
    for (const r of normalRooms) {
      expect(r.floors[0].kind).toBe('marble');
      expect(r.walls[0].style.base).not.toBe('#0d0a0c');
      expect(r.walls[0].style.base).not.toBe('#1e1619');
    }
  });
});
