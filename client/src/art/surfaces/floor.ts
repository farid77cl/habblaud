// Pisos gerados em blocos ("chunks") de 8x8 tiles a partir de coordenadas de MUNDO (puro).
// Assim tábuas de madeira, veios de mármore e manchas do cimento continuam de um tile para o
// outro sem emendas, e o cache fica limitado ao tamanho do mundo (não ao formato das áreas).
import { TILE, type FloorKind } from '../api';
import { mix, parseColor, ramp, shade, type RGBA } from '../core/color';
import { PixelBuf } from '../core/pixbuf';
import { VP, isVoute } from '../voute';

export const CHUNK_TILES = 8;
export const CHUNK_PX = CHUNK_TILES * TILE;

/** Hash inteiro determinístico de até 3 coordenadas + semente. */
export function h3(a: number, b: number, c = 0, seed = 0): number {
  let h = Math.imul(a | 0, 0x9e3779b1) ^ Math.imul(b | 0, 0x85ebca77) ^ Math.imul(c | 0, 0xc2b2ae3d) ^ Math.imul(seed | 0, 0x27d4eb2f);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return h >>> 0;
}

function rnd01(a: number, b: number, c = 0, seed = 0): number {
  return h3(a, b, c, seed) / 4294967296;
}

/** Ruído de valor suave (bilinear) em coordenadas de mundo, 0..1. */
function noise(x: number, y: number, cell: number, seed: number): number {
  const gx = Math.floor(x / cell);
  const gy = Math.floor(y / cell);
  const fx = x / cell - gx;
  const fy = y / cell - gy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = rnd01(gx, gy, 0, seed);
  const b = rnd01(gx + 1, gy, 0, seed);
  const c = rnd01(gx, gy + 1, 0, seed);
  const d = rnd01(gx + 1, gy + 1, 0, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

export interface FloorOpts {
  seed: number;
  tint?: string;
  tint2?: string;
}

/** Gera o bloco (cx, cy) — em unidades de chunk — de um tipo de piso. */
export function floorChunk(kind: FloorKind, cx: number, cy: number, o: FloorOpts): PixelBuf {
  const voute = isVoute();
  const effKind: FloorKind = voute && kind === 'grass' ? 'asphalt' : kind;
  const b = new PixelBuf(CHUNK_PX, CHUNK_PX);
  const x0 = cx * CHUNK_PX;
  const y0 = cy * CHUNK_PX;
  switch (effKind) {
    case 'wood':
      paintWood(b, x0, y0, o.seed, voute);
      break;
    case 'concrete':
      paintConcrete(b, x0, y0, o.seed, voute);
      break;
    case 'marble':
      paintMarble(b, x0, y0, o.seed, voute);
      break;
    case 'sidewalk':
      paintSidewalk(b, x0, y0, o.seed, voute);
      break;
    default:
      for (let ty = 0; ty < CHUNK_TILES; ty++) {
        for (let tx = 0; tx < CHUNK_TILES; tx++) {
          b.ox = tx * TILE;
          b.oy = ty * TILE;
          paintTile(b, effKind, cx * CHUNK_TILES + tx, cy * CHUNK_TILES + ty, o, voute);
        }
      }
      b.ox = 0;
      b.oy = 0;
  }
  return b;
}

// ------------------------------------------------------------------ pisos por tile

function paintTile(b: PixelBuf, kind: FloorKind, tx: number, ty: number, o: FloorOpts, voute: boolean): void {
  const r = (i: number) => rnd01(tx, ty, i, o.seed);
  switch (kind) {
    case 'carpet': {
      // Placas de carpete modular: trama discreta que alterna de direção (xadrez de orientação).
      const c1 = o.tint ?? (voute ? '#2a0a12' : '#c9d1dc');
      const c2 = o.tint2 ?? shade(c1, voute ? 0.04 : -0.03);
      const odd = (tx + ty) & 1;
      const base = mix(c1, c2, odd ? 0.55 : 0.15);
      b.rect(0, 0, TILE, TILE, base);
      const weave = shade(base, -0.018);
      for (let a = 1; a < TILE - 1; a += 3) {
        for (let k = 1; k < TILE - 1; k++) {
          if ((k + a) % 4 === 0) continue;
          if (odd) b.set(k, a, weave);
          else b.set(a, k, weave);
        }
      }
      for (let i = 0; i < 3; i++) b.set(Math.floor(r(i) * 14) + 1, Math.floor(r(i + 9) * 14) + 1, shade(base, i % 2 ? 0.03 : -0.035));
      b.hline(0, TILE - 1, TILE - 1, shade(base, -0.06));
      b.vline(TILE - 1, 0, TILE - 1, shade(base, -0.06));
      b.hline(0, TILE - 2, 0, shade(base, 0.025));
      b.vline(0, 0, TILE - 2, shade(base, 0.025));
      break;
    }
    case 'tile_check': {
      const a = voute ? '#6a2540' : '#f2ede4';
      const c = voute ? '#401627' : '#d2d8de';
      for (let qy = 0; qy < 2; qy++) {
        for (let qx = 0; qx < 2; qx++) {
          const col = (qx + qy + tx + ty) % 2 ? c : a;
          b.rect(qx * 8, qy * 8, 8, 8, col);
          b.hline(qx * 8, qx * 8 + 6, qy * 8, shade(col, 0.02));
          b.hline(qx * 8, qx * 8 + 7, qy * 8 + 7, shade(col, -0.045));
          b.vline(qx * 8 + 7, qy * 8, qy * 8 + 7, shade(col, -0.045));
          if (r(qx + qy * 2) < 0.3) b.set(qx * 8 + 2 + Math.floor(r(5) * 4), qy * 8 + 2 + Math.floor(r(6) * 4), shade(col, -0.02));
        }
      }
      break;
    }
    case 'tile_white': {
      const col = voute ? '#240d17' : '#eef2f5';
      const grout = voute ? '#16080e' : '#d3dae1';
      const hi = voute ? '#3a1424' : '#fbfcfd';
      const speck = voute ? '#1c0a12' : '#e4eaef';
      b.rect(0, 0, TILE, TILE, col);
      for (let q = 0; q < 2; q++) {
        b.hline(0, TILE - 1, q * 8 + 7, grout);
        b.vline(q * 8 + 7, 0, TILE - 1, grout);
      }
      for (let qy = 0; qy < 2; qy++) for (let qx = 0; qx < 2; qx++) b.hline(qx * 8, qx * 8 + 2, qy * 8, hi);
      if (r(1) < 0.4) b.set(Math.floor(r(2) * 14), Math.floor(r(3) * 14), speck);
      break;
    }
    case 'asphalt': {
      b.rect(0, 0, TILE, TILE, VP.as1);
      for (let i = 0; i < 18; i++) {
        const x = Math.floor(r(i) * TILE);
        const y = Math.floor(r(i + 30) * TILE);
        b.set(x, y, VP.as2);
      }
      break;
    }
    case 'grass': {
      const g = ramp('#6cab57', 0.045);
      const n = noise(tx * TILE, ty * TILE, 48, o.seed + 5);
      const base = mix(g.dk, g.lt, n);
      b.rect(0, 0, TILE, TILE, base);
      for (let i = 0; i < 12; i++) {
        const x = Math.floor(r(i) * TILE);
        const y = Math.floor(r(i + 20) * TILE);
        const c = r(i + 40) < 0.5 ? shade(base, 0.05) : shade(base, -0.05);
        b.set(x, y, c);
        if (r(i + 60) < 0.5) b.set(x, y - 1, shade(c, 0.03));
      }
      for (let i = 0; i < 2; i++) {
        const x = 2 + Math.floor(r(i + 80) * 12);
        const y = 3 + Math.floor(r(i + 90) * 11);
        b.set(x, y, g.dd);
        b.set(x - 1, y - 1, g.dk);
        b.set(x + 1, y - 1, g.dk);
        b.set(x, y - 2, g.lt);
      }
      if (r(99) < 0.12) {
        const fx = 3 + Math.floor(r(100) * 10);
        const fy = 3 + Math.floor(r(101) * 10);
        const fc = ['#ffffff', '#f7d154', '#f28fb0', '#b9a2f0'][Math.floor(r(102) * 4)];
        b.set(fx, fy, fc);
        b.set(fx + 1, fy, fc);
        b.set(fx, fy - 1, fc);
        b.set(fx + 1, fy + 1, '#f2c14e');
      }
      break;
    }
    case 'street': {
      if (voute) {
        // La calle es más clara que el lote nocturno que la rodea (que no se funda en un solo negro).
        b.rect(0, 0, TILE, TILE, '#3a3748');
        for (let i = 0; i < 16; i++) {
          b.set(Math.floor(r(i) * TILE), Math.floor(r(i + 30) * TILE), r(i + 60) < 0.5 ? '#454256' : '#302d3d');
        }
        break;
      }
      const n = noise(tx * TILE, ty * TILE, 64, o.seed + 9);
      const col = mix('#4b4f58', '#565a63', n);
      b.rect(0, 0, TILE, TILE, col);
      for (let i = 0; i < 14; i++) b.set(Math.floor(r(i) * TILE), Math.floor(r(i + 30) * TILE), r(i + 60) < 0.5 ? '#5f636c' : '#43464e');
      break;
    }
    default:
      b.rect(0, 0, TILE, TILE, '#dcdedf');
  }
}

// ------------------------------------------------------------------ pisos contínuos

/** Tabela de cores (RGBA) pré-calculada para escrita rápida. */
function rgba(c: string): RGBA {
  return parseColor(c);
}

const WOOD_TONES = ['#c99668', '#c48f61', '#cf9f72', '#c6925f'] as const;
const WOOD: readonly (readonly RGBA[])[] = WOOD_TONES.map((t) =>
  [t, shade(t, 0.03), shade(t, -0.075), shade(t, -0.03), shade(t, -0.1), shade(t, 0.03), shade(t, -0.12)].map(rgba),
);

const VOUTE_WOOD_TONES = ['#5c3626', '#64402e', '#54301f', '#6c4634'] as const;
const VOUTE_WOOD: readonly (readonly RGBA[])[] = VOUTE_WOOD_TONES.map((t) =>
  [t, shade(t, 0.03), shade(t, -0.05), shade(t, -0.025), shade(t, -0.07), shade(t, 0.03), shade(t, -0.08)].map(rgba),
);

/** Tábuas de madeira: 4px de altura, 48px de comprimento, emendas desencontradas, veios e nós. */
function paintWood(b: PixelBuf, x0: number, y0: number, seed: number, voute: boolean): void {
  const palette = voute ? VOUTE_WOOD : WOOD;
  for (let py = 0; py < CHUNK_PX; py++) {
    const wy = y0 + py;
    const row = Math.floor(wy / 4);
    const iy = wy - row * 4;
    const off = h3(row, 0, 1, seed) % 48;
    for (let px = 0; px < CHUNK_PX; px++) {
      const wx = x0 + px + off;
      const plank = Math.floor(wx / 48);
      const ix = wx - plank * 48;
      const ph = h3(row, plank, 2, seed);
      const t = palette[ph % palette.length];
      let k = 0;
      if (ix === 0) k = 4;
      else if (iy === 3) k = 2;
      else if (iy === 0) k = ix === 1 ? 5 : 1;
      else if (iy === 2 && ix === 10 + ((ph >>> 12) % 20) && (ph >>> 20) % 5 === 0) k = 6;
      else if (iy === 1 + ((ph >>> 5) % 2) && (ix + (ph >>> 8)) % 23 < 7) k = 3;
      else if (ix === 1) k = 5;
      b.put(px, py, t[k]);
    }
  }
}

const LEVELS = 16;
const CONCRETE: readonly RGBA[] = Array.from({ length: LEVELS }, (_, i) => rgba(mix('#d6d9dc', '#e4e6e8', i / (LEVELS - 1))));
const CONCRETE_EDGE: readonly RGBA[] = CONCRETE.map((c) => rgba(shade(`rgb(${c[0]},${c[1]},${c[2]})`, 0.02)));
const CONCRETE_SEAM = rgba('#c8cdd2');
const CONCRETE_SPECK = [rgba('#cdd1d5'), rgba('#eceeef')] as const;

const VOUTE_CONCRETE: readonly RGBA[] = Array.from({ length: LEVELS }, (_, i) => rgba(mix('#3b2a55', '#46345f', i / (LEVELS - 1))));
const VOUTE_CONCRETE_EDGE: readonly RGBA[] = VOUTE_CONCRETE.map((c) => rgba(shade(`rgb(${c[0]},${c[1]},${c[2]})`, 0.02)));
const VOUTE_CONCRETE_SEAM = rgba('#241838');
const VOUTE_CONCRETE_SPECK = [rgba('#55407a'), rgba('#6a2a5a')] as const;

/** Cimento polido em placas de 2x2 tiles, com manchas suaves contínuas. */
function paintConcrete(b: PixelBuf, x0: number, y0: number, seed: number, voute: boolean): void {
  const levels = voute ? VOUTE_CONCRETE : CONCRETE;
  const edges = voute ? VOUTE_CONCRETE_EDGE : CONCRETE_EDGE;
  const seam = voute ? VOUTE_CONCRETE_SEAM : CONCRETE_SEAM;
  const speck = voute ? VOUTE_CONCRETE_SPECK : CONCRETE_SPECK;
  for (let py = 0; py < CHUNK_PX; py++) {
    for (let px = 0; px < CHUNK_PX; px++) {
      const wx = x0 + px;
      const wy = y0 + py;
      const sx = wx & 31;
      const sy = wy & 31;
      if (sx === 31 || sy === 31) {
        b.put(px, py, seam);
        continue;
      }
      const sp = h3(wx, wy, 3, seed) % 61;
      if (sp < 2) {
        b.put(px, py, speck[sp]);
        continue;
      }
      const n = noise(wx, wy, 26, seed) * 0.6 + noise(wx, wy, 7, seed + 3) * 0.4;
      const lv = Math.min(LEVELS - 1, Math.floor(n * LEVELS));
      b.put(px, py, sx === 0 || sy === 0 ? edges[lv] : levels[lv]);
    }
  }
}

const MARBLE: readonly RGBA[] = Array.from({ length: LEVELS }, (_, i) => rgba(mix('#ebe8e3', '#f5f3f0', i / (LEVELS - 1))));
const MARBLE_VEIN = [rgba('#e2e3e6'), rgba('#cfd2d7')] as const;
const MARBLE_SEAM = rgba('#d6d3ce');

const VOUTE_MARBLE: readonly RGBA[] = Array.from({ length: LEVELS }, (_, i) => rgba(mix('#3a1c2c', '#4a2438', i / (LEVELS - 1))));
const VOUTE_MARBLE_VEIN = [rgba('#7a2a45'), rgba('#d4a64a')] as const;
const VOUTE_MARBLE_SEAM = rgba('#22101a');

/** Mármore em placas de 2x2 tiles com veios contínuos dentro da placa. */
function paintMarble(b: PixelBuf, x0: number, y0: number, seed: number, voute: boolean): void {
  const levels = voute ? VOUTE_MARBLE : MARBLE;
  const vein = voute ? VOUTE_MARBLE_VEIN : MARBLE_VEIN;
  const seam = voute ? VOUTE_MARBLE_SEAM : MARBLE_SEAM;
  for (let py = 0; py < CHUNK_PX; py++) {
    for (let px = 0; px < CHUNK_PX; px++) {
      const wx = x0 + px;
      const wy = y0 + py;
      if ((wx & 31) === 31 || (wy & 31) === 31) {
        b.put(px, py, seam);
        continue;
      }
      const slab = h3(wx >> 5, wy >> 5, 4, seed);
      const ax = (slab % 1000) / 1000;
      const veined = (slab >>> 12) % 5 < 2;
      const v = veined ? Math.sin(wx * 0.08 + wy * (0.14 + ax * 0.1) + noise(wx, wy, 14, seed + 12) * 2.4 + ax * 6.28) : 0;
      if (v > 0.997) b.put(px, py, vein[1]);
      else if (v > 0.986) b.put(px, py, vein[0]);
      else b.put(px, py, levels[Math.min(LEVELS - 1, Math.floor(noise(wx, wy, 20, seed + 11) * LEVELS))]);
    }
  }
}

const WALK_TONES = ['#d3cdc2', '#cfc8bc', '#d8d2c8'] as const;
const WALK: readonly (readonly RGBA[])[] = WALK_TONES.map((t) => [t, '#b8b1a5', shade(t, 0.03), shade(t, -0.05)].map(rgba));

const VOUTE_WALK_TONES = ['#5a5670', '#524e68', '#625e7a'] as const;
const VOUTE_WALK: readonly (readonly RGBA[])[] = VOUTE_WALK_TONES.map((t) => [t, '#2a2838', shade(t, 0.03), shade(t, -0.04)].map(rgba));

/** Calçada de placas 16x8 em fileiras desencontradas. */
function paintSidewalk(b: PixelBuf, x0: number, y0: number, seed: number, voute: boolean): void {
  const walk = voute ? VOUTE_WALK : WALK;
  for (let py = 0; py < CHUNK_PX; py++) {
    for (let px = 0; px < CHUNK_PX; px++) {
      const wx = x0 + px;
      const wy = y0 + py;
      const row = wy >> 3;
      const off = row & 1 ? 8 : 0;
      const ix = (wx + off) & 15;
      const iy = wy & 7;
      const t = walk[h3((wx + off) >> 4, row, 5, seed) % walk.length];
      let k = 0;
      if (iy === 7 || ix === 15) k = 1;
      else if (iy === 0 || ix === 0) k = 2;
      else if (h3(wx, wy, 6, seed) % 41 === 0) k = 3;
      b.put(px, py, t[k]);
    }
  }
}
