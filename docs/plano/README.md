# Heimdall — quadro de planejamento

Última atualização: 2026-10-22. Fase atual: **fase 2 — conclusão do produto e preparação da VPS** (`fase-2-execucao.md`; decisão D31: teste direto na VPS).

## Objetivo
Agente que só escuta o WhatsApp comercial do SDR (texto, áudio, PDF → .md; resto ignorado), acumula memória, aprende e entrega relatório diário e semanal (.md) no self-chat. Só conversa com o dono, só no self-chat. Fase 2: CRM Kanban (cadastrar, mover, ganho e perda).

## Decisões fechadas
| # | Decisão | Origem |
|---|---|---|
| D1 | Cliente WhatsApp: **Baileys** | usuário |
| D2 | **Um aparelho vinculado só** (sessão única) | usuário |
| D3 | Escutar **todas** as conversas e **todos os grupos**; mensagens enviadas pelo usuário entram | usuário |
| D4 | Histórico anterior: já tratado pelo usuário; **baixa prioridade** | usuário |
| D5 | Ponte listener ↔ Hermes: **opção Q** (API Server do Hermes; o listener envia a resposta, travado no próprio JID) | usuário |
| D6 | Hermes é o centro; memória de recuperação: **Hindsight** (a confirmar no spike) | usuário + análise |
| D7 | LLM: **ChatGPT Plus para tudo** (texto, áudio, documentos); sem API paga | usuário |
| D8 | Onde roda (local ou VPS): ~~decidir depois~~ **resolvida pela D30** (Windows primeiro, VPS depois da validação); **revista pela D31** (teste direto na VPS) | usuário |
| D9 | Dados de clientes nunca vão para o git (`data/` ignorado) | análise |
| D11 | PDF: **markitdown** (só PDF, transcrições de reuniões do Google Meet); outros documentos e imagens ficam de fora por enquanto; exemplos de PDF só na configuração | usuário |
| D13 | O PDF vem normalmente do **Pedro** (gestor interno); papéis dos contatos aprendidos no início, com cadastro explícito prioritário | usuário |
| D14 | Relatórios: semanal segunda 08:00 (semana anterior inteira), diário terça a sexta 08:00 (dia anterior); fuso `America/Sao_Paulo`; uma página; recomendações permitidas; sem alertas fora de hora; funil só na fase do CRM | usuário |
| D15 | Follow-up só para cliente que já respondeu; 2 dias entre tentativas; **7 tentativas sem retorno desconsideram** o cliente; cada resposta zera; "usuário sem responder" sempre no topo do próximo relatório; retornos marcados aparecem no relatório do dia | usuário |
| D16 | Modelo de dados aprovado: manter apagadas/editadas marcadas; grupos só internos, absorvidos sem avisos; retenção mínima de 90 dias com aviso e apagar sob comando; cliente = empresa | usuário |
| D17 | Funil: Contato iniciado → 1ª Reunião Agendada → 2ª Reunião Agendada → Fechamento/Ganho → Perdido/Arquivado (7 tentativas ou objeção irreversível); CRM do zero; Heimdall propõe e o usuário aprova (movimentos no relatório das 08:00) | usuário |
| D18 | CRM: **Krayin** (funil de 5 etapas; propõe e usuário aprova) — peso medido no spike (E8) | usuário |
| D19 | O usuário usará **Claude Code, Codex e Antigravity**; os três leem o mesmo `AGENTS.md` (verificado na documentação) | usuário + verificação |
| D20 | Sincronização e extração do **histórico completo obrigatórias** na primeira vez; processamento com estratégias de carga (`fase-1-carga-inicial.md`) | usuário |
| D21 | Interface em **português do Brasil** | usuário |
| D22 | Instalação feita por **IA**; instalador próprio fica para depois | usuário |
| D23 | Acesso **só na máquina** por enquanto; domínio e acesso pela internet só depois da validação | usuário |
| D24 | Cadastro inicial de **usuário, empresa e equipe interna** (função e telefone); cadastro tem prioridade sobre inferência; dias úteis ignoram feriados no início | usuário |
| D25 | Linguagem: **TypeScript/Node** no núcleo; Python só onde a ferramenta exige | usuário (recomendação aceita) |
| D26 | Comercial: primeiro para o próprio usuário com o plano do ChatGPT; **ideal que o cliente tenha a sua API** | usuário |
| D27 | Cadastro por **formulário** na tela de onboarding; o usuário escuta tudo e **não tem contatos pessoais** no WhatsApp empresarial, só o próprio número pessoal (tratar como `dono_pessoal`, fora das regras de cliente) | usuário |
| D28 | Regra para a IA instaladora: **cada erro resolvido gera teste de regressão, atualização das instruções e registro em `LICOES.md`**; só acrescenta, nunca enfraquece as regras inegociáveis | usuário |
| D29 | Personalidade: **sem exemplos do usuário**; o Heimdall aprende o jeito de falar dele ao processar o conteúdo e cria a própria personalidade (proposta com aprovação no self-chat, a confirmar) | usuário |
| D30 | **Onde roda:** primeiro **no Windows do dono**, até validar (relatório diário e semanal gerados, tudo o que o Baileys puxar absorvido, aprendizado em andamento); **só então migra para a VPS** já contextualizado, levando acervo, memória e aprendizado (plano em `fase-2-migracao-para-vps.md`). Resolve a D8; a D23 continua valendo até a migração | usuário (2026-10-20) |
| D31 | **Testar direto na VPS (Linux), antes de validar na máquina local** (2026-10-22): o programa dos 6 itens (limpeza Linux-only, skill de design, documentação, tela de onboarding, ponte completa e facilitador) é concluído com testes e CI verdes; o dono sobe para a VPS e a intervenção humana fica restrita a QR, login do ChatGPT, credenciais do CRM e decisões de acesso. O Omarchy na máquina local fica como ambiente de desenvolvimento. Revê a D30 (que previa validar primeiro no Windows) e mantém o espírito da D23: **sem exposição pública** — acesso à tela por túnel SSH ou Tailscale, a definir. Plano: `fase-2-execucao.md` | usuário (2026-10-22) |
| D12 | O Heimdall correlaciona a transcrição ao cliente pelo compromisso combinado no WhatsApp; **compromissos** viram entidade própria; pergunta no self-chat quando a confiança for baixa | usuário + análise |
| D10 | Áudio: **Whisper local via `faster-whisper`**; modelo escolhido por teste de capacidade da máquina; poucos áudios, até 3 min cada | usuário |

## Biblioteca de documentação (no repo, para contexto)
`docs/hermes-agent/` (458 págs) · `docs/baileys/` (1.778) · `docs/openai-codex/` (203) · `docs/hindsight/` (152) · `docs/whisper/` (repo + anúncio) · `docs/faster-whisper/` (README, código, benchmarks) · `docs/markitdown/` (README, pacotes, conversor de PDF) · `docs/krayin/` · `docs/docker/` (693 págs, subconjunto) · `docs/claude-code/` (48) · `docs/antigravity/` (71). Firecrawl: conectado; usado só quando o site não publica `llms-full.txt`.

## Análises feitas
- `fase-1-planejamento.md`: o que o Hermes faz e o achado de que a escuta passiva não é nativa.
- `fase-1-whatsapp-baileys-hermes.md`: 12 problemas do cruzamento Baileys × bridge do Hermes e arquitetura.
- `fase-1-memoria-hermes.md`: como o Hermes trata memória e a arquitetura em 3 camadas.
- `fase-1-memoria-e-llm.md`: Hindsight × Mem0 × claude-mem × Obsidian; assinaturas × provedores.
- `fase-1-audio.md`: Whisper local, teste de capacidade da máquina, riscos.
- `fase-1-pdf.md`: markitdown, escopo só PDF, segurança e fluxo.
- `fase-1-relatorios.md`: horários, regras de follow-up, estados do cliente.
- `fase-1-mcp.md`: MCP do Hindsight + MCP próprio.
- `fase-1-modelo-de-dados.md`: tabelas, princípios e fluxo para o Hindsight.
- `fase-2-crm.md`: Krayin, funil, autonomia.
- `fase-1-spike.md`: 13 experimentos de viabilidade antes de construir.
- `fase-1-operacao-da-ia.md`: regras para a IA instaladora (`AGENTS.md`), memória, testes de regressão.
- `LICOES.md`: registro de erros resolvidos (teste, instruções atualizadas).
- `runbooks/`: roteiros de instalação por componente (documentados, não executados) e testes de fumaça.
- `fase-1-cadastro-inicial.md`: cadastro de usuário, empresa e equipe (modelos em `templates/cadastro/`).
- `fase-1-arquitetura-e-compose.md`: estrutura do repositório, serviços, portas, rede e logins.
- `fase-1-carga-inicial.md`: 14 estratégias para a primeira carga de dados.
- `fase-1-onboarding-visual.md`: tela de configuração em 9 passos, só na primeira vez.
- `fase-1-requisitos-e-preflight.md`: requisitos por sistema e verificador automático (`spike/preflight/`).

## Riscos avaliados e aceitos pelo usuário (2026-10-18)
O usuário avaliou e decidiu seguir, com base em testes próprios: cota do ChatGPT Plus (fluxo majoritariamente texto, "não é muito"), termos de uso da assinatura em agentes externos, risco da conta do WhatsApp (o agente só escuta, não responde a terceiros nem dispara em massa), LGPD (confia no provedor) e bugs (testes automáticos de regressão em produção). Mantidos aqui só como pontos a **medir** no spike, não como bloqueios.

Ainda abertos (técnicos): Hindsight auto-hospedado (discussão pública de falha, não lida); Baileys v8 muda o formato de login e o Hermes fixa Baileys 7.0.0-rc13.

## O que falta (2026-10-19, atualizado)
**Decisões do usuário**
1. ~~Contatos pessoais e forma de cadastro~~: resolvidos (escuta tudo; formulário).

**Planejamento que ainda não existe**
2. ~~Roteiros de instalação~~: feitos em `runbooks/` (documentados; a execução é o spike).
3. ~~**Prompts e personalidade**~~ (feito em 2026-10-20, `prompts/`; aguarda revisão): `SOUL.md` (assessor), modelos dos relatórios, extração de compromissos e sinais, catálogo de objeções, skills iniciais.
4. ~~**Aprendizado**~~ (proposta em `fase-1-aprendizado.md`, aguarda aprovação): como as correções do usuário viram melhoria (`registrar_feedback`, critérios de "potencial" e "sem retorno").
5. ~~Segurança operacional~~ (aprovada em `fase-1-seguranca-operacional.md`, decisões do dono em 2026-10-20): onde ficam os segredos, **backup e restauração** (sessão do WhatsApp e acervo), rotina dos 90 dias e "apagar tudo de um cliente".
6. ~~Manutenção~~ (proposta em `fase-1-manutencao-e-versoes.md`, sem pergunta pendente): atualização de versões (Baileys muda o protocolo; Hermes e Hindsight), versões fixadas.
7. ~~Testes~~ (`fase-1-testes-e-ci.md`: executor único, 3 conjuntos rodando no GitHub; faltam os testes do código): lista detalhada e integração contínua no GitHub.
8. ~~Versão comercial com chave de API do cliente~~ (proposta em `fase-1-troca-de-provedor.md`; **achado:** embeddings/reranker/busca do Hindsight vêm em inglês, configurar para português antes da carga): desenho da troca de provedor (Hermes e Hindsight).

**Feito neste ciclo:** cadastro inicial (modelos), arquitetura e serviços (Compose em desenho), estrutura do repositório.

**Spike**
- Usuário baixa o repositório no notebook e roda `spike/preflight/`; testar o `.ps1` no Windows real e o `.sh` no macOS.
- E1 a E13 de `fase-1-spike.md` (WhatsApp, ponte Q, cron, Hindsight com ChatGPT, Whisper, markitdown com PDF do Meet, Krayin, regras, relatório, correlação, cota, segurança). Escrever e testar o Compose.
- **Sem material de teste fornecido pelo dono (decisão de 2026-10-19):** o próprio Heimdall baixa os dados do WhatsApp e usa **PDFs e áudios reais já extraídos** para o teste de conversão e transcrição, dentro da tela de onboarding (passo "Processar"; teste rápido com os próprios arquivos).

**Riscos técnicos abertos**
Hindsight auto-hospedado (discussão pública de falha, não lida); Baileys v8 muda o formato de login e o Hermes fixa Baileys 7.0.0-rc13; consumo de memória do Hermes e do núcleo (desconhecido); **janela de 5 horas do ChatGPT Plus compartilhada** entre Hermes, Hindsight e a IA instaladora; números brasileiros e o nono dígito no WhatsApp (não documentado).

**Verificado em 2026-10-20 (OpenAI):** o uso do plano via "Sign in with ChatGPT" é documentado para **apps de código aberto e locais**, com Plus e Pro elegíveis (Hermes está na lista oficial de parceiros). **App pago ou hospedado remotamente exige o formulário de interesse da OpenAI**; para a versão comercial, o caminho garantido é a **chave de API do cliente** (D26). Ver `runbooks/07-logins.md`.
