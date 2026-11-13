import type { AgentInfo } from '../../../shared/types';
import { tr } from '../../../shared/i18n';
import { ConversationStream, type ConversationEntry } from './conversation-stream';
import { h, KeyedList, setHidden, setText } from './dom';
import { formatClock } from './format';
import { renderMarkdown } from './markdown';

/** Mensagens e respostas junto à caixa de envio; a terminal completa continua no botão próprio. */
export class Conversation {
  readonly el: HTMLElement;
  private stream: ConversationStream;
  private scroll: HTMLElement;
  private list: KeyedList<ConversationEntry>;
  private status: HTMLElement;
  private earlier: HTMLElement;
  private retry: HTMLButtonElement;
  private agent?: AgentInfo;
  private shown = new WeakMap<HTMLElement, string>();

  constructor() {
    this.status = h('p', { class: 'ui-muted ui-small', role: 'status' });
    this.earlier = h('p', { class: 'ui-muted ui-small', text: tr('Mensagens recentes. O histórico completo está no terminal.'), hidden: true });
    const messages = h('ol', { class: 'ui-conversation__messages' });
    this.scroll = h('div', { class: 'ui-conversation__scroll', tabIndex: 0, role: 'log', attrs: { 'aria-label': tr('Conversa'), 'aria-live': 'polite', 'aria-relevant': 'additions' } }, messages);
    this.list = new KeyedList(messages, {
      key: (entry) => `${entry.kind}:${entry.id}`,
      create: () => h('li', { class: 'ui-conversation__message' }, h('div', { class: 'ui-conversation__meta' }, h('strong'), h('time')), h('div', { class: 'ui-md ui-conversation__text' })),
      update: (li, entry) => this.updateMessage(li, entry),
    });
    this.retry = h('button', { class: 'ui-btn ui-btn--sm', type: 'button', text: tr('Tentar novamente'), hidden: true, on: { click: () => this.stream.retry() } });
    this.el = h('div', { class: 'ui-conversation' }, this.earlier, this.scroll, this.status, this.retry);
    this.stream = new ConversationStream(() => this.refresh());
  }

  render(agent: AgentInfo | undefined, enabled: boolean): void {
    this.agent = agent;
    this.stream.bind(enabled && agent ? agent.id : null);
    this.refresh();
  }

  close(): void { this.stream.bind(null); }

  private updateMessage(li: HTMLElement, entry: ConversationEntry): void {
    const [meta, body] = li.children as unknown as HTMLElement[];
    const [name, time] = meta.children as unknown as HTMLElement[];
    setText(name, entry.kind === 'user' ? tr('Você') : this.agent?.name ?? tr('o agente'));
    setText(time, formatClock(entry.at, false));
    li.classList.toggle('is-user', entry.kind === 'user');
    if (this.shown.get(body) === entry.text) return;
    this.shown.set(body, entry.text);
    if (entry.kind === 'assistant') body.replaceChildren(renderMarkdown(entry.text));
    else setText(body, entry.text);
  }

  private refresh(): void {
    const following = this.scroll.scrollHeight - this.scroll.scrollTop - this.scroll.clientHeight < 40;
    const empty = !this.scroll.firstElementChild?.children.length;
    this.list.sync(this.stream.entries);
    setHidden(this.earlier, !this.stream.truncated);
    const state = this.stream.state;
    const text = state === 'failed' ? tr('Não foi possível carregar a conversa.')
      : state === 'reconnecting' ? tr('Reconectando a conversa…')
      : state === 'connecting' ? tr('Carregando conversa…')
      : state === 'closed' ? ''
      : this.agent?.status === 'working' ? tr('Aguardando a próxima resposta…')
      : !this.stream.entries.length ? tr('As mensagens e respostas aparecerão aqui.') : '';
    setText(this.status, text);
    setHidden(this.status, !text);
    setHidden(this.retry, state !== 'failed');
    if (following || empty) this.scroll.scrollTop = this.scroll.scrollHeight;
  }
}
