# Onboarding visual (tela de configuração, só na primeira vez)

Pedido do usuário (2026-10-19): uma tela visual, passo a passo, em que **qualquer pessoa** configura o Heimdall e **testa cada passo**: botão para gerar o QR Code e mostrar se a conexão está ok; barra de progresso da sincronização com o telefone; botão para começar a extração, com barra de progresso; botão para conectar a LLM (plano da OpenAI); processamento dos dados extraídos, com barra; e, depois, tudo automático (relatórios, conversa no self-chat, CRM). **Faz sentido? Sim**, e as barras de progresso têm fonte de dados real, conforme abaixo.

## Divisão de trabalho
| Quem | Faz |
|---|---|
| **IA instaladora** (regras em `AGENTS.md`) | Docker, contêineres, dependências, serviços, migrações do banco, configuração base |
| **Tela de onboarding** | O que depende do **usuário e das contas dele**: QR do WhatsApp, login do ChatGPT, funil do CRM, testes ponta a ponta |
| **Automático** | Escuta, relatórios, self-chat, CRM |
Para clientes comerciais **sem IA instaladora**, a camada da IA vira um **instalador** (decisão futura).

## Os passos (cada um tem botão "Testar", estado verde/vermelho e mensagem de correção em português)
**0. Ambiente.** Roda a verificação de `spike/preflight/` dentro da tela (sistema, memória, disco, Docker, rede) e mostra o que falta.
**1. Conectar o WhatsApp.** Botão "Gerar QR Code" → mostra o QR na tela (o Baileys entrega o código no evento `connection.update`; o Hermes documenta que o QR renova a cada ~20 s). O usuário escaneia em *Aparelhos conectados*. A tela mostra "Conectado" quando a conexão abre. É normal o WhatsApp **forçar uma reconexão logo após o QR** (FAQ do Baileys); a tela deve esconder isso do usuário. Depois de conectado, o QR some.
**1b. Cadastro (formulário).** Usuário, empresa e equipe interna, com verificação dos telefones no WhatsApp (ver `fase-1-cadastro-inicial.md`). Pode ser preenchido antes da conexão; a verificação roda depois dela.
**2. Sincronizar com o telefone.** Barra de progresso real: o evento `messaging-history.set` informa `progress` (0 a 100), quantas conversas, contatos e mensagens chegaram, e a marca `isLatest` no fim. Pontos de atenção: histórico completo exige `syncFullHistory` com perfil de navegador desktop e consome memória; o telefone deve ficar ligado e conectado; o Baileys só recebe **o que o telefone entregar**.
**3. Extrair.** (Veja as estratégias de carga em `fase-1-carga-inicial.md`: tela de orçamento com confirmação, prioridade ao recente, quarentena, teste rápido de 7 dias.) Botão "Começar extração": grava mensagens no acervo e **baixa áudios e PDFs originais** (a mídia expira nos servidores). Barra: itens processados ÷ total, com contadores por tipo. Não usa LLM.
**4. Conectar a LLM.** (Na versão comercial, a tela oferece também **chave de API do cliente**; ver `fase-1-arquitetura-e-compose.md`.) Botão "Entrar com o ChatGPT": abre o login (o Hindsight usa retorno em `127.0.0.1:1455`; o Hermes usa login por código de dispositivo). Mostra "Conectado" e o plano detectado. Teste: uma resposta curta do modelo.
**5. Processar.** Transcrição dos áudios (Whisper local), conversão dos PDFs, extração (compromissos, papéis, sinais de potencial) e envio ao Hindsight por dia fechado. Barra de progresso a partir da **fila durável** (`fila`: pendentes ÷ total), com tempo estimado e **uso da cota do plano**. Pausa e retomada sem perder progresso.
**6. CRM.** Botão "Criar funil" (as 5 etapas) no Krayin; teste que cria um lead de teste, move de etapa e remove.
**7. Self-chat.** Teste de ida e volta: o Heimdall envia uma mensagem e um `.md` ao self-chat; o usuário responde e vê a resposta.
**8. Agenda.** Mostra os horários (semanal segunda 08:00; diário terça a sexta 08:00; `America/Sao_Paulo`) e gera um **relatório de teste agora**.
**9. Pronto.** A tela vira um painel simples de **status** (saúde dos serviços, fila, cota, avisos de 90 dias), e o resto é automático.

## Requisitos de comportamento
- **Retomável:** se a janela fechar no meio, volta do passo em que parou (estado guardado no banco).
- **Refazer um passo** sem refazer tudo.
- Nenhum passo é pulado: o seguinte só libera com o anterior verde.
- Cada erro explica **o que aconteceu e o que fazer**, sem jargão.
- Logs técnicos ficam acessíveis em "Detalhes", fora do caminho do usuário comum.

## Tecnologia (proposta)
**Tela web local**, servida pelo próprio Heimdall em `http://localhost:<porta>` e aberta no navegador. Funciona igual em Windows, macOS e Linux, sem instalar framework de janela. Progresso em tempo real por conexão contínua (SSE ou WebSocket, a escolher na construção).
Segurança: aceitar conexões **só da própria máquina**, com um código de uso único por sessão; **o QR é um acesso à conta do WhatsApp**: mostrá-lo só enquanto o passo 1 estiver ativo e apagá-lo ao conectar.

## Reflexo no modelo de dados
Adicionar tabelas `onboarding_etapas` (passo, estado, início, fim, erro) e `configuracao` (valores não secretos). Segredos (credenciais do WhatsApp, tokens) ficam fora dessas tabelas.

## Decisões do usuário (2026-10-19)
1. **Sincronização obrigatória:** no início o Heimdall puxa **tudo** o que o servidor do WhatsApp entregar (criar contexto, memória e autoaprendizado). Nada de limitar o histórico.
2. **Estratégias para a carga grande:** ver `docs/plano/fase-1-carga-inicial.md` (orçamento antes de começar, processamento por prioridade, ritmo controlado, quarentena, teste rápido, entre outras).
3. **Idioma:** português do Brasil.
4. **Instalação:** feita por IA (Claude Code, Codex ou Antigravity). Um instalador próprio fica para depois.

## Decididos depois (2026-10-19)
- A tela fica acessível **só na própria máquina**. Acesso pela internet (domínio, HTTPS, autenticação) só depois que o Heimdall estiver validado.
- O **cadastro inicial** (usuário, empresa, equipe) entra como passo da configuração; ver `fase-1-cadastro-inicial.md`. Possível formulário na tela.


## Acréscimo (2026-10-20): destino do backup
Na configuração inicial o onboarding pergunta **onde guardar o backup** (HD externo, segundo disco ou pen drive) e verifica se o local existe e tem espaço. O backup roda no primeiro uso do dia. Ver `fase-1-seguranca-operacional.md`.

---

# Versão 2 do onboarding (2026-10-19): incorpora as decisões posteriores

Pergunta do dono: "a tela de onboarding, com barras de progresso, já está ajustada? Quero que a IA deixe todo o *background* pronto e eu faça tudo por essa página." **Resposta:** o desenho dos passos 0 a 9 acima existia, mas **não estava atualizado** com o que decidimos depois (escolha de provedor, idioma, calibração, backup, apagar, aprovações). Esta seção é a versão atual; em caso de conflito, **vale esta**. **Ainda não existe protótipo visual**: o que há é texto. Antes de programar, vale um desenho de tela para o dono aprovar.

## O que a IA instaladora deixa pronto *antes* de o dono abrir a página (definição de pronto)
1. Docker Desktop instalado e rodando; todos os serviços da fase 1 (`hermes`, `hindsight`, `postgres`, `core`, `media-worker`) **saudáveis**, com **versões fixadas** (`fase-1-manutencao-e-versoes.md`).
2. Hindsight já configurado para **português** (embeddings, reranker e dicionário), sem o dono escolher (`fase-1-troca-de-provedor.md`); modelo do Whisper e demais modelos **já baixados**.
3. Hermes com os toolsets restritos, chave da API gerada, `skills.write_approval` e `memory.write_approval` ligados; `SOUL.md` mínimo, skills e textos de `prompts/` instalados.
4. A página no ar em `http://localhost:<porta>`, aberta **por um atalho** na área de trabalho do Windows (o dono não digita comando). Como o atalho é criado e se o dono prefere abrir pelo navegador: **a decidir com ele**.
5. **Todos os testes** (`sh tests/run-all.sh`) e os **testes de fumaça que não dependem do dono** verdes; resultado gravado em `PROGRESS.md`.
6. Nada que dependa do dono fica feito por trás: **QR do WhatsApp, logins do ChatGPT, aprovações**. A IA não os executa (regra 4).
7. A IA **fecha** quando termina (o notebook tem 8 GB; `fase-1-requisitos-e-preflight.md`); a página mostra o **uso de memória** para o dono ver.

## Fluxo atual na página (cada passo com "Testar", verde/vermelho e erro em português)
| # | Passo | Mudança em relação à versão 1 |
|---|---|---|
| 0 | **Ambiente** | só leitura (a IA já instalou); mostra memória, disco, serviços. **Pergunta o destino do backup** (HD externo, segundo disco ou pen drive) e confere se existe e tem espaço |
| 1 | **WhatsApp (QR)** | igual; o QR nunca vai para log e some ao conectar |
| 1b | **Cadastro (formulário)** | igual, mas **pré-preenchido** com o que o dono já nos contou (contexto da Vtrês60 e objeções, hoje em `prompts/objecoes/catalogo.md`), para ele só conferir; equipe e telefones continuam a digitar |
| 2 | **Sincronizar com o telefone** | igual (barra de `messaging-history.set`) |
| 3 | **Extrair** | igual (mensagens e mídia originais; sem modelo) |
| 4 | **Conectar o modelo** | mostra as **duas opções**: "Entrar com o ChatGPT" (assinatura, seu uso) ou "Chave de API" (cliente comercial); chamada de teste nas duas peças (Hermes e Hindsight) |
| 5 | **Processar** | igual (transcrição, PDF, extração, Hindsight por dia fechado; barra da fila, tempo estimado, uso da cota; pausar e retomar) |
| 5b | **Voz e personalidade (novo)** | primeira calibração: o Heimdall mostra o **perfil de voz** e a proposta de estilo; botões `aprovar`, `ajustar`, `recusar` (funcionam também no self-chat) |
| 6 | **CRM** | **fase 2**: oculto na fase 1 |
| 7 | **Self-chat** | teste de ida e volta **e** teste de ensino: o Heimdall envia um item de exemplo `A1`; o dono responde "A1 já resolvi" e vê o registro (`fase-1-aprendizado.md`) |
| 8 | **Agenda e relatório de teste** | gera o diário e o semanal de teste; confere que cabem em uma tela |
| 9 | **Backup e segurança (novo)** | faz o **primeiro backup agora** e mostra o resultado; opção "ensaio de restauração" em pasta de teste; explica como apagar (duas etapas) |
| 10 | **Pronto: painel** | status dos serviços, fila, cota, **memória**, último backup, avisos de 90 dias (limpar só áudios e PDFs originais), versões e lembrete mensal de novidades |

## Regras de comportamento (mantidas e reforçadas)
Retomável e refazível por passo · um passo só libera quando o anterior estiver verde · cada erro diz o que aconteceu e o que fazer, sem jargão · logs em "Detalhes" · página acessível **só na própria máquina**, com código de uso único por sessão · segredos nunca aparecem na tela depois de digitados.

## Testes de regressão previstos para a página
Passo só libera com o anterior verde · retoma de onde parou depois de reiniciar · o QR nunca aparece em log nem em banco e é apagado ao conectar · a página só atende conexões locais e exige o código de uso único · chave de API digitada nunca é devolvida ao navegador nem gravada em log · refazer um passo não repete os anteriores · o passo 9 grava o backup no destino escolhido e falha com mensagem clara se o destino sumiu.

## Pendências
Desenho das telas (protótipo visual) para aprovação do dono · forma do atalho no Windows · porta da página · SSE ou WebSocket (decide-se na construção) · se o passo 5b também pode aprovar pela página (proposta: sim).


## Protótipo visual (2026-10-19)
Primeira versão do desenho das telas em `docs/plano/prototipo-onboarding/` (base de design: skill UI UX Pro Max; tema de mitologia nórdica). **Aguarda avaliação do dono.** A pendência "desenho das telas" fica em aberto até ele aprovar ou pedir mudanças.

## Decisões de 2026-10-19 (sem material de teste; instalador)
- **O dono não fornece material de teste.** No passo "Processar" a tela oferece **"Teste rápido com os seus próprios arquivos"**: escolhe, entre os PDFs e áudios reais já extraídos do WhatsApp, alguns poucos, converte/transcreve e mostra o resultado (só na tela, nunca no git) para o dono conferir a qualidade antes de processar tudo.
- **A única ação manual do dono é baixar o código.** O `iniciar.cmd` + `instalar/instalar.ps1` detectam o que falta (Git, Node.js 22.18+, Python 3, Docker Desktop), perguntam e instalam. Ver `PROMPT-INICIAL-NOTEBOOK.md`. O que depende do dono de verdade (QR, logins) continua na tela de onboarding.
