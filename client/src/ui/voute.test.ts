import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isVoute, setVouteMode } from '../art/voute';
import { VOUTE_KEY } from '../net/voute-estado';
import { montarBotonVoute } from './voute';

class FakeEl {
  tagName: string;
  type = '';
  className = '';
  private _text = '';
  title = '';
  disabled = false;
  dataset: Record<string, string> = {};
  attrs = new Map<string, string>();
  children: FakeEl[] = [];
  listeners = new Map<string, (() => void)[]>();
  private classes = new Set<string>();

  get textContent(): string {
    if (this.children.length === 0) return this._text;
    return [this._text, ...this.children.map((c) => c.textContent)].filter(Boolean).join(' ');
  }

  set textContent(v: string) {
    this._text = v;
    this.children = [];
  }

  get firstChild(): FakeEl | null {
    return this.children[0] ?? null;
  }

  classList = {
    add: (...cs: string[]) => cs.forEach((c) => this.classes.add(c)),
    remove: (...cs: string[]) => cs.forEach((c) => this.classes.delete(c)),
    toggle: (c: string, force?: boolean) => {
      const next = force === undefined ? !this.classes.has(c) : force;
      if (next) this.classes.add(c);
      else this.classes.delete(c);
      return next;
    },
    contains: (c: string) => this.classes.has(c),
  };

  constructor(tag = 'div') {
    this.tagName = tag;
  }

  setAttribute(k: string, v: string): void {
    this.attrs.set(k, v);
  }

  getAttribute(k: string): string | null {
    return this.attrs.get(k) ?? null;
  }

  addEventListener(ev: string, cb: () => void): void {
    const list = this.listeners.get(ev) ?? [];
    list.push(cb);
    this.listeners.set(ev, list);
  }

  click(): void {
    if (this.disabled) return;
    for (const cb of this.listeners.get('click') ?? []) cb();
  }

  appendChild(child: FakeEl): FakeEl {
    this.children.push(child);
    return child;
  }

  removeChild(child: FakeEl): FakeEl {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
    return child;
  }

  prepend(child: FakeEl): void {
    this.children.unshift(child);
  }

  querySelector(sel: string): FakeEl | null {
    if (sel === '.ui-topbar .ui-btn-group') return this.children[0] ?? null;
    if (sel === '[aria-live="polite"]') {
      return this.children.find((c) => c.getAttribute('aria-live') === 'polite') ?? null;
    }
    return null;
  }
}

const memStore = () => {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
};

describe('Botón La Voûte en topbar (client/src/ui/voute.ts)', () => {
  let docEl: FakeEl;
  let root: FakeEl;
  let group: FakeEl;
  let canvas: FakeEl;

  beforeEach(() => {
    vi.useFakeTimers();
    setVouteMode(false);
    docEl = new FakeEl('html');
    root = new FakeEl('div');
    group = new FakeEl('div');
    canvas = new FakeEl('canvas');
    root.appendChild(group);
    vi.stubGlobal('document', {
      documentElement: docEl,
      createElement: (tag: string) => new FakeEl(tag),
    });
  });

  afterEach(() => {
    setVouteMode(false);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('monta el botón a la izquierda del grupo con estado inicial apagado, accesible y etiqueta corta LV', () => {
    const st = memStore();
    const existing = new FakeEl('button');
    group.appendChild(existing);
    const changes: boolean[] = [];

    const btn = montarBotonVoute(
      root as unknown as HTMLElement,
      st,
      (on) => changes.push(on),
      { canvas: canvas as unknown as HTMLElement, reducedMotion: () => false },
    ) as unknown as FakeEl;

    expect(group.children[0]).toBe(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.title).toBe('Entrar a La Voûte');
    expect(btn.textContent).toContain('✦');
    expect(btn.textContent).toContain('La Voûte');
    expect(btn.textContent).toContain('LV');
    expect(isVoute()).toBe(false);
    expect(changes).toEqual([false]);
  });

  it('al hacer clic activa La Voûte, anuncia por aria-live="polite", aplica fundido de 300 ms y deshabilita el botón durante el fundido', () => {
    const st = memStore();
    const changes: boolean[] = [];

    const btn = montarBotonVoute(
      root as unknown as HTMLElement,
      st,
      (on) => changes.push(on),
      { canvas: canvas as unknown as HTMLElement, reducedMotion: () => false },
    ) as unknown as FakeEl;

    btn.click();

    expect(isVoute()).toBe(true);
    expect(st.getItem(VOUTE_KEY)).toBe('1');
    expect(docEl.classList.contains('voute')).toBe(true);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.classList.contains('is-active')).toBe(true);
    expect(btn.title).toBe('Volver a la oficina');
    expect(btn.textContent).toContain('●');
    expect(btn.disabled).toBe(true);
    expect(canvas.classList.contains('voute-fading')).toBe(true);

    const live = group.children.find((c) => c.getAttribute('aria-live') === 'polite');
    expect(live?.textContent).toBe('La Voûte activada');

    vi.advanceTimersByTime(150);
    expect(canvas.classList.contains('voute-fading')).toBe(false);
    expect(btn.disabled).toBe(true);

    vi.advanceTimersByTime(150);
    expect(btn.disabled).toBe(false);
    expect(changes).toEqual([false, true]);
  });

  it('con prefers-reduced-motion cambia en 0 ms sin deshabilitar ni fundir el canvas', () => {
    const st = memStore();
    const btn = montarBotonVoute(
      root as unknown as HTMLElement,
      st,
      () => {},
      { canvas: canvas as unknown as HTMLElement, reducedMotion: () => true },
    ) as unknown as FakeEl;

    btn.click();
    expect(isVoute()).toBe(true);
    expect(btn.disabled).toBe(false);
    expect(canvas.classList.contains('voute-fading')).toBe(false);

    btn.click();
    expect(isVoute()).toBe(false);
    const live = group.children.find((c) => c.getAttribute('aria-live') === 'polite');
    expect(live?.textContent).toBe('Oficina de vuelta');
  });
});
