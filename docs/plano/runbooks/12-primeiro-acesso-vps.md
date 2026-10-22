# 12. Primeiro acesso do dono na VPS (túnel, tela, logins e CRM)

Para o **dono** fazer, na ordem. O IP da VPS e a porta do SSH **não entram no repositório** (`fase-2-migracao-para-vps.md`): aqui aparecem como `<IP-DA-VPS>` e `<PORTA-SSH>`; os valores reais ficam com o dono. Nada disto abre porta pública: tudo passa pelo túnel SSH.

**Nunca cole em conversa (nem com a IA), issue ou log:** o link da tela (tem um código de uso único), a senha do Krayin, tokens e o código do login do ChatGPT.

## 0. Antes de tudo: uma sessão do WhatsApp só (D2)
1. No computador antigo (Windows/Omarchy): o Heimdall de lá tem de estar **parado**.
2. No celular: WhatsApp → Configurações → **Aparelhos conectados**. Se houver um aparelho antigo do Heimdall, **desconecte**. Só então leia o QR da VPS (passo 3).

## 1. Abrir o túnel (PowerShell no PC do dono; deixe a janela aberta)
```
ssh -N -L 8765:127.0.0.1:8765 -L 8082:127.0.0.1:8082 -i "$env:USERPROFILE\.ssh\<SUA-CHAVE>" -p <PORTA-SSH> pedro@<IP-DA-VPS>
```
- Use **as mesmas portas dos dois lados** (8765 e 8082). A tela recusa outro endereço (confere o cabeçalho `Host`: só `127.0.0.1:8765` ou `localhost:8765`) e o Krayin monta os links com `APP_URL=http://127.0.0.1:8082`. Se o PC disser que a porta está ocupada, feche o programa que a usa; não troque o número.
- A janela fica "parada" sem mostrar nada: é normal (`-N` = só túnel). Para fechar o túnel: `Ctrl+C`.

## 2. Pegar o link da tela (outra janela do PowerShell)
```
ssh -i "$env:USERPROFILE\.ssh\<SUA-CHAVE>" -p <PORTA-SSH> pedro@<IP-DA-VPS> "cd ~/heimdall && sh scripts/heimdall.sh link"
```
Copie o endereço `http://127.0.0.1:8765/?codigo=...` e cole **no navegador**. O código vale **uma entrada**; depois o navegador fica com a sessão. Se precisar de um código novo: `ssh ... "systemctl --user restart heimdall.service"` (reinicia os 5 processos; espere ~20 s) e rode o `link` de novo.

## 3. Na tela, nesta ordem
1. **Ambiente:** "Testar".
2. **Conectar o WhatsApp:** no celular, Aparelhos conectados → Conectar um aparelho → ler o QR. Espere "conectado".
3. **Cadastro:** a equipe interna (nome, função, telefone).
4. **Sincronizar / Extrair:** acompanhe as barras (histórico do WhatsApp; download de áudio e PDF). Áudios são lentos nesta VPS (~5× a duração do áudio).
5. **Conectar o modelo (login do ChatGPT, só no terminal):**
   ```
   ssh -t -i "$env:USERPROFILE\.ssh\<SUA-CHAVE>" -p <PORTA-SSH> pedro@<IP-DA-VPS> "docker exec -it heimdall-hermes-1 hermes model"
   ```
   Escolha **ChatGPT or Codex Subscription**, abra o endereço mostrado no navegador do PC e digite o código. Volte à tela e clique em **"Fazer chamada de teste"**.
6. **Processar:** libere quando quiser (gasta a cota do ChatGPT Plus, janela de 5 horas compartilhada).
7. **Self-chat:** peça a mensagem de teste e responda no seu self-chat. **Agenda:** gere o relatório de teste. **Backup:** escolha a pasta.
8. **CRM (Krayin):** abra `http://127.0.0.1:8082` e entre com `dono@heimdall.local` e a senha que está no servidor:
   ```
   ssh -i "$env:USERPROFILE\.ssh\<SUA-CHAVE>" -p <PORTA-SSH> pedro@<IP-DA-VPS> "grep KRAYIN_ADMIN_PASSWORD ~/heimdall/infra/compose/.env"
   ```
   Em **Settings → Pipeline → Create Pipeline**: dê um nome, marque **Mark as default** e, entre as etapas fixas (**Novo** no começo; **Ganho** e **Perdido** no fim, que o Krayin não deixa renomear), **adicione três**: `Contato iniciado`, `1ª Reunião Agendada`, `2ª Reunião Agendada` (pode digitar sem acento e "1a"). Salve. Na tela do Heimdall, passo CRM: **"Testar de novo"** → deve ficar verde (o token já está configurado no servidor).
9. **Pronto:** o painel mostra o estado de tudo.

## 4. O que a tela ainda NÃO faz (manual ou decisão)
- **Login do modelo:** só pelo terminal (item 5).
- **Memória com LLM (Hindsight):** a versão instalada (1.0.0) não tem o login do ChatGPT; fica sem LLM (guarda e busca, sem "observações") até o dono decidir atualizar para a 1.1.0.
- **Cliente ↔ lead no CRM:** nasce pelas propostas do relatório das 08:00 (`C1`, `C2`...), aprovadas no self-chat com "ok 1 e 3", "não, o 2 fica" ou "C1 ok, C2 não". Não há comando livre ("mova a empresa X"). **Ganho** não é proposto sozinho; mover um cartão à mão no Krayin não atualiza o Heimdall.

## 5. Comandos úteis (no servidor)
`sh ~/heimdall/scripts/heimdall.sh estado` · `systemctl --user status heimdall.service` · parar tudo: `systemctl --user stop heimdall.service` (os contêineres continuam) · religar: `systemctl --user start heimdall.service`.
