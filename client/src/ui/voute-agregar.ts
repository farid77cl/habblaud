// Botón «+ Agente»: agrega una residente (nombre y oficio) a la oficina. Es solo de la vista: se recuerda en
// localStorage (net/voute-estado.ts) y nunca llega al servidor ni al World.
import { tr } from '../../../shared/i18n';
import { NAME_MAX } from '../../../shared/appearance';
import { VOUTE_SALAS, vouteSalaNombre } from '../../../shared/voute-residentes';
import { isVoute } from '../art/voute';

export interface AgregarOptions {
  /** Intenta agregar; devuelve false si no valió (nombre vacío, ya no caben más). */
  onAdd: (nombre: string, sala: string) => boolean;
}

/** Monta «+ Agente» a la izquierda del botón de La Voûte (en el grupo de la barra superior). */
export function montarBotonAgregar(root: HTMLElement, opts: AgregarOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'voute-add';
  btn.textContent = tr('+ Agente');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-expanded', 'false');
  btn.title = tr('Agregar una agente a la oficina');

  const panel = document.createElement('form');
  panel.className = 'voute-add__panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', tr('Agregar una agente'));
  panel.hidden = true;

  const nameLabel = document.createElement('label');
  nameLabel.textContent = tr('Nombre');
  const name = document.createElement('input');
  name.type = 'text';
  name.maxLength = NAME_MAX;
  name.required = true;
  name.autocomplete = 'off';
  nameLabel.appendChild(name);

  const jobLabel = document.createElement('label');
  jobLabel.textContent = tr('Oficio');
  const job = document.createElement('select');
  jobLabel.appendChild(job);

  const ok = document.createElement('button');
  ok.type = 'submit';
  ok.textContent = tr('Agregar');
  const msg = document.createElement('span');
  msg.className = 'voute-add__msg';
  msg.setAttribute('role', 'status');

  panel.appendChild(nameLabel);
  panel.appendChild(jobLabel);
  panel.appendChild(ok);
  panel.appendChild(msg);

  const llenarOficios = () => {
    while (job.firstChild) job.removeChild(job.firstChild);
    for (const s of VOUTE_SALAS) {
      const o = document.createElement('option');
      o.value = s.key;
      o.textContent = vouteSalaNombre(s.id, isVoute()) ?? s.key;
      job.appendChild(o);
    }
  };

  const abrir = (on: boolean) => {
    panel.hidden = !on;
    btn.setAttribute('aria-expanded', String(on));
    if (on) {
      llenarOficios();
      msg.textContent = '';
      name.focus();
    } else btn.focus();
  };

  btn.addEventListener('click', () => abrir(Boolean(panel.hidden)));
  panel.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Escape') abrir(false);
  });
  panel.addEventListener('submit', (e) => {
    e.preventDefault();
    if (opts.onAdd(name.value, job.value)) {
      name.value = '';
      abrir(false);
    } else msg.textContent = tr('Escribe un nombre (hay un máximo de agentes).');
  });

  const host = (root.querySelector?.('.ui-topbar .ui-btn-group') as HTMLElement | null) ?? root;
  host.prepend(btn);
  host.appendChild(panel);
  return btn;
}
