// Botón «La Voûte» en la barra superior, a la izquierda del grupo de zoom/ajustes (el estado puro vive en net/voute-estado.ts).
import { tr } from '../../../shared/i18n';
import { setVouteMode } from '../art/voute';
import { VOUTE_CLASS, guardarVoute, leerVoute } from '../net/voute-estado';

type Store = Parameters<typeof leerVoute>[0];

export interface VouteToggleOptions {
  canvas?: HTMLElement | null;
  reducedMotion?: () => boolean;
}

const defaultReducedMotion = (): boolean => {
  try {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

/**
 * Monta el botón «La Voûte» en la barra superior (a la izquierda del grupo de cámara/ajustes; si no existe, cae en `root`).
 * Actualiza `setVouteMode(on)`, la clase `html.voute`, el estado `aria-pressed`, el anuncio `aria-live="polite"` y el fundido de 300 ms.
 */
export function montarBotonVoute(
  root: HTMLElement,
  st: Store | null,
  onChange: (on: boolean) => void,
  opts: VouteToggleOptions = {},
): HTMLButtonElement {
  let on = leerVoute(st);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'voute-toggle';

  const star = document.createElement('span');
  star.className = 'voute-toggle__star';
  star.setAttribute('aria-hidden', 'true');
  star.textContent = '✦';

  const label = document.createElement('span');
  label.className = 'voute-toggle__label';
  label.textContent = 'La Voûte';

  const short = document.createElement('span');
  short.className = 'voute-toggle__short';
  short.setAttribute('aria-hidden', 'true');
  short.textContent = 'LV';

  const dot = document.createElement('span');
  dot.className = 'voute-toggle__dot';
  dot.setAttribute('aria-hidden', 'true');
  dot.textContent = '●';

  btn.appendChild(star);
  btn.appendChild(label);
  btn.appendChild(short);
  btn.appendChild(dot);

  const live = document.createElement('span');
  live.className = 'voute-live';
  live.setAttribute('aria-live', 'polite');

  const pintar = (announce: boolean) => {
    setVouteMode(on);
    document.documentElement?.classList?.toggle(VOUTE_CLASS, on);
    if (document.documentElement?.dataset) {
      document.documentElement.dataset.voute = on ? '1' : '0';
    }
    btn.classList?.toggle('is-active', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.title = on ? tr('Volver a la oficina') : tr('Entrar a La Voûte');
    btn.textContent = on ? '✦ La Voûte LV ●' : '✦ La Voûte LV';
    btn.appendChild(star);
    btn.appendChild(label);
    btn.appendChild(short);
    if (on) btn.appendChild(dot);
    if (announce) {
      live.textContent = on ? tr('La Voûte activada') : tr('Oficina de vuelta');
    }
  };

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    on = !on;
    guardarVoute(st, on);
    pintar(true);
    onChange(on);

    const reduced = opts.reducedMotion ? opts.reducedMotion() : defaultReducedMotion();
    if (!reduced) {
      btn.disabled = true;
      opts.canvas?.classList?.add('voute-fading');
      setTimeout(() => {
        opts.canvas?.classList?.remove('voute-fading');
      }, 150);
      setTimeout(() => {
        btn.disabled = false;
      }, 300);
    }
  });

  pintar(false);
  const host = (root.querySelector?.('.ui-topbar .ui-btn-group') as HTMLElement | null) ?? root;
  if (typeof host.prepend === 'function') host.prepend(btn);
  else host.appendChild(btn);
  host.appendChild(live);
  onChange(on);
  return btn;
}
