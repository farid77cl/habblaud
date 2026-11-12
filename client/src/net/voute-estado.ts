// Estado puro de La Voûte (cliente): interruptor recordado en localStorage y look Voûte de los agentes.
import { parseCharacterName } from '../../../shared/appearance';
import { hash32 } from '../../../shared/hash';
import type { AgentInfo, OfficeSnapshot, RoomInfo } from '../../../shared/types';
import { vouteAgente } from '../../../shared/voute-agentes';
import { VOUTE_SALAS, residenteExtra, residentesAusentes, vouteSalaNombre, type ResidenteExtra, type VouteSalaKey } from '../../../shared/voute-residentes';

export const VOUTE_KEY = 'habblaud:voute';
export const VOUTE_CLASS = 'voute';
export const EXTRAS_KEY = 'habblaud:voute-extras';
/** Ruta (opcional) de la carpeta cuya principal es Ele, si el nombre de la carpeta no es LaVouteDAnais. */
export const ELE_RUTA_KEY = 'habblaud:voute-ele';
const EXTRAS_MAX = 40;

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

const SALAS_VALIDAS = new Set<string>(VOUTE_SALAS.map((s) => s.key));

export function leerExtras(st: Store | null): ResidenteExtra[] {
  try {
    const raw = JSON.parse(st?.getItem(EXTRAS_KEY) ?? '[]') as unknown;
    if (!Array.isArray(raw)) return [];
    const out: ResidenteExtra[] = [];
    for (const e of raw as Array<Partial<ResidenteExtra>>) {
      const nombre = parseCharacterName(e?.nombre);
      if (!nombre || typeof e.id !== 'string' || !/^voute:extra-[a-z0-9]+$/.test(e.id)) continue;
      if (typeof e.sala !== 'string' || !SALAS_VALIDAS.has(e.sala)) continue;
      out.push({ id: e.id, nombre, sala: e.sala as VouteSalaKey });
      if (out.length >= EXTRAS_MAX) break;
    }
    return out;
  } catch {
    return [];
  }
}

export function guardarExtras(st: Store | null, extras: readonly ResidenteExtra[]): void {
  try {
    if (extras.length) st?.setItem(EXTRAS_KEY, JSON.stringify(extras.slice(0, EXTRAS_MAX)));
    else st?.removeItem(EXTRAS_KEY);
  } catch {
    /* sin storage: valen solo esta sesión */
  }
}

/** Una residente nueva para «+ Agente»: null si el nombre o el oficio no valen o ya no caben más. */
export function crearExtra(nombre: string, sala: string, existentes: readonly ResidenteExtra[]): ResidenteExtra | null {
  const limpio = parseCharacterName(nombre);
  if (!limpio || !SALAS_VALIDAS.has(sala) || existentes.length >= EXTRAS_MAX) return null;
  const usados = new Set(existentes.map((e) => e.id));
  let n = existentes.length + 1;
  while (usados.has(`voute:extra-${n.toString(36)}`)) n++;
  return { id: `voute:extra-${n.toString(36)}`, nombre: limpio, sala: sala as VouteSalaKey };
}

export function leerEleRuta(st: Store | null): string | undefined {
  try {
    return st?.getItem(ELE_RUTA_KEY) || undefined;
  } catch {
    return undefined;
  }
}

export interface OpcionesVoute {
  /** Residentes agregadas con «+ Agente». */
  extras?: readonly ResidenteExtra[];
  /** Ruta explícita de la carpeta de Ele (si no, la que tenga un tramo `LaVouteDAnais`). */
  eleRuta?: string;
}

const tramos = (p: string): string[] => p.split(/[\\/]+/).filter(Boolean).map((t) => t.toLowerCase());

/** ¿La carpeta es la de Ele? Por el tramo `lavoutedanais` en la ruta (no solo la última carpeta) o por la ruta configurada. */
function esDeEle(path: string | undefined, eleRuta: string | undefined): boolean {
  if (!path) return false;
  const t = tramos(path);
  if (t.includes('lavoutedanais')) return true;
  if (!eleRuta) return false;
  const r = tramos(eleRuta);
  return r.length > 0 && r.length <= t.length && r.every((x, i) => x === t[i]);
}

/**
 * La vista de La Voûte: el snapshot del servidor (que no sabe nada de esto) más las seis salas, las residentes en
 * reposo y los nombres y looks fijos. Es solo de la vista: lo que sube al World sale del servidor, nunca de acá.
 * Con `on` las salas se llaman como los espacios del cabaret y las del roster llevan el look Voûte.
 */
export function aplicarVoute(snap: OfficeSnapshot, on: boolean, opts: OpcionesVoute = {}): OfficeSnapshot {
  const now = snap.meta?.startedAt ?? snap.serverTime ?? Date.now();
  const reales = Array.isArray(snap.rooms) ? snap.rooms : [];
  const usados = new Set(reales.map((r) => r.slot));
  let libre = 0;
  const salas: RoomInfo[] = VOUTE_SALAS.map((s) => {
    while (usados.has(libre)) libre++;
    const slot = libre++;
    const name = vouteSalaNombre(s.id, on) ?? s.key;
    return { id: s.id, name, path: name, slot, seed: hash32(s.id), createdAt: now };
  });

  const rutas = new Map(reales.map((r) => [r.id, r.path]));
  let eleLibre = true;
  const reales2: AgentInfo[] = snap.agents.map((a) => {
    if (a.custom) return a;
    let out = a;
    if (a.kind === 'main' && eleLibre && esDeEle(rutas.get(a.roomId), opts.eleRuta)) {
      const ele = vouteAgente('ele');
      if (ele) {
        eleLibre = false;
        out = { ...a, name: ele.name, look: 'f', parts: ele.parts };
      }
    } else if (a.kind === 'sub') {
      const v = vouteAgente(a.role);
      if (v) out = { ...a, name: v.name, look: 'f', parts: v.parts };
    }
    const v = on ? vouteAgente(out.name) : undefined;
    return v ? { ...out, parts: v.partsVoute } : out;
  });

  const ausentes = residentesAusentes(reales2, now).map((r) => {
    const v = on ? vouteAgente(r.name) : undefined;
    return v ? { ...r, parts: v.partsVoute } : r;
  });
  const extras = (opts.extras ?? []).map((e) => residenteExtra(e, now));
  return {
    ...snap,
    rooms: [...reales, ...salas],
    agents: [...reales2, ...ausentes, ...extras],
  };
}
