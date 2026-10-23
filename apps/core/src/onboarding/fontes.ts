// Painel fixo de "fontes": o que cada peca da ponte esta fazendo AGORA. Tudo vem do banco (Painel) ou de um
// resultado ja gravado; nada aqui fala com a rede nem com o WhatsApp. A tela mostra os cinco cartoes em qualquer passo.
import type { Painel } from './painel.ts';

export type EstadoFonte = 'pendente' | 'processando' | 'verde' | 'vermelho';

export interface Fonte {
  estado: EstadoFonte;
  detalhe: string;
}

export interface Fontes {
  whatsapp: Fonte;
  modelo: Fonte;
  memoria: Fonte;
  midia: Fonte;
  crm: Fonte;
}

export interface ModeloParaFontes {
  estado: 'nao_feito' | 'pedido' | 'ok' | 'falhou';
  ms?: number;
  motivo?: string;
}

// O CRM so entra como "conectado" depois de um teste de verdade; sem teste, fica pendente (nunca verde de graca).
export interface CrmParaFontes {
  configurado: boolean;
  estado?: 'ok' | 'falhou';
  motivo?: string;
  completo?: boolean;
  faltando?: string[];
}

const soma = (o: Record<string, number> | undefined): number => Object.values(o ?? {}).reduce((a, b) => a + b, 0);

function fonteWhatsapp(p: Painel): Fonte {
  const w = p.whatsapp;
  if (w.estado === 'conectado') {
    const dono = w.dono ? ` · ${w.dono}` : '';
    return { estado: 'verde', detalhe: `conectado${dono} · ${w.contagem?.inseridas ?? 0} mensagem(ns) recebida(s)` };
  }
  if (w.estado === 'erro') return { estado: 'vermelho', detalhe: `erro: ${w.motivo ?? 'sem detalhe'}` };
  if (w.estado === 'deslogado') return { estado: 'vermelho', detalhe: 'desconectado; leia o QR para conectar.' };
  if (w.estado === 'reconectar') return { estado: 'processando', detalhe: w.qrSvg ? 'QR gerado; aguardando a leitura no telefone.' : 'precisa reconectar; abra o passo do WhatsApp para gerar o QR.' };
  if (w.qrSvg) return { estado: 'processando', detalhe: 'QR gerado; aguardando a leitura no telefone.' };
  return { estado: 'pendente', detalhe: 'ainda não conectado; abra o passo do WhatsApp.' };
}

function fonteModelo(m: ModeloParaFontes): Fonte {
  if (m.estado === 'ok') return { estado: 'verde', detalhe: `chamada de teste ok${m.ms != null ? ` (${m.ms} ms)` : ''}` };
  if (m.estado === 'falhou') return { estado: 'vermelho', detalhe: `a chamada falhou: ${m.motivo ?? 'sem detalhe'}` };
  if (m.estado === 'pedido') return { estado: 'processando', detalhe: 'teste pedido; aguardando a ponte responder.' };
  return { estado: 'pendente', detalhe: 'ainda sem chamada de teste.' };
}

function fonteMemoria(p: Painel): Fonte {
  const s = p.servicos.hindsight;
  if (!s) return { estado: 'pendente', detalhe: `Hindsight ainda não respondeu${p.memoria.documentosEnviados > 0 ? `; ${p.memoria.documentosEnviados} documento(s) já enviado(s)` : ''}.` };
  if (!s.ok) return { estado: 'vermelho', detalhe: `sem resposta há ${s.ha}s; ${p.memoria.documentosEnviados} documento(s) enviado(s).` };
  return { estado: 'verde', detalhe: `respondendo · ${p.memoria.documentosEnviados} documento(s) enviado(s).` };
}

function fonteMidia(p: Painel): Fonte {
  const q = (tipo: string): Record<string, number> => p.fila.porTipo[tipo] ?? {};
  const tipos = ['baixar_midia', 'transcrever', 'converter_pdf'];
  // "indisponivel" = o WhatsApp nao tem mais o arquivo (painel.ts separa): nao ha o que consertar, entao NAO e falha nem entra no total; conta a parte.
  // Download abandonado por outro motivo (hash nao confere, arquivo vazio...) continua falha.
  const semArquivo = q('baixar_midia').indisponivel ?? 0;
  const total = tipos.reduce((a, t) => a + soma(q(t)), 0) - semArquivo;
  const ok = tipos.reduce((a, t) => a + (q(t).ok ?? 0), 0);
  const pend = tipos.reduce((a, t) => a + (q(t).pendente ?? 0) + (q(t).em_andamento ?? 0), 0);
  const falhas = tipos.reduce((a, t) => a + (q(t).erro ?? 0) + (q(t).abandonada ?? 0), 0);
  const sem = semArquivo > 0 ? `; ${semArquivo} sem arquivo (não estão mais no WhatsApp; é normal)` : '';
  if (pend > 0) return { estado: 'processando', detalhe: `${ok} de ${total} etapa(s) concluída(s); ${pend} na fila${sem}.` };
  if (falhas > 0) return { estado: 'vermelho', detalhe: `${falhas} arquivo(s) com falha; ${ok} de ${total} etapa(s) concluída(s)${sem}.` };
  if (total > 0) return { estado: 'verde', detalhe: `${p.acervo.audios} áudio(s) e ${p.acervo.pdfs} PDF(s); ${ok} de ${total} etapa(s) concluída(s)${sem}.` };
  if (p.acervo.audios + p.acervo.pdfs > 0) return { estado: 'pendente', detalhe: `${p.acervo.audios} áudio(s) e ${p.acervo.pdfs} PDF(s) aguardando processamento.` };
  return { estado: 'pendente', detalhe: 'nenhum áudio ou PDF recebido ainda.' };
}

function fonteCrm(c: CrmParaFontes): Fonte {
  if (!c.configurado) return { estado: 'pendente', detalhe: 'não configurado (Krayin).' };
  if (c.estado === 'ok') {
    if (c.completo === false) {
      const falta = c.faltando ?? [];
      return { estado: 'processando', detalhe: `conectado; funil incompleto${falta.length > 0 ? `: falta ${falta.join(', ')}` : ''}.` };
    }
    return { estado: 'verde', detalhe: 'conectado ao Krayin; funil com as 5 etapas.' };
  }
  if (c.estado === 'falhou') return { estado: 'vermelho', detalhe: `sem conexão: ${c.motivo ?? 'sem detalhe'}.` };
  return { estado: 'pendente', detalhe: 'configurado; falta testar a conexão.' };
}

export function montarFontes(p: Painel, modelo: ModeloParaFontes, crm: CrmParaFontes): Fontes {
  return {
    whatsapp: fonteWhatsapp(p),
    modelo: fonteModelo(modelo),
    memoria: fonteMemoria(p),
    midia: fonteMidia(p),
    crm: fonteCrm(crm)
  };
}
