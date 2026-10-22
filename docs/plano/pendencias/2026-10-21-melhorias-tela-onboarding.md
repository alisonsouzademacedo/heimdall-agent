# Pendência: melhorias da tela de onboarding (feedback do dono, 2026-10-21, durante a primeira carga real)

**Estado:** implementado em 2026-10-22 (itens 1 a 4 e o painel fixo de fontes); falta a revisão visual final e o teste em navegador real. Mexer na tela exige teste primeiro (regra do `AGENTS.md`). Origem: o dono olhou a tela com a carga em andamento (capturas dos passos 3, 4 e 5) e pediu estes pontos.

## 1. Passo "Cadastro" (3 de 12): ainda não está ligado ("Este passo ainda nao esta ligado nesta versao")
O dono pede:
- **Inteligência no número de telefone.** Ele digita no formato brasileiro comum, por exemplo `(55) 99XXXXXXX` (modelo; o número real não vai para o repositório), mas o WhatsApp guarda o número de outro jeito: com `+55` na frente e, em contas antigas, **sem o 9** depois do DDD. O cadastro precisa aceitar o formato humano e achar a pessoa certa.
- **Só equipe interna.** O cadastro é para os **membros da equipe** (não clientes). Depois de processado pelo modelo, o Heimdall monta o contexto existente de cada membro.

Notas de desenho (propostas, **não verificadas**; o nono dígito brasileiro **não** está documentado em `docs/baileys/`, ver `fase-1-cadastro-inicial.md` e `PROGRESS.md`, linha de 2026-10-19):
1. Normalizar a entrada para dígitos com país: tirar espaços, parênteses e traços; se não começar por `55`, acrescentar; gerar as **duas variantes** (com e sem o 9 depois do DDD, só para celulares: 11 dígitos nacionais ou 10).
2. **Casar com o que já existe no acervo** (`contato_jids`, hoje 673 contatos importados), sem consultar os servidores do WhatsApp: se alguma variante bate com um contato conhecido, usar o identificador dele; se nenhuma bate, guardar as duas variantes ligadas à mesma pessoa e **avisar** o dono ("não achei este número entre os seus contatos").
3. Mostrar ao dono o que foi entendido (`+55 DD 9XXXX-XXXX` e `+55 DD XXXX-XXXX`) antes de gravar.
4. Teste primeiro, com números **sintéticos**: formatos com e sem `+`, `55`, parênteses, 9 presente e ausente, número curto/inválido, duplicata da mesma pessoa.

## 2. Passos 4 e 5 (Sincronizar, Extrair): "viável, mas não 100%"
Observado nas capturas: o passo aparece **verde ("pronto")** com a barra cheia enquanto a extração de mídia ainda estava em 133 de 655 arquivos; faltam porcentagem correta e o número de conversas/mensagens "correndo"; o menu lateral não mostra andamento.

O dono pede:
- Mostrar **a porcentagem real e os contadores subindo** (conversas, mensagens) durante a carga.
- O item do **menu lateral** de cada passo deve ter **barra de progresso**; enquanto não terminou, **amarelo "processando"**, nunca verde. Verde só quando tudo foi puxado.

### Causa no código (lido, `apps/core/src/onboarding/painel.ts`, `atualizarEtapas`)
- A função **só grava** `verde`/`vermelho` (`UPDATE onboarding_etapas ... SET estado = ?`); **nunca volta atrás nem grava "andamento"**. Se num instante o banco "prova" a condição (por exemplo `historico.ultima = true` com a fila de download ainda vazia, porque as mídias são enfileiradas aos poucos), o passo fica **verde para sempre**, mesmo que depois a fila encha.
- `sincronizar` fica verde quando o WhatsApp marca a **última** parte do histórico (`ultima`), o que não significa que tudo já foi gravado nem baixado.
- A tela só conhece dois estados (verde / não verde): não há estado "processando" nem porcentagem geral por passo.
- Percentuais possíveis **hoje**, com dados reais do acervo: mídia = `baixar_midia` concluída / total enfileirado (633 áudios + 22 PDFs = 655, 133 baixados na captura); histórico = o campo `progresso` que o WhatsApp informa (`whatsapp.historico`). **O WhatsApp não informa o total de conversas nem de mensagens** com antecedência, então para estas **não existe porcentagem honesta**: mostrar só a contagem crescente e "recebendo".

### Proposta (não aplicada; teste primeiro, dados sintéticos)
1. Estados de passo: `pendente`, **`processando`** (amarelo, com `percentual` e `detalhe`), `verde`, `vermelho`.
2. Para `sincronizar` e `extrair`, **calcular o estado ao vivo** a cada leitura do painel (sem gravar verde "pegajoso"): verde só se `ultima` e fila de download e de transcrição/PDF zeradas; se houver trabalho, `processando` com o percentual.
3. Menu lateral com a mesma barra mínima por passo (acessível: texto "133 de 655", não só cor).
4. Testes que falham antes: (a) passo não fica verde com fila de download pendente, mesmo se já tiver sido verde antes; (b) volta de verde para processando quando entram novos trabalhos; (c) percentual correto com contagens sintéticas; (d) sem total conhecido, nenhum percentual é inventado.
5. Atualizar `painel.test.ts`, `servidor.test.ts` e as quebras propositais; conferir na tela real (`tests/navegadores/check_navegadores.sh` já existe).

## Para registrar também
- O texto da tela do passo 3 menciona `docs/plano/fase-1-onboarding-visual.md`, mostrado ao usuário final: trocar por um texto sem caminho de arquivo quando o passo existir.

## Atualização (2026-10-22, local)
- **Cadastro inteligente:** `apps/core/src/cadastro.ts` normaliza o número humano, gera as variantes com e sem o 9 e casa com os contatos do acervo; `tests` cobrem formatos sintéticos.
- **Estados ao vivo:** `painel.ts` calcula `sincronizar`, `extrair` e `processar` a cada leitura, com percentual só quando existe total conhecido; o menu lateral mostra barra e detalhe. Testes em `painel.test.ts` e `servidor.test.ts`.
- **Fontes:** novo painel fixo na tela (`apps/core/src/onboarding/fontes.ts` + `recursos.ts`) com WhatsApp, modelo (ChatGPT), memória (Hindsight), mídia (Whisper/PDF) e CRM (Krayin). O cartão do CRM fica **pendente** enquanto o Krayin não estiver configurado e **nunca fica verde sem um teste de verdade**.
- **Ainda falta:** aplicar o desenho completo do protótipo (tipografia e composição), revisar os textos para leigo e rodar o teste de navegador num ambiente com Playwright; o CI Ubuntu roda a bateria, mas o teste de navegador é pulado sem Playwright.
