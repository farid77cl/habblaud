// Temas de sala (puros): paletas claras e bem distintas. Sementes consecutivas (slots vizinhos)
// recebem temas diferentes; a ordem da lista alterna famílias de cor de propósito.
import type { RoomTheme } from './api';
import { isVoute } from './voute';

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

const VOUTE_LIST: readonly RoomTheme[] = [
  V('#5a1426', '#6e1a30', '#1e1619', '#d4a64a', 'stripes', '#ffe08a'), // 0: camarín de tocadores
  V('#2a0a12', '#5a1426', '#0d0a0c', '#d4a64a', 'wood_panel', '#d4a64a'), // 1: reservado VIP
  V('#1e1619', '#2a0a12', '#0d0a0c', '#ff3fa4', 'brick', '#ff3fa4'), // 2: barra
  V('#6e1a30', '#8c2240', '#1e1619', '#d4a64a', 'stripes', '#ff3fa4'), // 3: salón de sofás
  V('#5a1426', '#2a0a12', '#0d0a0c', '#d4a64a', 'plain', '#ffe08a'), // 4: vestíbulo con telón
  V('#2a0a12', '#1e1619', '#1e1619', '#ff8fcf', 'plain', '#ff8fcf'), // 5: camerinos privados
  V('#5a1426', '#8c2240', '#0d0a0c', '#ff3fa4', 'stripes', '#ff3fa4'), // 6: La Voûte (cabina)
];

/** Superficies cabaret por sala (spec Barbie 11/11/2026), reemplazan a THEMES con el modo Voûte. */
export const VOUTE_THEMES = Object.assign(VOUTE_LIST, {
  camarin: VOUTE_LIST[0],
  vip: VOUTE_LIST[1],
  barra: VOUTE_LIST[2],
  salon: VOUTE_LIST[3],
  vestibulo: VOUTE_LIST[4],
  camerinos: VOUTE_LIST[5],
  cabina: VOUTE_LIST[6],
});
const VOUTE_ROOM: Readonly<Record<string, number>> = { 'voute:camarin': 0, 'voute:vip': 1, 'voute:barra': 2, 'voute:salon': 3, 'voute:cabina': 6 };

export const THEME_COUNT = THEMES.length;

export function roomTheme(seed: number, id?: string): RoomTheme {
  const list = isVoute() ? VOUTE_THEMES : THEMES;
  const n = list.length;
  const fixed = id !== undefined ? VOUTE_ROOM[id] : undefined;
  const t = list[fixed ?? ((Math.floor(seed) % n) + n) % n];
  return { ...t, wall: { ...t.wall } };
}
