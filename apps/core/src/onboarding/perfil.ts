// Perfil ideal POR TIPO DE COMPUTADOR (docs/plano/fase-1-perfis-de-computador.md). Funcao pura: medidas entram, recomendacao sai.
// Regra de honestidade: cada item diz de onde vem ("medido" na maquina do dono em 2026-10-20, "documentacao" ou "estimativa").
// So o perfil de 8 GB tem itens medidos; os outros NAO foram medidos e dizem isso. Texto sem acentos, como as outras mensagens do instalador.
import type { Medidas } from './ambiente.ts';

export type Adequacao = 'ok' | 'apertado' | 'nao_recomendado';
export type Origem = 'medido' | 'documentacao' | 'estimativa';
export type IdPerfil = 'insuficiente' | 'enxuto' | 'equilibrado' | 'folgado';

export interface ItemPerfil {
  rotulo: string;
  valor: string;
  origem: Origem;
}

export interface Perfil {
  id: IdPerfil;
  nome: string;
  adequacao: Adequacao;
  resumo: string;
  itens: ItemPerfil[];
  avisos: string[];
  passos: string[];
}

const GIB = 1024 ** 3;
const SISTEMAS = ['win32', 'linux', 'darwin'];
const NOMES: Record<IdPerfil, string> = {
  insuficiente: 'Insuficiente (menos de 8 GB)',
  enxuto: 'Enxuto (8 a 11 GB)',
  equilibrado: 'Equilibrado (12 a 23 GB)',
  folgado: 'Folgado (24 GB ou mais)'
};

function idPelaMemoria(gb: number): IdPerfil {
  if (gb < 8) return 'insuficiente';
  if (gb < 12) return 'enxuto';
  if (gb < 24) return 'equilibrado';
  return 'folgado';
}

function itemDocker(plataforma: string): ItemPerfil {
  if (plataforma === 'linux') return { rotulo: 'Docker', valor: 'Docker Engine (o Docker do proprio Linux, sem aplicativo grafico)', origem: 'documentacao' };
  if (plataforma === 'darwin') return { rotulo: 'Docker', valor: 'Docker Desktop (macOS)', origem: 'documentacao' };
  return { rotulo: 'Docker', valor: 'Docker Desktop com WSL 2 (virtualizacao ligada na BIOS)', origem: 'documentacao' };
}

function itemGpu(m: Medidas, comGpuNoPadrao: boolean): ItemPerfil {
  const g = m.gpuNvidia;
  if (m.plataforma === 'darwin' || !g) return { rotulo: 'GPU', valor: 'sem GPU NVIDIA: Whisper em CPU (int8)', origem: 'documentacao' };
  const detalhe = `placa NVIDIA detectada (${g.nome}, ${g.vramMb} MB)`;
  if (comGpuNoPadrao) return { rotulo: 'GPU', valor: `${detalhe}: Whisper em float16 na GPU (exige CUDA 12 e cuDNN 9; no Docker, NVIDIA Container Toolkit)`, origem: 'documentacao' };
  return { rotulo: 'GPU', valor: `${detalhe}: usar a GPU no Whisper e opcao NAO VERIFICADA aqui (exige CUDA 12 e cuDNN 9; no Docker, NVIDIA Container Toolkit); o padrao continua CPU int8`, origem: 'estimativa' };
}

export function escolherPerfil(m: Medidas): Perfil {
  const gb = Math.round(m.memTotalBytes / GIB); // 7,8 GiB contam como "8 GB" (mesma regra do verificador de ambiente)
  const livreGb = m.memLivreBytes / GIB;
  const disco = Math.floor(m.discoLivreBytes / GIB);
  const id = idPelaMemoria(gb);
  const avisos: string[] = [];
  let adequacao: Adequacao = id === 'insuficiente' ? 'nao_recomendado' : id === 'enxuto' ? 'apertado' : 'ok';
  const itens: ItemPerfil[] = [];
  const passos: string[] = [];
  let resumo = '';

  if (id === 'insuficiente') {
    resumo = 'Menos de 8 GB de memoria: abaixo do minimo documentado para o Docker Desktop e para os servicos juntos.';
    passos.push('Use um servidor externo (VPS) para os servicos pesados: decisao D8 de docs/plano/README.md (hoje a D23 diz "so na maquina": mudar isso exige decisao do dono).');
    passos.push('Ou use outro computador com 8 GB de memoria ou mais.');
  } else if (id === 'enxuto') {
    resumo = 'Cabe, mas sem margem: na medicao real (8 GB) nenhum servico foi morto, porem a memoria livre do Windows chegou a poucas centenas de MB.';
    itens.push({ rotulo: 'Hindsight', valor: 'imagem slim + extra local-onnx (imagem propria, ver runbooks/02), sem LLM local: cerca de 1,3 GB', origem: 'medido' });
    itens.push({ rotulo: 'Embeddings', valor: 'intfloat/multilingual-e5-small em ONNX (448 MB)', origem: 'medido' });
    itens.push({ rotulo: 'Reranker', valor: 'rrf (sem modelo); qualidade em portugues nao medida', origem: 'medido' });
    itens.push({ rotulo: 'Whisper', valor: 'small, int8, CPU, um audio por vez: pico de 1,4 GB, 0,37x o tempo real', origem: 'medido' });
    itens.push({ rotulo: 'Hermes', valor: 'cerca de 0,33 GB ocioso, sem conversa (vai crescer com o uso; nao medido)', origem: 'medido' });
    itens.push({ rotulo: 'PostgreSQL', valor: 'pgvector/pgvector:pg18, cerca de 0,07 GB com o banco vazio (cresce com os dados)', origem: 'medido' });
    itens.push({ rotulo: 'Economia possivel', valor: 'embeddings model_O4.onnx (224 MB) ou qint8 (113 MB, exige AVX-512 VNNI): nao testado', origem: 'estimativa' });
    if (m.plataforma === 'win32') itens.push({ rotulo: 'VM do Docker (WSL)', valor: 'manter o teto padrao (50% da RAM, cerca de 3,8 GB): menor causa falta de memoria, maior deixa o Windows sem folga', origem: 'estimativa' });
    itens.push({ rotulo: 'Carga do historico', valor: 'em lotes, de madrugada, com navegador e outros programas fechados', origem: 'estimativa' });
    avisos.push('Folga pequena (medido: o Windows chegou a 317 MB livres com o app do Claude e o navegador abertos).');
    passos.push('Feche o app do Claude e o navegador durante o processamento pesado.');
    passos.push('Transcreva um audio por vez e, se possivel, com o Hindsight parado (o Whisper e o que leva a VM ao teto).');
  } else if (id === 'equilibrado') {
    resumo = 'Folga razoavel: nenhuma parte deste perfil foi medida (documentacao e estimativa).';
    itens.push({ rotulo: 'Hindsight', valor: 'imagem completa (embeddings e reranker locais; 1,5 a 2 GB de RAM; ~9 GB em disco) ou slim + onnx como no perfil enxuto', origem: 'documentacao' });
    itens.push({ rotulo: 'Whisper', valor: 'small int8 como ponto de partida; subir para medium se o teste de capacidade (docs/plano/fase-1-audio.md) aprovar', origem: 'estimativa' });
    itens.push({ rotulo: 'Hermes', valor: 'pelo menos 1 GB; 2 a 4 GB se usar ferramentas de navegador', origem: 'documentacao' });
    itens.push({ rotulo: 'PostgreSQL', valor: '512 MB a 1 GB ou mais (cresce com os dados)', origem: 'documentacao' });
    passos.push('Rode o teste de capacidade do Whisper (docs/plano/fase-1-audio.md) antes de fixar o modelo.');
    passos.push('Meça o consumo real com docker stats nos primeiros dias e registre em docs/plano/.');
  } else {
    resumo = 'Muita folga: nenhuma parte deste perfil foi medida (documentacao e estimativa).';
    itens.push({ rotulo: 'Hindsight', valor: 'imagem completa (embeddings e reranker locais; 1,5 a 2 GB de RAM; ~9 GB em disco)', origem: 'documentacao' });
    const gpuBoa = !!m.gpuNvidia && m.plataforma !== 'darwin' && m.gpuNvidia.vramMb >= 4096;
    itens.push({ rotulo: 'Whisper', valor: gpuBoa ? 'faster-whisper na GPU: modelo grande (turbo ou large-v3) conforme o teste de capacidade' : 'turbo ou large-v3 em int8 na CPU, conforme o teste de capacidade (a documentacao nao traz benchmark de CPU para modelos grandes)', origem: 'estimativa' });
    itens.push({ rotulo: 'Hermes', valor: '2 a 4 GB (permite as ferramentas de navegador)', origem: 'documentacao' });
    itens.push({ rotulo: 'PostgreSQL', valor: '1 GB ou mais', origem: 'documentacao' });
    passos.push('Rode o teste de capacidade do Whisper (docs/plano/fase-1-audio.md) antes de fixar o modelo.');
  }

  if (id !== 'insuficiente') {
    itens.push(itemDocker(m.plataforma));
    const gpuNoPadrao = id === 'folgado' && !!m.gpuNvidia && m.plataforma !== 'darwin' && m.gpuNvidia.vramMb >= 4096;
    itens.push(itemGpu(m, gpuNoPadrao));
    if (m.arch === 'arm64') itens.push({ rotulo: 'Arquitetura', valor: 'arm64: as imagens do Hindsight sao menores (~3,7 GB), mas confira se todas as imagens do projeto tem versao arm64', origem: 'documentacao' });
  }

  if (!SISTEMAS.includes(m.plataforma)) { adequacao = 'nao_recomendado'; avisos.push(`Sistema nao suportado (${m.plataforma}): use Windows 11, Linux ou macOS.`); }
  if (id !== 'insuficiente' && livreGb < 2) avisos.push(`Pouca memoria livre agora (${livreGb.toFixed(1)} GB): feche navegadores e outros programas antes de processar.`);
  if (disco < 30) { adequacao = 'nao_recomendado'; avisos.push(`Disco com menos de 30 GB livres (${disco} GB): as imagens do projeto ocupam cerca de 11 GB e os modelos e os dados crescem.`); }
  else if (disco < 50) avisos.push(`Folga de disco pequena (${disco} GB livres): as imagens ocupam cerca de 11 GB e os dados crescem.`);
  if (m.cpus !== undefined && m.cpus < 4) avisos.push(`Poucas CPUs (${m.cpus}): a transcricao sera lenta (nao medido).`);

  return { id, nome: NOMES[id], adequacao, resumo, itens, avisos, passos };
}

const ROTULO_ADEQUACAO: Record<Adequacao, string> = { ok: 'adequado', apertado: 'apertado', nao_recomendado: 'nao recomendado' };

// Texto para o console (inicio do instalador): mesma informacao que a tela mostra.
export function descreverPerfil(p: Perfil): string[] {
  const linhas = [`Perfil recomendado para este computador: ${p.nome} - ${ROTULO_ADEQUACAO[p.adequacao]}`, p.resumo];
  for (const i of p.itens) linhas.push(`  - ${i.rotulo}: ${i.valor} [${i.origem}]`);
  for (const a of p.avisos) linhas.push(`  ! ${a}`);
  for (const s of p.passos) linhas.push(`  > ${s}`);
  return linhas;
}
