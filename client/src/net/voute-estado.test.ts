import { describe, expect, it } from 'vitest';
import type { AgentInfo, OfficeSnapshot } from '../../../shared/types';
import { VOUTE_AGENTES } from '../../../shared/voute-agentes';
import { VOUTE_KEY, aplicarVoute, leerVoute, guardarVoute } from '../net/voute-estado';

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), key: () => null, length: 0 };
};
const ag = (name: string, extra: Partial<AgentInfo> = {}) => ({ id: name, name, parts: { top: '#111111' }, ...extra }) as AgentInfo;
const snap = (agents: AgentInfo[]) => ({ rev: 1, agents }) as unknown as OfficeSnapshot;

describe('La Voûte (cliente)', () => {
  it('el estado se recuerda en localStorage; sin storage es falso', () => {
    const st = mem();
    expect(leerVoute(st)).toBe(false);
    guardarVoute(st, true);
    expect(st.getItem(VOUTE_KEY)).toBe('1');
    expect(leerVoute(st)).toBe(true);
    guardarVoute(st, false);
    expect(leerVoute(st)).toBe(false);
    expect(leerVoute(null)).toBe(false);
  });
  it('apagado devuelve el mismo snapshot', () => {
    const s = snap([ag('Chanel')]);
    expect(aplicarVoute(s, false)).toBe(s);
  });
  it('encendido: partsVoute a las del roster; el resto y los custom quedan', () => {
    const s = snap([ag('Chanel'), ag('Marina'), ag('Kitty', { custom: true })]);
    const o = aplicarVoute(s, true);
    expect(o.agents[0].parts).toEqual(VOUTE_AGENTES.chanel.partsVoute);
    expect(o.agents[1].parts).toEqual({ top: '#111111' });
    expect(o.agents[2].parts).toEqual({ top: '#111111' });
    expect(s.agents[0].parts).toEqual({ top: '#111111' });
  });
});
