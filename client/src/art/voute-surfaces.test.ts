import { afterEach, describe, expect, it } from 'vitest';
import { PixelBuf } from './core/pixbuf';
import { CHUNK_PX, floorChunk } from './surfaces/floor';
import { renderRug } from './surfaces/rug';
import { wallFaceTile } from './surfaces/walls';
import { VOUTE_THEMES, roomTheme } from './theme';
import { VP, isVoute, setVouteMode, vouteStyleOf } from './voute';
import { layoutCorridor } from '../world/layout/corridor';

function countColor(buf: PixelBuf, hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16;
  const g = (n >> 8) & 255;
  const b = n & 255;
  let c = 0;
  for (let i = 0; i < buf.data.length; i += 4) {
    if (buf.data[i + 3] > 200 && buf.data[i] === r && buf.data[i + 1] === g && buf.data[i + 2] === b) c++;
  }
  return c;
}

describe('La Voûte — temas de sala y superficies', () => {
  afterEach(() => {
    setVouteMode(false);
  });

  it('mapea las 5 salas de La Voûte a sus temas cabaret exactos cuando isVoute() está activo', () => {
    expect(isVoute()).toBe(false);
    setVouteMode(true);
    expect(isVoute()).toBe(true);

    expect(vouteStyleOf('voute:camarin')).toBe('camarin');
    expect(vouteStyleOf('voute:vip')).toBe('vip');
    expect(vouteStyleOf('voute:barra')).toBe('barra');
    expect(vouteStyleOf('voute:salon')).toBe('salon');
    expect(vouteStyleOf('voute:cabina')).toBe('cabina');

    expect(roomTheme(1, 'voute:camarin')).toEqual(VOUTE_THEMES.camarin);
    expect(roomTheme(2, 'voute:vip')).toEqual(VOUTE_THEMES.vip);
    expect(roomTheme(3, 'voute:barra')).toEqual(VOUTE_THEMES.barra);
    expect(roomTheme(4, 'voute:salon')).toEqual(VOUTE_THEMES.salon);
    expect(roomTheme(5, 'voute:cabina')).toEqual(VOUTE_THEMES.cabina);

    // En modo oficina vuelve a los temas normales.
    setVouteMode(false);
    expect(roomTheme(1, 'voute:camarin')).not.toEqual(VOUTE_THEMES.camarin);
  });

  it('reemplaza grass por asphalt (#1b1a20 / #24232b) en modo Voûte', () => {
    const normalGrass = floorChunk('grass', 0, 0, { seed: 7 });
    expect(countColor(normalGrass, VP.asphalt)).toBe(0);

    setVouteMode(true);
    const vouteGrass = floorChunk('grass', 0, 0, { seed: 7 });
    const explicitAsphalt = floorChunk('asphalt', 0, 0, { seed: 7 });
    expect(vouteGrass.countOpaque()).toBe(CHUNK_PX * CHUNK_PX);
    expect(vouteGrass.data).toEqual(explicitAsphalt.data);
    expect(countColor(vouteGrass, VP.asphalt)).toBeGreaterThan(CHUNK_PX * CHUNK_PX * 0.7);
    expect(countColor(vouteGrass, VP.asphalt2)).toBeGreaterThan(100);
  });

  it('renderiza alfombras de terciopelo carmesí (#8c2240) con borde dorado (#d4a64a), línea #3a0f1e y rombos #ff3fa4', () => {
    setVouteMode(true);
    const rug = renderRug(32, 24, '#3f7fd8', 11);
    expect(countColor(rug, VP.crimson)).toBeGreaterThan(100);
    expect(countColor(rug, VP.gold)).toBeGreaterThan(40);
    expect(countColor(rug, '#3a0f1e')).toBeGreaterThan(30);
    expect(countColor(rug, VP.pink)).toBeGreaterThan(10);
  });

  it('renderiza paredes con zócalo dorado #d4a64a (brillo #ffe08a) y apliques de luz cálida', () => {
    setVouteMode(true);
    const tileWithSconce = wallFaceTile({ base: '#2a0a12', trim: '#d4a64a', pattern: 'stripes' }, 0, 0);
    expect(countColor(tileWithSconce, VP.gold)).toBeGreaterThan(16);
    expect(countColor(tileWithSconce, VP.goldHi)).toBeGreaterThan(16);
  });

  it('viste el pasillo con piso oscuro #12090e y alfombra roja continua #8c2240', () => {
    setVouteMode(true);
    const corr = layoutCorridor(5);
    expect(corr.floors[0].tint).toBe('#12090e');
    expect(corr.rugs.length).toBeGreaterThanOrEqual(1);
    expect(corr.rugs.every((r) => r.color === VP.crimson)).toBe(true);
  });
});
