import { afterEach, describe, expect, it } from 'vitest';
import { FURNITURE } from '../art/api';
import { renderRug } from '../art/surfaces/rug';
import { roomTheme } from '../art/theme';
import { setVouteMode } from '../art/voute';
import { VOUTE_SALAS, vouteSalaNombre } from '../../../shared/voute-residentes';
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

  it('el letrero de neón mide al menos 3 veces el original (64x24) y deja de pisar la fachada', () => {
    setVouteMode(true);
    const sp = propSprite('neon_sign');
    expect(sp.canvas.width).toBeGreaterThanOrEqual(64 * 3);
    expect(sp.canvas.height).toBeGreaterThanOrEqual(24 * 3);
    const ext = layoutExterior(5);
    const signs = ext.props.filter((p) => p.kind === 'neon_sign');
    expect(signs.length).toBeGreaterThanOrEqual(2);
    // el de la entrada queda en el lote de la izquierda (no sobre el primer módulo)
    expect(Math.min(...signs.map((p) => p.x))).toBeLessThan(0);
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

  it('diseña los 6 espacios de La Voûte, cada uno con el mueble que lo nombra, todos distintos y caminables', () => {
    setVouteMode(true);
    expect(VOUTE_SALAS).toHaveLength(6);
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

    // 1. El mueble que nombra a cada espacio (Ama 11/11: entrada con cordón VIP, barra con taburetes, tocadores con
    //    espejos de bombillas, reservados con cortina, tarima con piano y mesas redondas, cama con dosel).
    const cuenta = (r: (typeof rooms)[number], kind: string) => r.furniture.filter((f) => f.kind === kind).length;
    const [entrada, barra, maquillaje, privados, escenario, anais] = rooms;
    expect(cuenta(entrada, 'stanchion'), 'entrada: postes del cordón').toBeGreaterThanOrEqual(6);
    expect(cuenta(barra, 'counter') + cuenta(barra, 'counter_sink'), 'barra: mostrador').toBeGreaterThanOrEqual(3);
    expect(cuenta(barra, 'stool'), 'barra: taburetes').toBeGreaterThanOrEqual(6);
    expect(cuenta(maquillaje, 'desk') + cuenta(maquillaje, 'desk_back'), 'maquillaje: tocadores').toBeGreaterThanOrEqual(4);
    expect(maquillaje.wallItems.filter((f) => f.kind === 'mirror').length, 'maquillaje: espejos').toBeGreaterThanOrEqual(2);
    expect(cuenta(privados, 'toilet_stall'), 'privados: reservados con cortina').toBeGreaterThanOrEqual(3);
    expect(cuenta(escenario, 'stage_piano'), 'escenario: tarima con piano').toBe(1);
    expect(cuenta(escenario, 'cafe_table'), 'escenario: mesas redondas').toBeGreaterThanOrEqual(2);
    expect(cuenta(anais, 'canopy_bed'), 'anais: cama con dosel').toBe(1);
    for (const r of [barra, maquillaje, privados, escenario, anais]) expect(cuenta(r, 'stanchion'), `${r.id} sin cordón`).toBe(0);

    // 2. Pisos y alfombras: ninguna sala repite piso con alfombra
    const pisos = rooms.map((r) => `${r.floors[0].kind}|${r.floors[0].tint ?? ''}|${r.rugs[0].color}`);
    expect(new Set(pisos).size).toBe(6);
    const rugColors = rooms.map((r) => r.rugs[0].color);
    const rugHashes = rugColors.map((col, idx) => {
      const buf = renderRug(48, 32, col, idx + 1);
      let h = 2166136261;
      for (let i = 0; i < buf.data.length; i++) h = Math.imul(h ^ buf.data[i], 16777619);
      return h >>> 0;
    });
    expect(new Set(rugHashes).size).toBe(new Set(rugColors).size);

    // 3. Firmas de mobiliario distintas
    const furnSignatures = rooms.map((r) =>
      r.furniture
        .map((f) => `${f.kind}@${f.tx - r.rect.x},${f.ty - r.rect.y}`)
        .sort()
        .join('|'),
    );
    expect(new Set(furnSignatures).size).toBe(6);

    // 4. Invariantes de simulación y caminabilidad sin solapes
    for (const room of rooms) {
      const desks = room.spots.filter((s) => s.kind === 'desk');
      expect(desks, `${room.id} desks`).toHaveLength(6);
      expect(new Set(desks.map((d) => d.rank))).toEqual(new Set([0, 1, 2, 3, 4, 5]));
      expect(room.spots.filter((s) => s.kind === 'stool' || s.kind === 'nook').length).toBeGreaterThanOrEqual(2);
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

  it('el rótulo de cada sala dice el nombre de su espacio en La Voûte', () => {
    const nombres = VOUTE_SALAS.map((s) => vouteSalaNombre(s.id, true));
    expect(nombres).toEqual(['Entrada', 'Barra', 'Sala de maquillaje', 'Privados', 'Escenario', 'Habitación de Anaïs']);
  });

  it('roomTheme depende del modo: en modo normal una sala voute:* se sortea como en el upstream', () => {
    setVouteMode(false);
    for (const s of VOUTE_SALAS) for (const seed of [3, 17, 4242]) expect(roomTheme(seed, s.id)).toEqual(roomTheme(seed));
    setVouteMode(true);
    expect(roomTheme(3, 'voute:barra')).not.toEqual(roomTheme(3, 'voute:escenario'));
  });

  it('en la opción normal (!isVoute()), tanto el núcleo como las 6 salas se ven 100% como oficina normal sin restos de caché', () => {
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
