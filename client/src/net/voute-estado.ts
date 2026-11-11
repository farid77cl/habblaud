// Estado puro de La Voûte (cliente): interruptor recordado en localStorage y look Voûte de los agentes.
import type { OfficeSnapshot } from '../../../shared/types';
import { vouteAgentePorNombre } from '../../../shared/voute-agentes';

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
  return {
    ...snap,
    agents: snap.agents.map((a) => {
      const v = a.custom ? undefined : vouteAgentePorNombre(a.name);
      return v ? { ...a, parts: v.partsVoute } : a;
    }),
  };
}

