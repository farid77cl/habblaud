// Layouts dedicados de las 5 salas de La Voûte (solo cuando isVoute() está activo).
// En modo normal (!isVoute()), layoutProjectRoom usa el layout de oficina estándar.
// Cada espacio tiene su propio piso, alfombras, paredes y mobiliario para que ninguno se repita:
//   - voute:camarin -> Boudoir de tocadores con bombillas, lavamanos de perfumes, percheros de vestuario y diván
//   - voute:barra   -> Damero burdeos/noir, gran barra de caoba y bronce de 10 tiles, taburetes altos y mesas de cóctel
//   - voute:salon   -> Parquet de teatro, escenario con Gran Piano de Cola Negro, telón y platea de mesas cabaret
//   - voute:vip     -> Mármol negro y oro, cordones de terciopelo, Gran Mesa Imperial VIP, diván capitoné y sillones trono
//   - voute:cabina  -> Losa subterránea, 3 cabinas privadas con cortina roja, 3 boxes con mamparas ahumadas y consola de luces
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

/** 1. CAMARÍN (`voute:camarin`): Boudoir de las artistas con tocadores de bombillas, percheros de vestuario y diván. */
function layoutVouteCamarin(room: RoomInput, theme: RoomTheme): AreaLayout {
  const { b, north } = setupShell(room, theme.wall);
  // Piso de moqueta acolchada ciruela-rosa y dos alfombras de encaje boudoir (#5a1426).
  b.floor('carpet', 0, 0, 16, 12, room.seed, '#4a1228', '#380d1e');
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
  b.wall('window', 12.2, undefined, { order: 0.42 });
  b.spot('window', 12, 2, 'up', { dx: 4, dy: 1 });
  b.wall('poster', 14.2, 'coffee', { order: 0.45 });
  addSwitch(b, north);

  // Gran Barra de Caoba y Bronce (lx = 1..10, ly = 2): cava, mostradores, máquinas de absenta/espresso y vitrina.
  b.furn('fridge', 1, 2, undefined, { order: 0.22 });
  b.spot('fridge', 1, 3, 'up', { dy: -3 });
  b.furn('counter', 2, 2, 'drawers', { order: 0.23 });
  b.furn('counter_sink', 3, 2, undefined, { order: 0.24 });
  b.spot('sink', 3, 3, 'up', { dy: -3 });
  b.furn('counter', 4, 2, 'plain', { order: 0.25 });
  for (const lx of [5, 6]) {
    const m = b.furn('coffee_machine', lx, 2, undefined, { order: 0.26 });
    b.spot('coffee', lx, 3, 'up', { dy: -3, furnitureId: m });
  }
  b.furn('counter', 7, 2, 'drawers', { order: 0.27 });
  b.furn('microwave', 8, 2, undefined, { order: 0.28 });
  const vend = b.furn('vending_machine', 10, 2, undefined, { order: 0.29 });
  b.spot('snack', 10, 3, 'up', { dy: -3, furnitureId: vend });
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

/** 3. SALÓN (`voute:salon`): Le Grand Salon Burlesque con parquet oscuro, escenario con Piano de Cola y platea cabaret. */
function layoutVouteSalon(room: RoomInput, theme: RoomTheme): AreaLayout {
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

  // Escenario Burlesque (oeste, lx = 1..6): Gran Piano de Cola Negro (3x2) + banqueta de pianista + candilejas + cabina de luces.
  b.furn('pingpong_table', 2, 4, undefined, { order: 0.45 });
  const ppY = b.py(5) + 5;
  const ppSort = b.py(6) + SEATED_SORT_BIAS;
  b.spot('pingpong', 1, 5, 'right', { x: b.px(2) - 6, y: ppY, group: 'pingpong:salon', sortY: ppSort });
  b.spot('pingpong', 5, 5, 'left', { x: b.px(5) + 6, y: ppY, group: 'pingpong:salon', sortY: ppSort });
  b.seat('desk', 'stool', 1, 4, 'right', undefined, { rank: 0, order: 0.46 });
  b.furn('plant_tall', 1, 2, 'palm', { order: 0.2 });
  b.furn('floor_lamp', 6, 3, undefined, { order: 0.35 });
  b.furn('printer', 1, 9, undefined, { order: 0.62 });
  b.furn('filing_cabinet', 2, 9, undefined, { order: 0.63 });
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

/** 4. MESA VIP (`voute:vip`): La Loge Impériale d'Anaïs con mármol negro/oro, cordones de terciopelo y Gran Mesa Imperial. */
function layoutVouteVip(room: RoomInput, theme: RoomTheme): AreaLayout {
  const { b, north } = setupShell(room, theme.wall);
  // Piso de mármol negro con vetas doradas + Gran Alfombra Imperial de Brocado Dorado (#d4a64a).
  b.floor('marble', 0, 0, 16, 12, room.seed);
  b.rug(2.0, 3.6, 12.0, 6.0, '#d4a64a', room.seed);
  b.rug(DOOR_X - 0.25, north ? 9.5 : 2, DOOR_W + 0.5, 1.25, VP.crimson, room.seed + 1);

  // Pared norte: óleos imperiales, reloj dorado y placa.
  b.wall('painting', 3.0, undefined, { order: 0.5 });
  b.wall('clock', 5.2, undefined, { order: 0.6 });
  b.area.signId = b.wall('sign', 10.5, undefined, { order: 0.95 });
  b.wall('painting', 13.5, undefined, { order: 0.52 });
  addSwitch(b, north);

  // Cordones de terciopelo / divisores de cristal y oro flanqueando la entrada VIP.
  b.furn('glass_partition', 5, 3, 'h', { order: 0.3 });
  b.furn('glass_partition', 6, 3, 'h', { order: 0.31 });
  b.furn('glass_partition', 9, 3, 'h', { order: 0.32 });
  b.furn('glass_partition', 10, 3, 'h', { order: 0.33 });

  // Gran Mesa Imperial VIP en el centro (3x2) con candelabro y champán + 2 mesas bajas laterales.
  b.furn('meeting_table', 6, 5, undefined, { order: 0.48 });
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

/** 5. CABINA (`voute:cabina`): Les Cabines Privées con 3 cabinas de cortina roja, 3 boxes íntimos y consola de luces. */
function layoutVouteCabina(room: RoomInput, theme: RoomTheme): AreaLayout {
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

export function layoutVouteRoom(style: VouteStyle, room: RoomInput, theme: RoomTheme): AreaLayout {
  switch (style) {
    case 'camarin':
      return layoutVouteCamarin(room, theme);
    case 'barra':
      return layoutVouteBarra(room, theme);
    case 'salon':
    default:
      return layoutVouteSalon(room, theme);
    case 'vip':
      return layoutVouteVip(room, theme);
    case 'cabina':
      return layoutVouteCabina(room, theme);
  }
}
