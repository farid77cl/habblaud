// Residentes de La Voûte: todo el roster siempre en la oficina, en reposo; una agente real del mismo tipo ocupa su asiento.
import type { AgentInfo } from './types';
import { hash32 } from './hash';
import { tr } from './i18n';
import { VOUTE_AGENTES } from './voute-agentes';

export type VouteSalaKey = 'entrada' | 'barra' | 'maquillaje' | 'privados' | 'escenario' | 'anais';

export interface VouteSala {
  id: string;
  key: VouteSalaKey;
}

/** Las seis salas de La Voûte (solo de la vista): las residentes se reparten por oficio. */
export const VOUTE_SALAS: readonly VouteSala[] = (['entrada', 'barra', 'maquillaje', 'privados', 'escenario', 'anais'] as const).map((key) => ({
  id: `voute:${key}`,
  key,
}));

/** Nombre de la sala: de oficina con el modo normal, del espacio de cabaret con La Voûte encendida. */
export function vouteSalaNombre(id: string, lv = false): string | undefined {
  const k = VOUTE_SALAS.find((s) => s.id === id)?.key;
  if (!k) return undefined;
  switch (k) {
    case 'entrada':
      return lv ? tr('Entrada') : tr('Portería');
    case 'barra':
      return tr('Barra');
    case 'maquillaje':
      return lv ? tr('Sala de maquillaje') : tr('Camarín');
    case 'privados':
      return lv ? tr('Privados') : tr('Reservados');
    case 'escenario':
      return tr('Escenario');
    case 'anais':
      return lv ? tr('Habitación de Anaïs') : tr('Despacho de Anaïs');
  }
}

const SALA_DE: Readonly<Record<string, VouteSalaKey>> = {
  ele: 'entrada', kitty: 'entrada', destiny: 'entrada', loreto: 'entrada',
  perla: 'barra', maite: 'barra', peaches: 'barra', gomita: 'barra',
  chanel: 'maquillaje', prada: 'maquillaje', barbie: 'maquillaje', 'lulú': 'maquillaje', flash: 'maquillaje',
  brandi: 'privados', delmira: 'privados', dolly: 'privados', bambi: 'privados',
  roxxy: 'escenario', coni: 'escenario', trini: 'escenario', 'pía': 'escenario',
  trixie: 'anais', candy: 'anais',
};

export const vouteSalaId = (key: string): string => `voute:${SALA_DE[key] ?? 'entrada'}`;

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
      roomId: vouteSalaId(k),
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

export interface ResidenteExtra {
  id: string;
  nombre: string;
  sala: VouteSalaKey;
}

/** Residente agregada a mano con «+ Agente»: nombre y oficio elegidos, en reposo en la sala de su oficio. Solo de la vista. */
export function residenteExtra(e: ResidenteExtra, now: number): AgentInfo {
  return {
    id: e.id,
    kind: 'main',
    roomId: `voute:${e.sala}`,
    name: e.nombre,
    look: 'f',
    role: e.nombre,
    sessionId: e.id,
    account: 'voute',
    status: 'idle',
    recent: [],
    tasks: [],
    startedAt: now,
    lastEventAt: now,
    statusSince: now,
    stats: { toolCalls: 0, tokensIn: 0, tokensOut: 0, subagents: 0 },
    seed: hash32(e.id),
  };
}
