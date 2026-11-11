// Agentes de La Voûte: cada tipo (campo `role`) sale con su nombre y su look fijos; el resto sigue al azar.
// Dos looks por agente: `parts` (normal) y `partsVoute` (látex, ligas, tacos; estilizado, SIN desnudos: el fork es público).
import type { AppearanceParts } from './appearance';

export interface VouteAgente {
  name: string;
  /** Look normal. */
  parts: AppearanceParts;
  /** Look La Voûte. */
  partsVoute: AppearanceParts;
}

const NEGRO = '#1a1a1a';
const BLANCO = '#f5f5f5';
const GRIS = '#6b6b6b';
const ROSA = '#ff8fb8';
const RUBIO = '#e8c872';
const BURDEOS = '#6d0f2a';
const ORO = '#d4af37';

/** Look Voûte: top y falda de látex, tacos del color de acento; `extra` pisa lo que haga falta. */
function voute(base: AppearanceParts, acento: string, extra: AppearanceParts = {}): AppearanceParts {
  return {
    ...base,
    top: NEGRO,
    topAccent: acento,
    topStyle: 'jacket',
    bottom: BURDEOS,
    bottomStyle: 'skirt',
    shoes: acento,
    accessory: 'earrings',
    accessoryColor: ORO,
    ...extra,
  };
}

const def = (name: string, parts: AppearanceParts, acento: string, extra?: AppearanceParts): VouteAgente => ({
  name,
  parts,
  partsVoute: voute(parts, acento, extra),
});

const LISTA: VouteAgente[] = [
  def('Ele', { hair: '#2a1a14', hairStyle: 'long', top: '#ff5c9a', topStyle: 'blouse', bottom: NEGRO, bottomStyle: 'skirt', shoes: NEGRO, accessory: 'earrings', accessoryColor: ORO }, '#ff2f7e', { hair: ROSA }),
  def('Chanel', { hair: NEGRO, hairStyle: 'bob', top: NEGRO, topStyle: 'blouse', bottom: NEGRO, bottomStyle: 'skirt', shoes: NEGRO, accessory: 'earrings', accessoryColor: ORO }, ORO),
  def('Flash', { hair: '#6b4423', hairStyle: 'ponytail', top: BLANCO, topStyle: 'tshirt', bottom: NEGRO, bottomStyle: 'pants', shoes: NEGRO, accessory: 'cap', accessoryColor: '#2b2b2b' }, '#ffd23f', { accessory: 'cap', accessoryColor: NEGRO }),
  def('Gomita', { hair: NEGRO, hairStyle: 'long', top: '#ff1f3d', topStyle: 'tshirt', bottom: NEGRO, bottomStyle: 'skirt', shoes: '#d81b3a', accessory: 'sunglasses', accessoryColor: '#111111' }, '#ff1f3d', { accessory: 'sunglasses', accessoryColor: '#111111' }),
  def('Kitty', { hair: '#4a3020', hairStyle: 'pigtails', top: BLANCO, topStyle: 'blouse', bottom: GRIS, bottomStyle: 'skirt', shoes: NEGRO, accessory: 'glasses', accessoryColor: '#222222' }, BLANCO, { accessory: 'glasses', accessoryColor: ORO }),
  def('Prada', { hair: '#5a1f12', hairStyle: 'long', top: '#f2e6c9', topStyle: 'blouse', bottom: NEGRO, bottomStyle: 'skirt', shoes: NEGRO, accessory: 'earrings', accessoryColor: ORO }, '#c9a227'),
  def('Peaches', { hair: '#f4a0c0', hairStyle: 'wavy', top: ROSA, topStyle: 'tshirt', bottom: BLANCO, bottomStyle: 'skirt', shoes: ROSA, accessory: 'bow', accessoryColor: '#ff5c9a' }, '#ff9ec7', { accessory: 'bow', accessoryColor: '#ff5c9a' }),
  def('Dolly', { hair: RUBIO, hairStyle: 'long', top: '#c8a2e8', topStyle: 'tshirt', bottom: '#8a6bb0', bottomStyle: 'skirt', shoes: '#8a6bb0', accessory: 'bow', accessoryColor: '#e8c0f0' }, '#b57be0', { accessory: 'bow', accessoryColor: '#e8c0f0' }),
  def('Destiny', { hair: NEGRO, hairStyle: 'wavy', top: '#7b3fb8', topStyle: 'tshirt', bottom: NEGRO, bottomStyle: 'skirt', shoes: NEGRO }, '#7b3fb8'),
  def('Bambi', { hair: RUBIO, hairStyle: 'pigtails', top: '#8ecbf0', topStyle: 'tshirt', bottom: '#5aa0d0', bottomStyle: 'skirt', shoes: '#5aa0d0', accessory: 'bow', accessoryColor: ROSA }, '#5ec2ff', { accessory: 'bow', accessoryColor: ROSA }),
  def('Trixie', { hair: '#3a2a20', hairStyle: 'bun', top: GRIS, topStyle: 'hoodie', bottom: '#2b2f3a', bottomStyle: 'pants', shoes: NEGRO, accessory: 'glasses', accessoryColor: '#222222' }, '#ff4fa3', { bottom: '#ff4fa3' }),
  def('Candy', { hair: '#ff7ab0', hairStyle: 'ponytail', top: ROSA, topStyle: 'hoodie', bottom: '#2b2f3a', bottomStyle: 'shorts', shoes: ROSA }, '#ff5c9a'),
  def('Barbie', { hair: RUBIO, hairStyle: 'long', top: '#ff1493', topStyle: 'tshirt', bottom: '#ff1493', bottomStyle: 'skirt', shoes: '#ff1493' }, '#ff1493', { bottom: '#ff1493' }),
  def('Brandi', { hair: '#c8461e', hairStyle: 'short', top: BLANCO, topStyle: 'polo', bottom: '#2b2f3a', bottomStyle: 'pants', shoes: NEGRO, accessory: 'glasses', accessoryColor: '#222222' }, '#e0592a', { accessory: 'glasses', accessoryColor: '#222222' }),
  def('Loreto', { hair: '#4a3020', hairStyle: 'bun', top: BLANCO, topStyle: 'blouse', bottom: GRIS, bottomStyle: 'skirt', shoes: NEGRO, accessory: 'glasses', accessoryColor: '#222222' }, '#8a8a8a', { accessory: 'glasses', accessoryColor: '#222222' }),
  def('Coni', { hair: '#7a4a2a', hairStyle: 'short', top: '#9bd18b', topStyle: 'sweater', bottom: '#2b2f3a', bottomStyle: 'pants', shoes: NEGRO }, '#58c47a'),
  def('Maite', { hair: '#2d1f3a', hairStyle: 'bob', top: '#e8b4d8', topStyle: 'blouse', bottom: GRIS, bottomStyle: 'skirt', shoes: NEGRO, accessory: 'glasses', accessoryColor: '#222222' }, '#c46ab0', { accessory: 'glasses', accessoryColor: ORO }),
  def('Trini', { hair: '#ffb347', hairStyle: 'ponytail', top: '#ffd9a0', topStyle: 'shirt_tie', bottom: '#2b2f3a', bottomStyle: 'shorts', shoes: NEGRO, accessory: 'headphones', accessoryColor: '#333333' }, '#ff9a2f', { accessory: 'headphones', accessoryColor: NEGRO }),
  def('Roxxy', { hair: '#2a2a2a', hairStyle: 'short', top: '#d02a2a', topStyle: 'jacket', bottom: NEGRO, bottomStyle: 'pants', shoes: NEGRO, accessory: 'sunglasses', accessoryColor: '#111111' }, '#ff3b3b', { accessory: 'sunglasses', accessoryColor: '#111111' }),
  // Las cuatro hermanas: looks propuestos por Ele; la Ama los ajusta.
  def('Lulú', { hair: '#ff9ec7', hairStyle: 'wavy', top: '#ffe0ef', topStyle: 'blouse', bottom: ROSA, bottomStyle: 'skirt', shoes: ROSA, accessory: 'bow', accessoryColor: '#ff5c9a' }, '#ff2f9a', { accessory: 'bow', accessoryColor: '#ff5c9a' }),
  def('Delmira', { hair: '#3b1f2b', hairStyle: 'bun', top: '#d8c3a5', topStyle: 'sweater', bottom: '#4a3a2a', bottomStyle: 'skirt', shoes: NEGRO, accessory: 'glasses', accessoryColor: '#5a3a1a' }, '#8c1c3a', { accessory: 'glasses', accessoryColor: ORO }),
  def('Perla', { hair: '#f2ecd8', hairStyle: 'long', top: '#cfe8f0', topStyle: 'blouse', bottom: BLANCO, bottomStyle: 'skirt', shoes: '#cfe8f0', accessory: 'earrings', accessoryColor: BLANCO }, '#e8f1f5', { accessoryColor: BLANCO }),
  def('Pía', { hair: '#2b1b4a', hairStyle: 'pigtails', top: '#b9a3f0', topStyle: 'hoodie', bottom: '#2b2f3a', bottomStyle: 'shorts', shoes: '#b9a3f0', accessory: 'headphones', accessoryColor: '#7b3fb8' }, '#9b6bff', { accessory: 'headphones', accessoryColor: '#9b6bff' }),
];

export const VOUTE_AGENTES: Readonly<Record<string, VouteAgente>> = Object.fromEntries(LISTA.map((a) => [a.name.toLowerCase(), a]));

const copia = (a: VouteAgente): VouteAgente => ({ name: a.name, parts: { ...a.parts }, partsVoute: { ...a.partsVoute } });

/** Personagem fixo para o tipo de subagente (`role`), ou undefined (azar). Sem diferenciar caixa. */
export function vouteAgente(role: string | undefined): VouteAgente | undefined {
  if (!role) return undefined;
  const a = VOUTE_AGENTES[role.trim().normalize('NFC').toLowerCase()];
  return a ? copia(a) : undefined;
}

/** Igual a vouteAgente, pelo nome (caixa e acentos NFC não importam). */
export function vouteAgentePorNombre(name: string | undefined): VouteAgente | undefined {
  return vouteAgente(name);
}
