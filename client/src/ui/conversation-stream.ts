// A conversa da gaveta reutiliza o stream local do terminal, sem ferramentas nem raciocínio.
import type { TerminalEntry } from '../../../shared/types';
import { parseAppend, parseInit, terminalUrl } from './terminal';

export type ConversationEntry = Extract<TerminalEntry, { kind: 'user' | 'assistant' }>;
export type ConversationState = 'closed' | 'connecting' | 'open' | 'reconnecting' | 'failed';
export const CONVERSATION_LIMIT = 60;

export class ConversationStream {
  entries: ConversationEntry[] = [];
  state: ConversationState = 'closed';
  truncated = false;
  private id: string | null = null;
  private source: EventSource | null = null;

  constructor(private changed: () => void, private createSource = (url: string): EventSource => new EventSource(url)) {}

  bind(id: string | null): void {
    if (this.id === id) return;
    this.disconnect();
    this.id = id;
    this.entries = [];
    this.truncated = false;
    if (id) this.connect();
    else { this.state = 'closed'; this.changed(); }
  }

  retry(): void {
    if (this.id) this.connect();
  }

  private disconnect(): void {
    this.source?.close();
    this.source = null;
  }

  private connect(): void {
    this.disconnect();
    const id = this.id!;
    this.state = 'connecting';
    this.changed();
    let source: EventSource;
    try { source = this.createSource(terminalUrl(id)); }
    catch { this.state = 'failed'; this.changed(); return; }
    this.source = source;
    source.addEventListener('init', (event) => {
      if (this.source !== source) return;
      const init = parseInit((event as MessageEvent).data);
      if (!init || init.agentId !== id) return;
      this.entries = [];
      this.truncated = init.truncated;
      this.state = 'open';
      this.ingest(init.entries);
    });
    source.addEventListener('append', (event) => {
      if (this.source !== source) return;
      this.state = 'open';
      this.ingest(parseAppend((event as MessageEvent).data));
    });
    source.addEventListener('error', () => {
      if (this.source !== source) return;
      this.state = source.readyState === 2 ? 'failed' : 'reconnecting';
      if (this.state === 'failed') this.disconnect();
      this.changed();
    });
  }

  private ingest(batch: TerminalEntry[]): void {
    const messages = new Map(this.entries.map((entry) => [`${entry.kind}:${entry.id}`, entry]));
    for (const entry of batch) {
      if ((entry.kind === 'user' || entry.kind === 'assistant') && entry.text.trim()) {
        messages.set(`${entry.kind}:${entry.id}`, entry);
      }
    }
    const entries = [...messages.values()];
    if (entries.length > CONVERSATION_LIMIT) this.truncated = true;
    this.entries = entries.slice(-CONVERSATION_LIMIT);
    this.changed();
  }
}
