# Observações do dono na tela, depois do primeiro QR (2026-10-23)

Origem: o dono conectou o WhatsApp na VPS (túnel SSH, computador Omarchy/Linux) e mandou capturas de texto da tela. **[V]** = verificado nesta sessão (comando executado ou código lido); **[NV]** = não verificado. Nenhum conteúdo de conversa aqui, só contagens.

## 1. O que o primeiro QR fez [V]
- Mensagens no acervo: 6.526 → **6.704** (+178). Conversas 662 → 667; contatos 677 → 682. **0 duplicadas** por (`conversa_id`, `wa_msg_id`). Clientes: ainda **0**.
- A tela mostrou "6416 mensagens guardadas" e "6485 repetidas ignoradas". **Não é erro de contagem:** "guardadas" (`painel.ts`, `WHERE tipo != 'ignorada'`) exclui as **288** mensagens do tipo `ignorada` (6.704 − 288 = 6.416 conferido no banco); "repetidas ignoradas" é o contador de `escuta.ts` desde que o listener subiu: o WhatsApp **reenviou praticamente o acervo inteiro** e o `INSERT OR IGNORE` o descartou, como o teste `tests/carga/reentrega-apos-troca-de-aparelho.test.ts` prevê. O texto "guardadas" confunde quem compara com o "178 mensagens recebidas" do cartão do WhatsApp: **melhoria de rótulo (não feita)**: "mensagens de conversa guardadas (sem reações e avisos do sistema)" e um contador "novas nesta conexão".
- Busca antiga: `historico.antigo` = `liberado: false` (a pausa antes do QR funcionou); a tela mostra "31 pedidos já feitos" (29 do Windows + 2) e "665 pendentes, 1 em andamento" (666 conversas na tela contra 667 no acervo; **[NV]** a causa — provavelmente o self-chat fora da conta).
- Mídia: 149 downloads ok (eram 134), 137 transcrições ok, 11 pendentes. A tela mostra "292 de 820 etapas concluídas; 6 na fila" (conta diferente da fila crua: mistura download, transcrição e `retain`; **[NV]** a fórmula exata).

## 2. Disco "vermelho" (Ambiente) [V]
- A tela tem limite fixo de **30 GB livres**; a VPS está em ~29,5 GB livres → "falha", "Vermelho · precisa de atenção". Não é erro do Heimdall: os dados dele (`data/`) ocupam **36 MB**; os volumes do Compose, 0,93 GB; as imagens, 16,9 GB.
- O cache de construção do Docker passou de **7,8 GB (63 entradas) para 9,5 GB (70 entradas)** em ~1 dia, sem que eu tenha construído imagem nenhuma nesta sessão: **hipótese:** outro projeto do servidor está construindo imagens **[NV: não identifiquei quem; só `docker buildx du` mostra a soma]**. O Docker só documenta `--filter until=` (`docs/docker/reference/cli/docker/builder/prune.md`): **não há filtro que atinja só o nosso cache**. Não foi apagado nada (regra 4, servidor compartilhado).
- **Decisão do dono:** (a) deixar o aviso (o disco é de todos os projetos); (b) reduzir o limite de 30 GB do Heimdall para ~20 GB só nesta VPS (o limite de 30 GB nasceu do perfil de notebook de 8 GB: `perfil.ts`); (c) limpar o cache de construção com `docker builder prune --filter until=<horas>` **sabendo que atinge os outros projetos** (só reconstrói mais devagar na próxima vez; nada é perdido além de cache).
- Texto corrigido: a mensagem dizia "só a imagem do Hindsight pesa cerca de 9 GB" (vale para a imagem completa; aqui é a slim+onnx de ~2 GB). Agora: "as imagens do projeto ocupam cerca de 17 GB". Teste: `ambiente.test.ts` ("aviso de disco usa o tamanho medido das imagens").

## 3. "Aqui era pra eu conseguir configurar o modelo por aqui" (passo Conectar o modelo)
Pedido do dono: fazer o login do ChatGPT **pela tela**, sem terminal. Hoje a tela só orienta (`servidor.ts`, `/api/modelo`) e a regra de projeto é que a tela **nunca vê token**. O que a documentação do Hermes permite (lido por inteiro: `docs/hermes-agent/guides/oauth-over-ssh.md`; `reference/cli-commands.md`, seção `hermes auth`):
- `hermes auth add openai-codex` usa por padrão o **fluxo de código de dispositivo** (a documentação só diz "device code" para o Codex; a tabela de `oauth-over-ssh.md` diz que **não precisa de túnel**): o programa imprime um endereço e um código; o dono abre o endereço no navegador dele e digita o código; o Hermes espera a aprovação e grava o `auth.json` **dentro do volume dele**. O token nunca passa pela tela.
- **Proposta (não feita; precisa da decisão do dono, porque a tela passaria a rodar um comando no contêiner do Hermes):** botão "Conectar o ChatGPT" → o processo da tela roda `docker exec heimdall-hermes-1 hermes auth add openai-codex` (sem `-it`), lê **só** a URL e o código impressos, mostra-os na tela, e fica verificando `hermes auth status openai-codex` até concluir; depois faz a "chamada de teste". Mantém as regras 1 e 2 (nada enviado a terceiros; nenhum token na tela). **[NV]:** se o comando funciona sem terminal interativo (TTY), em que formato imprime o código, se precisa de entrada do teclado (por exemplo "importar login do Codex? s/n"; a documentação diz que `hermes auth add openai-codex` "pergunta antes de importar um login existente do Codex CLI") e quanto tempo espera. Isso só se prova rodando o comando, e rodar é uma tentativa de login em conta: pedir o OK do dono (regra 4) e fazer com a conta nova que ele vai criar.
- **Útil já para o passo "medir a cota":** `hermes usage --provider openai-codex --json` mostra as janelas de 5 horas e semanal do Codex e o plano **sem iniciar uma sessão** (`cli-commands.md`, seção `hermes usage`). Dá para a tela/ponte mostrar o consumo real **[NV: formato real da saída; só depois do login]**.
- Texto da tela corrigido: agora lembra que, num servidor (VPS), o comando é `ssh -t <apelido-do-servidor> "docker exec -it heimdall-hermes-1 hermes model"`. Teste: `servidor.test.ts` (`/api/modelo`).

## 4. Equipe cadastrada (11 pessoas) [NV: só a captura do dono]
A lista aparece completa e mascarada (`+55 55 *****-2838`). Observações para o dono conferir: "Victoria" aparece **duas vezes** com dois telefones (+55 55 e +55 71) — pode ser correto (duas linhas) ou um duplicado; o cadastro aceita o mesmo nome em números diferentes. Nenhuma ação tomada.

## 5. Lacunas que continuam abertas (ordem de trabalho)
1. Nenhum código cria `clientes` a partir dos contatos (classificar cliente × fornecedor × interno × pessoal): ver `2026-10-22-diagnostico-pos-importacao.md`, seção 4, lacuna 1. **Próximo trabalho de código**, com teste primeiro e revisão do dono de uma amostra.
2. `SOUL.md` e as 6 skills do Heimdall não estão instalados no Hermes.
3. Falta o MCP próprio do Heimdall.
4. Dossiês e aprendizado pelo resultado das recomendações.

## 6. Lacuna (a), passo 1: ver antes de criar [V]
Feito (só leitura, nada é escrito): `apps/core/src/candidatos-cliente.ts` (`resumirContatosDm`, `contarPorSituacao`) com 3 testes (`candidatos-cliente.test.ts`, dados sintéticos; vistos falhar antes). Para cada conversa direta diz o que **realmente aconteceu**, sem inventar papel; mensagens `ignorada` (reações, avisos) não contam.

**No acervo real (contagens, 2026-10-23):** 663 conversas diretas =
| Situação | Conversas | O que significa |
|---|---|---|
| `ida_e_volta` | 261 (254 desconhecidos + 7 internos; 82 com mensagem nos últimos 30 dias) | os dois lados falaram |
| `so_eles` | 76 | só o contato escreveu; o dono nunca respondeu (possíveis pedidos sem resposta, ou spam/avisos) |
| `so_eu` | 315 (314 desconhecidos + 1 interno) | só o dono escreveu (abordagem fria, ninguém respondeu) |
| `vazia` | 11 | conversa sem mensagem de texto/áudio/PDF |

**Proposta de regra v1 (NÃO aplicada; precisa do OK do dono):**
1. Só vira **candidato a cliente** quem está em `ida_e_volta`, tem `papel = desconhecido` e não é interno. Cadastro explícito do dono sempre vence (D13). Quem é `so_eu` **não** é cliente (a regra de acompanhamento já ignora quem nunca respondeu, `fase-1-modelo-de-dados.md`).
2. Ao aplicar: criar um `clientes` por contato (nome = nome do contato; "cliente = empresa" fica para quando houver como agrupar), `contatos.cliente_id` preenchido, `papel = cliente`, `papel_fonte = inferido`. Reversível: `papel_fonte = inferido` permite desfazer em lote.
3. **Amostra antes:** o dono confere uma lista curta (por exemplo 15 nomes, mostrada só na tela/self-chat) e diz quem **não** é cliente (fornecedor, amigo, família). Os códigos de correção `A1/F2/P1` do self-chat (`aprendizado.ts`) já existem para isso; **[NV]** se cobrem "isto não é cliente" sem ajuste.
4. Fornecedor × pessoal: só o modelo consegue distinguir com qualidade; fica para depois do login do ChatGPT e sempre como **proposta** (nunca muda sozinho).
5. Começar pelos **82 com atividade nos últimos 30 dias**, como no diagnóstico (seção 5): erro de classificação custa menos e o relatório já fica útil.

**Perguntas ao dono:** (i) a regra v1 está certa? (ii) as 76 conversas `so_eles` (só o contato escreveu e o dono não respondeu) devem aparecer como "aguardando você" mesmo sem serem clientes confirmados? (iii) quem é Victoria duplicada na equipe (seção 4)?

## 7. "522 arquivos com falha" e "149 de 671" (relato do dono depois de conectar o ChatGPT) [V]
- **Números reais da fila (banco):** `baixar_midia`: 149 ok + 522 abandonadas = 671; `transcrever`: 149 ok, 0 pendente. Ou seja, **tudo que o WhatsApp entregou já foi baixado e transcrito**. Os "820 etapas" eram 671 + 149; as "298 concluídas" eram 149 + 149; as 522 nunca fecham.
- **Causa da tela vermelha:** `fonteMidia` somava os 522 como "falha" e como parte do total. **Corrigido** (ver `LICOES.md`, 2026-10-23): agora são contados à parte ("522 sem arquivo (o WhatsApp não entregou)") e a Mídia fica verde; a Extração diz "149 baixados; 522 sem arquivo". Falha de verdade (erro de download, transcrição ou PDF abandonados) continua vermelha.
- **Atenção, não é tudo "expirado":** das 522, **395** deram `Failed to fetch stream` (arquivo não existe mais no servidor do WhatsApp: compatível com mídia antiga) e **127** deram `Unsupported state or unable to authenticate data` (a **descriptografia** falhou: chave de mídia ausente/inválida ou arquivo diferente do esperado). Os 127 **não são provadamente "expirados"**; causa **[NV]**. Investigar: se são de uma época específica (histórico antigo sem `mediaKey`?) e se o pedido de reenvio pelo celular (`reuploadRequest`) os recupera. Antes de investigar, ver `docs/baileys` (mídia/`downloadMediaMessage`) inteira (regra do protocolo de leitura).
