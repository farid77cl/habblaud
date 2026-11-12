// Tapetes decorativos (puros): borda escura, filete claro, franjas nas pontas e padrão no campo.
import { ramp, shade } from '../core/color';
import { PixelBuf } from '../core/pixbuf';
import { VP, isVoute } from '../voute';

export function renderRug(w: number, h: number, color: string, seed: number): PixelBuf {
  const b = new PixelBuf(w, h);
  if (isVoute()) {
    const x0 = 1;
    const x1 = w - 2;
    const style = color.toLowerCase();
    const isBoudoir = style === '#5a1426';
    const isArtDeco = style === '#1e1619';
    const isStage = style === '#6e1a30';
    const isVip = style === '#d4a64a';
    const isCabina = style === '#ff3fa4';
    const isIvory = style === '#e8d5c0';

    const fringeCol = isCabina ? VP.rn : isBoudoir ? '#ff8fcf' : VP.or;
    for (let y = 2; y < h - 2; y += 2) {
      b.set(0, y, fringeCol);
      b.set(w - 1, y, fringeCol);
    }
    // Borde exterior dorado 1px (#d4a64a) o neón (#ff3fa4 en Cabina).
    b.rect(x0, 0, x1 - x0 + 1, h, isCabina ? VP.rn : isVip ? VP.ol : VP.or);
    // Línea interna #3a0f1e (o dorada en VIP).
    b.rect(x0 + 1, 1, x1 - x0 - 1, h - 2, isVip ? VP.or : isIvory ? '#c9577f' : '#3a0f1e');
    const fx = x0 + 2;
    const fy = 2;
    const fw = Math.max(0, x1 - x0 - 3);
    const fh = Math.max(0, h - 4);
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        let c: string = VP.b5;
        const mx = x % 4;
        const my = y % 4;
        if (isBoudoir) {
          // Camarín: terciopelo ciruela (#5a1426) con encaje rosa (#ff8fcf / #ff3fa4).
          c = '#5a1426';
          if ((x + y) % 6 === 0 || (x - y + 600) % 6 === 0) c = '#8c2240';
          if (mx === 2 && my === 2) c = '#ff8fcf';
          else if (mx === 0 && my === 0) c = VP.rn;
        } else if (isArtDeco) {
          // Barra: damasco Art-Déco noir (#1e1619) con líneas geométricas doradas (#d4a64a).
          c = '#1e1619';
          if (x === 1 || x === fw - 2 || y === 1 || y === fh - 2) c = VP.or;
          else if ((x + y) % 8 === 0) c = VP.or;
          else if (mx === 2 && my === 2) c = '#5a1426';
        } else if (isStage) {
          // Salón: gran alfombra escénica rubí (#6e1a30 / #8c2240) con medallón y marco dorado (#ffe08a / #d4a64a).
          c = '#6e1a30';
          const border2 = x === 1 || x === fw - 2 || y === 1 || y === fh - 2;
          const cx = fw / 2;
          const cy = fh / 2;
          const dist = Math.hypot((x - cx) * 0.8, y - cy);
          if (border2 || (dist > 5.5 && dist < 7.2)) c = VP.or;
          else if (dist < 2.5) c = VP.ol;
          else if ((x + y) % 4 === 0) c = VP.b5;
        } else if (isVip) {
          // Mesa VIP: brocado imperial oro (#d4a64a / #ffe08a) sobre púrpura real (#3a0f1e / #8c2240).
          c = '#3a0f1e';
          if (x === 1 || x === fw - 2 || y === 1 || y === fh - 2) c = VP.ol;
          else if (mx === 1 && my === 1) c = VP.ol;
          else if (mx === 1 || my === 1) c = VP.or;
          else if ((x + y) % 2 === 0) c = VP.b5;
        } else if (isIvory) {
          // Habitación de Anaïs: damasco marfil (#e8d5c0) con rombos rosa empolvado y puntos dorados.
          c = '#e8d5c0';
          if (x === 1 || x === fw - 2 || y === 1 || y === fh - 2) c = '#c9577f';
          else if (mx === 2 && my === 2) c = VP.or;
          else if ((mx === 0 && my === 2) || (mx === 2 && my === 0) || (mx === 1 && my === 1)) c = '#d9b8a8';
        } else if (isCabina) {
          // Cabina: terciopelo nocturno (#2a0a12) con rombos fucsia neón (#ff3fa4).
          c = '#2a0a12';
          if (mx === 1 && my === 1) c = VP.rn;
          else if ((x + y) % 4 === 0) c = '#6b1630';
        } else {
          // Clásico La Voûte: campo de terciopelo carmesí (#8c2240) con rombos #ff3fa4 cada 4px.
          if (mx === 1 && my === 1) c = VP.rn;
          else if ((mx === 1 && (my === 0 || my === 2)) || (my === 1 && (mx === 0 || mx === 2))) c = '#6b1630';
        }
        b.set(fx + x, fy + y, c);
      }
    }
    for (const [cx, cy] of [[x0, 0], [x1, 0], [x0, h - 1], [x1, h - 1]] as const) b.clear(cx, cy);
    return b;
  }

  const m = ramp(color, 0.06);
  const fringe = '#efe6d2';
  // Franjas nas laterais curtas (1px para fora do corpo).
  const x0 = 1;
  const x1 = w - 2;
  for (let y = 2; y < h - 2; y += 2) {
    b.set(0, y, fringe);
    b.set(w - 1, y, fringe);
  }
  b.rect(x0, 0, x1 - x0 + 1, h, m.dk);
  b.rect(x0 + 1, 1, x1 - x0 - 1, h - 2, m.base);
  // Filete claro interno.
  b.rect(x0 + 2, 2, x1 - x0 - 3, 1, m.hi);
  b.rect(x0 + 2, h - 3, x1 - x0 - 3, 1, m.hi);
  b.rect(x0 + 2, 2, 1, h - 4, m.hi);
  b.rect(x1 - 2, 2, 1, h - 4, m.hi);
  // Campo com padrão.
  const fx = x0 + 3;
  const fy = 3;
  const fw = x1 - x0 - 5;
  const fh = h - 6;
  const kind = Math.abs(seed) % 3;
  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < fw; x++) {
      let c = m.lt;
      if (kind === 0) {
        // Losangos.
        const d = (Math.abs(((x + 3) % 8) - 4) + Math.abs(((y + 3) % 8) - 4)) % 8;
        if (d === 4) c = m.base;
        else if (d === 0) c = m.hi;
      } else if (kind === 1) {
        // Listras.
        if (y % 6 === 0) c = m.base;
        else if (y % 6 === 3) c = shade(m.lt, 0.03);
      } else if ((x * 7 + y * 13) % 11 === 0) c = m.base;
      b.set(fx + x, fy + y, c);
    }
  }
  // Cantos arredondados.
  for (const [cx, cy] of [[x0, 0], [x1, 0], [x0, h - 1], [x1, h - 1]] as const) b.clear(cx, cy);
  return b;
}
