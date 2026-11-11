import { describe, expect, it } from 'vitest';
import { parseAppearanceParts, parseCharacterName } from './appearance';
import { VOUTE_AGENTES, vouteAgente } from './voute-agentes';

describe('voute-agentes', () => {
  it('trae los 14 tipos', () => expect(Object.keys(VOUTE_AGENTES)).toHaveLength(14));
  it.each(Object.entries(VOUTE_AGENTES))('%s: nombre y partes válidos', (k, a) => {
    expect(parseCharacterName(a.name)).toBe(a.name);
    expect(a.name[0]).toBe(a.name[0].toUpperCase());
    expect(a.name.toLowerCase()).toBe(k);
    expect(parseAppearanceParts(a.parts)).not.toBeNull();
  });
  it('busca sin caja y los desconocidos son azar', () => {
    expect(vouteAgente(' Chanel ')?.name).toBe('Chanel');
    expect(vouteAgente('general-purpose')).toBeUndefined();
    expect(vouteAgente(undefined)).toBeUndefined();
  });
});
