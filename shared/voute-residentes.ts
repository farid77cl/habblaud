// Residentes de La Voûte: todo el roster siempre en la oficina, en reposo; una agente real del mismo tipo ocupa su asiento.
import type { AgentInfo } from './types';
import { VOUTE_AGENTES } from './voute-agentes';

export const VOUTE_ROOM_ID = 'voute:residentes';
export const VOUTE_ROOM_NAME = 'La Voûte';

function hash32(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
  return h >>> 0;
}

const norm = (s: string) => s.trim().normalize('NFC').toLowerCase();

/** Residentes que faltan por asiento: las del roster sin una agente real (no offline) del mismo tipo (role o nombre). */
export function residentesAusentes(real: readonly AgentInfo[], now: number): AgentInfo[] {
  const ocupados = new Set<string>();
  for (const a of real) {
    if (a.status === 'offline') continue;
    ocupados.add(norm(a.name));
    if (a.role) ocupados.add(norm(a.role));
  }
  return Object.entries(VOUTE_AGENTES)
    .filter(([k]) => !ocupados.has(k))
    .map(([k, v]) => ({
      id: `voute:${k}`,
      kind: 'main' as const,
      roomId: VOUTE_ROOM_ID,
      name: v.name,
      look: 'f' as const,
      role: v.name,
      sessionId: `voute:${k}`,
      account: 'voute',
      status: 'idle' as const,
      recent: [],
      tasks: [],
      startedAt: now,
      lastEventAt: now,
      statusSince: now,
      stats: { toolCalls: 0, tokensIn: 0, tokensOut: 0, subagents: 0 },
      seed: hash32(k),
      parts: { ...v.parts },
    }));
}
