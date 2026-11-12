// Catálogo de móveis em modo La Voûte (cabaret parisiense noturno).
// Usa as mesmas coordenadas de footprint de office.ts / common.ts / wall.ts:
// - mount 'floor': (0, 0) canto superior esquerdo do footprint; base no chão em y = h * TILE; y < 0 sobe.
// - mount 'wall': x ∈ [0, w*TILE], y = 0 rodapé, face da parede em y ∈ [-32, 0].
import type { FurnitureKind } from '../api';
import { ramp } from '../core/color';
import type { PixelBuf } from '../core/pixbuf';
import { floorSheet, rectAt, wallSheet, type BufFurniture } from '../core/sprite';
import { VP } from '../voute';
import { contact, frontFace, rngOf, topFace, underRect } from './kit';

type SwapFn = (variant: string | undefined, state: number, seed: number) => BufFurniture;

const VELVET = ramp(VP.b5, 0.08);
const BURGUNDY = ramp(VP.b7, 0.08);
const MAHOGANY = ramp('#3a141e', 0.07);
const GOLD = ramp(VP.or, 0.09);
const OBSIDIAN = ramp('#1b1218', 0.07);

function border(b: PixelBuf, x: number, y: number, w: number, h: number, c: string): void {
  b.hline(x, x + w - 1, y, c);
  b.hline(x, x + w - 1, y + h - 1, c);
  b.vline(x, y, y + h - 1, c);
  b.vline(x + w - 1, y, y + h - 1, c);
}

// 1. desk (2x1): Tocador con espejo iluminado (bombillas cálidas #ffe08a) y frascos de perfume.
function vouteDesk(_variant: string | undefined, seed: number): BufFurniture {
  const s = floorSheet(2, 1, 14);
  const b = s.buf;
  const r = rngOf(seed, 101);
  // Patas doradas y cajonera carmesí
  for (const x of [0, 29]) {
    b.rect(x, 8, 3, 8, GOLD.base);
    b.vline(x, 8, 15, GOLD.hi);
    b.vline(x + 2, 8, 15, GOLD.dk);
  }
  frontFace(b, 20, 8, 9, 7, VELVET);
  b.hline(22, 26, 10, VP.ol);
  b.hline(22, 26, 13, VP.ol);
  // Tablero de caoba oscura con filete dorado
  topFace(b, 0, 0, 32, 6, MAHOGANY);
  frontFace(b, 0, 6, 32, 2, GOLD);
  // Espejo Hollywood frontal (14x9 dentro de marco 16x11)
  b.rect(3, -8, 16, 11, GOLD.dk);
  b.rect(4, -7, 14, 9, '#1e0d18');
  for (const bx of [3, 7, 11, 15, 18]) {
    b.set(bx, -8, VP.ol);
    b.set(bx, 2, VP.ol);
  }
  for (const by of [-6, -3, 0]) {
    b.set(3, by, VP.ol);
    b.set(18, by, VP.ol);
  }
  b.rect(9, 3, 4, 2, GOLD.base);
  const scr = rectAt(s, 4, -7, 14, 9);
  // Segundo espejo/joyero lateral (screen2)
  b.rect(20, -5, 8, 6, GOLD.dk);
  b.rect(21, -4, 6, 4, '#2a0e1d');
  b.set(22, -3, VP.rn);
  b.set(25, -2, VP.ol);
  const scr2 = rectAt(s, 21, -4, 6, 4);
  // Frasco de perfume y copa de champán
  const perfume = r() < 0.5 ? VP.rn : VP.ol;
  b.rect(28, 1, 3, 4, perfume);
  b.set(29, 0, GOLD.hi);
  b.outline();
  underRect(b, 3, 8, 26, 7, 'rgba(30,10,20,0.28)');
  contact(b, -1, 13, 34, 4, 0.22);
  s.rects = { screen: scr, screen2: scr2 };
  return { base: s };
}

// 2. desk_back (2x1): Tocador visto desde atrás (trasera dorada clara/media del espejo).
function vouteDeskBack(_variant: string | undefined, seed: number): BufFurniture {
  const s = floorSheet(2, 1, 14);
  const b = s.buf;
  const r = rngOf(seed, 102);
  frontFace(b, 1, 8, 30, 6, VELVET);
  b.hline(1, 30, 8, VP.or);
  for (const x of [0, 29]) {
    b.rect(x, 8, 3, 8, GOLD.base);
    b.vline(x, 8, 15, GOLD.hi);
  }
  topFace(b, 0, 0, 32, 6, MAHOGANY);
  frontFace(b, 0, 6, 32, 2, GOLD);
  // Frasco de perfume y copa al norte
  b.rect(3, 1, 3, 4, r() < 0.5 ? VP.rn : VP.rg);
  b.set(4, 0, VP.ol);
  // Trasera de espejo en latón claro/dorado (legible como reverso)
  b.rect(8, -7, 16, 10, GOLD.lt);
  b.hline(8, 23, -7, VP.ol);
  b.rect(9, -6, 14, 8, GOLD.base);
  b.rect(13, -4, 6, 4, VP.ol);
  b.rect(14, 3, 4, 2, GOLD.dk);
  b.outline();
  contact(b, -1, 13, 34, 4, 0.22);
  return { base: s };
}

// 3. office_chair_front (1x1): Taburete capitoné con respaldo al norte.
function vouteChairFront(_variant: string | undefined): BufFurniture {
  const s = floorSheet(1, 1, 10);
  const b = s.buf;
  // Base dorada
  b.vline(7, 10, 14, GOLD.dk);
  b.vline(8, 10, 14, GOLD.hi);
  b.hline(4, 11, 14, GOLD.base);
  // Respaldo capitoné carmesí al norte
  topFace(b, 3, -6, 10, 2, GOLD);
  frontFace(b, 3, -4, 10, 8, VELVET);
  b.set(5, -1, VP.ol);
  b.set(10, -1, VP.ol);
  b.set(7, 1, VP.ol);
  // Cojín acolchado
  topFace(b, 2, 4, 12, 4, VELVET);
  frontFace(b, 2, 8, 12, 2, GOLD);
  b.outline();
  contact(b, 2, 13, 12, 3, 0.2);
  return { base: s };
}

// 4. office_chair (1x1): Taburete capitoné de espaldas (con capa front).
function vouteChairBack(_variant: string | undefined): BufFurniture {
  const base = floorSheet(1, 1, 8);
  const b = base.buf;
  b.vline(7, 10, 14, GOLD.dk);
  b.vline(8, 10, 14, GOLD.hi);
  b.hline(4, 11, 14, GOLD.base);
  topFace(b, 2, 4, 12, 4, VELVET);
  frontFace(b, 2, 8, 12, 2, GOLD);
  b.outline();
  contact(b, 2, 13, 12, 3, 0.2);

  const front = floorSheet(1, 1, 8);
  const f = front.buf;
  topFace(f, 3, -2, 10, 2, GOLD);
  frontFace(f, 3, 0, 10, 9, VELVET);
  f.set(5, 3, VP.ol);
  f.set(10, 3, VP.ol);
  f.set(7, 6, VP.ol);
  f.vline(7, 9, 12, GOLD.base);
  f.outline();
  return { base, front };
}

// 5. bookshelf (2x1): Perchero de vestuario cabaret con barra dorada y 3 trajes colgados (boa fucsia, vestido burdeos, estola marfil).
function vouteBookshelf(_seed: number): BufFurniture {
  const s = floorSheet(2, 1, 20);
  const b = s.buf;
  // Base de terciopelo y ébano con borde dorado
  b.rect(2, 11, 28, 3, '#1e1619');
  b.hline(2, 29, 11, VP.or);
  // Postes laterales de bronce (#d4a64a) y travesaño superior
  b.rect(3, -16, 2, 27, VP.or);
  b.rect(27, -16, 2, 27, VP.or);
  b.rect(3, -17, 26, 2, VP.ol);
  b.hline(3, 28, -15, VP.or);
  // Percha 1 (izquierda): Vestido de plumas / boa fucsia (#ff3fa4 / #ff8fcf)
  b.vline(9, -15, -12, VP.or);
  b.rect(6, -12, 7, 19, VP.rn);
  b.rect(7, -11, 5, 6, '#ff8fcf');
  b.hline(6, 12, 5, VP.ol);
  // Percha 2 (centro): Capa / vestido de terciopelo burdeos (#8c2240 / #5a1426) con corset negro
  b.vline(16, -15, -12, VP.or);
  b.rect(13, -12, 7, 20, VP.b5);
  b.rect(14, -10, 5, 6, '#0d0a0c');
  b.hline(14, 18, -7, VP.or);
  // Percha 3 (derecha): Estola de piel blanca marfil (#f3e6d0) y vestido noir (#0d0a0c)
  b.vline(23, -15, -12, VP.or);
  b.rect(20, -12, 6, 18, '#0d0a0c');
  b.rect(20, -12, 6, 7, '#f3e6d0');
  b.hline(20, 25, 4, VP.or);
  b.outline();
  contact(b, 0, 14, 32, 3, 0.22);
  return { base: s };
}

// 6. filing_cabinet (1x1): Cabina de luces y sonido (módulo rack con 6 LEDs #ff3fa4/#ffe08a y parlante dorado).
function vouteCabinet(): BufFurniture {
  const s = floorSheet(1, 1, 14);
  const b = s.buf;
  b.rect(2, -10, 12, 4, '#1e1619');
  b.rect(2, -6, 12, 21, '#0d0a0c');
  b.hline(2, 13, -6, VP.or);
  b.hline(2, 13, 3, VP.or);
  // 6 LEDs alternados (#ff3fa4 y #ffe08a) en el panel superior
  const leds = [VP.rn, VP.ol, VP.rn, VP.ol, VP.rn, VP.ol] as const;
  leds.forEach((col, i) => {
    const lx = 3 + (i % 3) * 4;
    const ly = -4 + Math.floor(i / 3) * 3;
    b.rect(lx, ly, 2, 2, col);
  });
  // Parlante con rejilla dorada (#d4a64a) abajo
  b.rect(4, 5, 8, 8, '#1e1619');
  b.ellipse(7.5, 9, 3, 3, VP.or);
  b.set(7, 9, '#0d0a0c');
  b.outline();
  contact(b, 1, 14, 14, 3, 0.22);
  return { base: s };
}

// 7. printer (1x1): Consola de luces y sonido con mesa mezcladora, 6 LEDs (#ff3fa4/#ffe08a) y monitor de retorno.
function voutePrinter(): BufFurniture {
  const s = floorSheet(1, 1, 12);
  const b = s.buf;
  b.rect(2, 0, 12, 5, '#1e1619');
  b.rect(2, 5, 12, 10, '#0d0a0c');
  b.hline(2, 13, 5, VP.or);
  // 6 LEDs de mezcla en la superficie (#ff3fa4 / #ffe08a)
  for (let i = 0; i < 6; i++) {
    b.set(3 + i * 2, 2, i % 2 === 0 ? VP.rn : VP.ol);
    b.set(3 + i * 2, 3, VP.or);
  }
  // Rejilla de parlante dorada en el frente
  b.rect(4, 7, 8, 6, VP.or);
  b.rect(5, 8, 6, 4, '#1e1619');
  b.hline(5, 10, 9, VP.ol);
  b.outline();
  contact(b, 1, 14, 14, 3, 0.2);
  return { base: s };
}

// 8. trash_bin (1x1): Cubitera de champán dorada con botella.
function vouteTrashBin(): BufFurniture {
  const s = floorSheet(1, 1, 6);
  const b = s.buf;
  topFace(b, 4, 5, 8, 2, GOLD);
  frontFace(b, 4, 7, 8, 7, GOLD);
  b.rect(5, 5, 6, 2, '#fff5e4');
  b.rect(7, 1, 2, 5, '#2d5a3c');
  b.rect(7, 0, 2, 2, VP.ol);
  b.outline();
  contact(b, 3, 13, 10, 3, 0.18);
  return { base: s };
}

// 9. plant_small (1x1): Pedestal negro (#1e1619) con arreglo de plumas fucsias (#ff3fa4) y candelabro dorado.
function voutePlantSmall(_variant?: string): BufFurniture {
  const s = floorSheet(1, 1, 8);
  const b = s.buf;
  b.rect(5, 8, 6, 7, '#1e1619');
  b.hline(5, 10, 8, VP.or);
  b.hline(4, 11, 14, VP.or);
  // Penacho de plumas de avestruz fucsias (#ff3fa4 / #ff8fcf) y burdeos (#8c2240)
  b.ellipse(7.5, 5, 4, 3.5, VP.b5);
  b.ellipse(7.5, 4, 3.5, 3, VP.rn);
  b.ellipse(7, 3, 2, 2, '#ff8fcf');
  // 3 velas encendidas (#ffe08a)
  for (const vx of [5, 7, 9]) {
    b.vline(vx, 1, 3, '#f3e6d0');
    b.set(vx, 0, VP.ol);
  }
  b.outline();
  contact(b, 4, 14, 8, 2, 0.18);
  return { base: s };
}

// 10. plant_tall (1x1): Pedestal alto negro (#1e1619) con boa de plumas (#ff3fa4) y candelabro de 3 velas (#d4a64a / #ffe08a).
function voutePlantTall(_variant?: string): BufFurniture {
  const s = floorSheet(1, 1, 16);
  const b = s.buf;
  // Pedestal columna negra (#1e1619) con capiteles dorados (#d4a64a)
  b.rect(4, 5, 8, 10, '#1e1619');
  b.hline(4, 11, 5, VP.or);
  b.hline(3, 12, 14, VP.or);
  // Boa de plumas fucsia (#ff3fa4) y carmesí (#8c2240) envolviendo la copa
  b.ellipse(7.5, 2, 4.5, 3.5, VP.b5);
  b.ellipse(7.5, 1, 4, 3, VP.rn);
  b.ellipse(7, 0, 2.5, 2, '#ff8fcf');
  // Candelabro dorado de 3 brazos con velas (#f3e6d0) y llamas (#ffe08a)
  b.vline(7, -6, 1, VP.or);
  b.hline(4, 10, -4, VP.or);
  for (const vx of [4, 7, 10]) {
    b.vline(vx, -7, -5, '#f3e6d0');
    b.set(vx, -8, VP.ol);
  }
  b.outline();
  contact(b, 3, 14, 10, 3, 0.2);
  return { base: s };
}

// 11. glass_partition (1x1): Biombo art-déco de latón dorado y vidrio ahumado borgoña.
function voutePartition(variant?: string): BufFurniture {
  const v = variant ?? 'h';
  const s = floorSheet(1, 1, 12);
  const b = s.buf;
  if (v === 'v') {
    b.rect(6, -8, 4, 24, GOLD.base);
    b.vline(7, -8, 15, VP.ol);
    b.outline();
    return { base: s };
  }
  if (v === 'end') {
    topFace(b, 5, -9, 6, 3, GOLD);
    frontFace(b, 5, -6, 6, 21, GOLD);
    b.ellipse(7.5, -9, 2, 2, VP.ol);
    b.outline();
    contact(b, 4, 14, 8, 3, 0.2);
    return { base: s };
  }
  // 'h'
  frontFace(b, 0, 6, 16, 9, BURGUNDY);
  b.hline(0, 15, 6, VP.or);
  b.rect(0, -8, 16, 14, 'rgba(140, 34, 64, 0.45)');
  b.hline(0, 15, -9, VP.or);
  b.hline(0, 15, -8, VP.ol);
  b.vline(0, -9, 14, VP.or);
  b.vline(15, -9, 14, VP.or);
  b.line(1, 5, 8, -7, 'rgba(212, 166, 74, 0.78)');
  b.line(14, 5, 8, -7, 'rgba(212, 166, 74, 0.78)');
  return { base: s };
}

// 12. binder_shelf (1x1): Estantería estrecha de botellas retroiluminada en rosa neón.
function vouteBinderShelf(seed: number): BufFurniture {
  const s = floorSheet(1, 1, 18);
  const b = s.buf;
  const r = rngOf(seed, 112);
  topFace(b, 2, -16, 12, 3, GOLD);
  frontFace(b, 2, -13, 12, 28, MAHOGANY);
  b.rect(3, -11, 10, 24, '#2a0818');
  b.hline(3, 12, -11, VP.rn);
  const cols = [VP.rn, VP.or, VP.ol, '#58c472'];
  for (const sy of [-4, 3, 10]) {
    b.hline(3, 12, sy, VP.or);
    for (let x = 4; x < 12; x += 2) {
      const c = cols[Math.floor(r() * cols.length)];
      b.rect(x, sy - 4, 1, 4, c);
      b.set(x, sy - 5, VP.ol);
    }
  }
  b.outline();
  contact(b, 1, 14, 14, 3, 0.22);
  return { base: s };
}

// 13. meeting_table (3x2): Mesa de cabaret con mantel carmesí y candelabros dorados.
function vouteMeetingTable(): BufFurniture {
  const s = floorSheet(3, 2, 6);
  const b = s.buf;
  for (const x of [10, 34]) {
    b.rect(x, 18, 4, 12, GOLD.dk);
    b.vline(x + 1, 18, 29, GOLD.hi);
  }
  b.hline(8, 39, 29, GOLD.base);
  topFace(b, 2, 2, 44, 16, VELVET);
  frontFace(b, 2, 18, 44, 5, VELVET);
  b.hline(2, 45, 18, VP.or);
  b.hline(2, 45, 22, VP.or);
  for (const cx of [16, 31]) {
    b.rect(cx, 8, 3, 2, GOLD.hi);
    b.rect(cx + 1, 5, 1, 3, VP.cr);
    b.set(cx + 1, 4, VP.ol);
    b.set(cx + 1, 3, VP.rn);
  }
  b.rect(23, 9, 2, 3, VP.ol);
  b.outline();
  contact(b, 2, 28, 44, 5, 0.22);
  return { base: s };
}

// 14. stool (1x1): Taburete alto de barra con cojín de terciopelo carmesí y pie dorado.
function vouteStool(): BufFurniture {
  const s = floorSheet(1, 1, 4);
  const b = s.buf;
  b.vline(7, 8, 14, GOLD.dk);
  b.vline(8, 8, 14, GOLD.hi);
  b.hline(4, 11, 14, GOLD.base);
  b.ellipse(7.5, 6, 4.5, 2.2, VELVET.base);
  b.hline(5, 10, 5, VELVET.hi);
  b.hline(5, 10, 7, VP.or);
  b.outline();
  contact(b, 4, 13, 8, 3, 0.18);
  return { base: s };
}

// 15. floor_lamp (1x1): Lámpara de pie de cabaret con pantalla de flecos carmesí/dorados (rects.glow).
function vouteFloorLamp(): BufFurniture {
  const s = floorSheet(1, 1, 16);
  const b = s.buf;
  b.ellipse(7.5, 14, 4, 1.5, GOLD.base);
  b.vline(7, -4, 14, GOLD.dk);
  b.vline(8, -4, 14, GOLD.hi);
  topFace(b, 3, -12, 10, 2, GOLD);
  frontFace(b, 3, -10, 10, 6, VELVET);
  b.hline(4, 11, -9, VP.rn);
  b.hline(3, 12, -4, VP.or);
  for (let x = 3; x <= 12; x += 2) b.set(x, -3, VP.ol);
  s.rects = { glow: rectAt(s, 4, -10, 8, 6) };
  b.outline();
  contact(b, 3, 13, 10, 3, 0.2);
  return { base: s };
}

// 16. water_cooler (1x1): Dispensador de champán / fuente dorada.
function vouteWaterCooler(): BufFurniture {
  const s = floorSheet(1, 1, 16);
  const b = s.buf;
  topFace(b, 3, -2, 10, 3, MAHOGANY);
  frontFace(b, 3, 1, 10, 14, MAHOGANY);
  b.hline(3, 12, 1, VP.or);
  b.rect(5, 4, 6, 4, '#1a0a12');
  b.set(6, 5, VP.rn);
  b.set(9, 5, VP.ol);
  topFace(b, 4, -11, 8, 2, GOLD);
  frontFace(b, 4, -9, 8, 7, GOLD);
  b.rect(5, -8, 6, 5, '#ffe89e');
  b.vline(6, -8, -4, '#fff7dc');
  b.outline();
  contact(b, 2, 14, 12, 3, 0.2);
  return { base: s };
}

// 17. whiteboard (3x0 wall): Cartelera de cabaret con marco dorado (rects.board).
function vouteWhiteboard(): BufFurniture {
  const s = wallSheet(3);
  const b = s.buf;
  const x = 2;
  const y = -27;
  const w = 44;
  const h = 19;
  b.rect(x, y, w, h, GOLD.base);
  b.hline(x, x + w - 1, y, VP.ol);
  b.rect(x + 2, y + 2, w - 4, h - 4, '#260b16');
  for (const bx of [x + 2, x + 12, x + 22, x + 32, x + 41]) b.set(bx, y + 1, VP.ol);
  b.rect(x + 3, y + h, w - 6, 2, GOLD.dk);
  b.outline();
  s.rects = { board: rectAt(s, x + 2, y + 2, w - 4, h - 4) };
  return { base: s };
}

// 18. window (2x0 wall): Ventana nocturna con cortinaje de terciopelo carmesí (rects.glass).
function vouteWindow(): BufFurniture {
  const s = wallSheet(2);
  const b = s.buf;
  const x = 2;
  const y = -27;
  const w = 28;
  const h = 19;
  b.rect(x, y, w, 2, GOLD.lt);
  b.rect(x, y + h - 2, w, 2, GOLD.base);
  b.rect(x, y, 2, h, GOLD.lt);
  b.rect(x + w - 2, y, 2, h, GOLD.base);
  b.rect(x + 13, y + 2, 2, h - 4, GOLD.base);
  b.rect(x + 2, y + 9, w - 4, 1, GOLD.base);
  // Cortinas de terciopelo carmesí a los lados
  b.rect(x + 2, y + 2, 4, h - 4, VELVET.base);
  b.rect(x + w - 6, y + 2, 4, h - 4, VELVET.base);
  b.hline(x + 2, x + 5, y + 11, VP.or);
  b.hline(x + w - 6, x + w - 3, y + 11, VP.or);
  b.rect(x - 1, y + h, w + 2, 2, GOLD.dk);
  b.outline();
  s.rects = { glass: rectAt(s, x + 2, y + 2, w - 4, h - 4) };
  return { base: s };
}

// 19. clock (1x0 wall): Reloj art-déco de latón dorado con esfera negra (rects.face).
function vouteClock(): BufFurniture {
  const s = wallSheet(1);
  const b = s.buf;
  b.ellipse(8, -20, 5.5, 5.5, GOLD.base);
  b.ellipse(8, -20, 4.2, 4.2, '#180912');
  for (const [dx, dy] of [[0, -3], [3, 0], [0, 3], [-3, 0]] as const) {
    b.set(8 + dx, -20 + dy, VP.ol);
  }
  b.outline();
  s.rects = { face: rectAt(s, 5, -23, 7, 7) };
  return { base: s };
}

// 20. poster (1x0 wall): Afiche de cabaret enmarcado en oro.
function voutePoster(variant?: string): BufFurniture {
  const s = wallSheet(1);
  const b = s.buf;
  b.rect(2, -26, 12, 17, GOLD.base);
  b.rect(3, -25, 10, 15, '#1e0814');
  b.hline(4, 11, -24, VP.or);
  if (variant === 'coffee' || variant === 'cat') {
    b.ellipse(8, -18, 3, 3, VP.rn);
    b.rect(6, -15, 4, 3, VP.ol);
  } else {
    b.ellipse(8, -20, 2.5, 2.5, VP.ol);
    b.rect(6, -17, 5, 5, VP.b5);
    b.set(8, -21, VP.rn);
  }
  b.outline();
  return { base: s };
}

// 21. painting (2x0 wall): Óleo de boudoir en marco barroco dorado (rects.art).
function voutePainting(): BufFurniture {
  const s = wallSheet(2);
  const b = s.buf;
  const x = 2;
  const y = -26;
  const w = 28;
  const h = 18;
  b.rect(x, y, w, h, GOLD.base);
  border(b, x + 1, y + 1, w - 2, h - 2, VP.ol);
  const ax = x + 2;
  const ay = y + 2;
  const aw = w - 4;
  const ah = h - 4;
  b.rect(ax, ay, aw, ah, '#2a0a16');
  b.rect(ax, ay + 8, aw, 6, VP.b5);
  b.ellipse(ax + 18, ay + 4, 2.5, 2.5, VP.ol);
  b.ellipse(ax + 10, ay + 10, 6, 2.5, VP.rn);
  b.outline();
  s.rects = { art: rectAt(s, ax, ay, aw, ah) };
  return { base: s };
}

// 22. tv (2x0 wall): Pantalla de cabaret enmarcada en latón y neón rosa (rects.tv).
function vouteTv(): BufFurniture {
  const s = wallSheet(2);
  const b = s.buf;
  const x = 1;
  const y = -26;
  const w = 30;
  const h = 17;
  b.rect(x, y, w, h, GOLD.base);
  b.rect(x + 2, y + 2, w - 4, h - 4, '#120812');
  b.set(16, y + h - 1, VP.rn);
  b.outline();
  s.rects = { tv: rectAt(s, x + 2, y + 2, w - 4, h - 4) };
  return { base: s };
}

// 23. light_switch (1x0 wall): Interruptor de latón dorado con joya luminosa.
function vouteLightSwitch(variant?: string): BufFurniture {
  const s = wallSheet(1);
  const b = s.buf;
  const on = (variant ?? 'on') === 'on';
  b.rect(6, -18, 4, 6, GOLD.base);
  b.rect(7, -16, 2, 2, on ? VP.rn : '#3a0f1e');
  b.outline();
  return { base: s };
}

// 24. elevator (2x0 wall): Ascensor art-déco de latón dorado.
function vouteElevator(state: number): BufFurniture {
  const s = wallSheet(2);
  const b = s.buf;
  const open = Math.max(0, Math.min(4, state));
  const gap = open * 3;
  b.rect(11, -31, 10, 3, GOLD.base);
  b.rect(13, -30, 6, 1, open > 0 ? VP.rn : VP.ol);
  b.rect(2, -28, 28, 28, GOLD.base);
  b.rect(4, -26, 24, 26, '#2a0a14');
  b.hline(4, 27, -25, VP.ol);
  b.rect(5, -23, 22, 14, VELVET.dk);
  b.hline(5, 26, -14, VP.or);
  const leafW = 12 - gap;
  if (leafW > 0) {
    b.rect(4, -26, leafW, 26, GOLD.base);
    b.vline(4 + leafW - 1, -26, -1, '#120810');
    if (leafW > 2) b.vline(5, -25, -2, VP.ol);
    const rx = 28 - leafW;
    b.rect(rx, -26, leafW, 26, GOLD.base);
    b.vline(rx, -26, -1, '#120810');
    if (leafW > 2) b.vline(rx + leafW - 2, -25, -2, GOLD.dk);
  }
  b.outline();
  return { base: s };
}

// 25. door_frame (2x0 wall): Marco de puerta con cortinaje de terciopelo carmesí.
function vouteDoorFrame(): BufFurniture {
  const s = wallSheet(2);
  const b = s.buf;
  b.rect(0, -29, 32, 3, GOLD.base);
  b.hline(0, 31, -29, VP.ol);
  b.rect(0, -26, 4, 26, VELVET.base);
  b.vline(3, -26, -1, VP.or);
  b.rect(28, -26, 4, 26, VELVET.base);
  b.vline(28, -26, -1, VP.or);
  b.outline();
  return { base: s };
}

// 26. sign (3x0 wall): Marquesina luminosa de cabaret en latón y terciopelo (rects.sign).
function vouteSign(): BufFurniture {
  const s = wallSheet(3);
  const b = s.buf;
  b.rect(2, -25, 44, 12, GOLD.base);
  b.rect(4, -23, 40, 8, '#2a0a14');
  b.set(5, -19, VP.rn);
  b.set(42, -19, VP.rn);
  b.outline();
  s.rects = { sign: rectAt(s, 7, -23, 34, 8) };
  return { base: s };
}

// 27. mirror (1x0 wall): Espejo de camerino con bombillas cálidas #ffe08a (rects.glass).
function vouteMirror(): BufFurniture {
  const s = wallSheet(1);
  const b = s.buf;
  b.rect(2, -26, 12, 18, GOLD.base);
  b.rect(4, -24, 8, 14, '#2b1324');
  for (let i = 0; i < 10; i++) b.set(4 + (i % 7), -23 + i, '#592848');
  for (const by of [-25, -21, -17, -13, -10]) {
    b.set(2, by, VP.ol);
    b.set(13, by, VP.ol);
  }
  b.outline();
  s.rects = { glass: rectAt(s, 4, -24, 8, 14) };
  return { base: s };
}

// 28. shelf_wall (2x0 wall): Repisa dorada con botellas de licor y copas.
function vouteShelfWall(): BufFurniture {
  const s = wallSheet(2);
  const b = s.buf;
  b.rect(2, -14, 28, 2, GOLD.base);
  b.hline(2, 29, -15, VP.ol);
  b.rect(5, -20, 3, 5, VP.rn);
  b.set(6, -21, VP.ol);
  b.rect(10, -21, 3, 6, '#388e56');
  b.set(11, -22, VP.ol);
  b.rect(16, -19, 4, 4, VP.or);
  b.rect(23, -20, 3, 5, VP.b5);
  b.set(24, -21, VP.ol);
  b.outline();
  return { base: s };
}

// 29. counter (1x1): Barra de caoba oscura con encimera de mármol negro y riel de latón.
function vouteCounter(variant?: string): BufFurniture {
  const s = floorSheet(1, 1, 10);
  const b = s.buf;
  topFace(b, 0, -4, 16, 6, OBSIDIAN);
  frontFace(b, 0, 2, 16, 13, MAHOGANY);
  b.hline(0, 15, 2, VP.or);
  b.hline(0, 15, 13, VP.or);
  if (variant === 'drawers') {
    for (const y of [5, 9]) {
      b.hline(2, 13, y, MAHOGANY.dk);
      b.rect(6, y + 1, 4, 1, VP.ol);
    }
  } else {
    b.rect(3, 5, 10, 6, VELVET.dk);
    b.set(7, 8, VP.ol);
  }
  b.outline();
  contact(b, 0, 14, 16, 3, 0.2);
  return { base: s };
}

// 30. counter_sink (1x1): Lavacopas de barra con grifo dorado.
function vouteCounterSink(): BufFurniture {
  const f = vouteCounter('plain');
  const b = f.base.buf;
  b.rect(3, -3, 10, 4, GOLD.dk);
  b.rect(4, -2, 8, 2, '#120810');
  b.vline(8, -7, -3, GOLD.hi);
  b.hline(6, 8, -7, VP.ol);
  b.outline();
  return f;
}

// 31. coffee_machine (1x1): Máquina de espresso / grifo dorado de cócteles (state 1 = sirviendo).
function vouteCoffeeMachine(state: number): BufFurniture {
  const f = vouteCounter('plain');
  const b = f.base.buf;
  topFace(b, 3, -9, 10, 2, GOLD);
  frontFace(b, 3, -7, 10, 7, GOLD);
  b.rect(5, -5, 6, 4, '#1a0a12');
  b.rect(6, -3, 3, 2, VP.cr);
  b.set(4, -6, state === 1 ? VP.rn : VP.ol);
  if (state === 1) {
    b.vline(7, -4, -3, VP.rn);
    b.set(6, -10, VP.rg);
  }
  b.outline();
  return f;
}

// 32. microwave (1x1): Destilador de absenta / calentador dorado sobre la barra.
function vouteMicrowave(): BufFurniture {
  const f = vouteCounter('drawers');
  const b = f.base.buf;
  topFace(b, 2, -8, 12, 2, GOLD);
  frontFace(b, 2, -6, 12, 6, GOLD);
  b.rect(3, -5, 7, 4, '#1a2e22');
  b.set(5, -3, '#6eff9e');
  b.set(11, -3, VP.rn);
  b.outline();
  return f;
}

// 33. fridge (1x1): Cava de champán refrigerada con puerta de cristal.
function vouteFridge(): BufFurniture {
  const s = floorSheet(1, 1, 18);
  const b = s.buf;
  topFace(b, 1, -16, 14, 3, OBSIDIAN);
  frontFace(b, 1, -13, 14, 28, OBSIDIAN);
  border(b, 2, -11, 12, 24, VP.or);
  b.rect(3, -10, 10, 22, '#260b18');
  for (const sy of [-4, 2, 8]) {
    b.hline(3, 12, sy, VP.or);
    b.rect(4, sy - 3, 2, 3, '#388e56');
    b.rect(7, sy - 3, 2, 3, VP.rn);
    b.rect(10, sy - 3, 2, 3, VP.ol);
  }
  b.vline(13, -6, 2, GOLD.hi);
  b.outline();
  contact(b, 1, 14, 14, 3, 0.22);
  return { base: s };
}

// 34. vending_machine (1x1): Vitrina iluminada de licores y copas con neón rosa (rects.glow).
function vouteVendingMachine(): BufFurniture {
  const s = floorSheet(1, 1, 18);
  const b = s.buf;
  topFace(b, 1, -16, 14, 3, BURGUNDY);
  frontFace(b, 1, -13, 14, 28, BURGUNDY);
  b.rect(2, -11, 9, 18, '#1e0814');
  border(b, 2, -11, 9, 18, VP.or);
  const cols = [VP.rn, VP.ol, VP.or, '#58c472'];
  for (let row = 0; row < 3; row++) {
    const ry = -8 + row * 5;
    b.hline(3, 9, ry + 2, GOLD.dk);
    for (let c = 0; c < 3; c++) b.rect(3 + c * 2, ry, 2, 2, cols[(row + c) % cols.length]);
  }
  b.rect(12, -6, 2, 4, VP.rn);
  b.rect(3, 9, 8, 4, '#12060c');
  s.rects = { glow: rectAt(s, 2, -11, 9, 18) };
  b.outline();
  contact(b, 1, 14, 14, 3, 0.22);
  return { base: s };
}

// 35. cafe_table (1x1): Mesita redonda de cabaret con mantel carmesí y vela cálida.
function vouteCafeTable(): BufFurniture {
  const s = floorSheet(1, 1, 6);
  const b = s.buf;
  b.vline(7, 6, 14, GOLD.dk);
  b.vline(8, 6, 14, GOLD.hi);
  b.hline(4, 11, 14, GOLD.base);
  b.ellipse(7.5, 4, 6.5, 3.2, VELVET.base);
  b.ellipse(7.5, 3.5, 5.2, 2.2, VELVET.lt);
  b.rect(7, 1, 2, 2, VP.cr);
  b.set(7, 0, VP.ol);
  b.set(8, 0, VP.rn);
  b.outline();
  contact(b, 3, 13, 10, 3, 0.18);
  return { base: s };
}

// 36. cafe_chair (1x1): Silla Thonet negra/dorada con cojín de terciopelo carmesí.
function vouteCafeChair(variant?: string): BufFurniture {
  const dir = variant ?? 'down';
  const base = floorSheet(1, 1, 8);
  const b = base.buf;
  b.vline(5, 9, 14, GOLD.dk);
  b.vline(10, 9, 14, GOLD.dk);
  if (dir === 'down') {
    topFace(b, 4, -4, 8, 2, GOLD);
    frontFace(b, 4, -2, 8, 7, VELVET);
  }
  topFace(b, 4, 5, 8, 3, VELVET);
  frontFace(b, 4, 8, 8, 2, GOLD);
  if (dir === 'left' || dir === 'right') {
    const bx = dir === 'left' ? 10 : 4;
    frontFace(b, bx, -3, 2, 8, GOLD);
  }
  b.outline();
  contact(b, 3, 13, 10, 3, 0.18);
  if (dir === 'up') {
    const front = floorSheet(1, 1, 8);
    topFace(front.buf, 4, -1, 8, 2, GOLD);
    frontFace(front.buf, 4, 1, 8, 8, VELVET);
    front.buf.outline();
    return { base, front };
  }
  return { base };
}

// 37. sofa (3x1): Sofá Chesterfield de cuero/terciopelo borgoña con botones dorados.
function vouteSofa(variant?: string): BufFurniture {
  const dir = variant ?? 'down';
  const base = floorSheet(3, 1, 10);
  const b = base.buf;
  if (dir === 'down') {
    topFace(b, 2, -6, 44, 4, VELVET);
    frontFace(b, 2, -2, 44, 9, VELVET);
    topFace(b, 5, 4, 38, 6, VELVET);
    frontFace(b, 5, 10, 38, 5, BURGUNDY);
    for (const x of [12, 20, 28, 36]) {
      b.set(x, 0, VP.ol);
      b.set(x, 11, GOLD.dk);
    }
    topFace(b, 2, -2, 4, 8, BURGUNDY);
    frontFace(b, 2, 6, 4, 9, BURGUNDY);
    topFace(b, 42, -2, 4, 8, BURGUNDY);
    frontFace(b, 42, 6, 4, 9, BURGUNDY);
    b.rect(7, 2, 6, 4, GOLD.base);
    b.rect(35, 2, 6, 4, GOLD.base);
    b.outline();
    contact(b, 1, 13, 46, 4, 0.22);
    return { base };
  }
  // 'up' — de espaldas a la cámara (respaldo continuo en front)
  topFace(b, 5, 2, 38, 6, VELVET);
  frontFace(b, 5, 8, 38, 6, BURGUNDY);
  topFace(b, 2, -1, 4, 8, BURGUNDY);
  frontFace(b, 2, 7, 4, 8, BURGUNDY);
  topFace(b, 42, -1, 4, 8, BURGUNDY);
  frontFace(b, 42, 7, 4, 8, BURGUNDY);
  b.outline();
  contact(b, 1, 13, 46, 4, 0.22);

  const front = floorSheet(3, 1, 10);
  topFace(front.buf, 2, 0, 44, 4, VELVET);
  frontFace(front.buf, 2, 4, 44, 11, VELVET);
  front.buf.hline(3, 44, 4, VP.or);
  front.buf.outline();
  return { base, front };
}

// 38. armchair (1x1): Butaca club de terciopelo carmesí con vivos dorados.
function vouteArmchair(variant?: string): BufFurniture {
  const dir = variant ?? 'down';
  const base = floorSheet(1, 1, 8);
  const b = base.buf;
  if (dir === 'up') {
    topFace(b, 2, 2, 12, 6, VELVET);
    frontFace(b, 2, 8, 12, 6, BURGUNDY);
    b.outline();
    contact(b, 1, 13, 14, 3, 0.2);
    const front = floorSheet(1, 1, 8);
    topFace(front.buf, 2, -1, 12, 3, VELVET);
    frontFace(front.buf, 2, 2, 12, 11, VELVET);
    front.buf.hline(3, 13, 4, VP.or);
    front.buf.outline();
    return { base, front };
  }
  if (dir === 'down') {
    topFace(b, 2, -5, 12, 3, VELVET);
    frontFace(b, 2, -2, 12, 8, VELVET);
  }
  topFace(b, 3, 4, 10, 5, VELVET);
  frontFace(b, 3, 9, 10, 5, BURGUNDY);
  topFace(b, 1, 0, 3, 7, BURGUNDY);
  frontFace(b, 1, 7, 3, 7, BURGUNDY);
  topFace(b, 12, 0, 3, 7, BURGUNDY);
  frontFace(b, 12, 7, 3, 7, BURGUNDY);
  b.set(8, 0, VP.ol);
  b.outline();
  contact(b, 1, 13, 14, 3, 0.2);
  return { base };
}

// 39. coffee_table (2x1): Mesa baja dorada con bandeja de champán y copas.
function vouteCoffeeTable(): BufFurniture {
  const s = floorSheet(2, 1, 4);
  const b = s.buf;
  b.rect(4, 10, 2, 5, GOLD.dk);
  b.rect(26, 10, 2, 5, GOLD.dk);
  topFace(b, 2, 3, 28, 6, MAHOGANY);
  frontFace(b, 2, 9, 28, 3, GOLD);
  b.rect(11, 4, 10, 4, GOLD.base);
  b.rect(13, 3, 2, 2, VP.ol);
  b.rect(17, 3, 2, 2, VP.rn);
  b.outline();
  contact(b, 2, 13, 28, 3, 0.2);
  return { base: s };
}

// 40. pingpong_table (3x2): Gran piano de cola negro (#0d0a0c) con teclado marfil (#f3e6d0) y candelabro dorado (#d4a64a).
function voutePingpongTable(): BufFurniture {
  const s = floorSheet(3, 2, 6);
  const b = s.buf;
  // Patas torneadas en ébano y bronce con pedales dorados
  for (const x of [6, 22, 39]) {
    b.rect(x, 19, 3, 10, '#0d0a0c');
    b.hline(x, x + 2, 28, VP.or);
  }
  b.rect(18, 25, 5, 3, VP.or);
  // Caja armónica del piano de cola (curva en el lado derecho, recta al frente/izquierda)
  b.rect(3, 3, 32, 16, '#0d0a0c');
  b.rect(35, 5, 9, 12, '#0d0a0c');
  b.rect(4, 4, 30, 13, '#1e1619');
  b.rect(34, 6, 8, 9, '#1e1619');
  // Filete dorado perimetral y atril
  b.hline(3, 34, 18, VP.or);
  b.rect(12, 2, 12, 3, VP.or);
  // Tapa entreabierta con puntal dorado e interior carmesí (#8c2240)
  b.rect(7, 5, 24, 7, VP.b5);
  b.line(30, 12, 35, 3, VP.or);
  // Teclado de marfil (#f3e6d0) con sostenidos en ébano (#0d0a0c) en el frente izquierdo/sur
  b.rect(5, 14, 24, 4, '#f3e6d0');
  for (let kx = 6; kx < 28; kx += 2) {
    if (kx % 6 !== 0) b.rect(kx, 14, 1, 2, '#0d0a0c');
  }
  // Candelabro dorado (#d4a64a) con 3 velas encendidas (#ffe08a) sobre la cola
  b.rect(36, 7, 5, 2, VP.or);
  for (const cx of [36, 38, 40]) {
    b.vline(cx, 4, 6, '#f3e6d0');
    b.set(cx, 3, VP.ol);
  }
  b.outline();
  contact(b, 2, 28, 44, 5, 0.22);
  return { base: s };
}

// 41. beanbag (1x1): Puff redondo de terciopelo con borla dorada.
function vouteBeanbag(variant?: string): BufFurniture {
  const col = variant === 'blue' ? '#6b1630' : variant === 'yellow' ? VP.or : VP.b5;
  const m = ramp(col, 0.08);
  const s = floorSheet(1, 1, 4);
  const b = s.buf;
  b.ellipse(7.5, 9, 6, 4.5, m.base);
  b.ellipse(7, 7.5, 4.5, 3, m.lt);
  b.hline(4, 11, 10, VP.or);
  b.set(7, 7, VP.ol);
  b.outline();
  contact(b, 2, 12, 12, 3, 0.2);
  return { base: s };
}

// 42. arcade (1x1): Máquina de burlesque / jukebox neón con pantalla animada (rects.screen).
function vouteArcade(): BufFurniture {
  const s = floorSheet(1, 1, 16);
  const b = s.buf;
  topFace(b, 2, -14, 12, 3, BURGUNDY);
  frontFace(b, 2, -11, 12, 26, BURGUNDY);
  b.rect(3, -11, 10, 3, VP.rn);
  b.hline(4, 11, -10, VP.ol);
  b.rect(3, -7, 10, 7, '#120612');
  b.set(5, -5, VP.rn);
  b.set(9, -4, VP.ol);
  b.set(7, -2, '#58c472');
  b.rect(2, 0, 12, 3, GOLD.base);
  b.set(5, 1, VP.rn);
  b.set(8, 1, VP.ol);
  b.set(10, 1, VP.b5);
  b.rect(6, 6, 4, 6, GOLD.dk);
  s.rects = { screen: rectAt(s, 4, -6, 8, 5) };
  b.outline();
  contact(b, 2, 14, 12, 3, 0.22);
  return { base: s };
}

// 43. toilet_stall (2x2): Cabina boudoir con cortina de terciopelo carmesí (con front).
function vouteToiletStall(state: number): BufFurniture {
  const occupied = state === 1;
  const base = floorSheet(2, 2, 8);
  const b = base.buf;
  b.rect(2, -4, 28, 32, '#1e0b14');
  b.vline(1, -6, 28, GOLD.base);
  b.vline(30, -6, 28, GOLD.base);
  topFace(b, 12, -2, 8, 3, OBSIDIAN);
  frontFace(b, 12, 1, 8, 6, OBSIDIAN);
  b.ellipse(16, 10, 4, 3, GOLD.base);
  b.ellipse(16, 10, 2.5, 1.8, '#2a0f1d');
  b.outline();

  const front = floorSheet(2, 2, 8);
  const f = front.buf;
  f.rect(1, -6, 30, 3, GOLD.base);
  f.hline(1, 30, -6, VP.ol);
  frontFace(f, 1, -3, 7, 33, VELVET);
  frontFace(f, 24, -3, 7, 33, VELVET);
  if (occupied) {
    frontFace(f, 8, -1, 16, 30, VELVET);
    f.vline(16, 0, 28, VP.or);
    f.rect(20, 12, 2, 2, VP.rn);
  } else {
    frontFace(f, 8, -1, 6, 30, VELVET);
    f.vline(13, 0, 28, VP.or);
    f.rect(21, 12, 2, 2, VP.ol);
  }
  f.outline();
  return { base, front };
}

// 44. sink (1x1): Tocador con lavabo de porcelana negra y grifería de latón dorado.
function vouteSink(): BufFurniture {
  const s = floorSheet(1, 1, 8);
  const b = s.buf;
  topFace(b, 2, 0, 12, 4, MAHOGANY);
  frontFace(b, 2, 4, 12, 11, MAHOGANY);
  b.hline(2, 13, 4, VP.or);
  b.ellipse(8, 2, 4.5, 2, GOLD.base);
  b.ellipse(8, 2.2, 3.2, 1.3, '#1a0a14');
  b.vline(8, -2, 0, VP.ol);
  b.set(8, -2, VP.or);
  b.outline();
  contact(b, 2, 14, 12, 3, 0.2);
  return { base: s };
}

// 45. reception_desk (3x1): Mostrador de bienvenida con capitoné carmesí y lámpara cálida.
function vouteReceptionDesk(): BufFurniture {
  const s = floorSheet(3, 1, 10);
  const b = s.buf;
  topFace(b, 1, -4, 46, 6, MAHOGANY);
  frontFace(b, 1, 2, 46, 13, MAHOGANY);
  b.rect(4, 4, 40, 9, VELVET.base);
  border(b, 4, 4, 40, 9, VP.or);
  for (let x = 8; x < 42; x += 6) {
    b.set(x, 7, VP.ol);
    b.set(x + 3, 9, VP.ol);
  }
  b.rect(10, -7, 6, 3, VP.or);
  b.hline(11, 14, -8, VP.ol);
  b.rect(22, -3, 8, 3, GOLD.hi);
  b.rect(36, -4, 4, 4, VP.rn);
  b.outline();
  contact(b, 1, 14, 46, 4, 0.22);
  return { base: s };
}

// 46. bench (2x1): Banqueta de terciopelo carmesí con patas de latón dorado.
function vouteBench(): BufFurniture {
  const s = floorSheet(2, 1, 4);
  const b = s.buf;
  for (const x of [4, 26]) {
    b.rect(x, 10, 2, 5, GOLD.dk);
    b.vline(x, 10, 14, GOLD.hi);
  }
  topFace(b, 2, 4, 28, 5, VELVET);
  frontFace(b, 2, 9, 28, 3, GOLD);
  for (const x of [8, 16, 24]) b.set(x, 6, VP.ol);
  b.outline();
  contact(b, 2, 13, 28, 3, 0.2);
  return { base: s };
}

// 47. stanchion (1x1): Poste de latón dorado con base y bola, cuerda de terciopelo carmesí hacia los lados (cordón VIP).
function vouteStanchion(variant?: string): BufFurniture {
  const s = floorSheet(1, 1, 10);
  const b = s.buf;
  const left = variant !== 'l';
  const right = variant !== 'r';
  // Cuerda: cae en catenaria entre postes vecinos (llega hasta el borde del tile)
  const rope = (x0: number, x1: number) => {
    b.hline(x0, x1, -3, VP.b5);
    b.hline(x0, x1, -2, VP.b7);
    b.set(Math.round((x0 + x1) / 2), -1, VP.b7);
  };
  if (left) rope(0, 6);
  if (right) rope(9, 15);
  // Poste: base de disco, fuste y bola con brillo
  b.ellipse(7.5, 13, 5, 2, GOLD.dk);
  b.ellipse(7.5, 12, 4.5, 1.7, GOLD.base);
  b.vline(7, -5, 11, GOLD.base);
  b.vline(8, -5, 11, GOLD.dk);
  b.vline(6, -3, 10, GOLD.hi);
  b.ellipse(7.5, -7, 2.5, 2.5, GOLD.base);
  b.set(6, -8, VP.ol);
  b.outline();
  contact(b, 2, 13, 12, 3, 0.2);
  return { base: s };
}

// 48. canopy_bed (3x2): Cama con dosel de terciopelo, cuatro postes dorados, cortinas rosas y cobertor carmesí.
function vouteCanopyBed(): BufFurniture {
  const s = floorSheet(3, 2, 28);
  const b = s.buf;
  const SHEET = ramp('#f3e6d0', 0.05);
  const PINK = ramp('#c9577f', 0.07);
  // Cabecera tallada y marco de la cama
  frontFace(b, 2, -4, 44, 12, MAHOGANY);
  b.hline(2, 45, -4, VP.or);
  for (const x of [6, 14, 22, 30, 38]) b.vline(x, -2, 6, MAHOGANY.dd);
  // Colchón con sábana crema, almohadas y cobertor carmesí con ribete dorado
  topFace(b, 3, 7, 42, 14, SHEET);
  b.ellipse(14, 11, 7, 3, PINK.lt);
  b.ellipse(34, 11, 7, 3, PINK.lt);
  b.hline(9, 19, 10, PINK.hi);
  b.hline(29, 39, 10, PINK.hi);
  frontFace(b, 3, 15, 42, 8, VELVET);
  b.hline(3, 44, 15, VP.or);
  b.hline(3, 44, 17, VELVET.hi);
  b.vline(24, 18, 22, VELVET.dk);
  frontFace(b, 2, 23, 44, 5, MAHOGANY);
  b.hline(2, 45, 23, VP.or);
  // Dosel: faldón superior, cortinas recogidas a los lados y cuatro postes dorados
  b.rect(0, -26, 48, 4, VELVET.dk);
  b.hline(0, 47, -26, VP.or);
  b.hline(0, 47, -22, VP.or);
  for (let x = 3; x < 46; x += 6) b.set(x, -21, VP.ol);
  b.rect(3, -21, 7, 17, PINK.base);
  b.rect(38, -21, 7, 17, PINK.base);
  for (const x of [5, 7, 40, 42]) b.vline(x, -20, -6, PINK.dk);
  for (const x of [0, 45]) {
    b.rect(x, -26, 3, 53, GOLD.base);
    b.vline(x, -26, 26, GOLD.hi);
    b.vline(x + 2, -26, 26, GOLD.dk);
    b.rect(x, -28, 3, 2, VP.ol);
  }
  b.outline();
  contact(b, 0, 26, 48, 5, 0.22);
  return { base: s };
}

// 49. stage_piano (4x2): Tarima de escenario con candilejas doradas, piano de cola negro y candelabro.
function vouteStagePiano(): BufFurniture {
  const s = floorSheet(4, 2, 26);
  const b = s.buf;
  const BOARDS = ramp('#6b3a24', 0.07);
  // Tarima de tablones con frente dorado y candilejas encendidas
  topFace(b, 0, 8, 64, 16, BOARDS);
  for (let x = 4; x < 64; x += 8) b.vline(x, 9, 22, BOARDS.dk);
  frontFace(b, 0, 24, 64, 5, VELVET);
  b.hline(0, 63, 24, VP.or);
  b.hline(0, 63, 28, GOLD.dk);
  for (let x = 3; x < 62; x += 6) {
    b.set(x, 26, VP.ol);
    b.set(x + 1, 26, VP.ol);
  }
  // Piano de cola sobre la tarima: tapa abierta, caja, teclado de marfil y patas
  b.rect(10, -8, 36, 6, '#0d0a0c');
  b.rect(12, -7, 32, 4, VP.b5);
  b.line(44, -3, 50, -14, VP.or);
  b.rect(8, -2, 40, 16, '#0d0a0c');
  b.rect(9, -1, 38, 13, '#1e1619');
  b.rect(46, 0, 8, 11, '#0d0a0c');
  b.rect(47, 1, 6, 9, '#1e1619');
  b.hline(8, 47, 14, VP.or);
  b.rect(11, 9, 30, 4, '#f3e6d0');
  for (let kx = 12; kx < 40; kx += 2) if (kx % 6 !== 0) b.rect(kx, 9, 1, 2, '#0d0a0c');
  for (const x of [10, 28, 50]) b.rect(x, 14, 3, 8, '#0d0a0c');
  b.rect(27, 20, 5, 2, VP.or);
  // Candelabro dorado con tres velas sobre la cola
  b.rect(49, -1, 5, 2, VP.or);
  for (const cx of [49, 51, 53]) {
    b.vline(cx, -5, -2, '#f3e6d0');
    b.set(cx, -6, VP.ol);
  }
  b.outline();
  contact(b, 0, 27, 64, 4, 0.22);
  return { base: s };
}

export const VOUTE_SWAP: Readonly<Record<FurnitureKind, SwapFn>> = {
  desk: (v, _s, seed) => vouteDesk(v, seed),
  desk_back: (v, _s, seed) => vouteDeskBack(v, seed),
  office_chair_front: (v) => vouteChairFront(v),
  office_chair: (v) => vouteChairBack(v),
  bookshelf: (_v, _s, seed) => vouteBookshelf(seed),
  filing_cabinet: () => vouteCabinet(),
  printer: () => voutePrinter(),
  trash_bin: () => vouteTrashBin(),
  plant_small: (v) => voutePlantSmall(v),
  plant_tall: (v) => voutePlantTall(v),
  glass_partition: (v) => voutePartition(v),
  binder_shelf: (_v, _s, seed) => vouteBinderShelf(seed),
  meeting_table: () => vouteMeetingTable(),
  stool: () => vouteStool(),
  floor_lamp: () => vouteFloorLamp(),
  water_cooler: () => vouteWaterCooler(),
  whiteboard: () => vouteWhiteboard(),
  window: () => vouteWindow(),
  clock: () => vouteClock(),
  poster: (v) => voutePoster(v),
  painting: () => voutePainting(),
  tv: () => vouteTv(),
  light_switch: (v) => vouteLightSwitch(v),
  elevator: (_v, state) => vouteElevator(state),
  door_frame: () => vouteDoorFrame(),
  sign: () => vouteSign(),
  mirror: () => vouteMirror(),
  shelf_wall: () => vouteShelfWall(),
  counter: (v) => vouteCounter(v),
  counter_sink: () => vouteCounterSink(),
  coffee_machine: (_v, state) => vouteCoffeeMachine(state),
  microwave: () => vouteMicrowave(),
  fridge: () => vouteFridge(),
  vending_machine: () => vouteVendingMachine(),
  cafe_table: () => vouteCafeTable(),
  cafe_chair: (v) => vouteCafeChair(v),
  sofa: (v) => vouteSofa(v),
  armchair: (v) => vouteArmchair(v),
  coffee_table: () => vouteCoffeeTable(),
  pingpong_table: () => voutePingpongTable(),
  beanbag: (v) => vouteBeanbag(v),
  arcade: () => vouteArcade(),
  toilet_stall: (_v, state) => vouteToiletStall(state),
  sink: () => vouteSink(),
  reception_desk: () => vouteReceptionDesk(),
  bench: () => vouteBench(),
  stanchion: (v) => vouteStanchion(v),
  canopy_bed: () => vouteCanopyBed(),
  stage_piano: () => vouteStagePiano(),
};
