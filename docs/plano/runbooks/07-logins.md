# 7. Logins e contas (ChatGPT, WhatsApp, Krayin)

Fontes: `docs/hindsight/developer/models.md` ("ChatGPT Setup"), `docs/hermes-agent/integrations/providers.md` (OpenAI Codex), `docs/baileys/authentication/qr-code.md`, `docs/krayin/devdocs/2.2/introduction/installation.md`.

## Regra geral
Fazer **um login por vez**, na ordem abaixo. Todos usam o mesmo plano do ChatGPT e **compartilham a janela de uso de 5 horas** (R4).

## A. Hermes e ChatGPT
`docker exec -it hermes hermes model` → **ChatGPT or Codex Subscription**: login por código de dispositivo (abrir o endereço mostrado, digitar o código). Credenciais em `/opt/data/auth.json`; a renovação é automática. Se a renovação falhar de modo terminal, o Hermes pede novo login (`hermes auth add openai-codex`). Organizações que bloqueiam o código de dispositivo podem usar `hermes auth add openai-codex --browser`, que escuta em `http://localhost:1455/auth/callback` (**porta fixa**). Falha de TLS (`UNEXPECTED_EOF_WHILE_READING`) pode vir de intermediário de rede que rejeita grupos pós-quânticos.

## B. Hindsight e ChatGPT (provedor `chatgpt`)
Rota **suportada** ("Sign in with ChatGPT" para apps de código aberto); credenciais **próprias**, sem compartilhar nem rotacionar as do Codex CLI. Exige "um plano do ChatGPT que permita uso em apps de terceiros" (**[validar]** se o Plus permite).
1. **Na máquina com navegador:** `hindsight-admin chatgpt login` (abre o navegador; retorno em `http://127.0.0.1:1455/auth/callback`; `--port` muda a porta; `--no-browser` mostra o endereço). Aprovar também o **uso do plano**. Grava `~/.hindsight/chatgpt/credentials.json` (modo 0600).
2. **Servidor em contêiner (sem navegador):** o retorno `127.0.0.1` cai na máquina do navegador. Copiar o arquivo e instalá-lo **como o usuário que roda o Hindsight**: `hindsight-admin chatgpt login --from-file /tmp/chatgpt.json` (com `--home <dir>` se `HINDSIGHT_API_LLM_CHATGPT_HOME` estiver definido); apagar o arquivo temporário. Depois, **na máquina original**, `hindsight-admin chatgpt logout --local-only` (limpa só o local; `logout` simples **revoga** e derruba o servidor). Os tokens rotacionam: só um lado deve usar a sessão.
3. `HINDSIGHT_API_LLM_PROVIDER=chatgpt` (modelo padrão `gpt-6-luna`, `HINDSIGHT_API_LLM_MODEL` altera); `hindsight-admin chatgpt status` confere (não mostra tokens).
4. O diretório de credenciais (`HINDSIGHT_API_LLM_CHATGPT_HOME`) precisa ser **volume gravável** (cada renovação grava o token novo). **Um diretório por conta do ChatGPT.**
Ao atingir o limite do plano, o Hindsight **adia** a extração e tenta de novo após 30 minutos. A rota é "prévia" (envia `store: false` e `stream: true`).

## C. WhatsApp
QR no passo 1 do onboarding (`05-listener-baileys.md`). O usuário abre WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho, e escaneia. O QR dá acesso à conta: mostrar só durante o passo e **nunca** registrar em log.

## D. Krayin
Entrar com `admin@example.com` / `admin123` e **trocar a senha na hora** (R6); criar o usuário de API (login `POST .../login`).

## Para a versão comercial
Com **chave de API do cliente**: configurar provedor por chave no Hermes (`hermes model`) e no Hindsight (variáveis de provedor); sem janela de 5 horas. O passo 4 do onboarding oferece as duas formas.

## Verificação
`hindsight-admin chatgpt status`; chamada de teste ao Hermes; `docker exec hermes hermes doctor`; `connection: open` no listener; login no Krayin com a nova senha.

## Não verificado
Elegibilidade do plano Plus para o provedor `chatgpt`; uso de `-it` no `docker exec`; instalação do `hindsight-admin` na máquina do usuário (a documentação não mostra o comando de instalação na seção lida).
