// Estado puro de La Voûte (cliente): interruptor recordado en localStorage y look Voûte de los agentes.
import { hash32 } from '../../../shared/hash';
import type { OfficeSnapshot, RoomInfo } from '../../../shared/types';
import { vouteAgentePorNombre } from '../../../shared/voute-agentes';
import { VOUTE_SALAS, residentesAusentes } from '../../../shared/voute-residentes';

export const VOUTE_KEY = 'habblaud:voute';
export const VOUTE_CLASS = 'voute';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function leerVoute(st: Store | null): boolean {
  try {
    return st?.getItem(VOUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function guardarVoute(st: Store | null, on: boolean): void {
  try {
    if (on) st?.setItem(VOUTE_KEY, '1');
    else st?.removeItem(VOUTE_KEY);
  } catch {
    /* sin storage: el estado vale solo esta sesión */
  }
}

/** Snapshot con el look Voûte en los agentes del roster (los personajes elegidos a mano en el editor no se tocan). */
export function aplicarVoute(snap: OfficeSnapshot, on: boolean): OfficeSnapshot {
  if (!on) return snap;
  let rooms = snap.rooms;
  let baseAgents = snap.agents;
  if (snap.meta?.demo && Array.isArray(snap.rooms) && !snap.rooms.some((r) => r.id.startsWith('voute:'))) {
    const now = snap.serverTime || Date.now();
    const vouteRooms: RoomInfo[] = VOUTE_SALAS.map((s, idx) => ({
      id: s.id,
      name: s.name,
      path: s.name,
      slot: idx,
      seed: hash32(s.id),
      createdAt: snap.meta?.startedAt ?? now,
    }));
    rooms = vouteRooms;
    const res = residentesAusentes([], now);
    const mains = snap.agents.filter((a) => a.kind === 'main' && a.status !== 'offline');
    baseAgents = res.map((r, i) => {
      const m = mains[i];
      if (!m) return r;
      return {
        ...r,
        status: m.status,
        activity: m.activity,
        recent: m.recent,
        tasks: m.tasks,
        shells: m.shells,
        stats: m.stats,
      };
    });
  }
  return {
    ...snap,
    ...(rooms !== snap.rooms ? { rooms } : {}),
    agents: baseAgents.map((a) => {
      const v = a.custom ? undefined : vouteAgentePorNombre(a.name);
      return v ? { ...a, parts: v.partsVoute } : a;
    }),
  };
}

