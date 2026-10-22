// Porta do CRM para a ponte: le a configuracao fora do git, fala com o Krayin e entrega ao nucleo apenas o necessario.
// Nenhum token vai para log, banco ou resposta. Sem configuracao, a porta nao faz nada (a ponte segue sem CRM).
import type { Banco } from '../../core/src/db.ts';
import { lerConfigCrm, type ConfigCrm } from '../../core/src/crm/config.ts';
import { criarLead, listarFunis, moverEtapa, verificarFunil } from '../../core/src/crm/krayin.ts';
import {
  aplicarRespostaCrm, proporMovimentos, type ApiCrm, type EtapasCrm, type PropostaCrm, type RespostaCrm
} from '../../core/src/crm/fluxo.ts';

export interface PortaCrm {
  /** Le o funil no Krayin e devolve o que mudou; falha de rede/funil incompleto = lista vazia (o relatorio sai sem CRM). */
  propor(db: Banco, agora: number): Promise<PropostaCrm[]>;
  /** Aplica a resposta do dono; null = a mensagem nao era um comando de CRM. */
  aplicar(db: Banco, texto: string, agora: number): Promise<RespostaCrm | null>;
}

// A configuracao e lida A CADA chamada: o dono pode salvar o token no onboarding com a ponte ja rodando, sem reiniciar.
// Sem configuracao, a porta existe mas nao faz nada (propor devolve vazio; aplicar devolve null e o fluxo normal segue).
export function criarPortaCrm(raiz: string): PortaCrm {
  const apiDe = (config: ConfigCrm): ApiCrm => ({
    criarLead: (entrada) => criarLead(config, entrada),
    moverEtapa: (leadId, etapaId) => moverEtapa(config, leadId, etapaId)
  });
  return {
    async propor(db, agora) {
      const config = lerConfigCrm(raiz);
      if (!config) return [];
      const lista = await listarFunis(config);
      if (!lista.ok) return [];
      const v = verificarFunil(lista.funis);
      if (!v.completo || !v.etapas.contato || !v.etapas.primeira || !v.etapas.segunda || !v.etapas.ganho || !v.etapas.perdido) return [];
      const etapas: EtapasCrm = {
        contato: v.etapas.contato,
        primeira: v.etapas.primeira,
        segunda: v.etapas.segunda,
        ganho: v.etapas.ganho,
        perdido: v.etapas.perdido
      };
      return proporMovimentos(db, etapas, agora);
    },
    async aplicar(db, texto, agora) {
      const config = lerConfigCrm(raiz);
      if (!config) return null;
      return aplicarRespostaCrm(db, texto, apiDe(config), { selfChat: true }, agora);
    }
  };
}
