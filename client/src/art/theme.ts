// Temas de sala (puros): paletas claras e bem distintas. Sementes consecutivas (slots vizinhos)
// recebem temas diferentes; a ordem da lista alterna famílias de cor de propósito.
import type { RoomTheme } from './api';
import { isVoute, vouteStyleOf, type VouteStyle } from './voute';

const THEMES: readonly RoomTheme[] = [
  { carpet: '#c9d1dc', carpet2: '#bdc6d3', wall: { base: '#eef1f4', trim: '#9fb0c4', pattern: 'plain' }, accent: '#3f7fd8', deskVariant: 'white', chairVariant: 'blue' },
  { carpet: '#dbcfba', carpet2: '#d0c2ab', wall: { base: '#f6f0e5', trim: '#b99f7a', pattern: 'stripes' }, accent: '#ec8a3c', deskVariant: 'wood', chairVariant: 'black' },
  { carpet: '#c4cfbb', carpet2: '#b8c5af', wall: { base: '#f1f3ea', trim: '#93a487', pattern: 'wood_panel' }, accent: '#4cae6a', deskVariant: 'wood', chairVariant: 'green' },
  { carpet: '#cdc8de', carpet2: '#c2bbd5', wall: { base: '#f3f1f8', trim: '#a59cc4', pattern: 'plain' }, accent: '#8d66cf', deskVariant: 'white', chairVariant: 'gray' },
  { carpet: '#e4cdbe', carpet2: '#dbc1b0', wall: { base: '#f8f1eb', trim: '#c99a83', pattern: 'plain' }, accent: '#e2604f', deskVariant: 'wood', chairVariant: 'red' },
  { carpet: '#bfd9d2', carpet2: '#b2cfc7', wall: { base: '#eef6f4', trim: '#7fb3a6', pattern: 'stripes' }, accent: '#36b0b0', deskVariant: 'white', chairVariant: 'green' },
  { carpet: '#aab1bd', carpet2: '#9fa7b4', wall: { base: '#e8eaee', trim: '#6d7583', pattern: 'brick' }, accent: '#f2c14e', deskVariant: 'dark', chairVariant: 'black' },
  { carpet: '#e0cad2', carpet2: '#d6bdc6', wall: { base: '#f9f2f4', trim: '#c08ea0', pattern: 'stripes' }, accent: '#e47aa8', deskVariant: 'white', chairVariant: 'black' },
  { carpet: '#c0d2e7', carpet2: '#b3c7e0', wall: { base: '#eef4fa', trim: '#8aa6c8', pattern: 'wood_panel' }, accent: '#5b8fe0', deskVariant: 'wood', chairVariant: 'blue' },
  { carpet: '#d1c5b8', carpet2: '#c5b8aa', wall: { base: '#f4efe8', trim: '#8a6a52', pattern: 'wood_panel' }, accent: '#c9713f', deskVariant: 'dark', chairVariant: 'gray' },
];

const V = (carpet: string, carpet2: string, base: string, trim: string, pattern: 'plain' | 'stripes' | 'wood_panel' | 'brick', accent: string): RoomTheme => ({
  carpet, carpet2, wall: { base, trim, pattern }, accent, deskVariant: 'vanity', chairVariant: 'velvet',
});

/**
 * Superficies cabaret de cada una de las seis salas (spec Barbie 11/11/2026 + revisión), solo con el modo La Voûte.
 * Cada sala tiene su propia familia de color y paredes más claras que el piso, para que muebles y agentes contrasten.
 */
export const VOUTE_THEMES: Readonly<Record<VouteStyle, RoomTheme>> = {
  entrada: V('#7a1d36', '#8f2644', '#3a1a28', '#d4a64a', 'plain', '#ffe08a'), // mármol negro y oro, alfombra roja
  barra: V('#3b1d2b', '#2a1420', '#2f1520', '#ff3fa4', 'brick', '#ff3fa4'), // damero y latón con neón rosa
  maquillaje: V('#8a3a5c', '#74304e', '#4a2236', '#ffe08a', 'stripes', '#ffe08a'), // boudoir ciruela-rosa, bombillas
  privados: V('#3d2a5e', '#2f1f4a', '#2b1d3a', '#ff8fcf', 'plain', '#ff8fcf'), // losa violeta, cortinas
  escenario: V('#8c3a2a', '#74301f', '#40201a', '#d4a64a', 'wood_panel', '#ffe08a'), // parquet cálido, telón
  anais: V('#b25f78', '#9c4f68', '#5a3040', '#f3e6d0', 'plain', '#f3e6d0'), // habitación rosa empolvado y marfil
};

/** Paredes de las salas comunes (vestíbulo, camerinos, foyer) con La Voûte; no son salas de agentes. */
export const VOUTE_CORE_THEMES = {
  vestibulo: V('#7a1d36', '#5a1426', '#3a1a28', '#d4a64a', 'plain', '#ffe08a'),
  camerinos: V('#2a0a12', '#1e1619', '#2d1a30', '#ff8fcf', 'plain', '#ff8fcf'),
  salon: V('#6e1a30', '#8c2240', '#3a1c26', '#d4a64a', 'stripes', '#ff3fa4'),
} as const;

export const THEME_COUNT = THEMES.length;

export function roomTheme(seed: number, id?: string): RoomTheme {
  // Solo con La Voûte encendida una sala voute:* tiene tema propio; en modo normal se sortea como en el upstream.
  const style = isVoute() ? vouteStyleOf(id) : undefined;
  if (style) {
    const v = VOUTE_THEMES[style];
    return { ...v, wall: { ...v.wall } };
  }
  const n = THEMES.length;
  const t = THEMES[((Math.floor(seed) % n) + n) % n];
  return { ...t, wall: { ...t.wall } };
}
