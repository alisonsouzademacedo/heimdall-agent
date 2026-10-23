import test from 'node:test';
import assert from 'node:assert/strict';
import { montarFontes, type CrmParaFontes } from './fontes.ts';
import type { Painel } from './painel.ts';

const T = Date.parse('2026-10-22T12:00:00Z');

function painel(over: Partial<Painel> = {}): Painel {
  return {
    whatsapp: { estado: 'desconhecido', dono: null, motivo: null, aviso: null, historico: null, contagem: null, qrSvg: null },
    fila: { total: { pendente: 0, em_andamento: 0, ok: 0, erro: 0, abandonada: 0 }, porTipo: {} },
    saida: { pendente: 0, enviada: 0, abandonada: 0 },
    acervo: { mensagens: 0, conversas: 0, audios: 0, pdfs: 0 },
    memoria: { documentosEnviados: 0 },
    relatorios: { ultimo: null },
    servicos: {},
    selfchat: { teste: 'nao_feito' },
    backup: { destino: null, ultimoEm: null, erro: null },
    historicoAntigo: { liberado: false, conversas: 0, pendentes: 0, emAndamento: 0, concluidas: 0, esgotadas: 0, pedidos: 0, novas: 0 },
    processamento: { liberada: false },
    ...over
  };
}

const SEM_CRM: CrmParaFontes = { configurado: false };

test('fontes: sem nada ligado, todas ficam pendentes e dizem o que falta', () => {
  const f = montarFontes(painel(), { estado: 'nao_feito' }, SEM_CRM);
  assert.deepEqual(
    Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.estado])),
    { whatsapp: 'pendente', modelo: 'pendente', memoria: 'pendente', midia: 'pendente', crm: 'pendente' }
  );
  assert.match(f.whatsapp.detalhe, /ainda n.o conectado/i);
  assert.match(f.modelo.detalhe, /ainda sem chamada/i);
  assert.match(f.memoria.detalhe, /Hindsight/i);
  assert.match(f.midia.detalhe, /nenhum .udio ou PDF/i);
  assert.match(f.crm.detalhe, /n.o configurado/i);
});

test('fontes: WhatsApp conectado, modelo ok, Hindsight respondendo e mídias concluídas ficam verdes', () => {
  const p = painel({
    whatsapp: { estado: 'conectado', dono: '+55 11 9 9999-0000', motivo: null, aviso: null, historico: null, contagem: { inseridas: 42, duplicadas: 0, editadas: 0, apagadas: 0, midiasEnfileiradas: 2, falhas: 0, ultimaMensagemEm: T, em: T }, qrSvg: null },
    acervo: { mensagens: 42, conversas: 3, audios: 2, pdfs: 1 },
    memoria: { documentosEnviados: 7 },
    servicos: { hindsight: { ok: true, ha: 3 } },
    fila: {
      total: { pendente: 0, em_andamento: 0, ok: 4, erro: 0, abandonada: 0 },
      porTipo: {
        baixar_midia: { ok: 2 },
        transcrever: { ok: 1 },
        converter_pdf: { ok: 1 }
      }
    }
  });
  const f = montarFontes(p, { estado: 'ok', ms: 321 }, { configurado: true, estado: 'ok' });
  assert.equal(f.whatsapp.estado, 'verde');
  assert.match(f.whatsapp.detalhe, /42 mensagem/);
  assert.equal(f.modelo.estado, 'verde');
  assert.match(f.modelo.detalhe, /321 ms/);
  assert.equal(f.memoria.estado, 'verde');
  assert.match(f.memoria.detalhe, /7 documento/);
  assert.equal(f.midia.estado, 'verde');
  assert.match(f.midia.detalhe, /2 .udio/);
  assert.equal(f.crm.estado, 'verde');
});

test('fontes: QR pendente, teste falhou, Hindsight sem resposta e midia com falha pedem atencao', () => {
  const p = painel({
    whatsapp: { estado: 'reconectar', dono: null, motivo: null, aviso: null, historico: null, contagem: null, qrSvg: '<svg></svg>' },
    servicos: { hindsight: { ok: false, ha: 400 } },
    acervo: { mensagens: 10, conversas: 1, audios: 1, pdfs: 1 },
    fila: {
      total: { pendente: 0, em_andamento: 0, ok: 1, erro: 1, abandonada: 1 },
      porTipo: {
        baixar_midia: { ok: 1, erro: 1 },
        converter_pdf: { abandonada: 1 }
      }
    }
  });
  const f = montarFontes(p, { estado: 'falhou', motivo: 'sem chave' }, { configurado: true, estado: 'falhou', motivo: '302' });
  assert.equal(f.whatsapp.estado, 'processando');
  assert.match(f.whatsapp.detalhe, /QR/i);
  assert.equal(f.modelo.estado, 'vermelho');
  assert.match(f.modelo.detalhe, /sem chave/);
  assert.equal(f.memoria.estado, 'vermelho');
  assert.match(f.memoria.detalhe, /400/);
  assert.equal(f.midia.estado, 'vermelho');
  assert.match(f.midia.detalhe, /2 arquivo/);
  assert.equal(f.crm.estado, 'vermelho');
});

test('fontes: download que o WhatsApp nao tem mais (indisponivel) NAO e falha: midia fica verde e conta separado', () => {
  const p = painel({
    acervo: { mensagens: 10, conversas: 1, audios: 3, pdfs: 0 },
    fila: {
      total: { pendente: 0, em_andamento: 0, ok: 4, erro: 0, abandonada: 5 },
      porTipo: { baixar_midia: { ok: 2, indisponivel: 5 }, transcrever: { ok: 2 } }
    }
  });
  const f = montarFontes(p, { estado: 'nao_feito' }, SEM_CRM);
  assert.equal(f.midia.estado, 'verde');
  assert.match(f.midia.detalhe, /4 de 4 etapa/);
  assert.match(f.midia.detalhe, /5 sem arquivo/);
  assert.doesNotMatch(f.midia.detalhe, /falha/);
});

test('fontes: download abandonado por falha de verdade (nao "indisponivel") continua vermelho', () => {
  const p = painel({
    acervo: { mensagens: 10, conversas: 1, audios: 3, pdfs: 0 },
    fila: {
      total: { pendente: 0, em_andamento: 0, ok: 2, erro: 0, abandonada: 1 },
      porTipo: { baixar_midia: { ok: 1, abandonada: 1 }, transcrever: { ok: 1 } }
    }
  });
  const f = montarFontes(p, { estado: 'nao_feito' }, SEM_CRM);
  assert.equal(f.midia.estado, 'vermelho');
  assert.match(f.midia.detalhe, /1 arquivo/);
});

test('fontes: CRM conectado mas com funil incompleto fica em andamento, nunca verde', () => {
  const f = montarFontes(painel(), { estado: 'nao_feito' }, { configurado: true, estado: 'ok', completo: false, faltando: ['2ª Reunião Agendada'] });
  assert.equal(f.crm.estado, 'processando');
  assert.match(f.crm.detalhe, /2ª Reuni/);
});

test('fontes: media ainda na fila fica processando, mesmo sem falha', () => {
  const p = painel({
    acervo: { mensagens: 5, conversas: 1, audios: 1, pdfs: 0 },
    fila: {
      total: { pendente: 1, em_andamento: 0, ok: 0, erro: 0, abandonada: 0 },
      porTipo: { baixar_midia: { pendente: 1 } }
    }
  });
  const f = montarFontes(p, { estado: 'pedido' }, SEM_CRM);
  assert.equal(f.midia.estado, 'processando');
  assert.match(f.midia.detalhe, /0 de 1/);
  assert.match(f.midia.detalhe, /1 na fila/);
  assert.equal(f.modelo.estado, 'processando');
});
