// Fumaca contra um Hindsight REAL (tests/infra/smoke_hindsight.sh): a requisicao do cliente e aceita (200/202, nao 4xx) e o recall responde.
// Com HINDSIGHT_API_LLM_PROVIDER=none NAO ha extracao de fatos (nao ha modelo): isto prova o formato dos pedidos, nao a qualidade da memoria.
// Imprime UMA linha JSON. Dados sinteticos.
import { criarClienteHindsight } from '../src/hindsight.ts';

const c = criarClienteHindsight({ url: process.env.HINDSIGHT_URL ?? 'http://127.0.0.1:8888', banco: 'fumaca' });
const saida: Record<string, unknown> = { saude: await c.saude() };
const item = { documentId: 'conv:1:2025-10-10', content: 'Ana da Loja (2025-10-10T12:00:00-03:00): Quero o orçamento do plano anual.\nEu (2025-10-10T12:01:00-03:00): Envio hoje à tarde.', context: 'conversa de WhatsApp comercial de um SDR', timestamp: '2025-10-10T23:59:59-03:00', tags: ['conversa:1', 'chat:dm', 'tipo:conversa'] };
try { await c.reter(item); saida.reter = 'aceito'; await c.reter(item); saida.reter_repetido = 'aceito'; } catch (e) { saida.reter = `erro: ${(e as Error).message}`; }
try { saida.lembrar = (await c.lembrar('o que a Ana pediu?', { tipos: ['experience', 'observation'], maxTokens: 500, tags: ['conversa:1'] })).length >= 0 ? 'respondeu' : 'vazio'; } catch (e) { saida.lembrar = `erro: ${(e as Error).message}`; }
try { saida.apagar = await c.apagarDocumento('conv:1:2025-10-10'); } catch (e) { saida.apagar = `erro: ${(e as Error).message}`; }
console.log(JSON.stringify(saida));
