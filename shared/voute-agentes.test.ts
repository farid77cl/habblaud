import { describe, expect, it } from 'vitest';
import { parseAppearanceParts, parseCharacterName } from './appearance';
import { VOUTE_AGENTES, vouteAgente, vouteAgentePorNombre } from './voute-agentes';

const ROSTER = [
  'Ele', 'Chanel', 'Flash', 'Gomita', 'Kitty', 'Prada', 'Peaches', 'Dolly', 'Destiny', 'Bambi', 'Brandi', 'Loreto', 'Trixie',
  'Candy', 'Barbie', 'Coni', 'Maite', 'Trini', 'Roxxy', 'Lulú', 'Delmira', 'Perla', 'Pía',
];

describe('voute-agentes', () => {
  it('trae todo el roster del spec', () => {
    expect(Object.values(VOUTE_AGENTES).map((a) => a.name).sort()).toEqual([...ROSTER].sort());
  });
  it.each(Object.entries(VOUTE_AGENTES))('%s: nombre y los dos looks válidos', (k, a) => {
    expect(parseCharacterName(a.name)).toBe(a.name);
    expect(a.name.toLowerCase()).toBe(k);
    expect(parseAppearanceParts(a.parts)).not.toBeNull();
    expect(parseAppearanceParts(a.partsVoute)).not.toBeNull();
    expect(JSON.stringify(a.partsVoute)).not.toBe(JSON.stringify(a.parts));
  });
  it('busca sin caja y los desconocidos son azar', () => {
    expect(vouteAgente(' Chanel ')?.name).toBe('Chanel');
    expect(vouteAgente('general-purpose')).toBeUndefined();
    expect(vouteAgente(undefined)).toBeUndefined();
  });
  it('busca por nombre con acentos y devuelve copias', () => {
    const a = vouteAgentePorNombre('LULÚ');
    expect(a?.name).toBe('Lulú');
    a!.partsVoute.top = '#000000';
    expect(vouteAgentePorNombre('Lulú')!.partsVoute.top).not.toBe('#000000');
  });
});
