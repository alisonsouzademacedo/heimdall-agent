// Banco do acervo (SQLite) e migracoes. Modelo: docs/plano/fase-1-modelo-de-dados.md.
// Usa o modulo node:sqlite do Node (sem dependencia externa). Em producao o arquivo fica em volume nomeado, nunca no git.
import { DatabaseSync } from 'node:sqlite';

export type Banco = DatabaseSync;

interface Migracao {
  versao: number;
  descricao: string;
  sql: string;
}

export const MIGRACOES: readonly Migracao[] = [
  {
    versao: 1,
    descricao: 'acervo base',
    sql: `
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE DEFAULT (lower(hex(randomblob(16)))),
  nome TEXT NOT NULL,
  notas TEXT,
  criado_em INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE contatos (
  id INTEGER PRIMARY KEY,
  nome TEXT,
  papel TEXT NOT NULL DEFAULT 'desconhecido' CHECK (papel IN ('cliente','interno','dono_pessoal','fornecedor','pessoal','desconhecido')),
  papel_fonte TEXT NOT NULL DEFAULT 'inferido' CHECK (papel_fonte IN ('cadastro','inferido','confirmado')),
  cliente_id INTEGER REFERENCES clientes(id)
);
CREATE TABLE contato_jids (
  jid TEXT PRIMARY KEY,
  contato_id INTEGER NOT NULL REFERENCES contatos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('lid','pn'))
);
CREATE TABLE conversas (
  id INTEGER PRIMARY KEY,
  jid TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('dm','grupo','self')),
  nome TEXT
);
CREATE TABLE mensagens (
  id INTEGER PRIMARY KEY,
  conversa_id INTEGER NOT NULL REFERENCES conversas(id),
  wa_msg_id TEXT NOT NULL,
  remetente_contato_id INTEGER REFERENCES contatos(id),
  de_mim INTEGER NOT NULL CHECK (de_mim IN (0,1)),
  enviada_em INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('texto','audio','pdf','ignorada')),
  texto TEXT,
  estado TEXT NOT NULL DEFAULT 'ativa' CHECK (estado IN ('ativa','editada','apagada')),
  texto_original TEXT,
  pede_resposta INTEGER CHECK (pede_resposta IN (0,1)),
  origem_evento TEXT NOT NULL CHECK (origem_evento IN ('notify','append','historico')),
  UNIQUE (conversa_id, wa_msg_id)
);
CREATE INDEX idx_mensagens_conversa_tempo ON mensagens (conversa_id, enviada_em);
CREATE TABLE midias (
  id INTEGER PRIMARY KEY,
  mensagem_id INTEGER NOT NULL REFERENCES mensagens(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('audio','pdf')),
  caminho TEXT NOT NULL,
  sha256 TEXT UNIQUE,
  bytes INTEGER,
  criada_em INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE compromissos (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('reuniao','retorno','proposta','outro')),
  titulo TEXT NOT NULL,
  data_hora TEXT,
  estado TEXT NOT NULL DEFAULT 'marcado' CHECK (estado IN ('marcado','realizado','transcricao_recebida','cumprido','cancelado')),
  origem_mensagem_id INTEGER REFERENCES mensagens(id),
  confianca REAL,
  motivo TEXT
);
CREATE TABLE sinais_potencial (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  mensagem_id INTEGER REFERENCES mensagens(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('pediu_proposta','perguntou_preco','marcou_reuniao','trouxe_decisor')),
  em INTEGER NOT NULL
);
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  texto TEXT NOT NULL,
  tipo INTEGER NOT NULL CHECK (tipo BETWEEN 1 AND 6),
  estado TEXT NOT NULL DEFAULT 'registrado' CHECK (estado IN ('registrado','aplicado','proposto','aprovado','recusado','desfeito')),
  cliente_id INTEGER REFERENCES clientes(id),
  item_codigo TEXT,
  criado_em INTEGER NOT NULL,
  aplicado_em INTEGER
);
CREATE TABLE ajustes_cliente (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('silenciar','prioridade_baixa','resolvido')),
  ate_dia TEXT,
  criado_em INTEGER NOT NULL
);
CREATE TABLE apagar_pendente (
  codigo TEXT PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente','midias_antigas')),
  cliente_id INTEGER,
  limite_em INTEGER,
  criado_em INTEGER NOT NULL,
  tentativas_erradas INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE esquecimento (
  cliente_uid TEXT PRIMARY KEY,
  apagado_em INTEGER NOT NULL
);
CREATE TABLE auditoria_apagar (
  id INTEGER PRIMARY KEY,
  escopo TEXT NOT NULL,
  contagens TEXT NOT NULL,
  em INTEGER NOT NULL
);
`
  },
  {
    versao: 2,
    descricao: 'onboarding e configuracao',
    sql: `
CREATE TABLE onboarding_etapas (
  passo TEXT PRIMARY KEY,
  estado TEXT NOT NULL DEFAULT 'pendente' CHECK (estado IN ('pendente','em_andamento','verde','vermelho')),
  inicio INTEGER,
  fim INTEGER,
  erro TEXT
);
CREATE TABLE configuracao (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
`
  },
  {
    versao: 3,
    descricao: 'aprendizado: itens de relatorio, casos, propostas e versoes de criterios',
    sql: `
CREATE TABLE relatorio_itens (
  dia TEXT NOT NULL,
  codigo TEXT NOT NULL,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  PRIMARY KEY (dia, codigo)
);
CREATE TABLE casos_criterio (
  id INTEGER PRIMARY KEY,
  chave TEXT NOT NULL,
  cliente_id INTEGER REFERENCES clientes(id),
  em INTEGER NOT NULL
);
CREATE TABLE propostas_criterio (
  id INTEGER PRIMARY KEY,
  chave TEXT NOT NULL,
  descricao TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'proposta' CHECK (estado IN ('proposta','aprovada','recusada','desfeita')),
  criada_em INTEGER NOT NULL,
  respondida_em INTEGER
);
CREATE TABLE criterios_versoes (
  versao INTEGER PRIMARY KEY,
  conteudo TEXT NOT NULL,
  proposta_id INTEGER REFERENCES propostas_criterio(id),
  aprovada_em INTEGER NOT NULL,
  ativa INTEGER NOT NULL DEFAULT 1 CHECK (ativa IN (0,1))
);
`
  },
  {
    versao: 4,
    descricao: 'fila duravel, origem das midias e sincronizacao com o Hindsight',
    sql: `
-- A escuta nunca espera o processamento: tudo que e pesado entra aqui (fase-1-modelo-de-dados.md). Nenhum tipo de "enviar": regra 1.
CREATE TABLE fila (
  id INTEGER PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('baixar_midia','transcrever','converter_pdf','extrair','retain')),
  referencia TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendente' CHECK (estado IN ('pendente','em_andamento','ok','erro','abandonada')),
  tentativas INTEGER NOT NULL DEFAULT 0,
  proximo_em INTEGER NOT NULL,
  erro TEXT,
  criado_em INTEGER NOT NULL,
  atualizado_em INTEGER NOT NULL,
  UNIQUE (tipo, referencia)
);
CREATE INDEX idx_fila_pronta ON fila (estado, proximo_em);
-- Descritor da midia (JSON do Baileys com BufferJSON): o suficiente para baixar de novo se a primeira tentativa falhar ou a midia expirar.
CREATE TABLE midias_origem (
  mensagem_id INTEGER PRIMARY KEY REFERENCES mensagens(id),
  descritor TEXT NOT NULL
);
CREATE TABLE sync_hindsight (
  tipo TEXT NOT NULL,
  referencia TEXT NOT NULL,
  document_id TEXT NOT NULL,
  hash_conteudo TEXT NOT NULL,
  sincronizado_em INTEGER NOT NULL,
  PRIMARY KEY (tipo, referencia)
);
`
  },
  {
    versao: 5,
    descricao: 'varias mensagens podem apontar para o mesmo arquivo de midia',
    sql: `
-- "midias" tem UM registro por arquivo (sha256 unico). O mesmo PDF ou audio reenviado em outras conversas e processado uma vez e todas
-- as mensagens recebem o texto: cada mensagem aponta para o arquivo por aqui. (Sem DROP/DELETE: so apagar.ts apaga dados.)
CREATE TABLE mensagem_midia (
  mensagem_id INTEGER PRIMARY KEY REFERENCES mensagens(id),
  midia_id INTEGER NOT NULL REFERENCES midias(id)
);
CREATE INDEX idx_mensagem_midia_midia ON mensagem_midia (midia_id);
`
  },
  {
    versao: 6,
    descricao: 'caixa de saida para o dono (sem coluna de destino: so existe o self-chat)',
    sql: `
-- Todo texto que o Heimdall escreve para o dono passa por aqui e e entregue pelo listener, que so envia ao self-chat (regra 1).
-- Proposital: NAO existe coluna de destino. "chave" evita gerar o mesmo relatorio duas vezes.
CREATE TABLE saida (
  id INTEGER PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('resposta','relatorio','aviso')),
  texto TEXT NOT NULL,
  chave TEXT UNIQUE,
  estado TEXT NOT NULL DEFAULT 'pendente' CHECK (estado IN ('pendente','enviada','abandonada')),
  tentativas INTEGER NOT NULL DEFAULT 0,
  proximo_em INTEGER NOT NULL DEFAULT 0,
  wa_msg_id TEXT,
  erro TEXT,
  criada_em INTEGER NOT NULL,
  enviada_em INTEGER
);
CREATE INDEX idx_saida_pronta ON saida (estado, proximo_em, id);
CREATE INDEX idx_saida_wa ON saida (wa_msg_id);
`
  },
  {
    versao: 7,
    descricao: 'documentos do Hindsight a apagar quando um cliente e apagado',
    sql: `
-- Apagar um cliente tambem tem de esquecer o que foi enviado ao Hindsight (conversas por dia). apagar.ts anota aqui; o processo da memoria
-- executa e marca "feito". Guarda so o id do documento (conv:<conversa>:<dia>), nunca texto.
CREATE TABLE memoria_apagar (
  document_id TEXT PRIMARY KEY,
  pedido_em INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendente' CHECK (estado IN ('pendente','feito')),
  tentativas INTEGER NOT NULL DEFAULT 0,
  feito_em INTEGER,
  erro TEXT
);
`
  },
  {
    versao: 8,
    descricao: 'duvidas do Heimdall para o dono (extracao com pouca confianca)',
    sql: `
-- Quando o modelo nao tem certeza (audio ruim, data ambigua) a pergunta vai ao dono no relatorio seguinte. So a pergunta curta; sem texto da conversa.
CREATE TABLE duvidas (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  texto TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'aberta' CHECK (estado IN ('aberta','respondida')),
  criada_em INTEGER NOT NULL,
  UNIQUE (cliente_id, texto)
);
`
  },
  {
    versao: 9,
    descricao: 'edicao/apagada que chega antes da mensagem original (carga do historico): espera a original e e aplicada quando ela entra',
    sql: `
-- Nada e apagado daqui (D16): depois de aplicada a linha so ganha "aplicada_em". Uma linha por mensagem e tipo: a ultima edicao recebida vale.
CREATE TABLE alteracoes_pendentes (
  id INTEGER PRIMARY KEY,
  remote_jid TEXT NOT NULL,
  wa_msg_id TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('editar','apagar')),
  novo_texto TEXT,
  recebida_em INTEGER NOT NULL,
  aplicada_em INTEGER,
  UNIQUE (remote_jid, wa_msg_id, tipo)
);
CREATE INDEX idx_alteracoes_pendentes_msg ON alteracoes_pendentes (wa_msg_id);
`
  },
  {
    versao: 10,
    descricao: 'trabalho abandonado guarda o hash do conteudo: so volta para a fila se a conversa mudar (antes voltava a cada varredura)',
    sql: `
-- Hash (sem texto de conversa) do conteudo no momento em que o trabalho foi abandonado. Os agendadores comparam: igual = nao adianta tentar de novo.
ALTER TABLE fila ADD COLUMN hash_abandono TEXT;
`
  },
  {
    versao: 11,
    descricao: 'nome de contato/grupo que chega antes da primeira mensagem (a lista de contatos costuma vir primeiro): espera e e aplicado quando o contato/grupo aparece',
    sql: `
-- Uma linha por JID; a ultima lista recebida vale. Nada e apagado: ao aplicar, a linha ganha "aplicada_em". Nunca sobrescreve nome que o contato ja tem.
CREATE TABLE nomes_pendentes (
  jid TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  recebida_em INTEGER NOT NULL,
  aplicada_em INTEGER
);
`
  }
];

export function abrirBanco(caminho: string = ':memory:'): Banco {
  const db = new DatabaseSync(caminho);
  // Primeiro comando: os 5 processos abrem o mesmo arquivo juntos e o primeiro precisa recuperar o WAL; sem a espera ja definida o outro leva
  // "database is locked" (errcode 261) na subida (LICOES.md, 2026-10-21).
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

export function versaoAtual(db: Banco): number {
  const existe = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_versao'").get();
  if (!existe) return 0;
  const r = db.prepare('SELECT MAX(versao) AS v FROM schema_versao').get() as { v: number | null };
  return r.v ?? 0;
}

// Aplica as migracoes pendentes, cada uma em transacao. Idempotente: rodar de novo nao muda nada.
export function migrar(db: Banco, ate: number = MIGRACOES.at(-1)!.versao, agora: number = Date.now()): number {
  db.exec('CREATE TABLE IF NOT EXISTS schema_versao (versao INTEGER PRIMARY KEY, aplicada_em INTEGER NOT NULL)');
  for (const m of MIGRACOES) {
    if (m.versao > ate) continue;
    // Os processos do Heimdall sobem juntos e migram o mesmo arquivo: pega a trava de escrita ANTES de decidir e le a versao DENTRO da transacao,
    // senao outro processo pode aplicar a mesma migracao entre a leitura e o BEGIN ("table ... already exists"; LICOES.md, 2026-10-20).
    db.exec('BEGIN IMMEDIATE');
    try {
      if (m.versao <= versaoAtual(db)) { db.exec('COMMIT'); continue; }
      db.exec(m.sql);
      db.prepare('INSERT INTO schema_versao (versao, aplicada_em) VALUES (?, ?)').run(m.versao, agora);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }
  return versaoAtual(db);
}

export function contar(db: Banco, tabela: string): number {
  if (!/^[a-z_]+$/.test(tabela)) throw new Error('nome de tabela invalido');
  return (db.prepare(`SELECT COUNT(*) AS n FROM ${tabela}`).get() as { n: number }).n;
}
