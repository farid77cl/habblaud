// Modo La Voûte del dibujo (global): con él encendido, el arte cambia de oficina a cabaret. Se lee una vez al cargar
// (el botón guarda el estado y recarga la página tras un fundido); los tests lo fijan con setVouteMode.
let mode: boolean | null = null;

export function isVoute(): boolean {
  if (mode === null) {
    try {
      mode = typeof localStorage !== 'undefined' && localStorage.getItem('habblaud:voute') === '1';
    } catch {
      mode = false;
    }
  }
  return mode;
}

export function setVouteMode(on: boolean | null): void {
  mode = on;
}

/** Paleta cabaret (tokens del spec de Barbie). */
export const VP = {
  b9: '#2a0a12', b7: '#5a1426', b6: '#6e1a30', b5: '#8c2240',
  n9: '#0d0a0c', n7: '#1e1619',
  rn: '#ff3fa4', rg: '#ff8fcf', or: '#d4a64a', ol: '#ffe08a', cr: '#f3e6d0',
  as1: '#1b1a20', as2: '#24232b', ve: '#2a2830', ln: '#c9a447',
  crimson: '#8c2240',
  gold: '#d4a64a',
  goldHi: '#ffe08a',
  pink: '#ff3fa4',
  pinkGlow: '#ff8fcf',
  cream: '#f3e6d0',
  asphalt: '#1b1a20',
  asphalt2: '#24232b',
  curb: '#2a2830',
  lane: '#c9a447',
  darkWood: '#1c0b14',
  corridorFloor: '#12090e',
} as const;

/** Estilo de cada una de las seis salas de La Voûte (por id de sala), para que no sean clones de la oficina. */
export const VOUTE_STYLES = ['entrada', 'barra', 'maquillaje', 'privados', 'escenario', 'anais'] as const;
export type VouteStyle = (typeof VOUTE_STYLES)[number];
export function vouteStyleOf(areaId: string | undefined): VouteStyle | undefined {
  const m = /^voute:([a-z]+)$/.exec(areaId ?? '');
  return m && (VOUTE_STYLES as readonly string[]).includes(m[1]) ? (m[1] as VouteStyle) : undefined;
}
