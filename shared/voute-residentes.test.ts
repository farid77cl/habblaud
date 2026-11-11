import { describe, expect, it } from 'vitest';
import type { AgentInfo } from './types';
import { VOUTE_SALAS, residentesAusentes } from './voute-residentes';
import { VOUTE_AGENTES } from './voute-agentes';

const real = (name: string, role = 'x'): AgentInfo => ({ id: name, name, role, kind: 'sub', status: 'working' }) as AgentInfo;

describe('residentes', () => {
  it('sin nadie real salen todas, en reposo, repartidas en las salas de La Voûte', () => {
    const r = residentesAusentes([], 1000);
    expect(r).toHaveLength(Object.keys(VOUTE_AGENTES).length);
    for (const a of r) {
      expect(a.status).toBe('idle');
      expect(VOUTE_SALAS.map((x) => x.id)).toContain(a.roomId);
      expect(a.parts).toBeDefined();
      expect(a.recent).toEqual([]);
    }
    expect(new Set(r.map((a) => a.id)).size).toBe(r.length);
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
});
