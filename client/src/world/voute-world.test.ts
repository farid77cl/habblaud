import { afterEach, describe, expect, it } from 'vitest';
import { setVouteMode } from '../art/voute';
import { layoutExterior } from './layout/exterior';
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
});
