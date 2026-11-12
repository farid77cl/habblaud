import { describe, expect, it } from 'vitest';
import type { AgentInfo } from './types';
import { VOUTE_SALAS, residenteExtra, residentesAusentes, vouteSalaId, vouteSalaNombre } from './voute-residentes';
import { VOUTE_AGENTES } from './voute-agentes';

const real = (name: string, role = 'x'): AgentInfo => ({ id: name, name, role, kind: 'sub', status: 'working' }) as AgentInfo;

describe('residentes', () => {
  it('son seis salas, cada una con nombre de oficina y nombre de cabaret', () => {
    expect(VOUTE_SALAS.map((s) => s.key)).toEqual(['entrada', 'barra', 'maquillaje', 'privados', 'escenario', 'anais']);
    expect(VOUTE_SALAS.every((s) => s.id === `voute:${s.key}`)).toBe(true);
    expect(vouteSalaNombre('voute:anais', true)).toBe('Habitación de Anaïs');
    expect(vouteSalaNombre('voute:anais')).not.toBe(vouteSalaNombre('voute:anais', true));
    expect(vouteSalaNombre('voute:maquillaje', true)).toBe('Sala de maquillaje');
    expect(vouteSalaNombre('/p/real')).toBeUndefined();
  });
  it('sin nadie real salen todas, en reposo, repartidas por oficio en las seis salas, con gente en cada una', () => {
    const r = residentesAusentes([], 1000);
    expect(r).toHaveLength(Object.keys(VOUTE_AGENTES).length);
    for (const a of r) {
      expect(a.status).toBe('idle');
      expect(VOUTE_SALAS.map((x) => x.id)).toContain(a.roomId);
      expect(a.parts).toBeDefined();
      expect(a.recent).toEqual([]);
    }
    expect(new Set(r.map((a) => a.id)).size).toBe(r.length);
    expect(new Set(r.map((a) => a.roomId)).size).toBe(6);
    expect(r.find((a) => a.name === 'Chanel')?.roomId).toBe(vouteSalaId('chanel'));
  });
  it('una real del mismo tipo (por role o por nombre) ocupa su asiento: no se duplica', () => {
    const r = residentesAusentes([real('Zoe', 'chanel'), real('Kitty')], 1000).map((a) => a.name);
    expect(r).not.toContain('Chanel');
    expect(r).not.toContain('Kitty');
    expect(r).toContain('Ele');
  });
  it('una real offline no ocupa asiento', () => {
    const off = { ...real('Zoe', 'chanel'), status: 'offline' } as AgentInfo;
    expect(residentesAusentes([off], 1000).map((a) => a.name)).toContain('Chanel');
  });
  it('«+ Agente»: la residente extra cae en la sala de su oficio, en reposo, con id voute:*', () => {
    const a = residenteExtra({ id: 'voute:extra-1', nombre: 'Mia', sala: 'escenario' }, 5);
    expect(a).toMatchObject({ id: 'voute:extra-1', name: 'Mia', roomId: 'voute:escenario', status: 'idle', kind: 'main' });
  });
});
