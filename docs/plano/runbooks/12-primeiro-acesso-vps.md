# 12. Primeiro acesso do dono na VPS (túnel, tela, logins e CRM)

Para o **dono** fazer, na ordem. O IP da VPS e a porta do SSH **não entram no repositório** (`fase-2-migracao-para-vps.md`): aqui aparecem como `<IP-DA-VPS>` e `<PORTA-SSH>`; os valores reais ficam com o dono. O computador do dono é Omarchy/Linux. Nada disto abre porta pública: tudo passa pelo túnel SSH.

**Nunca cole em conversa (nem com a IA), issue ou log:** o link da tela (tem um código de uso único), a senha do Krayin, tokens e o código do login do ChatGPT.

## 0. Antes de tudo: uma sessão do WhatsApp só (D2)
1. No computador antigo (Windows/Omarchy): o Heimdall de lá tem de estar **parado**.
2. No celular: WhatsApp → Configurações → **Aparelhos conectados**. Se houver um aparelho antigo do Heimdall, **desconecte**. Só então leia o QR da VPS (passo 3).

## 1. Preparar o computador do dono (uma vez só) — Omarchy/Linux, terminal (bash)
O computador do dono é **Omarchy (Linux)**: todos os comandos são de terminal, **não PowerShell**. Troque `<IP-DA-VPS>` e `<PORTA-SSH>` pelos valores reais (ficam só no `~/.ssh/config` dele, nunca no repositório).
```
mkdir -p ~/.ssh ~/.local/bin && chmod 700 ~/.ssh
cat >> ~/.ssh/config <<'EOF2'

Host heimdall
    HostName <IP-DA-VPS>
    Port <PORTA-SSH>
    User pedro
    LocalForward 8765 127.0.0.1:8765
    LocalForward 8082 127.0.0.1:8082
EOF2
chmod 600 ~/.ssh/config
cat > ~/.local/bin/heimdall <<'EOF2'
#!/bin/sh
# abre o túnel em segundo plano (pede a senha uma vez) e mostra o link da tela
ssh -fN heimdall || exit 1
ssh -o ClearAllForwardings=yes heimdall "cd ~/heimdall && sh scripts/heimdall.sh link"
EOF2
cat > ~/.local/bin/heimdall-parar <<'EOF2'
#!/bin/sh
pkill -f "ssh -fN heimdall" && echo "túnel fechado"
EOF2
chmod +x ~/.local/bin/heimdall ~/.local/bin/heimdall-parar
```
- **Sem senha (opcional, recomendado):** `ssh-keygen -t ed25519 -f ~/.ssh/heimdall` (Enter nas perguntas), `ssh-copy-id -i ~/.ssh/heimdall.pub heimdall` e `echo "    IdentityFile ~/.ssh/heimdall" >> ~/.ssh/config`. Só acrescenta uma chave ao usuário dele; não mexe no SSH do servidor.
- Use **as mesmas portas dos dois lados** (8765 e 8082). A tela recusa outro endereço (confere o cabeçalho `Host`: só `127.0.0.1:8765` ou `localhost:8765`) e o Krayin monta os links com `APP_URL=http://127.0.0.1:8082`. Se o PC disser que a porta está ocupada, feche o programa que a usa; não troque o número.
- Se `heimdall` não for achado, `~/.local/bin` não está no PATH: use `~/.local/bin/heimdall`.

## 2. Todo dia: túnel e link da tela
Digite `heimdall` no terminal. Ele pede a senha (se não houver chave), deixa o túnel aberto em segundo plano e mostra o endereço `http://127.0.0.1:8765/?codigo=...`. Copie **só para o navegador**. O código vale **uma entrada**; depois o navegador fica com a sessão. Para fechar o túnel: `heimdall-parar`. Para um código novo: `ssh heimdall "cd ~/heimdall && sh scripts/heimdall.sh novo-link"` (reinicia só a tela).

## 3. Na tela, nesta ordem
1. **Ambiente:** "Testar".
2. **ANTES do QR, pause a busca antiga:** no passo **Sincronizar com o telefone**, clique em **"Pausar busca antiga"**. Ela vem **ligada** do Windows e, assim que o WhatsApp conectar, começaria sozinha a pedir mensagens antigas (um pedido a cada ~105 s; no Windows as 29 respostas vieram vazias e o risco de o WhatsApp limitar a conta não foi medido). Libere depois, só se quiser testar.
   **Conectar o WhatsApp:** no celular, Aparelhos conectados → Conectar um aparelho → ler o QR. Espere "conectado".
   **O que esperar no primeiro QR:** o WhatsApp pode mandar o histórico de uma vez (milhares de mensagens, alguns minutos; o celular mostra "sincronizando"). O Heimdall **nunca guarda a mesma mensagem duas vezes**, então o que já veio do Windows (6.526 mensagens, as 134 transcrições) não duplica nem volta atrás (teste `tests/carga/reentrega-apos-troca-de-aparelho.test.ts`). Se o WhatsApp mandar só o novo ou tudo de novo, o resultado é o mesmo.
3. **Cadastro:** a equipe interna (nome, função, telefone).
4. **Sincronizar / Extrair:** acompanhe as barras (histórico do WhatsApp; download de áudio e PDF). Áudios são lentos nesta VPS (~5× a duração do áudio).
5. **Conectar o modelo (login do ChatGPT, só no terminal):**
   ```
   ssh -t heimdall "docker exec -it heimdall-hermes-1 hermes model"
   ```
   Escolha **ChatGPT or Codex Subscription**, abra o endereço mostrado no navegador do PC e digite o código. Volte à tela e clique em **"Fazer chamada de teste"**.
6. **Processar:** clique em **Começar** quando quiser (gasta a cota do ChatGPT Plus, janela de 5 horas compartilhada). A tela mostra, ao vivo: a barra de progresso da rodada (dias concluídos de quantos), quantos clientes há (com 0 clientes não há o que processar), os **tokens** gastos hoje, na semana e no total, o gasto por tarefa, a média por consulta e uma estimativa do que falta (só depois de 3 consultas medidas). **Clientes:** o Heimdall só lê conversas de clientes. Como você não salva os clientes no telefone, o botão **"Cadastrar como clientes os N contatos que responderam"** cria um cliente para cada contato que respondeu às suas mensagens (equipe, fornecedores e quem só recebeu mensagem sua ficam de fora; dá para desfazer em lote). O nome nasce provisório e é melhorado pelo modelo lendo as conversas, **do dia mais novo para o mais antigo**: ele procura o nome da pessoa e a empresa escritos na conversa (só com confiança ≥ 0,7; nome que você mesmo cadastrou nunca é trocado). Há um **teto diário de tokens** da extração (padrão 300.000; ao chegar nele o Heimdall pausa sozinho e volta no dia seguinte) e a escolha de **modelo e esforço de raciocínio por tarefa** (padrão: GPT-6 Luna, esforço baixo, para conversa e extração; relatórios no padrão do Hermes).
7. **Self-chat:** peça a mensagem de teste e responda no seu self-chat. **Agenda:** gere o relatório de teste. **Backup:** escolha a pasta.
8. **CRM (Krayin):** abra `http://127.0.0.1:8082` e entre com `dono@heimdall.local` e a senha que está no servidor:
   ```
   ssh heimdall "grep KRAYIN_ADMIN_PASSWORD ~/heimdall/infra/compose/.env"
   ```
   Em **Settings → Pipeline → Create Pipeline**: dê um nome, marque **Mark as default** e, entre as etapas fixas (**Novo** no começo; **Ganho** e **Perdido** no fim, que o Krayin não deixa renomear), **adicione três**: `Contato iniciado`, `1ª Reunião Agendada`, `2ª Reunião Agendada` (pode digitar sem acento e "1a"). Salve. Na tela do Heimdall, passo CRM: **"Testar de novo"** → deve ficar verde (o token já está configurado no servidor).
9. **Pronto:** o painel mostra o estado de tudo.

## 4. O que a tela ainda NÃO faz (manual ou decisão)
- **Login do modelo:** só pelo terminal (item 5).
- **Falar com o Heimdall no self-chat:** só o que começa com `/heimdall` vai ao modelo (ex.: `/heimdall quem está esperando minha resposta?`). O resto que você escreve ali (números, lembretes) fica guardado e **não** recebe resposta. **Comandos que respondo na hora, sem gastar o modelo (zero token):** `/heimdall ajuda`, `/heimdall hoje`, `/heimdall aguardando`, `/heimdall followups`, `/heimdall cliente <nome>` (só valem se a frase for exatamente o comando; com mais palavras vira pergunta livre). Os comandos curtos funcionam sem prefixo: `ok 1 e 3`, `C1 ok, C2 não`, `A1`, `F2`, `P1` e a frase de confirmar apagar. Sem login do ChatGPT no Hermes, nada é enviado a você (a ponte espera).
- **Conferir o login do modelo:** `ssh heimdall "docker exec heimdall-hermes-1 hermes auth status openai-codex"` (não mostra token); deve dizer que está logado.
- **Memória com LLM (Hindsight):** a versão instalada (1.0.0) não tem o login do ChatGPT; fica sem LLM (guarda e busca, sem "observações") até o dono decidir atualizar para a 1.1.0.
- **Cliente ↔ lead no CRM:** nasce pelas propostas do relatório das 08:00 (`C1`, `C2`...), aprovadas no self-chat com "ok 1 e 3", "não, o 2 fica" ou "C1 ok, C2 não". Não há comando livre ("mova a empresa X"). **Ganho** não é proposto sozinho; mover um cartão à mão no Krayin não atualiza o Heimdall.

## 5. Comandos úteis (no servidor)
`sh ~/heimdall/scripts/heimdall.sh estado` · `systemctl --user status heimdall.service` · parar tudo: `systemctl --user stop heimdall.service` (os contêineres continuam) · religar: `systemctl --user start heimdall.service`.
