# Fase 1 — Perfis de computador (setup ideal por máquina)

Estado (2026-10-20): **implementado e testado** em `apps/core/src/onboarding/perfil.ts`. É **proposta técnica**, não decisão do dono: os limites dos perfis vêm da medição de uma única máquina (8 GB) e da documentação das ferramentas. Só o perfil "Enxuto" tem números **medidos**; os demais são documentação ou estimativa e **dizem isso em cada item**.

## Para que serve
O instalador e a tela de configuração mostram, logo no início, **qual setup serve a ESTE computador**: modelo do Whisper, imagem do Hindsight, o que fechar, o que evitar e o que ainda não foi verificado. A mesma função (`escolherPerfil`) alimenta o console do instalador (`iniciar.ts`) e o painel "Ambiente" da tela (resposta de `/api/ambiente/testar`, campo `perfil`).

## Como decide
Entradas (medidas de `medirSistema`, `ambiente.ts`): memória total e livre, disco livre, sistema e arquitetura, número de CPUs lógicas e placa NVIDIA (`nvidia-smi`, memória de vídeo). Memória arredondada como no verificador (7,8 GiB contam como 8 GB; 7,5 já é 8; 11,5 já é 12; 23,5 já é 24).

## As quatro opções
| Perfil | Memória | Adequação | Hindsight | Whisper | Origem dos números |
|---|---|---|---|---|---|
| **Insuficiente** | menos de 8 GB | não recomendado | — | — | documentação; sugere servidor externo (D8) ou outro computador |
| **Enxuto** | 8 a 11 GB | **apertado** | imagem slim + extra `local-onnx` (imagem própria), embeddings `multilingual-e5-small`, reranker `rrf`: ~1,3 GB | `small`, `int8`, CPU, **um áudio por vez**: pico 1,4 GB, 0,37× o tempo real | **medido** em 2026-10-20 (notebook do dono, 8029 MB, app do Claude e navegador abertos) |
| **Equilibrado** | 12 a 23 GB | adequado | imagem completa (1,5 a 2 GB de RAM, ~9 GB de disco) ou slim+onnx | `small` int8; subir para `medium` se o teste de capacidade aprovar | documentação e estimativa (**não medido**) |
| **Folgado** | 24 GB ou mais | adequado | imagem completa | `turbo` ou `large-v3`; com NVIDIA de 4 GB ou mais de vídeo: faster-whisper na GPU (`float16`, CUDA 12 + cuDNN 9) | documentação e estimativa (**não medido**) |

Por sistema: **Windows** = Docker Desktop com WSL 2 e virtualização ligada na BIOS (e teto da VM padrão, ~50% da RAM); **Linux** = Docker Engine; **macOS** = Docker Desktop, **sem GPU NVIDIA**, e aviso de `arm64` (imagens do Hindsight menores, mas conferir se todas as imagens têm versão arm64).

Avisos que podem ser acrescentados a qualquer perfil: memória livre agora abaixo de 2 GiB (fechar programas); disco abaixo de 30 GB livres (**reprova**, mesmo com muita memória) e de 30 a 49 GB (folga pequena); menos de 4 CPUs (transcrição lenta, **não medido**); sistema fora de Windows, Linux e macOS (**reprova**).

## O que foi medido (perfil Enxuto)
Resumo (detalhes e limites em `fase-1-orcamento-de-memoria.md`, seção 5d): PostgreSQL ~47 a 69 MB (banco vazio); Hermes ~320 a 350 MB (ocioso); Hindsight slim+onnx ~1,31 a 1,35 GB; Whisper `small` `int8`: 258,8 s de áudio sintético em 94,8 s, pico 1373 MB; soma dos contêineres ~3,1 GB; VM do Docker até 3679 MB; memória livre do Windows no pior momento 317 MB (437 MB durante o Whisper). Nenhum processo foi morto por falta de memória.

## Computador do dono (o que o Heimdall escolhe hoje)
i5-9300H (8 CPUs lógicas), 7,84 GiB, GTX 1650 de 4 GB, Windows 11 Pro: **Enxuto, apertado**. A placa de vídeo aparece como opção **não verificada** (o padrão continua CPU `int8`). Para rodar na GPU dentro do Docker faltaria verificar CUDA 12, cuDNN 9 e o NVIDIA Container Toolkit sob WSL 2.

## Testes automáticos de regressão (um por tipo de computador)
`apps/core/src/onboarding/perfil.test.ts` (rodam em `npm test`, no GitHub em Ubuntu e Windows com Node 22 e 24): 4 GB; o notebook do dono (8 GB, GTX 1650, ~1 GB livre); 8 GB com folga; 16 GB Windows; 32 GB Linux com NVIDIA de 12 GB; Mac arm64 com 16 GB; disco de 20 GB e de 40 GB; 2 CPUs; os limites de arredondamento (7,49 / 7,5 / 11,49 / 11,5 / 23,49 / 23,5); memória livre 1,99 e 2 GiB; sistema desconhecido; função pura; texto do console. **Honestidade como regra testada:** só o perfil de 8 GB pode ter itens "medido"; "Equilibrado" e "Folgado" não. Também em `ambiente.test.ts` (leitura do `nvidia-smi`, várias placas, lixo), `servidor.test.ts` (o perfil viaja na resposta e a tela sabe mostrá-lo) e `iniciar.test.ts` (o console mostra o perfil antes do endereço). 11 quebras propositais novas em `tests/core/mutacao.py`, todas detectadas.

## Como acrescentar um novo tipo de computador
1. Medir (ver `data\medicao\` e `fase-1-orcamento-de-memoria.md`) e registrar em `PROGRESS.md`.
2. Escrever **primeiro** o teste em `perfil.test.ts` (o novo caso precisa falhar).
3. Ajustar `perfil.ts`; o item só pode ser `medido` se houver medição registrada; senão `documentacao` ou `estimativa`.
4. Rodar todos os testes e a mutação (`python tests/core/mutacao.py`).

## Limites e pendências (honestos)
- Medição de **uma máquina e uma rodada**; banco vazio, Hermes sem conversa, Hindsight sem LLM; os perfis de 16 e 32 GB são **extrapolação**.
- Qualidade em português do reranker `rrf` e do `multilingual-e5-small` **não medida**; qualidade do Whisper **não avaliada**.
- Detecção de CPU limitada a quantidade (não detecta AVX2/AVX-512): a economia de embeddings quantizados **não foi testada** nem verificada na CPU.
- GPU: só detectada; uso dentro do Docker **não verificado**.
- A imagem do Hindsight com `local-onnx` e a do trabalhador de áudio (com `av` fixado) **ainda não existem no repositório** (só imagens de teste em `data\medicao`, fora do git): ver `runbooks/02` e `06`.
- Windows em outras edições e Linux/macOS: perfis só por documentação; **nunca rodados** nessas máquinas.
