// La Voûte (residentes, salas, looks) vive solo en la vista del cliente. Ninguna parte del servidor ni del World
// importa sus módulos: así nada `voute:*` puede llegar al Habblaud World, al historial ni al timeline.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') && !p.endsWith('.test.ts') ? [p] : [];
  });

describe('aislamiento de La Voûte', () => {
  it('server/ y shared/world/ no importan los módulos voute-*', () => {
    const files = [...walk(join(root, 'server')), ...walk(join(root, 'shared', 'world'))];
    const culpables = files.filter((f) => /from\s+['"][^'"]*voute-(agentes|residentes)['"]/.test(readFileSync(f, 'utf8')));
    expect(culpables).toEqual([]);
  });
});
