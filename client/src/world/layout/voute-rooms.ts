// Layouts dedicados de las 6 salas de La Voûte (solo cuando isVoute() está activo).
// En modo normal (!isVoute()), layoutProjectRoom usa el layout de oficina estándar.
// Cada espacio tiene su propio piso, alfombras, paredes y el mueble que lo nombra (Ama 11/11/2026):
//   - voute:entrada    -> cordón VIP con postes dorados, alfombra roja, recepción y sofá de espera
//   - voute:barra      -> gran barra de caoba y bronce, taburetes altos y mesas de cóctel
//   - voute:maquillaje -> tocadores con espejo de bombillas, percheros de vestuario y diván
//   - voute:privados   -> reservados con cortina de terciopelo, mamparas ahumadas y mesitas con vela
//   - voute:escenario  -> tarima con piano de cola, telón y mesas redondas de platea
//   - voute:anais      -> habitación de Anaïs: cama con dosel, tocador, diván y poufs
import type { RoomTheme, WallStyle } from '../../art/api';
import { VP, type VouteStyle } from '../../art/voute';
import { DOOR_W, DOOR_X, TILE } from '../constants';
import { AreaBuilder, SEATED_SORT_BIAS } from './builder';
import { slotRect, slotSide } from './geometry';
import type { RoomInput } from './room';
import type { AreaLayout } from './types';

function setupShell(room: RoomInput, wall: WallStyle): { b: AreaBuilder; north: boolean } {
  const rect = slotRect(room.slot);
  const side = slotSide(room.slot);
  const north = side === 'north';
  const b = new AreaBuilder(room.id, 'room', rect);
  b.area.side = side;
  const door = { lx: DOOR_X, w: DOOR_W };
  if (north) {
    b.face(0.5, 15, wall);
    b.south(0.5, 15, 11, wall, [door]);
  } else {
    b.face(0.5, 15, wall, [door]);
    b.south(0.5, 15, 11, { ...wall, exterior: true });
    b.wall('door_frame', DOOR_X + DOOR_W / 2, undefined, { order: 0.05 });
  }
  b.cap(0, 0, 0.5, 12, wall);
  b.cap(15.5, 0, 0.5, 12, wall);
  b.walk(1, 2, 14, 9);
  b.area.door = north ? { x: rect.x + DOOR_X, y: rect.y + 11, w: DOOR_W, h: 1 } : { x: rect.x + DOOR_X, y: rect.y, w: DOOR_W, h: 2 };
  b.walk(b.area.door.x - rect.x, b.area.door.y - rect.y, b.area.door.w, b.area.door.h);
  const p = { x: rect.x * TILE, y: rect.y * TILE, w: rect.w * TILE, h: rect.h * TILE };
  b.area.shade = north ? { x: p.x, y: p.y, w: p.w, h: p.h - TILE } : { x: p.x, y: p.y, w: p.w, h: p.h };
  return { b, north };
}

function addSwitch(b: AreaBuilder, north: boolean): void {
  if (north) {
    b.wall('light_switch', DOOR_X - 0.5, 'on', { ly: 12, on: 'south', order: 0.8 });
    b.spot('switch', DOOR_X - 1, 10, 'down', { dy: -1 });
  } else {
    b.wall('light_switch', DOOR_X - 0.5, 'on', { order: 0.8 });
    b.spot('switch', DOOR_X - 1, 2, 'up', { dy: -3 });
  }
}

/** 1. SALA DE MAQUILLAJE (`voute:maquillaje`): Boudoir de las artistas con tocadores de bombillas, percheros de vestuario y diván. */
function layoutVouteMaquillaje(room: RoomInput, theme: RoomTheme): AreaLayout {
  const { b, north } = setupShell(room, theme.wall);
  // Piso de moqueta acolchada ciruela-rosa y dos alfombras de encaje boudoir (#5a1426).
  b.floor('carpet', 0, 0, 16, 12, room.seed, '#8a3a5c', '#74304e');
  b.rug(1.4, 3.2, 6.8, 5.4, '#5a1426', room.seed);
  b.rug(9.0, 3.2, 5.6, 6.6, '#5a1426', room.seed + 1);

  // Pared norte: espejos de camerino sobre lavamanos de perfumes, cartel, cuadro y ventana.
  b.wall('mirror', 2.5, undefined, { order: 0.35 });
  b.wall('mirror', 4.5, undefined, { order: 0.36 });
  b.furn('sink', 2, 2, undefined, { order: 0.38 });
  b.spot('sink', 2, 3, 'up', { dy: -3 });
  b.furn('sink', 4, 2, undefined, { order: 0.39 });
  b.spot('sink', 4, 3, 'up', { dy: -3 });
  b.area.signId = b.wall('sign', north ? 8 : 10.5, undefined, { order: 0.95 });
  b.wall('painting', 11.2, undefined, { order: 0.5 });
  b.wall('window', 13.5, undefined, { order: 0.4 });
  b.spot('window', 13, 2, 'up', { dx: 8, dy: 1 });
  addSwitch(b, north);

  // Ala oeste: 4 tocadores de maquillaje con espejo de bombillas (2x2 isla de vanity).
  const ranks = [0, 1];
  for (let i = 0; i < 2; i++) {
    const lx = 2 + i * 3;
    const back = b.furn('desk_back', lx, 5, 'vanity', { order: 0.35 + i * 0.05, seat: `N${i}` });
    const front = b.furn('desk', lx, 6, 'vanity', { order: 0.4 + i * 0.05, seat: `S${i}` });
    b.seat('desk', 'office_chair_front', lx, 4, 'down', 'velvet', { dx: TILE / 2, deskId: back, rank: ranks[i] * 2 + 1, side: 'N', order: 0.55 + i * 0.03 });
    b.seat('desk', 'office_chair', lx, 7, 'up', 'velvet', { dx: TILE / 2, deskId: front, rank: ranks[i] * 2, side: 'S', order: 0.6 + i * 0.03 });
  }

  // Ala este: 2 grandes percheros de vestuario con boas/vestidos/pieles + biombo + diván boudoir.
  b.furn('bookshelf', 10, 4, undefined, { order: 0.42 });
  b.spot('shelf', 10, 5, 'up', { dx: 8, dy: -2 });
  b.furn('bookshelf', 10, 6, undefined, { order: 0.48 });
  b.spot('shelf', 10, 7, 'up', { dx: 8, dy: -2 });
  b.furn('glass_partition', 9, 4, 'v', { order: 0.41 });
  b.furn('glass_partition', 9, 6, 'v', { order: 0.47 });

  // Diván capitoné boudoir al sur-este y poufs de terciopelo al sur-oeste.
  const sofa = b.furn('sofa', 10, 9, 'up', { order: 0.62 });
  b.seat('desk', 'sofa', 10, 9, 'up', 'up', { noFurniture: true, furnitureId: sofa, rank: 4 });
  b.seat('desk', 'sofa', 11, 9, 'up', 'up', { noFurniture: true, furnitureId: sofa, rank: 5 });
  b.seat('nook', 'sofa', 12, 9, 'up', 'up', { noFurniture: true, furnitureId: sofa });

  b.seat('nook', 'armchair', 13, 5, 'left', 'left', { order: 0.52 });
  b.seat('stool', 'beanbag', 2, 9, 'up', 'red', { order: 0.64 });
  b.seat('stool', 'beanbag', 4, 9, 'up', 'yellow', { order: 0.65 });
  b.seat('nook', 'beanbag', 13, 8, 'left', 'blue', { order: 0.66 });

  // Pedestales con boas de plumas y candelabros + lámpara de flecos.
  b.furn('plant_tall', 1, 2, 'palm', { order: 0.2 });
  b.furn('plant_small', 6, 2, 'flower', { order: 0.22 });
  b.furn('floor_lamp', 14, 4, undefined, { order: 0.34 });
  b.furn('trash_bin', 14, 7, undefined, { order: 0.5 });
  b.furn('plant_tall', 1, 10, 'monstera', { order: 0.7 });
  b.furn('plant_tall', 14, 10, 'ficus', { order: 0.71 });

  b.spot('stand', 8, 5, 'left');
  b.spot('stand', 8, 8, 'right');
  b.spot('stand', 5, 9, 'up', { dy: -2 });
  return b.build();
}

/** 2. BARRA (`voute:barra`): Le Comptoir de Champagne con piso damero, gran barra de caoba, taburetes y mesas de cóctel. */
function layoutVouteBarra(room: RoomInput, theme: RoomTheme): AreaLayout {
  const { b, north } = setupShell(room, theme.wall);
  // Piso en damero burdeos y obsidiana (#2a0a12 / #16090e) y dos alfombras Art-Déco (#1e1619).
  b.floor('tile_check', 0, 0, 16, 12, room.seed);
  b.rug(1.3, 5.6, 5.2, 4.2, '#1e1619', room.seed);
  b.rug(9.5, 5.6, 5.2, 4.2, '#1e1619', room.seed + 1);

  // Pared norte con estanterías iluminadas de licores, letrero, ventana y póster.
  b.wall('shelf_wall', 3.0, undefined, { order: 0.4 });
  b.wall('shelf_wall', 5.5, undefined, { order: 0.41 });
  b.area.signId = b.wall('sign', 9.0, undefined, { order: 0.95 });
  b.wall('window', 12.8, undefined, { order: 0.42 });
  b.spot('window', 13, 2, 'up', { dx: 0, dy: 1 });
  b.wall('poster', 14.2, 'coffee', { order: 0.45 });
  addSwitch(b, north);

  // Gran Barra de Caoba y Bronce (lx = 1..10, ly = 2): cava, mostradores, máquinas de absenta/espresso y vitrina.
  b.furn('fridge', 1, 2, undefined, { order: 0.22 });
  b.spot('fridge', 1, 3, 'up', { dy: -3 });
  b.furn('counter', 2, 2, 'drawers', { order: 0.23 });
  b.furn('counter_sink', 3, 2, undefined, { order: 0.24 });
  b.spot('sink', 3, 3, 'up', { dy: -3 });
  b.furn('counter', 4, 2, 'plain', { order: 0.25 });
  const m = b.furn('coffee_machine', 5, 2, undefined, { order: 0.26 });
  b.spot('coffee', 5, 3, 'up', { dy: -3, furnitureId: m });
  // lx 6-8 queda libre: la puerta (lx 7-8) y el interruptor (lx 6) cuando la sala cae al sur del corredor.
  const m2 = b.furn('coffee_machine', 9, 2, undefined, { order: 0.265 });
  b.spot('coffee', 9, 3, 'up', { dy: -3, furnitureId: m2 });
  b.furn('counter', 10, 2, 'drawers', { order: 0.27 });
  b.furn('microwave', 11, 2, undefined, { order: 0.28 });
  const vend = b.furn('vending_machine', 12, 2, undefined, { order: 0.29 });
  b.spot('snack', 12, 3, 'up', { dy: -3, furnitureId: vend });
  b.furn('water_cooler', 14, 2, undefined, { order: 0.3 });
  b.spot('water', 14, 3, 'up', { dy: -3 });

  // 6 Taburetes altos de terciopelo frente a la barra (asientos principales de la Barra).
  for (let i = 0; i < 6; i++) {
    const lx = 2 + i;
    b.seat('desk', 'stool', lx, 4, 'up', undefined, { rank: i, side: 'S', order: 0.48 + i * 0.01 });
  }
  b.furn('trash_bin', 8, 4, undefined, { order: 0.49 });

  // Mesas redondas de cóctel con velas y sillas bistrô / butacas de terciopelo en el sur.
  b.furn('cafe_table', 3, 7, undefined, { order: 0.58 });
  b.seat('stool', 'cafe_chair', 2, 7, 'right', 'right', { order: 0.6 });
  b.seat('stool', 'cafe_chair', 4, 7, 'left', 'left', { order: 0.61 });

  b.furn('cafe_table', 3, 9, undefined, { order: 0.62 });
  b.seat('nook', 'armchair', 2, 9, 'right', 'right', { order: 0.64 });
  b.seat('nook', 'armchair', 4, 9, 'left', 'left', { order: 0.65 });

  b.furn('cafe_table', 11, 7, undefined, { order: 0.58 });
  b.seat('stool', 'cafe_chair', 10, 7, 'right', 'right', { order: 0.6 });
  b.seat('stool', 'cafe_chair', 12, 7, 'left', 'left', { order: 0.61 });

  b.furn('cafe_table', 11, 9, undefined, { order: 0.62 });
  b.seat('nook', 'armchair', 10, 9, 'right', 'right', { order: 0.64 });
  b.seat('nook', 'armchair', 12, 9, 'left', 'left', { order: 0.65 });

  b.furn('floor_lamp', 14, 5, undefined, { order: 0.45 });
  b.furn('plant_tall', 1, 10, 'palm', { order: 0.7 });
  b.furn('plant_tall', 14, 10, 'monstera', { order: 0.71 });

  b.spot('stand', 7, 6, 'right');
  b.spot('stand', 8, 6, 'left');
  b.spot('stand', 7, 9, 'up', { dy: -2 });
  return b.build();
}

/** 5. ESCENARIO (`voute:escenario`): Le Grand Salon Burlesque con parquet, tarima con Piano de Cola y platea de mesas redondas. */
function layoutVouteEscenario(room: RoomInput, theme: RoomTheme): AreaLayout {
  const { b, north } = setupShell(room, theme.wall);
  // Parquet oscuro de teatro (#281818) + Gran Alfombra Escénica Rubí y Oro (#6e1a30) al oeste + Alfombra de Platea al este.
  b.floor('wood', 0, 0, 16, 12, room.seed);
  b.rug(1.2, 2.6, 6.2, 5.8, '#6e1a30', room.seed);
  b.rug(8.2, 3.0, 6.4, 6.8, VP.crimson, room.seed + 1);

  // Pared norte: Gran Telón/Pantalla sobre el escenario, cartel, cuadro y ventana nocturna.
  b.wall('tv', 4.0, undefined, { order: 0.4 });
  b.area.signId = b.wall('sign', 8.0, undefined, { order: 0.95 });
  b.wall('painting', 11.0, undefined, { order: 0.5 });
  b.wall('window', 13.5, undefined, { order: 0.42 });
  b.spot('window', 13, 2, 'up', { dx: 8, dy: 1 });
  addSwitch(b, north);

  // Tarima con piano de cola (oeste, lx = 1..4, ly = 3..4) y la banqueta de la pianista frente al teclado.
  b.furn('stage_piano', 1, 3, undefined, { order: 0.45 });
  b.seat('desk', 'stool', 3, 5, 'up', undefined, { rank: 0, order: 0.5 });
  b.furn('plant_tall', 1, 2, 'palm', { order: 0.2 });
  b.furn('floor_lamp', 6, 3, undefined, { order: 0.35 });
  b.furn('plant_small', 1, 9, 'flower', { order: 0.62 });
  b.furn('floor_lamp', 2, 9, undefined, { order: 0.63 });
  b.furn('arcade', 4, 9, undefined, { order: 0.64 });
  b.spot('arcade', 4, 10, 'up', { dy: -3 });

  // Platea de Cabaret (este, lx = 8..14): Sofá capitoné + mesas redondas con velas mirando al escenario.
  const sofa = b.furn('sofa', 9, 4, 'down', { order: 0.48 });
  b.seat('desk', 'sofa', 9, 4, 'down', 'down', { noFurniture: true, furnitureId: sofa, rank: 1 });
  b.seat('desk', 'sofa', 10, 4, 'down', 'down', { noFurniture: true, furnitureId: sofa, rank: 2 });
  b.seat('desk', 'sofa', 11, 4, 'down', 'down', { noFurniture: true, furnitureId: sofa, rank: 3 });
  b.furn('coffee_table', 9, 5, undefined, { dx: TILE / 2, order: 0.52 });

  b.furn('cafe_table', 10, 8, undefined, { order: 0.58 });
  b.seat('desk', 'armchair', 9, 8, 'right', 'right', { rank: 4, order: 0.6 });
  b.seat('desk', 'armchair', 11, 8, 'left', 'left', { rank: 5, order: 0.61 });
  b.furn('trash_bin', 10, 9, undefined, { order: 0.62 });

  b.furn('cafe_table', 13, 6, undefined, { order: 0.56 });
  b.seat('stool', 'cafe_chair', 12, 6, 'right', 'right', { order: 0.57 });
  b.seat('stool', 'cafe_chair', 14, 6, 'left', 'left', { order: 0.58 });

  b.seat('nook', 'beanbag', 13, 9, 'left', 'red', { order: 0.65 });
  b.seat('nook', 'beanbag', 6, 8, 'right', 'yellow', { order: 0.66 });
  b.furn('plant_tall', 14, 10, 'monstera', { order: 0.7 });

  b.spot('stand', 6, 6, 'right');
  b.spot('stand', 7, 7, 'left');
  b.spot('stand', 8, 9, 'up', { dy: -2 });
  return b.build();
}

/** 0. ENTRADA (`voute:entrada`): el foyer con cordón VIP de postes dorados, alfombra roja, recepción y sofá de espera. */
function layoutVouteEntrada(room: RoomInput, theme: RoomTheme): AreaLayout {
  const { b, north } = setupShell(room, theme.wall);
  // Piso de mármol negro con vetas doradas + Gran Alfombra Imperial de Brocado Dorado (#d4a64a).
  b.floor('marble', 0, 0, 16, 12, room.seed);
  b.rug(2.0, 4.0, 12.0, 6.0, '#d4a64a', room.seed);
  b.rug(DOOR_X - 0.5, north ? 7.5 : 2, DOOR_W + 1, north ? 3.5 : 3.5, '#c4193d', room.seed + 1);

  // Pared norte: óleos imperiales, reloj dorado y placa.
  b.wall('painting', 3.0, undefined, { order: 0.5 });
  b.wall('clock', 5.2, undefined, { order: 0.6 });
  b.area.signId = b.wall('sign', 10.5, undefined, { order: 0.95 });
  b.wall('painting', 13.5, undefined, { order: 0.52 });
  addSwitch(b, north);

  // Cordón VIP: dos tramos de postes dorados con cuerda de terciopelo; entre ellos queda libre la alfombra roja.
  const cordon: Array<[number, string]> = [[3, 'l'], [4, 'h'], [5, 'h'], [6, 'r'], [9, 'l'], [10, 'h'], [11, 'h'], [12, 'r']];
  cordon.forEach(([lx, v], i) => b.furn('stanchion', lx, 3, v, { order: 0.3 + i * 0.005 }));

  // Recepción (3x1) al centro y dos mesas bajas laterales.
  b.furn('reception_desk', 6, 5, undefined, { order: 0.48 });
  b.furn('coffee_table', 3, 6, undefined, { order: 0.46 });
  b.furn('coffee_table', 11, 6, undefined, { order: 0.47 });

  // Gran Diván Capitoné Imperial (3x1) y Sillones Trono de Terciopelo rodeando la mesa.
  const sofa = b.furn('sofa', 6, 8, 'up', { order: 0.6 });
  b.seat('desk', 'sofa', 6, 8, 'up', 'up', { noFurniture: true, furnitureId: sofa, rank: 0 });
  b.seat('desk', 'sofa', 7, 8, 'up', 'up', { noFurniture: true, furnitureId: sofa, rank: 1 });
  b.seat('desk', 'sofa', 8, 8, 'up', 'up', { noFurniture: true, furnitureId: sofa, rank: 2 });

  b.seat('desk', 'armchair', 5, 5, 'right', 'right', { rank: 3, order: 0.52 });
  b.seat('desk', 'armchair', 9, 5, 'left', 'left', { rank: 4, order: 0.53 });
  b.seat('desk', 'armchair', 2, 6, 'right', 'right', { rank: 5, order: 0.54 });
  b.seat('nook', 'armchair', 13, 6, 'left', 'left', { order: 0.55 });
  b.seat('stool', 'armchair', 3, 8, 'up', 'up', { order: 0.62 });
  b.seat('stool', 'armchair', 11, 8, 'up', 'up', { order: 0.63 });
  b.seat('nook', 'beanbag', 4, 4, 'down', 'yellow', { order: 0.44 });
  b.seat('nook', 'beanbag', 11, 4, 'down', 'red', { order: 0.45 });

  // Cava privada, champañeras de pie doradas, cubiteras y pedestales con candelabros.
  b.furn('fridge', 1, 2, undefined, { order: 0.22 });
  b.spot('fridge', 1, 3, 'up', { dy: -3 });
  b.furn('water_cooler', 1, 5, undefined, { order: 0.4 });
  b.spot('water', 1, 6, 'up', { dy: -3 });
  b.furn('water_cooler', 14, 5, undefined, { order: 0.41 });
  b.spot('water', 14, 6, 'up', { dy: -3 });
  b.furn('trash_bin', 5, 7, undefined, { order: 0.58 });
  b.furn('trash_bin', 9, 7, undefined, { order: 0.59 });
  b.furn('floor_lamp', 14, 2, undefined, { order: 0.25 });
  b.furn('plant_tall', 1, 10, 'palm', { order: 0.7 });
  b.furn('plant_tall', 14, 10, 'monstera', { order: 0.71 });

  b.spot('stand', 7, 4, 'down');
  b.spot('stand', 8, 4, 'down');
  b.spot('stand', 10, 9, 'up', { dy: -2 });
  return b.build();
}

/** 3. PRIVADOS (`voute:privados`): Les Cabines Privées con reservados de cortina de terciopelo, mamparas ahumadas y mesitas con vela. */
function layoutVoutePrivados(room: RoomInput, theme: RoomTheme): AreaLayout {
  const { b, north } = setupShell(room, theme.wall);
  // Piso de losa oscura subterránea (#12090e) + 3 Alfombras de Terciopelo Neón Fucsia (#ff3fa4) en los 3 boxes.
  b.floor('concrete', 0, 0, 16, 12, room.seed);
  b.rug(1.2, 5.5, 4.2, 4.8, '#ff3fa4', room.seed);
  b.rug(6.0, 6.2, 4.0, 4.2, '#ff3fa4', room.seed + 1);
  b.rug(10.6, 5.5, 4.2, 4.8, '#ff3fa4', room.seed + 2);

  // Pared norte: 3 Cabinas Privadas con Cortina de Terciopelo Carmesí (lx = 1, 3, 13) sin tapar espejo ni placa.
  b.wall('mirror', 5.5, undefined, { order: 0.4 });
  b.area.signId = b.wall('sign', 10.5, undefined, { order: 0.95 });
  addSwitch(b, north);

  for (const [i, lx] of [
    [0, 1],
    [1, 3],
    [2, 13],
  ] as const) {
    const stall = b.furn('toilet_stall', lx, 2, undefined, { order: 0.3 + i * 0.04 });
    b.spot('stall', lx, 4, 'up', { furnitureId: stall, x: b.px(lx + 1), y: b.py(4) - 3, sortY: b.py(4) - 0.5 });
  }

  // Mamparas de cristal ahumado y bronce separando los 3 boxes privados en el sur.
  b.furn('glass_partition', 5, 6, 'v', { order: 0.48 });
  b.furn('glass_partition', 5, 7, 'v', { order: 0.52 });
  b.furn('glass_partition', 10, 6, 'v', { order: 0.48 });
  b.furn('glass_partition', 10, 7, 'v', { order: 0.52 });

  // Box Privado 1 (Oeste, lx = 1..4): mesita con vela, 2 butacas de terciopelo, pouf y lámpara de flecos.
  b.furn('cafe_table', 2, 7, undefined, { order: 0.55 });
  b.seat('desk', 'armchair', 1, 7, 'right', 'right', { rank: 0, order: 0.56 });
  b.seat('desk', 'armchair', 3, 7, 'left', 'left', { rank: 1, order: 0.57 });
  b.seat('nook', 'beanbag', 2, 9, 'up', 'red', { order: 0.62 });
  b.furn('floor_lamp', 1, 10, undefined, { order: 0.68 });

  // Box Privado 2 (Centro, lx = 6..9): diván capitoné, mesita con vela y Consola de Luces y Sonido con LEDs.
  b.furn('cafe_table', 7, 6, undefined, { order: 0.52 });
  const sofa = b.furn('sofa', 6, 8, 'up', { order: 0.58 });
  b.seat('desk', 'sofa', 6, 8, 'up', 'up', { noFurniture: true, furnitureId: sofa, rank: 2 });
  b.seat('desk', 'sofa', 7, 8, 'up', 'up', { noFurniture: true, furnitureId: sofa, rank: 3 });
  b.seat('nook', 'sofa', 8, 8, 'up', 'up', { noFurniture: true, furnitureId: sofa });
  b.furn('printer', 6, 10, undefined, { order: 0.66 });
  b.furn('filing_cabinet', 8, 10, undefined, { order: 0.67 });

  // Box Privado 3 (Este, lx = 11..14): mesita con vela, 2 butacas de terciopelo, 2 poufs, cubitera y lámpara.
  b.furn('cafe_table', 12, 7, undefined, { order: 0.55 });
  b.seat('desk', 'armchair', 11, 7, 'right', 'right', { rank: 4, order: 0.56 });
  b.seat('desk', 'armchair', 13, 7, 'left', 'left', { rank: 5, order: 0.57 });
  b.seat('stool', 'beanbag', 11, 9, 'up', 'yellow', { order: 0.62 });
  b.seat('stool', 'beanbag', 13, 9, 'up', 'blue', { order: 0.63 });
  b.furn('trash_bin', 14, 6, undefined, { order: 0.54 });
  b.furn('floor_lamp', 14, 10, undefined, { order: 0.68 });

  b.spot('stand', 6, 4, 'down');
  b.spot('stand', 9, 4, 'down');
  b.spot('stand', 10, 4, 'left');
  return b.build();
}

/** 6. HABITACIÓN DE ANAÏS (`voute:anais`): cama con dosel, tocador, rincón de conversación y poufs sobre alfombra marfil. */
function layoutVouteAnais(room: RoomInput, theme: RoomTheme): AreaLayout {
  const { b, north } = setupShell(room, theme.wall);
  b.floor('carpet', 0, 0, 16, 12, room.seed, '#b25f78', '#9c4f68');
  b.rug(2.0, 4.2, 12.0, 6.0, '#e8d5c0', room.seed);
  b.rug(9.4, 4.0, 4.6, 2.2, '#8c2240', room.seed + 1);

  // Pared norte: espejo de cuerpo entero, ventana nocturna, cuadro y la placa con el nombre.
  b.wall('mirror', 2.5, undefined, { order: 0.35 });
  b.wall('painting', 4.6, undefined, { order: 0.5 });
  b.area.signId = b.wall('sign', 8.0, undefined, { order: 0.95 });
  b.wall('window', 14.2, undefined, { order: 0.4 });
  b.spot('window', 14, 2, 'up', { dx: 8, dy: 1 });
  addSwitch(b, north);

  // La cama con dosel al este, con sus dos lámparas de noche.
  b.furn('canopy_bed', 10, 2, undefined, { order: 0.4 });
  b.furn('floor_lamp', 9, 2, undefined, { order: 0.3 });
  b.furn('floor_lamp', 13, 2, undefined, { order: 0.31 });
  b.spot('stand', 11, 4, 'up', { dy: -2 });

  // Tocador con espejo de bombillas al oeste.
  const vanity = b.furn('desk', 2, 2, 'vanity', { order: 0.38, seat: 'S0' });
  b.seat('desk', 'office_chair', 2, 3, 'up', 'velvet', { dx: TILE / 2, deskId: vanity, rank: 0, side: 'S', order: 0.55 });
  b.furn('plant_small', 4, 2, 'flower', { order: 0.4 });

  // Rincón de conversación: dos butacas frente a la mesita y el diván capitoné al sur.
  b.furn('coffee_table', 5, 6, undefined, { order: 0.52 });
  b.seat('desk', 'armchair', 4, 6, 'right', 'right', { rank: 1, order: 0.53 });
  b.seat('desk', 'armchair', 7, 6, 'left', 'left', { rank: 2, order: 0.54 });
  const sofa = b.furn('sofa', 5, 8, 'up', { order: 0.62 });
  b.seat('desk', 'sofa', 5, 8, 'up', 'up', { noFurniture: true, furnitureId: sofa, rank: 3 });
  b.seat('desk', 'sofa', 6, 8, 'up', 'up', { noFurniture: true, furnitureId: sofa, rank: 4 });
  b.seat('desk', 'sofa', 7, 8, 'up', 'up', { noFurniture: true, furnitureId: sofa, rank: 5 });

  // Poufs de terciopelo y plantas.
  b.seat('nook', 'beanbag', 13, 8, 'left', 'red', { order: 0.66 });
  b.seat('nook', 'beanbag', 2, 9, 'up', 'yellow', { order: 0.65 });
  b.furn('plant_tall', 1, 10, 'monstera', { order: 0.7 });
  b.furn('plant_tall', 14, 10, 'palm', { order: 0.71 });

  b.spot('stand', 9, 6, 'right');
  b.spot('stand', 10, 8, 'up', { dy: -2 });
  return b.build();
}

export function layoutVouteRoom(style: VouteStyle, room: RoomInput, theme: RoomTheme): AreaLayout {
  switch (style) {
    case 'entrada':
      return layoutVouteEntrada(room, theme);
    case 'barra':
      return layoutVouteBarra(room, theme);
    case 'maquillaje':
      return layoutVouteMaquillaje(room, theme);
    case 'privados':
      return layoutVoutePrivados(room, theme);
    case 'escenario':
      return layoutVouteEscenario(room, theme);
    case 'anais':
      return layoutVouteAnais(room, theme);
  }
}
