// Liga a escolha de modelo (core/modelos.ts, gravada no banco pela tela) ao cliente do Hermes: lida a cada pedido, sem reiniciar a ponte.
import type { Banco } from '../../core/src/db.ts';
import { lerModelo, tarefaDaSessao, PROVEDOR_DO_MODELO } from '../../core/src/modelos.ts';
import { registrarConsumo } from '../../core/src/consumo.ts';
import type { ConsumoDaChamada, EscolhaDeModelo } from './hermes.ts';

export function escolhaDeModelo(db: Banco): (sessao: string) => EscolhaDeModelo | undefined {
  return (sessao) => {
    const m = lerModelo(db, tarefaDaSessao(sessao));
    return m.model === null ? undefined : { model: m.model, provider: PROVEDOR_DO_MODELO, esforco: m.esforco };
  };
}

/** Anota no banco (so numeros) o que cada resposta do modelo gastou, na tarefa que a chave de sessao indica. */
export function consumoParaBanco(db: Banco, agora: () => number = Date.now): (c: ConsumoDaChamada) => void {
  return (c) => registrarConsumo(db, { tarefa: tarefaDaSessao(c.sessao), modelo: c.modelo, entrada: c.entrada, saida: c.saida, ms: c.ms }, agora());
}
