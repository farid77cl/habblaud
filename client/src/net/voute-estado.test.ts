import { describe, expect, it } from 'vitest';
import type { AgentInfo, OfficeSnapshot, RoomInfo } from '../../../shared/types';
import { VOUTE_AGENTES } from '../../../shared/voute-agentes';
import { VOUTE_SALAS } from '../../../shared/voute-residentes';
import { EXTRAS_KEY, VOUTE_KEY, aplicarVoute, crearExtra, guardarExtras, guardarVoute, leerExtras, leerVoute } from '../net/voute-estado';

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), key: () => null, length: 0 };
};
const ag = (name: string, extra: Partial<AgentInfo> = {}) => ({ id: name, name, kind: 'main', status: 'working', roomId: 'r1', parts: { top: '#111111' }, ...extra }) as AgentInfo;
const room = (id: string, slot: number, path = `/p/${id}`) => ({ id, name: id, path, slot, seed: 1, createdAt: 0 }) as RoomInfo;
const snap = (agents: AgentInfo[], rooms: RoomInfo[] = []) => ({ rev: 1, serverTime: 1000, agents, rooms, meta: { startedAt: 500 } }) as unknown as OfficeSnapshot;
const residentes = (s: OfficeSnapshot) => s.agents.filter((a) => a.id.startsWith('voute:'));

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

  it('modo normal: suma las seis salas y todas las residentes en reposo, con nombre de oficina y look normal', () => {
    const o = aplicarVoute(snap([]), false);
    expect(o.rooms.map((r) => r.id)).toEqual(VOUTE_SALAS.map((s) => s.id));
    expect(o.rooms.map((r) => r.name)).toContain('Portería');
    expect(o.rooms.map((r) => r.name)).not.toContain('Entrada');
    const res = residentes(o);
    expect(res).toHaveLength(Object.keys(VOUTE_AGENTES).length);
    expect(res.every((a) => a.status === 'idle')).toBe(true);
    expect(res.find((a) => a.name === 'Chanel')?.parts).toEqual(VOUTE_AGENTES.chanel.parts);
  });

  it('La Voûte encendida: nombres de los espacios y look Voûte', () => {
    const o = aplicarVoute(snap([]), true);
    expect(o.rooms.map((r) => r.name)).toEqual(expect.arrayContaining(['Entrada', 'Barra', 'Sala de maquillaje', 'Privados', 'Escenario', 'Habitación de Anaïs']));
    expect(residentes(o).find((a) => a.name === 'Chanel')?.parts).toEqual(VOUTE_AGENTES.chanel.partsVoute);
  });

  it('las salas de La Voûte toman los slots libres y no pisan a las reales', () => {
    const real = [room('/p/a', 0), room('/p/b', 2)];
    const o = aplicarVoute(snap([], real), false);
    const slots = o.rooms.map((r) => r.slot);
    expect(new Set(slots).size).toBe(slots.length);
    expect(o.rooms.filter((r) => r.id.startsWith('voute:')).map((r) => r.slot)).toEqual([1, 3, 4, 5, 6, 7]);
    expect(o.rooms.find((r) => r.id === '/p/a')?.slot).toBe(0);
  });

  it('LV compacto: seis salas, agentes reales por oficio y vuelta a los proyectos al apagar', () => {
    const original = snap([
      ag('Ele', { custom: true }),
      ag('Azar', { id: 's1', kind: 'sub', role: 'dolly' }),
      ag('Ele · Codex', { id: 'codex', roomId: 'r2', provider: 'codex', custom: true }),
    ], [room('r1', 8), room('r2', 17)]);
    const before = JSON.stringify(original);
    const compact = aplicarVoute(original, true);
    expect(compact.rooms).toHaveLength(6);
    expect(compact.rooms.map((r) => r.slot)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(compact.agents.find((a) => a.id === 's1')).toMatchObject({ name: 'Dolly', roomId: 'voute:privados' });
    expect(compact.agents.find((a) => a.id === 'codex')).toMatchObject({ name: 'Ele · Codex', roomId: 'voute:entrada' });
    expect(compact.agents.every((a) => compact.rooms.some((r) => r.id === a.roomId))).toBe(true);
    expect(JSON.stringify(original)).toBe(before);
    expect(aplicarVoute(original, false).agents.find((a) => a.id === 'codex')?.roomId).toBe('r2');
  });

  it('no toca el snapshot crudo', () => {
    const s = snap([ag('Marina')], [room('r1', 0)]);
    const copia = JSON.stringify(s);
    aplicarVoute(s, true, { eleRuta: '/p/r1' });
    expect(JSON.stringify(s)).toBe(copia);
  });

  it('una real del mismo tipo ocupa el asiento de la residente; las demás reales no cambian', () => {
    const real = [ag('Marina', { roomId: 'r1' }), ag('x', { id: 's1', kind: 'sub', role: 'chanel', name: 'Zoe', parts: undefined })];
    const o = aplicarVoute(snap(real, [room('r1', 0)]), false);
    expect(o.agents.filter((a) => a.name === 'Chanel')).toHaveLength(1);
    expect(o.agents.find((a) => a.id === 's1')?.parts).toEqual(VOUTE_AGENTES.chanel.parts);
    expect(o.agents.find((a) => a.id === 'Marina')?.name).toBe('Marina');
  });

  it('LV: el look Voûte llega a las del roster; los personajes elegidos a mano no se tocan', () => {
    const o = aplicarVoute(snap([ag('Chanel'), ag('Marina'), ag('Kitty', { custom: true })]), true);
    expect(o.agents.find((a) => a.id === 'Chanel')?.parts).toEqual(VOUTE_AGENTES.chanel.partsVoute);
    expect(o.agents.find((a) => a.id === 'Marina')?.parts).toEqual({ top: '#111111' });
    expect(o.agents.find((a) => a.id === 'Kitty')?.parts).toEqual({ top: '#111111' });
  });

  it('Ele: la principal real cuya ruta contiene LaVouteDAnais se llama Ele, con una copia del look', () => {
    const rooms = [room('r1', 0, '/c/Git/LaVouteDAnais/99_Sistema'), room('r2', 1, '/c/Git/otro')];
    const real = [ag('Ana', { id: 'a1', roomId: 'r1' }), ag('Beto', { id: 'a2', roomId: 'r2' })];
    const o = aplicarVoute(snap(real, rooms), false);
    const ele = o.agents.find((a) => a.id === 'a1')!;
    expect(ele.name).toBe('Ele');
    expect(ele.parts).toEqual(VOUTE_AGENTES.ele.parts);
    expect(ele.parts).not.toBe(VOUTE_AGENTES.ele.parts);
    expect(o.agents.find((a) => a.id === 'a2')?.name).toBe('Beto');
    expect(o.agents.filter((a) => a.name === 'Ele')).toHaveLength(1);
  });

  it('Ele no depende del nombre de la carpeta: una ruta configurada también vale; un nombre parecido no', () => {
    const rooms = [room('r1', 0, '/home/x/worktrees/clon-raro'), room('r2', 1, '/c/Git/lavoutedanais-viejo')];
    const real = [ag('Ana', { id: 'a1', roomId: 'r1' }), ag('Beto', { id: 'a2', roomId: 'r2' })];
    const sin = aplicarVoute(snap(real, rooms), false);
    expect(sin.agents.find((a) => a.id === 'a1')?.name).toBe('Ana');
    expect(sin.agents.find((a) => a.id === 'a2')?.name).toBe('Beto');
    const con = aplicarVoute(snap(real, rooms), false, { eleRuta: '/home/x/worktrees/clon-raro' });
    expect(con.agents.find((a) => a.id === 'a1')?.name).toBe('Ele');
  });

  it('«+ Agente»: la residente extra aparece en la sala de su oficio y se recuerda en localStorage', () => {
    const st = mem();
    guardarExtras(st, [{ id: 'voute:extra-1', nombre: 'Mia', sala: 'escenario' }]);
    expect(st.getItem(EXTRAS_KEY)).toContain('Mia');
    const extras = leerExtras(st);
    expect(extras).toEqual([{ id: 'voute:extra-1', nombre: 'Mia', sala: 'escenario' }]);
    const mia = aplicarVoute(snap([]), false, { extras }).agents.find((a) => a.name === 'Mia')!;
    expect(mia.roomId).toBe('voute:escenario');
    expect(mia.status).toBe('idle');
  });

  it('leerExtras descarta lo inválido y no revienta sin storage', () => {
    const st = mem();
    st.setItem(EXTRAS_KEY, JSON.stringify([{ id: 'x', nombre: 'Mal', sala: 'escenario' }, { id: 'voute:extra-2', nombre: 'Ok', sala: 'nada' }, { id: 'voute:extra-3', nombre: 'Bien', sala: 'barra' }]));
    expect(leerExtras(st)).toEqual([{ id: 'voute:extra-3', nombre: 'Bien', sala: 'barra' }]);
    st.setItem(EXTRAS_KEY, '{no json');
    expect(leerExtras(st)).toEqual([]);
    expect(leerExtras(null)).toEqual([]);
  });

  it('crearExtra valida nombre y oficio, y da ids que no se repiten', () => {
    expect(crearExtra('  ', 'barra', [])).toBeNull();
    expect(crearExtra('Mia', 'cocina', [])).toBeNull();
    const a = crearExtra(' Mia  ', 'barra', [])!;
    expect(a).toMatchObject({ nombre: 'Mia', sala: 'barra' });
    expect(a.id).toMatch(/^voute:extra-[a-z0-9]+$/);
    const b = crearExtra('Lola', 'anais', [a])!;
    expect(b.id).not.toBe(a.id);
    const llenas = Array.from({ length: 40 }, (_, i) => ({ id: `voute:extra-${i}`, nombre: `N${i}`, sala: 'barra' as const }));
    expect(crearExtra('Una más', 'barra', llenas)).toBeNull();
  });
});
