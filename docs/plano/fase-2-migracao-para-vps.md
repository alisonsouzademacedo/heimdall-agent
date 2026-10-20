# Fase 2 — Migração do Heimdall validado no Windows para uma VPS

Estado (2026-10-20): **plano, nada executado.** Decisão do dono (D30 em `README.md`): o Heimdall roda **primeiro no Windows**, até estar validado; só depois sobe para a VPS **já contextualizado**, com tudo o que aprendeu.

## Critério de "validado" (o dono decide quando está pronto)
1. Um **relatório diário** e um **semanal** gerados de verdade e aprovados por ele (o semanal ainda não existe no código: `PROGRESS.md`, 2026-10-19, "Faltam: relatório semanal").
2. Tudo o que o Baileys puxar na carga inicial **absorvido** (recebimento bruto → mídia → transcrição/PDF → extração → memória; `fase-1-carga-inicial.md`), sem fila pendente nem falhas abertas.
3. Aprendizado em andamento: critérios e personalidade aprovados no self-chat (`fase-1-aprendizado.md`, `fase-1-calibracao-da-personalidade.md`).
4. Uma **restauração ensaiada** do backup numa pasta de teste, com as contagens conferidas (`fase-1-seguranca-operacional.md`, "Ensaio de restauração"). **Sem isso a migração não começa:** a migração é uma restauração em outra máquina.

## O que se leva e o que NÃO se leva
| Item | Leva? | Como |
|---|---|---|
| Acervo (`acervo.sqlite`, `data/midias`, `data/md`, dossiês, relatórios, cadastro, versões de critérios e do `SOUL.md`) | Sim | backup consistente do próprio `core` (`VACUUM INTO`), nunca copiar o `.sqlite` aberto |
| Memória do Hindsight | Sim | `hindsight-admin backup` → `hindsight-admin restore` + `repair-bank --all` (`fase-1-seguranca-operacional.md`, "Restaurar (ordem)") |
| Hermes (config, memória, skills, sessões, cron) | Sim, **sem as chaves** | `hermes backup`/`hermes import`; o zip contém `.env` e `auth.json` (segredos): refazer o login na VPS em vez de levar o arquivo |
| Lista de esquecimento (ids apagados) | Sim, obrigatória | reaplicar depois de restaurar, para dado apagado não ressuscitar |
| Sessão do WhatsApp (`auth_info`) | **Não copiar sem decidir** | ver "Riscos"; o padrão seguro é **vincular de novo na VPS (QR)** e desvincular o aparelho do Windows |
| Segredos (`.env`, tokens, login do ChatGPT) | Não pelo git | digitados/ligados na VPS, só pelo dono |

## Ordem proposta (cada passo com confirmação do dono)
1. Medir a VPS com o mesmo método do Windows (`docker stats`; a medição vira a segunda máquina em `fase-1-perfis-de-computador.md`).
2. Preparar a VPS: Docker Engine, versões **fixas** das imagens, portas só em `127.0.0.1`, acesso por Tailscale ou SSH (nenhuma porta nova aberta para a internet sem o dono pedir).
3. Último backup no Windows, ensaiar a restauração na VPS **com o Windows ainda ligado e sem enviar nada**.
4. Parar a escuta no Windows (desvincular), vincular na VPS (QR), religar `sync_hindsight` e conferir contagens.
5. Só então desligar o Windows. Manter o último backup do Windows por 30 dias.

## Dados da VPS informados pelo dono (2026-10-20)
Ubuntu 24.04, KVM, 4 vCPUs ("QEMU Virtual CPU version 2.5+"), 7,8 GiB de RAM (cerca de 5,7 GiB disponíveis com os serviços atuais), 3,8 GiB de swap, 33 GB de disco livre, sem GPU, Tailscale instalado. Já roda outros serviços (Directus, aplicativos Next, nginx, contêineres Docker). O IP e as portas dela **não** entram no repositório.

## Riscos e o que NÃO foi verificado
- **CPU virtual genérica:** o modelo "QEMU Virtual CPU 2.5+" costuma esconder instruções como AVX/AVX2. Verificar `grep -o -w -E 'avx|avx2|avx512f' /proc/cpuinfo | sort -u`. O efeito no Whisper e nos embeddings (ONNX) **não foi medido**; com 4 vCPUs a transcrição deve ficar mais lenta que os 0,37× do notebook (também **não medido**).
- **Servidor compartilhado:** a folga (cerca de 2,6 GB depois dos 3,1 GB medidos do Heimdall) só vale se os outros serviços não crescerem. Definir limites de memória por contêiner.
- **WhatsApp a partir de IP de datacenter:** se a conta aceita bem esse tipo de origem **não foi verificado** (`docs/baileys/` não trata disso nas páginas lidas). Por isso o plano prevê vincular de novo por QR e não copiar a sessão.
- **Dados de clientes num servidor:** exigem acesso restrito (chave SSH/Tailscale), disco e backups **criptografados** e nenhum log com conteúdo de conversa (regra 2 do `AGENTS.md`).
- **Regra 1 na VPS:** o Heimdall continua só escrevendo no self-chat; nenhuma porta de entrada nova.
- **Restauração do Hindsight entre máquinas** e **do Hermes (`import`) em outra versão**: a documentação trata de restauração na mesma instalação; entre máquinas, **não verificado** (ensaiar no passo 3).
