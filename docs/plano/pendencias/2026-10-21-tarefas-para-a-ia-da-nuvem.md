# Pedido do dono para a IA da nuvem (2026-10-21): histórico antigo, tela de onboarding e "Conectar o modelo"

**Quem pede:** o dono, depois da primeira carga real no Windows dele. **Quem executa:** a IA da nuvem, a partir do que está no GitHub. **Regras:** `AGENTS.md` inteiro (principalmente: teste que falha antes, nada de enfraquecer teste, dados sintéticos, nunca imprimir segredo/conversa, regra 1: só o self-chat do dono). Leia também `docs/plano/PROGRESS.md` (fim do arquivo) e as pendências desta pasta.

## O que o dono NÃO vai fazer agora
Não vai validar a carga atual ("acho que está bom"). Vai deixar o computador e o celular conectados e **voltar à IA local** quando a nuvem terminar, para verificar duas coisas: (1) se o Heimdall **puxa o resto do histórico**; (2) se **não extrai de novo** o que já foi extraído.

## Estado real medido no Windows do dono (2026-10-21, ~14:50; só números)
- Acervo: **6.499 mensagens** (282 são do tipo "ignorada"; a tela mostra 6.217 = 5.562 texto + 633 áudios + 22 PDFs), **659 conversas** (655 individuais, 3 grupos, 1 self-chat), **673 contatos** (133 sem nome). Nenhuma duplicada. Esquema do banco v11.
- Histórico vai de **25/03/2026 a 21/10/2026**, mas quase tudo é de **agosto a outubro** (ago 2.065; set 2.262; out 1.491; março a julho somam cerca de 400). **Hipótese não provada:** o WhatsApp entregou ~3 meses completos e só rastros do resto. `whatsapp.historico` = `{"progresso":100,"ultima":false}` e nada antigo novo chega há mais de uma hora.
- Mídia: 655 (633 áudios, 22 PDFs). **133 baixadas** (todas com até ~30 dias: até 14 dias 94/94; 14 a 30 dias 39/171; **mais de 30 dias 0/390**). As 522 restantes falharam (arquivo expirado no servidor e "unable to authenticate data"), já na 4ª tentativa; a 5ª está marcada para ~16:24 e depois a fila abandona. O pedido de reenvio ao celular (`reuploadRequest`) não recuperou nenhuma. **Cerca de 470 áudios de agosto e setembro estão sem transcrição.**
- A **ponte está parada de propósito** (ver tarefa D). Hindsight com LLM `none`. O Hermes está logado com uma conta OpenAI **provisória**; o dono vai trocar por outra, com mais limite (ver tarefa C).
- O listener que está rodando **ainda é o código antigo** (anterior a `console-seguro.ts`): o `data/logs/listener.log` tem um despejo da sessão de criptografia (só contei, ver `LICOES.md` 2026-10-21). Quem reiniciar o listener limpa esse log **só com OK do dono**.
- Windows do dono: nunca abrir o Docker por dentro do app Claude (`instalar\docker-fora.cmd`); testes de shell usam `tests/lib/so.sh` (`runbooks/10`).

## Tarefa A: puxar o histórico antigo (`fetchMessageHistory`)
Origem: `docs/baileys/advanced/history-sync.md` (leia **inteira**). Verificado no Baileys instalado (`7.0.0-rc14`, `lib/Socket/messages-recv.js`, linhas 40 a 55): `fetchMessageHistory(count, oldestMsgKey, oldestMsgTimestamp)` com `oldestMsgKey = { remoteJid, fromMe, id }` monta um `historySyncOnDemandRequest` e o envia por `sendPeerDataOperationMessage` (pedido `HISTORY_SYNC_ON_DEMAND`). A resposta chega no evento `messaging-history.set` com `syncType = ON_DEMAND` (`lib/Utils/history.js`, linha 54). **Hoje nada no código chama isso.**

Requisitos (o dono quer a funcionalidade; **teste antes**, dados sintéticos):
1. Para cada conversa, pedir mensagens **mais antigas que a mais antiga já guardada** (usar a chave e a data dela), em páginas de `count` pequeno, repetindo até a resposta **não trazer nada novo** (ou até um limite configurável por conversa). Conversas de grupo e individuais; o self-chat fica de fora.
2. **Retomada e idempotência (o dono vai verificar isto):** estado persistente por conversa (nova tabela, migração **v12**: cursor/mais antiga pedida, tentativas, concluída ou esgotada, última resposta). Queda no meio: continua de onde parou, **sem repetir pedido já concluído**. Resposta repetida ou sobreposta: a ingestão já ignora mensagem duplicada (`INSERT OR IGNORE`); **teste que prova** 0 duplicadas.
3. **Não reextrair o que já foi extraído:** a regra existente é "documento de memória e extração só refeitos se o conteúdo do dia mudou" (hash). Mensagens antigas que caem em **dias novos** geram só trabalho novo; mensagens antigas que caem num **dia já processado** mudam o hash daquele dia e esse dia é refeito (isso é correto, mas **conte e mostre** quantos dias serão refeitos antes de gastar modelo). Testes em `tests/carga/` com os cenários: histórico antigo chega depois da extração dos dias recentes; chega duas vezes; queda no meio.
4. **Ritmo e segurança da conta:** poucos pedidos por vez, com espera entre eles, e **parar** se o estado do WhatsApp deixar de ser `conectado`. O risco de o WhatsApp limitar a conta com muitos pedidos **não está verificado**: escolher um ritmo conservador, registrar a escolha e **perguntar ao dono** o valor antes de rodar de verdade.
5. **Regra 1 (inegociável):** este pedido vai ao **aparelho do dono** (mensagem "peer"), **não** a um contato. Documente essa análise em `fase-1-whatsapp-baileys-hermes.md` (ou `runbooks/05`) e **trave com teste de arquitetura** que a única chamada de envio nova permitida é `fetchMessageHistory`, só no arquivo do listener, e que `sendMessage` continua só em `transporte.ts` e só ao self-chat. Se achar que algum caminho abre envio a terceiros, **pare e pergunte**.
6. **Mídia antiga:** as mensagens antigas chegarão com mídia quase toda expirada. Não encher a fila de download à toa: reutilizar a regra atual (5 tentativas, abandono) e **mostrar na tela** o que ficou sem arquivo.
7. Observabilidade na tela (e nos contadores): conversas já pedidas, concluídas, esgotadas, mensagens novas recebidas por esse caminho.
8. **Não verificado e só o celular responde:** quanto o WhatsApp devolve de fato por conversa. Deixar isso escrito como "não verificado".

## Tarefa B: corrigir a tela de onboarding (cadastro, sincronização, extração, menu)
Fonte: `docs/plano/pendencias/2026-10-21-melhorias-tela-onboarding.md` (feedback do dono + causa lida no código). Resumo:
- **Cadastro (passo 3):** ligar o passo (só **equipe interna**). Número "inteligente": aceitar `(55) 99XXXXXXX`, normalizar para `+55`, gerar as duas variantes (com e sem o 9), casar com os contatos já importados (`contato_jids`) **sem consultar os servidores do WhatsApp**, mostrar o que foi entendido, avisar se nenhuma variante bate. Contexto de cada membro montado quando o modelo processar.
- **Sincronizar e Extrair (passos 4 e 5) e menu lateral:** estado **`processando` (amarelo)** com barra e texto ("133 de 655"); o verde deixa de ser gravado de forma "pegajosa" (hoje `atualizarEtapas` só grava verde e nunca desfaz); verde só com tudo puxado e filas zeradas; porcentagem **só onde existe total conhecido** (mídia, e `progresso` do histórico); para conversas e mensagens, contagem crescente sem porcentagem inventada.
- Trocar o texto "Este passo ainda nao esta ligado... (docs/plano/...)" mostrado ao usuário final por texto sem caminho de arquivo.
- Todos com teste antes (`painel.test.ts`, `servidor.test.ts`, quebras propositais em `tests/core/mutacao.py`) e conferência na tela real (`tests/navegadores/`).

## Tarefa C: passo 6 "Conectar o modelo" (hoje "ainda nao esta ligado nesta versao")
- O dono **vai usar outra conta OpenAI, com mais limite**, para processar tudo; o login atual do Hermes é provisório. **A tela nunca recebe nem guarda token ou chave**; quem faz o login é o dono, no terminal (`runbooks/07-logins.md`, seção A: `docker exec -it heimdall-hermes-1 hermes model`).
- A tela deve: (1) mostrar o estado do login **só lendo** (por exemplo o resultado de `hermes doctor` no contêiner, linha de autenticação), sem exibir credencial; (2) guiar a troca de conta passo a passo e avisar que a cota de 5 horas do plano é compartilhada com os outros aplicativos; (3) fazer uma **chamada de teste** ao Hermes (só `127.0.0.1`, com a chave do `.env` lida no servidor da tela, nunca enviada à página) e mostrar sucesso/falha sem texto de conversa; (4) oferecer a alternativa por **chave de API** (decisão D26 em `docs/plano/README.md`), também sem a tela guardar a chave.
- **Divergência já verificada:** o Hindsight 1.0.0 **não tem** o provedor `chatgpt` (só `openai-codex`); fica em `none` (decisão do dono). Não prometer na tela algo que o Hindsight não faz.

## Tarefa D: trava "só processa depois do meu OK" e passo 7 "Processar"
**Descoberta importante:** hoje a ponte começa a extração pelo modelo **sozinha** assim que está ligada (`apps/ponte/src/ciclo.ts`: `agendarExtracao` e `pegarProximo('extrair')`), e o passo "Processar" da tela não está ligado. O dono achava que só processava depois do OK dele. Com o histórico inteiro isso gastaria a cota do plano sem ele pedir.
- Criar a trava: configuração `extracao.liberada` (padrão **falso**); a ponte **não chama o modelo** para extração enquanto estiver falsa (o self-chat e os relatórios seguem as regras atuais, **sem** extração em massa); o passo "Processar" mostra quantos dias estão na fila, uma **estimativa**, e um botão **"Liberar o processamento"** (confirmação explícita); botão para pausar de novo.
- Testes antes (a ponte não pergunta nada ao modelo com a trava fechada; abre e fecha), quebras propositais, runbooks 08/09.

## Tarefa E: tela principal e revisão geral
Revisar o painel final ("Pronto") e todos os passos (Ambiente, WhatsApp, Cadastro, Sincronizar, Extrair, Modelo, Processar, Voz, Self-chat, Agenda, Backup) para coerência de estados, textos em português simples e acessibilidade (não só cor). Registrar o que ficou **não verificado**.

## Ao terminar (a IA da nuvem)
1. Rodar tudo (`npm test` nas 5 partes, `tsc`, `sh tests/run-all.sh`, `tests/carga/check_carga.sh`) e mostrar a saída; 2. atualizar `PROGRESS.md`, `LICOES.md`, os runbooks e este arquivo (marcar o que foi feito); 3. commit e envio ao GitHub; 4. avisar o dono de que a IA local pode retomar, **com a lista exata do que ele deve conferir**: o Heimdall puxa o resto do histórico? não repete extração? a trava de processamento funciona?


---
## Estado da execucao (IA da nuvem, 2026-10-21, ao fim do credito)

**PRONTO, testado e enviado (core 408, listener 74, ponte 50, memoria 19; `tsc` limpo):**
- **A) Historico antigo:** nucleo (`apps/core/src/historico-antigo.ts`, migracao v12), laco do listener (`apps/listener/src/historico-antigo.ts`, ligado em `iniciar.ts`, **trava fechada por padrao**), contagem de dias novos x refeitos SEM enfileirar (`diasDeExtracaoPendentes`), trava de arquitetura (regra 1), 3 cenarios de carga (`tests/carga/historico-antigo.test.ts`: chega depois da extracao, chega duas vezes, queda no meio). Endpoints `/api/historico-antigo` e `/api/historico-antigo/liberar` (confirmacao + ritmo entre 15 e 3600 s).
- **D) Trava de processamento:** `extracao.liberada` (padrao FALSA); a ponte nao enfileira nem consulta o modelo com ela fechada; `/api/processamento` (so conta) e `/api/processamento/liberar` (liberar exige `confirmar:true`; pausar nao). Testes de ponte, servidor e nucleo.
- **B) Parte de dados da tela:** estados AO VIVO (`estadosAoVivo`) com `processando`, `percentual` (so onde ha total conhecido) e `detalhe`; `/api/estado` os entrega por passo e o verde gravado de sincronizar/extrair deixou de valer. **Cadastro da equipe interna** com numero inteligente (`apps/core/src/cadastro.ts`, migracao v13, tabela `equipe`): formatos humanos, DDD 55 x codigo do pais decidido pelo numero de digitos, duas variantes (com e sem o 9), casa com `contato_jids` sem consultar o WhatsApp, recusa cliente e duplicata; endpoints `/api/cadastro*`.
- **C) Conectar o modelo (parte de dados):** `apps/core/src/modelo-teste.ts`: a tela so grava o PEDIDO de teste, a **ponte** executa (a tela nao tem rede nem chave; regra de arquitetura do nucleo), guarda so ok/falhou/tempo/motivo curto (nunca o texto); `/api/modelo` entrega as instrucoes (login no terminal, cota de 5 horas compartilhada, alternativa por chave de API, Hindsight em `none`).
- Passos `cadastro`, `modelo` e `processar` ja constam como `pronto: true` em `passos.ts`.

**PENDENTE (nao feito por falta de credito):**
1. **Interface (`apps/core/src/onboarding/recursos.ts`, JS e CSS) dos passos novos.** Os endpoints existem e estao testados, mas a tela ainda NAO os usa: faltam (a) renderizadores `cadastro` (formulario nome/funcao/telefone, "Entender o numero", "Salvar", lista), `modelo` (instrucoes, botao "Fazer chamada de teste" e leitura do resultado a cada 2 s), `processar` (contas de `/api/processamento`, botao "Liberar o processamento" com `confirm` e "Pausar"), e o cartao do historico antigo dentro de `sincronizar` (liberar/pausar com ritmo); (b) menu lateral com **barra e texto** ("133 de 655"), classe amarela `proc` para `processando` e texto de estado (nao so cor); (c) no `setInterval`, passos de formulario (`cadastro`, `modelo`) so atualizam o MENU, nunca o painel (senao apagam o que o dono digita); (d) trocar o texto "Este passo ainda nao esta ligado... (docs/plano/...)" por texto sem caminho de arquivo (hoje so o passo `voz` cai nele). **ATENCAO:** como `cadastro`, `modelo` e `processar` ja estao `pronto: true` e o JS ainda nao tem o renderizador, esses tres passos aparecem na tela **sem conteudo** ate a interface ser feita.
2. Teste da tela real (`tests/navegadores/tela.mjs`) para os passos novos e para "processando" no menu.
3. **E) Revisao final** do painel "Pronto" e de todos os passos (textos em portugues simples, acessibilidade) e o registro do que ficou nao verificado.
4. Quebras propositais em `tests/core/mutacao.py` para as regras novas (historico antigo, trava `extracao.liberada`, `estadosAoVivo`, cadastro, modelo-teste) e rodar o `mutacao.py` completo (leva ~40 minutos).
5. Rodar `sh tests/run-all.sh` e `sh tests/carga/check_carga.sh` com tudo junto (nesta sessao rodei so os `npm test` e o `tsc`; os cenarios de carga do historico antigo passaram isoladamente com 2000 mensagens).
6. Adaptador de login do Hermes por `hermes doctor`: **nao feito de proposito** (o nucleo nao pode rodar programas fora de `ambiente.ts` e o formato da saida nao esta verificado).
7. "Contexto de cada membro montado quando o modelo processar": so a tabela `equipe` (nome, funcao) existe; a montagem do contexto no processamento nao foi feita.

**Ordem seguida:** A, D, B (dados), C (dados). A tarefa D foi adiantada antes de B e C de proposito, para a ponte nunca gastar cota sem o OK do dono.

**O que o dono confere na volta a IA local (nada disto foi provado com o WhatsApp real):**
1. **Puxa o resto do historico?** Atualizar o ramo; o acervo migra sozinho para v13. Abrir a busca antiga com `POST /api/historico-antigo/liberar` (ou pela tela quando a interface existir) com ritmo conservador (60 s) e **decidir o ritmo**; acompanhar `historico_pedidos` (conversas concluidas/esgotadas) e as mensagens novas. Anotar quanto o WhatsApp realmente devolve.
2. **Nao extrai de novo?** Antes de liberar o modelo, consultar `GET /api/processamento`: `diasNovos` x `diasRefeitos` (dias ja extraidos que mudaram). Conferir que os dias antigos geram so trabalho novo e que `diasRefeitos` e o numero esperado.
3. **A trava funciona?** Com `extracao.liberada` falsa a ponte nao consulta o modelo (conferir o contador de consultas do Hermes ou `fila` sem `extrair`); liberar (com `confirmar`) e ver o processamento comecar; pausar e ver parar.
4. **Conectar o modelo:** apos trocar a conta no terminal, `POST /api/modelo/testar` e depois `GET /api/modelo`: `teste.estado` deve virar `ok`.
