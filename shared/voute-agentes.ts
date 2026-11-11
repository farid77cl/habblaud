// Subagentes de La Voûte: cada tipo (campo `role`) sale con su nombre y su look fijos; el resto sigue al azar.
import type { AppearanceParts } from './appearance';

export interface VouteAgente {
  name: string;
  parts: AppearanceParts;
}

const NEGRO = '#1a1a1a';
const BLANCO = '#f5f5f5';
const GRIS = '#6b6b6b';
const ROSA = '#ff8fb8';
const RUBIO = '#e8c872';

export const VOUTE_AGENTES: Readonly<Record<string, VouteAgente>> = {
  chanel: { name: 'Chanel', parts: { hair: NEGRO, hairStyle: 'bob', top: NEGRO, topStyle: 'blouse', bottom: NEGRO, bottomStyle: 'skirt', shoes: NEGRO, accessory: 'earrings', accessoryColor: '#d4af37' } },
  flash: { name: 'Flash', parts: { hair: '#6b4423', hairStyle: 'ponytail', top: BLANCO, topStyle: 'tshirt', bottom: NEGRO, bottomStyle: 'pants', shoes: NEGRO, accessory: 'cap', accessoryColor: '#2b2b2b' } },
  gomita: { name: 'Gomita', parts: { hair: NEGRO, hairStyle: 'long', top: '#ff1f3d', topStyle: 'tshirt', bottom: NEGRO, bottomStyle: 'skirt', shoes: '#d81b3a', accessory: 'sunglasses', accessoryColor: '#111111' } },
  kitty: { name: 'Kitty', parts: { hair: '#4a3020', hairStyle: 'pigtails', top: BLANCO, topStyle: 'blouse', bottom: GRIS, bottomStyle: 'skirt', shoes: NEGRO, accessory: 'glasses', accessoryColor: '#222222' } },
  prada: { name: 'Prada', parts: { hair: '#5a1f12', hairStyle: 'long', top: '#f2e6c9', topStyle: 'blouse', bottom: NEGRO, bottomStyle: 'skirt', shoes: NEGRO, accessory: 'earrings', accessoryColor: '#d4af37' } },
  peaches: { name: 'Peaches', parts: { hair: '#f4a0c0', hairStyle: 'wavy', top: ROSA, topStyle: 'tshirt', bottom: BLANCO, bottomStyle: 'skirt', shoes: ROSA, accessory: 'bow', accessoryColor: '#ff5c9a' } },
  dolly: { name: 'Dolly', parts: { hair: RUBIO, hairStyle: 'long', top: '#c8a2e8', topStyle: 'tshirt', bottom: '#8a6bb0', bottomStyle: 'skirt', shoes: '#8a6bb0', accessory: 'bow', accessoryColor: '#e8c0f0' } },
  destiny: { name: 'Destiny', parts: { hair: NEGRO, hairStyle: 'wavy', top: '#7b3fb8', topStyle: 'tshirt', bottom: NEGRO, bottomStyle: 'skirt', shoes: NEGRO } },
  bambi: { name: 'Bambi', parts: { hair: RUBIO, hairStyle: 'pigtails', top: '#8ecbf0', topStyle: 'tshirt', bottom: '#5aa0d0', bottomStyle: 'skirt', shoes: '#5aa0d0', accessory: 'bow', accessoryColor: ROSA } },
  trixie: { name: 'Trixie', parts: { hair: '#3a2a20', hairStyle: 'bun', top: GRIS, topStyle: 'hoodie', bottom: '#2b2f3a', bottomStyle: 'pants', shoes: NEGRO, accessory: 'glasses', accessoryColor: '#222222' } },
  candy: { name: 'Candy', parts: { hair: '#ff7ab0', hairStyle: 'ponytail', top: ROSA, topStyle: 'hoodie', bottom: '#2b2f3a', bottomStyle: 'shorts', shoes: ROSA } },
  barbie: { name: 'Barbie', parts: { hair: RUBIO, hairStyle: 'long', top: '#ff1493', topStyle: 'tshirt', bottom: '#ff1493', bottomStyle: 'skirt', shoes: '#ff1493' } },
  brandi: { name: 'Brandi', parts: { hair: '#c8461e', hairStyle: 'short', top: BLANCO, topStyle: 'polo', bottom: '#2b2f3a', bottomStyle: 'pants', shoes: NEGRO, accessory: 'glasses', accessoryColor: '#222222' } },
  loreto: { name: 'Loreto', parts: { hair: '#4a3020', hairStyle: 'bun', top: BLANCO, topStyle: 'blouse', bottom: GRIS, bottomStyle: 'skirt', shoes: NEGRO, accessory: 'glasses', accessoryColor: '#222222' } },
};

/** Personagem fixo para o tipo de subagente (`role`), ou undefined (azar). Sem diferenciar caixa. */
export function vouteAgente(role: string | undefined): VouteAgente | undefined {
  if (!role) return undefined;
  const a = VOUTE_AGENTES[role.trim().toLowerCase()];
  return a ? { name: a.name, parts: { ...a.parts } } : undefined;
}
