# Fechamento da sessão de 22 a 23/10/2026 — piloto (MVP) funcionando na VPS

Documento de passagem para a próxima sessão (de qualquer IA) e para o dono. **Só fatos verificados:** cada número abaixo foi lido do banco, do Hermes, do git ou de um teste executado nesta sessão. O que não foi verificado está marcado **[NV]**. Complementa `PROGRESS.md` (diário), `LICOES.md` (erros e lições), `2026-10-23-observacoes-do-dono-na-tela.md` (achados detalhados, seções 1 a 11) e `runbooks/12` e `13`.

## 1. O que existe hoje (resumo)
O Heimdall **escuta** o WhatsApp comercial do dono (só leitura, nunca envia a ninguém além do self-chat), guarda tudo em `data/acervo.sqlite`, baixa e transcreve áudios (Whisper `small`) e converte PDFs, **cadastra como cliente quem respondeu**, lê cada conversa de cliente **dia a dia** com um modelo (Hermes + ChatGPT Plus) para extrair **nome, empresa, compromissos e sinais de potencial**, calcula por código o acompanhamento (7 tentativas, 2 dias úteis), monta os relatórios (semanal na segunda; diário de terça a sexta, 08:00, fuso de São Paulo) e os entrega **só no self-chat**. O CRM (Krayin) tem o funil pronto. Tudo roda numa VPS Linux compartilhada com sites de clientes; o dono usa a tela por **túnel SSH** (computador Omarchy/Linux).

## 2. Cronologia (commits em `main`; o resto foi feito na VPS)
| Commit | O que entrou |
|---|---|
| `1e3c970` | ponto de partida: fechamento da sessão anterior (CI verde) |
| `ebad763` | runbook 12 para Omarchy/Linux (alias `heimdall` no SSH), textos da tela, `candidatos-cliente.ts` (só leitura), pendência de 23/10 |
| `82f89d1` | mídia que o WhatsApp não entregou deixa de aparecer como falha |
| `eb50c4f` | self-chat só fala com o modelo com `/heimdall`; aviso "sem provedor" não é resposta; mídia indisponível desiste na 3ª tentativa |
| `6a06c39` | modelo por tarefa; config do Hermes enxuta (preserva o login); comandos por código; consumo de tokens e teto diário; tela de Processar; cadastro de clientes; extração do mais novo para o mais antigo; identificação de nome e empresa; Playwright |
| `6b25df0` | `recall` com poucos tokens; prompt de continuidade da VPS |
| `bfd00f4` | freio global da busca antiga; disco "com tudo instalado"; explicações na tela |
| `62b0120` | **defeito grave corrigido** (mensagem_origem em texto); descartes visíveis; teste real; estimativa sem dobrar |
| `bfb5261` | falso alarme de descartes; botão "Começar" muda; estilo de botão desabilitado |
| `8c70aad` | datas dos compromissos (calendário de referência, data impossível descartada, conserto do gravado), causa do erro de gravação |
| `fd541fd` e commit de fechamento | âncora da mutação; limpeza de `/tmp` dos testes; documentação final |

**Feito na VPS sem commit** (estado no banco, no Hermes e no Krayin): QR do WhatsApp lido; busca antiga pausada antes do QR; login do ChatGPT (Plus) no Hermes; modelos por tarefa; 257 clientes cadastrados; 529 consultas de extração; **funil "Funil Heimdall" criado no Krayin por API** (etapas Novo, Contato iniciado, 1ª Reunião Agendada, 2ª Reunião Agendada, Ganho, Perdido; é o padrão; o "Default Pipeline" original continua existindo, sem ser o padrão); backup configurado em `~/heimdall-backups`; relatórios de teste e teste do self-chat enviados.

## 3. Estado de cada passo da tela (verificado em 2026-10-23)
| # | Passo | Estado real |
|---|---|---|
| 1 | Ambiente | **verde.** Disco 28 GB livres. Regra nova: com Docker rodando e nenhuma imagem faltando, ok a partir de 15 GB, atenção de 8 a 15, falha abaixo de 8 (o limite de 30 GB era de instalação). Valores 15 e 8 = **decisão da IA, aguarda OK do dono** |
| 2 | WhatsApp | **conectado.** O listener reconecta **sem QR** depois de reiniciar (comprovado duas vezes) |
| 3 | Cadastro | 11 contatos da equipe (papel `interno`; 10 pessoas, uma delas com 2 telefones) |
| 4 | Sincronizar | histórico inicial recebido. **Busca antiga: 44 pedidos, 0 mensagens antigas trazidas.** Hoje está **pausada com 631 conversas pendentes**, então o passo fica cinza (ver seção 8, item 7) |
| 5 | Extrair (mídia) | 163 arquivos baixados, 162 transcrições e 1 PDF convertido; 522 downloads "sem arquivo" (o WhatsApp não tem mais; não é falha) |
| 6 | Modelo | logado (plano Plus), chamada de teste ok em 7,7 s |
| 7 | Processar | **529 de 529 consultas**, 0 falhas; liberado para os dias novos; teto diário **600.000** tokens (ver seção 7) |
| 8 | Voz e personalidade | **não implementado** (seção 8, item 4) |
| 9 | Self-chat | `/heimdall ...` funciona; **teste de ida e volta aguardando a resposta do dono** (mensagem enviada em 23/10 às 19:40, horário de Brasília) |
| 10 | Agenda | relatórios de teste (diário 339 palavras, semanal 447; limites 350 e 450) **enviados ao self-chat**; **o dono ainda precisa ler e avaliar** |
| 11 | Backup | configurado em `~/heimdall-backups` (**mesmo disco da VPS**), 1º backup conferido (integridade ok) |
| 12 | CRM | **verde** (teste do Heimdall: funil completo, nada faltando); nenhum lead criado ainda (propostas `C1..C5` só nascem nos relatórios reais) |
| 13 | Pronto | depende de 8, 9 e 10 |

## 4. Agenda (resposta à dúvida do dono)
Código `relatorioDoDia` (`calendario.ts`): **segunda = semanal; terça a sexta = diário; sábado e domingo = nenhum**, sempre às 08:00 em `America/Sao_Paulo`. Em 23/10 (sexta) às 08:00:04 saiu um relatório para o self-chat (pelo calendário, o diário; nessa hora ainda não havia clientes cadastrados, então sem itens; o conteúdo não foi relido). **Próximos automáticos:** segunda 26/10 = **semanal**; terça 27 a sexta 30 = diário. Os relatórios de teste de 23/10 às 19:40 vêm marcados "[TESTE]". Os códigos de correção (`A1`, `F2`, `P1`) só valem para relatórios reais (`relatorio_itens` está vazio hoje).

## 5. Números medidos (23/10)
- **Acervo:** 6.581 mensagens (sem as 307 "ignoradas": reações e avisos), 673 conversas, 688 contatos (257 clientes, 11 internos, 420 desconhecidos). Primeira mensagem **25/03/2026** (nada antes), 0 duplicadas.
- **Extração:** 218 de 257 clientes com nome extraído da conversa, 110 com empresa, **81 compromissos (27 sem data)**, **68 sinais**, 18 dúvidas abertas. 586 consultas gastaram 2.317.951 tokens de entrada + 97.792 de saída (inclui 56 consultas descartadas por defeito: ~240 mil tokens).
- **Custo por consulta:** média 4.279 tokens de entrada + 193 de saída (últimas 30); dias ricos ~5,6 mil. Texto fixo do Hermes: 3.187 → **2.280** tokens por pedido depois da config enxuta; **54%** da entrada total do Luna veio do cache do Hermes (1.537.792 de 2.824.449 tokens, em 700 chamadas; o campo `input_tokens` do Hermes exclui a parte lida do cache).
- **Cota real (informada por `hermes usage`):** sessão chegou a 10% e a semana a 2% depois do processamento todo (a sessão renovou e voltou a 0%). **As porcentagens são arredondadas; não foi medido quanto o cache pesa na cota.**
- **Minhas sondas de diagnóstico** gastaram ~125 chamadas ao Hermes (no fim: 711 chamadas no Hermes contra 586 no painel do Heimdall, que só vê o que passa pela ponte). Regra daqui em diante: **nenhuma chamada ao modelo sem o dono pedir.**

## 6. Decisões
**Do dono (2026-10-22/23):** pausar a busca antiga antes do QR; usar `/heimdall` para falar com o modelo (anotações soltas no self-chat não vão ao modelo); mídia indisponível desiste depois de N tentativas (confirmou 3); cadastrar **todo contato que respondeu** como cliente, com nome e empresa vindo **das conversas**; processar **do dia mais novo para o mais antigo**; usar o Playwright; seguir as estratégias de economia de tokens (modelo por tarefa, comandos por código, config enxuta); a mesma pessoa pode ter 2 telefones (equipe); acesso completo à IA para fechar CRM, backup, agenda e limpeza.
**Registradas como D33 a D38 em `README.md`.**
**Da IA, aguardando OK do dono:** limites de disco 15/8 GB; teto diário 600.000 (era 3.000.000 durante o acúmulo; baixado para o modo sem supervisão); freio da busca antiga (10 respostas vazias seguidas encerram, 5 falhas seguidas pausam); confiança mínima 0,7 para trocar o nome de um cliente; backup na mesma VPS; manter o "Default Pipeline" do Krayin sem ser o padrão.

## 7. O que está ativo agora (e como parar)
- **`heimdall.service`** (systemd de usuário, `Restart=always`): supervisiona **tela, listener, executor, memória e ponte**. Não é cron. Parar: `systemctl --user stop heimdall.service` (os contêineres continuam; `sh scripts/heimdall.sh parar --com-docker` para tudo).
- **Contêineres do projeto Compose `heimdall`:** Postgres, Hindsight (sem modelo de linguagem), Hermes, Krayin e MySQL do Krayin.
- **Extração liberada** (consome cota do ChatGPT): processa sozinha os dias novos que fecham, **dentro do teto de 600.000 tokens por dia**. Pausar: botão "Pausar processamento" na tela.
- **Nenhum agendamento criado por mim:** `CronList` da sessão retornou "No scheduled jobs"; nenhum `CronCreate`, `ScheduleWakeup` ou `/loop` foi usado.
- **Atenção, não é do Heimdall:** o `crontab` do usuário `pedro` contém 2 tarefas do projeto **V360 Dashboard** (a cada 15 minutos e às 08:00), com um token em texto puro. **Não foram tocadas** (servidor compartilhado). Vale o dono revisar.
- **Sem agentes em segundo plano:** o único agente da sessão (monitor, leitura somente) terminou.

## 8. Próximos passos (em ordem sugerida)
1. **Dono:** responder à mensagem de teste no self-chat e **ler os dois relatórios de teste**: dizer se são úteis e o que mudar.
2. **Dono:** conferir `data/revisao/amostra-2026-10-23.md` (10 exemplos, 4 com áudio; **contém conversas reais, fora do git, modo 600**). Depois **apagar** o arquivo (`rm data/revisao/*.md`). O gerador era um script descartável; ver item 12.
3. **Refazer os ~80 dias que geraram compromisso** com o calendário de referência (custo estimado ~350 mil tokens, algo como 3% da sessão; **precisa do OK do dono**). Antes, rodar `sh tests/infra/smoke_extracao_real.sh 6` e conferir que as datas saem certas. Os 27 compromissos sem data hoje são consequência da correção por código.
4. **Voz e personalidade** (`fase-1-calibracao-da-personalidade.md`): instalar o `prompts/SOUL.md` no Hermes (lacuna b), dar ao Heimdall um jeito de ler as mensagens do dono (lacuna c: MCP próprio **ou** um comando `/heimdall calibrar voz` que amostra as mensagens `de_mim` e propõe o perfil; `aprovar` no self-chat). Hoje o Hermes não acessa o acervo e usa a personalidade padrão.
5. **Cliente = empresa:** hoje há 1 cliente por contato. Agrupar contatos da mesma empresa (campo `empresa`) e tratar fornecedores e conversas pessoais (todo contato que respondeu virou cliente).
6. **Qualidade da extração:** conferir a possível alucinação de nome em título de compromisso (1 caso, confiança 0,68); decidir se a extração de áudio pede transcrição maior que o `small` (hoje ~5x o tempo real; erra nomes e siglas).
7. **Sincronizar cinza:** a busca antiga pausada com 631 pendentes deixa o passo cinza. Criar a ação "dar a busca por concluída" (marca as pendentes como esgotadas, reversível) **ou** deixar o freio decidir de novo ao liberar. Os ~4 meses anteriores a 25/03/2026 (o dono vê mensagem de 24/11/2025 no celular) **não vieram**: alternativa **[NV]** é importar a exportação de conversa do próprio WhatsApp.
8. **Backup fora da VPS:** o backup atual protege de erro, **não** de perder a VPS. Copiar `~/heimdall-backups/` para outro lugar (ex.: `scp` periódico do computador do dono).
9. **Funcionalidades que faltam:** MCP próprio do Heimdall (lacuna c), dossiês por cliente, aprendizado pelo resultado das recomendações (lacuna d), ganho/perdido e `lost_reason` no CRM (`pendencias/2026-10-22-vps-melhorias-pendentes.md`, seção 8).
10. **Decisões abertas:** Hindsight 1.0.0 → 1.1.0 (recomendado seguir sem modelo); experimento com **um** arquivo com erro 403 (pedir reenvio ao celular; hoje `baixar.ts` só pede em 404/410); Krayin em inglês/dólar (ver `pendencias/2026-10-22-vps-melhorias-pendentes.md`, seção 5); disco (cache de construção do Docker de ~9,5 GB, compartilhado, não separável com segurança); branches antigas no GitHub (`claude/serene-ptolemy-qirk3i`, `docker-wsl-registro`, `windows-correcoes-e-ci`, `windows-python-nos-testes`: apagar pela página do GitHub se o dono quiser).
11. **Robustez:** a ponte não chama `recuperarTravados` para `extrair` (quem recupera, para qualquer tipo de trabalho, são o listener e o executor em 15 minutos e a memória em 30); a ponte poderia fazer o mesmo. Um erro de gravação raro (1 em 529, passou na 2ª tentativa) agora registra a causa técnica; ver se reaparece.
12. **Ferramentas:** transformar o gerador de revisão (script descartável) em ferramenta versionada **com teste**; revisar o tempo da suíte de mutação (~35 a 40 min sob carga).

## 9. Armadilhas desta sessão (detalhes em `LICOES.md`)
- **Modelo falso não basta:** o defeito mais caro (56 dias e 240 mil tokens sem efeito) passou porque o teste usava um modelo falso com o formato que a IA imaginava. Regra no `AGENTS.md`; teste real em `tests/infra/smoke_extracao_real.sh` (provado: falha com o defeito).
- **Nunca `pkill -f`/`ps | grep | kill` por texto:** o padrão casa com o próprio comando e o derruba (aconteceu duas vezes). Use o PID de `data/processos.json`.
- **Não edite arquivos enquanto a bateria roda:** as cópias da mutação pegam arquivos no meio da mudança e o resultado não vale (aconteceu duas vezes).
- **Não gaste a cota do dono em sondas** sem pedir.
- **`config-hermes` regravava o `config.yaml` inteiro e apagaria o login do modelo** (agora preserva a seção `model:`).
- **Nada se apaga fora de `apagar.ts`:** uma trava de arquitetura recusou um `DELETE` meu; usei valor vazio.
- **Teste de navegador:** `PLAYWRIGHT_MODULE=$HOME/.local/share/heimdall-playwright/node_modules/playwright` (Playwright 1.56.1 só na pasta do usuário).

## 10. Limpeza feita no fim da sessão
Removidos (verificados antes): `~/heimdall-import` (as 6.526 mensagens e os 134 arquivos de mídia já estão no acervo; o backup do Postgres do Windows era inválido aqui) e `~/heimdall-fechamento.txt` (registro já no `PROGRESS.md`); 18 arquivos de saída de teste em `/tmp` e uma pasta temporária de 22/10; sobras `-shm` do backup antigo. Os scripts de teste passaram a usar pasta temporária própria, apagada ao sair. **Mantido de propósito:** `~/heimdall-backups/antes-do-processamento-2026-10-23.sqlite` (único ponto de volta antes dos clientes e da extração; o rodízio de backups não toca nele); pode ser apagado quando o dono quiser. Não foram tocados: nada de outros projetos da VPS, o cache de construção do Docker, o Playwright (328 MB, ferramenta de teste documentada).

## 11. Envio ao GitHub
Último commit **verificado com a bateria completa e a suíte de mutação (150 quebras detectadas)** antes desta documentação: `fd541fd`, em `main` e na branch `claude/affectionate-albattani-rtz8mu` (conferido com `git ls-remote`). O commit com esta documentação e a correção dos scripts de teste é o `HEAD` de `main`: conferir com `git log -1` e `git ls-remote git@github.com:alisonsouzademacedo/heimdall-agent.git refs/heads/main`. Envio sempre com a URL SSH explícita (o `origin` é HTTPS e o usuário não tem credencial HTTPS), sem `--force`. Branches antigas do GitHub: ver seção 8, item 10.
