# 7. Logins e contas (ChatGPT, WhatsApp, Krayin)

Fontes: `docs/hindsight/developer/models.md` ("ChatGPT Setup"), `docs/hermes-agent/integrations/providers.md` (OpenAI Codex), `docs/baileys/authentication/qr-code.md`, `docs/krayin/devdocs/2.2/introduction/installation.md`.

## Regra geral
Fazer **um login por vez**, na ordem abaixo. Todos usam o mesmo plano do ChatGPT e **compartilham a janela de uso de 5 horas** (R4).

## A. Hermes e ChatGPT
`docker exec -it hermes hermes model` → **ChatGPT or Codex Subscription**: login por código de dispositivo (abrir o endereço mostrado, digitar o código). Credenciais em `/opt/data/auth.json`; a renovação é automática. Se a renovação falhar de modo terminal, o Hermes pede novo login (`hermes auth add openai-codex`). Organizações que bloqueiam o código de dispositivo podem usar `hermes auth add openai-codex --browser`, que escuta em `http://localhost:1455/auth/callback` (**porta fixa**). Falha de TLS (`UNEXPECTED_EOF_WHILE_READING`) pode vir de intermediário de rede que rejeita grupos pós-quânticos.

## B. Hindsight e ChatGPT (provedor `chatgpt`)

> **DIVERGÊNCIA VERIFICADA (2026-10-20, no Windows do dono):** a imagem instalada `ghcr.io/vectorize-io/hindsight:1.0.0-slim` (a versão mais nova publicada no PyPI, tanto `hindsight-api` quanto `hindsight-api-slim`) **não tem** o provedor `chatgpt` nem o comando `hindsight-admin chatgpt` descritos abaixo e em `docs/hindsight/developer/models.md` ("ChatGPT Setup"): `hindsight-admin chatgpt login` responde "No such command 'chatgpt'" e o pacote só traz `codex_llm.py`/`codex_auth.py` (provedor **`openai-codex`**, que lê `auth.json` do Codex CLI em `CODEX_HOME` ou `HINDSIGHT_API_LLM_CODEX_HOME`). A documentação local descreve uma versão **ainda não publicada**. O que vale hoje: `none` (guarda e busca, sem extrair fatos) ou `openai-codex` (precisa do Codex CLI e de um login próprio, `codex login --device-auth`; endpoint privado do ChatGPT; a documentação do Hindsight diz "uso pessoal e de desenvolvimento"). **Decisão do dono pendente.** O texto abaixo vale para quando existir versão com `chatgpt`.

Rota **suportada** ("Sign in with ChatGPT" para apps de código aberto); credenciais **próprias**, sem compartilhar nem rotacionar as do Codex CLI.

**Elegibilidade (verificado em 2026-10-20):**
- `docs/openai-codex/docs/sign-in-with-chatgpt.md`: "assinantes **ChatGPT Plus e Pro elegíveis** podem escolher usar o plano para pedidos de IA" nos apps participantes; **Hermes Agent consta na lista oficial** de apps com uso do plano. O Hindsight **não consta** nessa lista; ele usa o fluxo documentado para **apps de código aberto** (`docs/openai-codex/siwc/`), no qual registra o próprio cliente OAuth.
- `siwc/token-sharing-open-source.md`: o fluxo vale para **apps de código aberto e hospedados localmente**. Para app **pago ou hospedado remotamente**, a OpenAI pede o **formulário de interesse** (`https://openai.com/form/sign-in-with-chatgpt-interest/`). **Consequência para a versão comercial:** o caminho garantido é a **chave de API do cliente** (decisão D26).
- A elegibilidade **individual** só se confirma no primeiro uso: o erro `subscription_sharing_user_not_eligible` (HTTP 403) significa que o plano está indisponível "para o usuário, workspace ou política selecionados".
- O uso é "prévia": limitações em `siwc/token-sharing-open-source_preview-limitations.md` (obrigatório `store: false` e `stream: true`; **sem entrada de áudio/vídeo, sem API de transcrição, sem upload de arquivos, sem MCP hospedado**). Isso confirma que a **transcrição de áudio tem de ser local**.

**Limites e controles (`siwc/..._profiles-and-sessions.md`):**
- No **Plus**, o limite de **5 horas** é **compartilhado entre todos os apps** que usam o plano (inclusive apps de código aberto e o Codex). **Não vale para o Pro.**
- Em **ChatGPT → Configurações → Uso** (`https://chatgpt.com/settings/usage`) o usuário vê o uso por app e pode **definir o limite semanal de cada app entre 10% e 100%** e decidir se pode usar créditos ao atingir o limite. **Útil:** reservar uma fatia para o Heimdall e deixar o resto para o Codex que instala e para o Hermes.
- Erro `subscription_sharing_usage_limit_exceeded` (429): **pausar** os pedidos que usam o plano (não é falha); o limite pode ser do app e não do plano inteiro. O Hindsight já adia e tenta de novo após 30 minutos.
- Tokens: o `refresh_token` vale **30 dias** e cada renovação traz um novo com 30 dias; o Hindsight renova sozinho (token de acesso dura 1 hora). Parado por mais de 30 dias, exige novo login (`refresh_token_expired`).
- Credenciais comprometidas: desconectar o app em Configurações do ChatGPT. A OpenAI **não avisa** o app quando o usuário o desconecta. Para sessões copiadas para outro computador, "atribuição de uso por host e revogação ainda não estão disponíveis".

**Passos:**
1. **Na máquina com navegador:** `hindsight-admin chatgpt login` (abre o navegador; retorno em `http://127.0.0.1:1455/auth/callback`; `--port` muda a porta; `--no-browser` mostra o endereço). Aprovar também o **uso do plano**. Grava `~/.hindsight/chatgpt/credentials.json` (modo 0600). Se recusou o uso do plano: `login --enable-plan-usage`.
2. **Servidor em contêiner (sem navegador):** o retorno `127.0.0.1` cai na máquina do navegador (a OpenAI diz o mesmo em `siwc/..._self-hosted-vms.md`). Copiar o arquivo e instalá-lo **como o usuário que roda o Hindsight**: `hindsight-admin chatgpt login --from-file /tmp/chatgpt.json` (com `--home <dir>` se `HINDSIGHT_API_LLM_CHATGPT_HOME` estiver definido); apagar o temporário. Depois, na máquina original, `hindsight-admin chatgpt logout --local-only` (limpa só o local; `logout` simples **revoga** e derruba o servidor). Os tokens rotacionam: só um lado deve usar a sessão. O arquivo preserva o identificador do servidor (`host_id`) e não o do computador de origem.
3. `HINDSIGHT_API_LLM_PROVIDER=chatgpt` (modelo padrão `gpt-6-luna`, `HINDSIGHT_API_LLM_MODEL` altera); `hindsight-admin chatgpt status` confere (não mostra tokens).
4. O diretório de credenciais (`HINDSIGHT_API_LLM_CHATGPT_HOME`) precisa ser **volume gravável** (cada renovação grava o token novo). **Um diretório por conta do ChatGPT.**
Rota "prévia": o Hindsight envia `store: false` e `stream: true` e omite campos rejeitados.

## C. WhatsApp
QR no passo 1 do onboarding (`05-listener-baileys.md`). O usuário abre WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho, e escaneia. O QR dá acesso à conta: mostrar só durante o passo e **nunca** registrar em log.

## D. Krayin
Entrar com `admin@example.com` / `admin123` e **trocar a senha na hora** (R6); criar o usuário de API (login `POST .../login`).

## Para a versão comercial
Com **chave de API do cliente**: configurar provedor por chave no Hermes (`hermes model`) e no Hindsight (variáveis de provedor); sem janela de 5 horas. O passo 4 do onboarding oferece as duas formas.

## Verificação
`hindsight-admin chatgpt status`; chamada de teste ao Hermes; `docker exec hermes hermes doctor`; `connection: open` no listener; login no Krayin com a nova senha.

## Não verificado
Se **esta conta** Plus é elegível (só o primeiro login responde: erro 403 `subscription_sharing_user_not_eligible` se não for); se o Hindsight, que não está na lista de parceiros, é aceito pelo fluxo de código aberto na prática; funcionamento do menu `hermes model` dentro do contêiner.
