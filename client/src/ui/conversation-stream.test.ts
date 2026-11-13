import { describe, expect, it } from 'vitest';
import type { TerminalEntry } from '../../../shared/types';
import { CONVERSATION_LIMIT, ConversationStream } from './conversation-stream';

class Source {
  readyState = 1;
  closed = false;
  handlers = new Map<string, ((event: MessageEvent) => void)[]>();
  addEventListener(name: string, fn: (event: MessageEvent) => void): void {
    this.handlers.set(name, [...this.handlers.get(name) ?? [], fn]);
  }
  close(): void { this.closed = true; }
  fire(name: string, data?: unknown): void {
    for (const fn of this.handlers.get(name) ?? []) fn({ data: JSON.stringify(data) } as MessageEvent);
  }
}

const message = (id: string, kind: 'assistant' | 'user' = 'assistant'): TerminalEntry => ({ id, kind, at: 100, text: `Texto ${id}` });

function fixture() {
  const sources: Source[] = [];
  const urls: string[] = [];
  let changes = 0;
  const stream = new ConversationStream(() => changes++, (url) => {
    urls.push(url);
    const source = new Source();
    sources.push(source);
    return source as unknown as EventSource;
  });
  return { stream, sources, urls, changes: () => changes };
}

describe('conversa da ficha (Claude e Codex)', () => {
  it.each(['.claude:123', '.codex:thread'])('carrega e acompanha mensagens de %s, sem ferramentas nem raciocínio', (id) => {
    const { stream, sources, urls } = fixture();
    stream.bind(id);
    const user = message('u', 'user');
    sources[0].fire('init', { agentId: id, entries: [user, { kind: 'thinking', id: 't', at: 1, text: 'privado' }], truncated: true });
    const answer = message('a');
    sources[0].fire('append', [answer, user, { kind: 'tool', id: 'c', title: 'Read(x)', at: 1, tool: 'Read' }]);
    expect(urls).toEqual([`/api/agents/${encodeURIComponent(id)}/terminal`]);
    expect(stream.entries).toEqual([user, answer]);
    expect(stream.truncated).toBe(true);
    expect(stream.state).toBe('open');
    stream.bind(id);
    expect(sources).toHaveLength(1);
  });

  it('fecha ao sair ou trocar de agente e ignora eventos atrasados da conversa anterior', () => {
    const { stream, sources } = fixture();
    stream.bind('ele');
    sources[0].fire('init', { agentId: 'ele', entries: [message('ele')] });
    stream.bind('outra-ele');
    expect(sources[0].closed).toBe(true);
    sources[0].fire('append', [message('atrasada')]);
    sources[1].fire('init', { agentId: 'ele', entries: [message('errada')] });
    expect(stream.entries).toEqual([]);
    sources[1].fire('init', { agentId: 'outra-ele', entries: [message('certa')] });
    stream.bind(null);
    expect(sources[1].closed).toBe(true);
    sources[1].fire('append', [message('depois-de-fechar')]);
    expect(stream.entries).toEqual([]);
    expect(stream.state).toBe('closed');
    stream.bind('outra-ele');
    expect(sources).toHaveLength(3);
  });

  it('reconexão substitui a janela, remove duplicações e limita o histórico exibido', () => {
    const { stream, sources } = fixture();
    stream.bind('ele');
    const entries = Array.from({ length: CONVERSATION_LIMIT + 8 }, (_, i) => message(String(i)));
    sources[0].fire('init', { agentId: 'ele', entries });
    expect(stream.entries).toEqual(entries.slice(8));
    expect(stream.truncated).toBe(true);
    sources[0].readyState = 0;
    sources[0].fire('error');
    expect(stream.state).toBe('reconnecting');
    sources[0].fire('init', { agentId: 'ele', entries: [message('novo'), message('novo')] });
    expect(stream.entries).toEqual([message('novo')]);
    expect(stream.truncated).toBe(false);
    expect(stream.state).toBe('open');
  });

  it('falha preserva as respostas e permite tentar novamente sem abrir conexões a cada render', () => {
    const { stream, sources } = fixture();
    stream.bind('ele');
    sources[0].fire('init', { agentId: 'ele', entries: [message('a')] });
    sources[0].readyState = 2;
    sources[0].fire('error');
    expect(sources[0].closed).toBe(true);
    expect(stream.state).toBe('failed');
    expect(stream.entries).toEqual([message('a')]);
    stream.bind('ele');
    expect(sources).toHaveLength(1);
    stream.retry();
    expect(sources).toHaveLength(2);
    sources[1].fire('init', { agentId: 'ele', entries: [message('a'), message('b')] });
    expect(stream.entries).toHaveLength(2);
  });
});
