// Contrato das ferramentas do MCP do Heimdall (docs/plano/fase-1-mcp.md). Ainda nao e o servidor: e a lista
// do que ele pode oferecer e a validacao de entrada. REGRA: so leitura, exceto registrar_feedback, que so grava em `feedback`.
// Nenhuma ferramenta envia mensagem nem apaga dados.

export type TipoCampo = 'texto' | 'inteiro' | 'data' | 'tipo_relatorio';

export interface Ferramenta {
  nome: string;
  descricao: string;
  entrada: Record<string, { tipo: TipoCampo; obrigatorio: boolean }>;
  escreve: boolean;
  escreveEm?: readonly string[];
}

const leitura = (nome: string, descricao: string, entrada: Ferramenta['entrada'] = {}): Ferramenta => ({ nome, descricao, entrada, escreve: false });

export const FERRAMENTAS: readonly Ferramenta[] = [
  leitura('clientes_aguardando_usuario', 'Clientes que esperam resposta do dono, do mais antigo ao mais novo.'),
  leitura('followups_devidos', 'Clientes com follow-up devido em uma data.', { data: { tipo: 'data', obrigatorio: true } }),
  leitura('compromissos_do_dia', 'Compromissos com data no dia informado.', { data: { tipo: 'data', obrigatorio: true } }),
  leitura('compromissos_atrasados', 'Compromissos vencidos e nao cumpridos.'),
  leitura('clientes_com_potencial', 'Clientes com sinal de potencial recente.'),
  leitura('cliente', 'Dossie, estado, tentativas e ultimos eventos de um cliente.', { id: { tipo: 'inteiro', obrigatorio: true } }),
  leitura('buscar_conversas', 'Mensagens de um cliente em um periodo.', { cliente: { tipo: 'inteiro', obrigatorio: true }, de: { tipo: 'data', obrigatorio: true }, ate: { tipo: 'data', obrigatorio: true } }),
  leitura('reunioes_sem_transcricao', 'Reunioes ocorridas que ainda nao tem transcricao.'),
  leitura('dados_do_relatorio', 'Pacote ja calculado (janelas e regras aplicadas) para o diario ou o semanal.', { tipo: { tipo: 'tipo_relatorio', obrigatorio: true }, data: { tipo: 'data', obrigatorio: true } }),
  leitura('perfil_usuario', 'Cadastro do dono.'),
  leitura('perfil_empresa', 'Cadastro da empresa.'),
  leitura('equipe', 'Pessoas internas e funcoes.'),
  { nome: 'registrar_feedback', descricao: 'Guarda uma correcao do dono (unica escrita permitida).', entrada: { texto: { tipo: 'texto', obrigatorio: true }, referencia: { tipo: 'texto', obrigatorio: false } }, escreve: true, escreveEm: ['feedback'] }
];

export class EntradaInvalida extends Error {
  constructor(motivo: string) { super(`Entrada invalida: ${motivo}`); this.name = 'EntradaInvalida'; }
}

const DATA = /^\d{4}-\d{2}-\d{2}$/;

export function validarEntrada(nome: string, args: Record<string, unknown>): void {
  const f = FERRAMENTAS.find((x) => x.nome === nome);
  if (!f) throw new EntradaInvalida(`ferramenta desconhecida: ${nome}`);
  for (const chave of Object.keys(args)) if (!(chave in f.entrada)) throw new EntradaInvalida(`campo nao previsto: ${chave}`);
  for (const [chave, campo] of Object.entries(f.entrada)) {
    const v = args[chave];
    if (v === undefined || v === null) {
      if (campo.obrigatorio) throw new EntradaInvalida(`falta o campo ${chave}`);
      continue;
    }
    const ok =
      campo.tipo === 'texto' ? typeof v === 'string' && v.trim() !== '' && v.length <= 2000 :
      campo.tipo === 'inteiro' ? Number.isInteger(v) && (v as number) > 0 :
      campo.tipo === 'data' ? typeof v === 'string' && DATA.test(v) && !Number.isNaN(Date.parse(v)) :
      v === 'diario' || v === 'semanal';
    if (!ok) throw new EntradaInvalida(`valor invalido em ${chave}`);
  }
}
