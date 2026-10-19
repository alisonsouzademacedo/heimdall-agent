# Requisitos de sistema e verificação automática (preflight)

Objetivo (usuário): o Heimdall pode virar **produto comercial**, instalado em máquinas de clientes. A instalação precisa ser amigável em Windows, Linux e Mac, e um teste deve **detectar o sistema, ler o hardware e dizer se atende** aos requisitos.

## É possível? Sim
Todo sistema expõe essas informações por comandos próprios: nome e versão do sistema, arquitetura, CPU e núcleos, memória, disco livre, GPU NVIDIA (`nvidia-smi`), programas instalados e suas versões, acesso à rede e portas livres. O verificador lê isso, compara com uma tabela de requisitos e dá um veredito em português.

**Protótipo pronto:** `spike/preflight/` com `preflight.sh` (macOS e Linux/WSL2) e `preflight.ps1` (Windows). Gera relatório na tela e `preflight-resultado.json`. Estado: o `.sh` foi executado e validado no Linux; o `.ps1` e o macOS **não foram testados**.

Exemplo real (este ambiente de desenvolvimento, só para mostrar o formato): Ubuntu 24.04 x86_64, 4 núcleos, 15 GB de RAM, 29 GB de disco, sem GPU → "ATENDE COM RESSALVAS" (disco no limite, Docker parado, fuso UTC); sugeriu `medium` em CPU para o Whisper.

## Por que dois scripts (e não um só)
O verificador precisa rodar numa máquina **sem nada instalado**. O Windows traz PowerShell e o macOS/Linux trazem shell POSIX; Python e Node não vêm de fábrica. Para o spike isso basta. Para o **produto**, o caminho é **um executável único** que faça a verificação e a instalação guiada (decisão futura).

## Onde cada peça roda (fontes: documentações salvas em `docs/`)
| Peça | macOS | Windows 10/11 | Linux / WSL2 | Observação |
|---|---|---|---|---|
| Hermes | Apple Silicon: completo. Intel: só linha de comando | nativo (x86_64 e ARM64) | Ubuntu e WSL2; x86_64 e aarch64 | Traz o próprio Python e Node |
| Baileys (listener) | sim | sim | sim | Node 20 ou superior |
| faster-whisper | sim (CPU; a doc só cita GPU NVIDIA) | sim; **não em Windows ARM64** (docs do Hermes) | sim | GPU: NVIDIA com CUDA 12 e cuDNN 9 |
| markitdown | sim | sim | sim | Python 3.10 a 3.14 |
| Hindsight | Apple Silicon completo; Intel só versão "slim" | sim | sim | via Docker ou pip |
| Krayin | via Docker | via Docker (Docker Desktop) | via Docker | PHP 8.3+, MySQL 8.0.32+ |
| Docker | Docker Desktop | Docker Desktop | Docker Engine | Necessário para Hindsight e Krayin |

## Requisitos (mínimo declarado × estimativa nossa)
**Declarados nas documentações:**
- Krayin: RAM 3 GB ou mais (a doc não diz se é só para instalar), PHP 8.3+, MySQL 8.0.32+ ou MariaDB.
- Hindsight (imagem completa): API 1,5 GB mínimo, 2 GB recomendado; PostgreSQL 0,5 GB mínimo, 1 GB+ recomendado.
- faster-whisper, modelo `small` em `int8` na CPU: ~1,5 GB de RAM (benchmark deles; não há dados para modelos maiores em CPU).
- Whisper com GPU: ~1 GB (tiny/base) até ~10 GB (large) de VRAM; `turbo` ~6 GB.
- Baileys: Node 20+. Hermes: Python 3.14 gerenciado por ele (não depende do sistema).

**Estimativa nossa (a confirmar medindo no spike):** somando os mínimos mais o sistema, o Docker e o Hermes (consumo ainda **desconhecido**):
| | Mínimo | Recomendado |
|---|---|---|
| Memória | 8 GB | 16 GB |
| Núcleos | 2 | 4 ou mais |
| Disco livre | 15 GB | 30 GB ou mais (imagens, modelos, áudios e PDFs de 90 dias) |
| GPU | não exige | NVIDIA com ≥ 6 GB de VRAM acelera o áudio, mas não é necessária |

## O que o verificador checa hoje
Sistema e arquitetura suportados · memória, núcleos, disco · AVX2 (CPU antiga deixa o Whisper lento) · GPU e VRAM · Docker instalado e **rodando** · Node ≥ 20, Python, Git · acesso a `web.whatsapp.com`, `chatgpt.com`, `huggingface.co` e `github.com` · portas 1455 (login do ChatGPT) e 8888 (Hindsight) · fuso horário · **modelo de transcrição sugerido** conforme CPU/RAM/GPU (candidato inicial, confirmado pelo teste real E6).

## Limites conhecidos
- Os limiares de memória, disco e núcleos são **estimativas**, não medidos.
- Não mede velocidade real (isso é o teste E6 do Whisper, com áudio de verdade).
- Não verifica AVX2 no Windows com PowerShell 5.1; não detecta GPU AMD ou Intel.
- A lista de portas é provisória (Hermes, Krayin e listener ainda sem portas definidas).

## Próximos passos
1. Usuário roda o verificador na máquina local e envia o resultado (`preflight-resultado.json`).
2. Testar o `.ps1` em Windows real e o `.sh` em macOS.
3. Ajustar limiares com os números medidos no spike (E6, E8, E12).
4. Definir o formato do instalador do produto (executável único).

## Decisões pendentes (usuário)
1. **Sistemas suportados no lançamento comercial:** os três (Windows, macOS, Linux) ou começar por um? Isso muda o esforço de instalação e suporte.
2. **Docker aceitável para clientes?** Hindsight e Krayin pedem Docker; clientes leigos podem achar a instalação pesada. A alternativa é empacotar tudo (mais trabalho).
