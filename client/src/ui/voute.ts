// Botón «La Voûte» en la barra superior, junto a los controles de zoom (el estado puro vive en net/voute-estado.ts).
import { tr } from '../../../shared/i18n';
import { VOUTE_CLASS, guardarVoute, leerVoute } from '../net/voute-estado';

type Store = Parameters<typeof leerVoute>[0];

/** Botón «La Voûte» en la barra superior (grupo de cámara; si no existe, cae en `root`); `onChange` recibe el estado nuevo (la clase en <html> ya está puesta). */
export function montarBotonVoute(root: HTMLElement, st: Store | null, onChange: (on: boolean) => void): void {
  let on = leerVoute(st);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'voute-toggle';
  btn.textContent = '🌹 La Voûte';
  const pintar = () => {
    document.documentElement.classList.toggle(VOUTE_CLASS, on);
    btn.setAttribute('aria-pressed', String(on));
    btn.title = on ? tr('Volver al escritório normal') : tr('Entrar a La Voûte');
  };
  btn.addEventListener('click', () => {
    on = !on;
    guardarVoute(st, on);
    pintar();
    onChange(on);
  });
  pintar();
  const host = root.querySelector('.ui-topbar .ui-btn-group') ?? root;
  host.appendChild(btn);
  onChange(on);
}
