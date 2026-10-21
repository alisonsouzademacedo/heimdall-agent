// Regras de arquitetura do listener, lendo o codigo-fonte. Garantem a regra 1 (so o self-chat) e que a escuta so le.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const fontes = readdirSync(DIR).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
const sem = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'`])\/\/.*$/gm, '$1'); // sem comentarios
const codigo = (f: string) => sem(readFileSync(join(DIR, f), 'utf8'));

test('ha fontes para conferir', () => assert.ok(fontes.length >= 3, fontes.join(',')));

test('sendMessage so existe em transporte.ts (o unico envio, atras da trava do nucleo)', () => {
  for (const f of fontes) if (f !== 'transporte.ts') assert.doesNotMatch(codigo(f), /sendMessage\s*[(:]/, f);
  assert.match(codigo('transporte.ts'), /sendMessage\s*\(/);
});

test('o socket so usa metodos de LEITURA ou de infraestrutura: nada de grupos, perfil, presenca, recibos de leitura, ligacoes ou canais', () => {
  const PERMITIDOS = new Set(['ev', 'user', 'updateMediaMessage', 'signalRepository', 'fetchMessageHistory', 'end', 'sendMessage']);
  for (const f of fontes) {
    for (const m of codigo(f).matchAll(/\bsock\.([A-Za-z_][A-Za-z0-9_]*)/g)) assert.ok(PERMITIDOS.has(m[1]!), `${f}: sock.${m[1]} nao e permitido`);
  }
  const PROIBIDOS = /\b(readMessages|sendReceipt|sendReceipts|sendPresenceUpdate|presenceSubscribe|groupCreate|groupLeave|groupUpdateSubject|groupParticipantsUpdate|groupInviteCode|updateProfile\w*|updateBlockStatus|chatModify|rejectCall|newsletter\w+|sendRawMessage|relayMessage|query)\s*\(/;
  for (const f of fontes) assert.doesNotMatch(codigo(f), PROIBIDOS, f);
});

test('makeWASocket so e chamado em conectar.ts; o listener nao abre servidor, nao roda programas e nao faz chamadas de rede proprias', () => {
  for (const f of fontes) {
    const c = codigo(f);
    if (f !== 'conectar.ts') assert.doesNotMatch(c, /makeWASocket\s*\(/, f);
    assert.doesNotMatch(c, /node:http|node:https|node:net|node:child_process|\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/, f);
  }
});

test('envio so por criarEnvio (a trava do nucleo): ninguem fora de iniciar.ts monta o Envio', () => {
  for (const f of fontes) if (f !== 'iniciar.ts') assert.doesNotMatch(codigo(f), /criarEnvio\s*\(/, f);
});

// Historico antigo (2026-10-21): fetchMessageHistory envia uma mensagem "peer" para a PROPRIA conta do dono (messages-send.js do Baileys instalado:
// relayMessage(meJid, ..., category 'peer')), nao a um contato. Mesmo assim, e a unica chamada de socket nova permitida e fica em UM arquivo.
test('fetchMessageHistory so e chamado em historico-antigo.ts (nenhum outro arquivo de nenhum pacote)', async () => {
  const { readdirSync: ls, statSync } = await import('node:fs');
  const raiz = fileURLToPath(new URL('../../', import.meta.url));
  const achados: string[] = [];
  for (const pacote of ls(raiz)) {
    const src = join(raiz, pacote, 'src');
    try { if (!statSync(src).isDirectory()) continue; } catch { continue; }
    const varrer = (d: string): void => {
      for (const n of ls(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) { if (n !== 'node_modules') varrer(p); continue; }
        if (n.endsWith('.ts') && !n.endsWith('.test.ts') && /\bfetchMessageHistory\b/.test(sem(readFileSync(p, 'utf8')))) achados.push(`${pacote}/${p.slice(src.length + 1).replace(/\\/g, '/')}`);
      }
    };
    varrer(src);
  }
  assert.deepEqual(achados, ['listener/historico-antigo.ts']);
});

test('historico-antigo.ts: so chama fetchMessageHistory no socket (nenhum sendMessage, nenhum outro metodo), e so com a trava e a conexao conferidas', () => {
  const c = codigo('historico-antigo.ts');
  assert.doesNotMatch(c, /sendMessage|criarEnvio|relayMessage|sendPeerDataOperationMessage/);
  assert.match(c, /sock\.fetchMessageHistory\(/);
  assert.equal((c.match(/\.fetchMessageHistory\(/g) ?? []).length, 1, 'uma unica chamada');
  assert.match(c, /cfg\.liberado/, 'so com a trava aberta pelo dono');
  assert.match(c, /!== 'conectado'/, 'so conectado');
});
