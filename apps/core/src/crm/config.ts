// Configuracao do CRM (Krayin) FORA do git: data/krayin.json, com URL e token. O token nunca vai para log,
// resposta da tela ou banco; a tela so recebe "configurado / nao configurado" e o resultado do teste.
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ConfigCrm {
  url: string;
  token: string;
}

export function caminhoConfigCrm(raiz: string): string {
  return join(raiz, 'data', 'krayin.json');
}

// Valida e normaliza. Mensagens de erro NUNCA incluem o token.
export function validarConfigCrm(entrada: { url?: unknown; token?: unknown }): ConfigCrm {
  const urlBruta = typeof entrada.url === 'string' ? entrada.url.trim() : '';
  if (urlBruta === '' || /[\r\n\t]/.test(urlBruta)) throw new Error('URL do Krayin invalida (vazia ou com quebra de linha).');
  let url: URL;
  try { url = new URL(urlBruta); } catch { throw new Error('URL do Krayin invalida: use http:// ou https://.'); }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('URL do Krayin invalida: use http:// ou https://.');
  if (url.username !== '' || url.password !== '') throw new Error('URL do Krayin invalida: nao coloque usuario e senha no endereco.');
  if (url.search !== '' || url.hash !== '') throw new Error('URL do Krayin invalida: tire a parte depois de ? ou #.');
  const caminho = url.pathname.replace(/\/+$/, '');
  const normalizada = `${url.origin}${caminho}`;

  const tokenBruto = typeof entrada.token === 'string' ? entrada.token : '';
  if (/[\r\n\t]/.test(tokenBruto)) throw new Error('Token do Krayin invalido: quebra de linha no meio.');
  const token = tokenBruto.trim();
  if (token.length < 20 || token.length > 512) throw new Error('Token do Krayin invalido: tamanho fora do esperado.');
  if (/\s/.test(token)) throw new Error('Token do Krayin invalido: tem espaco no meio.');
  return { url: normalizada, token };
}

export function lerConfigCrm(raiz: string): ConfigCrm | null {
  try {
    const bruto = JSON.parse(readFileSync(caminhoConfigCrm(raiz), 'utf8')) as { url?: unknown; token?: unknown };
    return validarConfigCrm(bruto);
  } catch { return null; }
}

export function salvarConfigCrm(raiz: string, entrada: { url?: unknown; token?: unknown }): ConfigCrm {
  const valor = validarConfigCrm(entrada);
  const pasta = join(raiz, 'data');
  mkdirSync(pasta, { recursive: true });
  const caminho = caminhoConfigCrm(raiz);
  writeFileSync(caminho, `${JSON.stringify(valor)}\n`, { encoding: 'utf8', mode: 0o600 });
  if (process.platform !== 'win32') chmodSync(caminho, 0o600);
  return valor;
}
