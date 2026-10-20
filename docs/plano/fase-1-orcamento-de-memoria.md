# Fase 1 — Orçamento de memória em 8 GB (proposta, 2026-10-19)

Estado: **proposta, nada instalado.** Medições são da máquina do dono (Windows 11 Pro, 8029 MB, Docker Desktop 29.9.1, WSL 3.0.3.0). Os números dos serviços vêm das páginas citadas e **não foram medidos aqui**.

## 1. Medido nesta máquina (sem nenhum contêiner do Heimdall)
| O quê | MB | Observação |
|---|---|---|
| Memória total / livre | 8029 / ~1150 | com o app do Claude (~2000 MB, 13 processos), o navegador (~650 MB), a tela do Heimdall (65 MB) e o Docker abertos |
| `vmmemWSL` (VM do Docker, ociosa) | ~1800 a 1950 | o Docker informa `Total Memory: 3.746GiB` (padrão = 50% da RAM) |
| Docker Desktop (lado Windows) | ~640 | `com.docker.backend`, `Docker Desktop`, `com.docker.build` |
| Todo o resto (Windows e demais programas) | ~3200 | grupo "outros", 133 processos |

Leitura: **a VM ociosa já custa ~1,9 GB e o Docker Desktop ~0,6 GB: ~2,5 GB antes de qualquer serviço nosso.** A VM chegou a aparecer menor numa amostra anterior (devolve memória quando ociosa); não medi a decomposição do que a VM usa. Um teste de "1 GB alocado" que tentei **não foi válido** (só passava dados por pipe) e não entra nos números.

## 2. O que a documentação diz de cada serviço (RAM)
| Serviço | Mínimo / recomendado | Fonte |
|---|---|---|
| Hindsight API, imagem **completa** | 1,5 GB / 2 GB (ocioso 0,8 a 1,0; sob carga 1,2 a 1,5); imagem ~9 GB em disco | `docs/hindsight/developer/installation.md` (Hardware) |
| Hindsight API, imagem **slim** | 512 MB / 1 GB; **exige** provedores externos de embeddings e reranker | idem |
| Hindsight Control Plane (tela web, opcional) | 128 / 256 MB | idem |
| PostgreSQL | 512 MB / 1 GB+ (cresce com as memórias) | idem |
| Hermes (sem ferramentas de navegador) | 1 GB / 2 a 4 GB; com navegador, pelo menos 2 GB | `docs/hermes-agent/user-guide/docker.md` (Resource limits) |
| faster-whisper `small`, `int8`, CPU | ~1477 MB para 13 min de áudio (i7-12700K, 8 threads); **não há número de CPU para modelos maiores** | `docs/faster-whisper/repo/README.md` |
| Núcleo/escuta (Node) | ~65 MB medidos na tela | medido |

## 3. Contas (estimativas, a validar com `docker stats`)
- **Tudo "como está no plano"** (Hindsight completo + Postgres + Hermes + Whisper `small`): 1,5 a 2 + 0,5 a 1 + 1 + 1,5 = **4,5 a 5,5 GB** só de serviços, além dos ~2,5 GB do Docker. **Não cabe** em 8 GB com o Windows e outros programas.
- **Versão leve** (Hindsight slim + embeddings locais ONNX + reranker `rrf` + Postgres + Hermes 1 GB + Whisper `small` só quando houver áudio): 0,5 a 1 + 0,5 a 1 + 1 + 0,1 = **~2,1 a 3,1 GB** em regime, **~3,6 a 4,6 GB** durante uma transcrição. Fica no limite, e só com o app do Claude e o navegador fechados durante o processamento pesado.

## 4. Alavancas encontradas na documentação
1. **Hindsight: reranker sem modelo.** `HINDSIGHT_API_RERANKER_PROVIDER=rrf` (lista de provedores) ou `HINDSIGHT_API_ENABLE_RERANKING=false` ("devolve a ordem fundida por RRF, mais rápido, menos preciso") — `configuration.md`, linhas ~1209 e ~1764. **Qualidade em português: não medida.** O reranker local padrão é um cross-encoder (`cross-encoder/ms-marco-MiniLM-L-6-v2`, treinado em inglês, a confirmar).
2. **Hindsight: embeddings.** O padrão `local` usa `BAAI/bge-small-en-v1.5` (inglês). Para português: provedor `onnx` com `intfloat/multilingual-e5-small` (384 dimensões, prefixos `query: ` e `passage: `), que roda no processo; a documentação manda instalar `hindsight-api-slim[local-onnx]` "ao montar o seu próprio ambiente" (**imagem própria; não verificado se a imagem slim oficial já traz isso**). Trocar de modelo depois obriga a reindexar tudo (aviso na própria página). Embeddings remotos (OpenAI, Cohere...) pedem chave de API, que contraria a decisão D7 (sem API paga).
3. **Hindsight sem LLM** (só trechos + busca) existe, mas desliga reflexão e observações (`configuration.md`, "No LLM"): perde o que o Heimdall quer do Hindsight.
4. **`.wslconfig` (Microsoft, `learn.microsoft.com/windows/wsl/wsl-config`, lida inteira):** arquivo em `%UserProfile%\.wslconfig` (não existe por padrão); seção `[wsl2]`: `memory=` (padrão 50% da RAM), `swap=` (padrão 25% da memória, arredondado), `processors=`, `vmIdleTimeout=` (60000 ms); seção `[experimental]`: `autoMemoryReclaim=` (`disabled`, `gradual` ou `dropCache`; padrão `dropCache`). Aplica-se depois de `wsl --shutdown`. **Um teto de memória abaixo do que os contêineres pedem faz o Linux matar processos: o valor certo só sai da medição.**
5. **Limites por contêiner** (`--memory`, `deploy.resources.limits`): o próprio exemplo do Hermes usa 4G e 2 CPUs; o mínimo documentado é 1 GB.
6. **Operação:** a transcrição já roda "um áudio por vez" (runbook 06); a carga do histórico (D20) deve ser em lotes, à noite, com o navegador e o app do Claude fechados.
7. **Fora do Docker:** a documentação do Hindsight dá `pip install hindsight-api` no Windows (banco embutido `pg0`). Tira o custo da VM, mas **perde o isolamento** e foge do desenho (runbook R1/R2/R8); só como último recurso.
8. **Onde roda (D8, "decidir depois"):** se a medição mostrar que 8 GB não bastam, o caminho honesto é um servidor/VPS (a D23 hoje diz "só na máquina"; mudar exige decisão do dono).

## 5. Proposta de ordem (cada passo com confirmação do dono)
1. **Medir de verdade**, uma imagem por vez, com `docker stats` e a memória do Windows: `pgvector/pgvector:pg18` (receita `external-pg`), `nousresearch/hermes-agent` (tag fixa), Hindsight `slim` (~500 MB) e o Whisper `small` `int8`. **Exige baixar as imagens (vários GB; o tamanho do Hermes não está na documentação)**.
2. Escolher entre (a) versão leve com `.wslconfig` e (b) servidor externo, com os números na mão.
3. Só então escrever o Compose (versões fixas, portas em `127.0.0.1`, volumes nomeados; runbooks 02, 03, 06) e testar.

## 5b. Ponto de parada (2026-10-19, noite) — retomar daqui
Autorizado pelo dono: baixar e medir. **Versões fixas escolhidas** (consultadas nos registros, só leitura): `pgvector/pgvector:pg18` (154 MB comprimidos; **baixada**), `ghcr.io/vectorize-io/hindsight:1.0.0-slim` (465 MB; **baixada**, 1,95 GB em disco), `nousresearch/hermes-agent:v0.22.2` (1070 MB; **download iniciado, não confirmado**: conferir com `docker image ls`; se faltar, repetir o `docker pull`, que retoma as camadas), base `python:3.12-slim` (41 MB) e modelo `Systran/faster-whisper-small` (461 MB, Hugging Face): **ainda não baixados**.
**Divergências documentação × realidade (registrar em `PROGRESS.md`):** a documentação do Hermes manda "tag `X.Y.Z`", mas as tags reais têm prefixo `v` (`v0.22.2`); os exemplos do Hindsight citam `0.4.9`, mas o registro já tem `1.0.0` (a documentação local pode estar defasada).
**Cuidado com a medição:** o dono combinou fechar o app do Claude e o navegador para medir, mas o app do Claude é onde a IA roda. Plano: um script de medição independente (processo oculto do PowerShell, gravando em `data\medicao\`, fora do git) sobe os contêineres um a um e amostra `docker stats`, `vmmemWSL` e a memória livre do Windows; o dono fecha os programas, espera o fim e reabre o app para eu ler os arquivos. Whisper: áudio sintético pt-BR gerado com a voz do Windows (mede memória e tempo, **não** qualidade). Hindsight slim pode **não subir** sem o provedor `onnx` (pergunta aberta da seção 6); se falhar, o erro é o resultado.
Contêineres de teste usam o prefixo `m-`, **sem publicar portas**, e são removidos ao fim (são descartáveis, criados pela IA).

## 6. Não verificado
Consumo real dos três serviços; qualidade do reranker `rrf` e do `multilingual-e5-small` em português; se a imagem slim oficial permite o provedor `onnx`; quanta memória a VM devolve ao Windows quando ociosa; se `autoMemoryReclaim` ajuda neste caso.
