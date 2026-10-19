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
