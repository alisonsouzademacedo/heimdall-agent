# Fase 1 — Segurança operacional: segredos, backup, retenção e apagar

Status: **proposta para aprovação** (item 5 do quadro de planejamento). Fontes lidas por inteiro: `docs/hindsight/developer/admin-cli.md`, `docs/baileys/authentication/session-management.md`, `docs/hermes-agent/developer-guide/state-db-recovery.md`. Lidas só nas seções indicadas: `docs/hermes-agent/reference/cli-commands.md` (`hermes backup`/`import`, linhas ~1098-1196), `reference/faq.md` (backup × export de perfil), `docs/docker/engine/storage/volumes.md` (backup de volume), `docs/hindsight/developer/api/documents.md` (apagar documento). O que não está nessas páginas vai marcado **[não verificado]**.

## 1. Segredos
| Segredo | Onde fica | Regras |
|---|---|---|
| Chave da API do Hermes (`API_SERVER_KEY`) | arquivo de ambiente em `infra/compose/` (fora do git), gerada na instalação | nunca impressa; só o `core` e o `hermes` a conhecem |
| Login do ChatGPT (Hermes e Hindsight) | volumes de cada serviço (`auth.json` do Hermes; diretório de credenciais do Hindsight) | um diretório por conta; os tokens rotacionam, então o volume é gravável |
| Sessão do WhatsApp (Baileys) | banco próprio, **não** `useMultiFileAuthState` (a documentação diz que não serve para produção) | quem tem esse banco **se passa pelo seu WhatsApp**: é o segredo mais sensível |
| Senhas do Krayin, do Postgres e do MySQL | arquivo de ambiente | trocar a senha padrão do Krayin na instalação (a documentação do Krayin a lista como padrão) |
| Chave do Firecrawl e de outras ferramentas de apoio | variáveis do ambiente da IA construtora | nunca dentro do repositório |

Regras: nada disso entra no git (`.gitignore` já cobre `data/` e arquivos de ambiente); logs **sem conteúdo de conversa e sem tokens**; o relatório de erro mostra o código do erro, não a mensagem do cliente. Disco do notebook criptografado: recomendo ativar (o Windows 11 Pro tem recurso próprio, mas **não verificado na documentação deste projeto**; confirmar no spike).
**Teste de regressão:** varredura do repositório procurando padrões de chave e arquivos que não deveriam estar versionados (falha o commit).

## 2. Backup
O que guardar, e como (cada comando vem da documentação indicada):
| Item | Como | Observações |
|---|---|---|
| Acervo (`acervo.sqlite`, `data/midias`, `data/md`, `dossies`, `relatorios`, `cadastro`, versões de critérios e do `SOUL.md`) | o `core` faz uma cópia consistente do SQLite (API de backup do SQLite) e compacta a pasta | não copiar o `.sqlite` com os arquivos `-wal`/`-shm` soltos; é o **dado mais valioso**: o histórico do WhatsApp pode não voltar inteiro |
| Memória do Hindsight | `hindsight-admin backup <arquivo>.zip` (dentro do contêiner da API) | snapshot consistente (`REPEATABLE READ`); inclui bancos de memória, fatos, modelos mentais, diretivas |
| Hermes (config, memória, skills, sessões, cron, **chaves**) | `hermes backup` (completo) ou `--quick` (só estado crítico); `-k N` mantém os N mais novos | funciona com o Hermes rodando; **o zip contém `.env` e `auth.json`** (é segredo) |
| Sessão do WhatsApp (Baileys) | cópia do banco de autenticação | se perder: escanear o QR de novo; o histórico que o WhatsApp devolver pode ser menor **[não verificado]** |
| Krayin (fase 2) | cópia do volume do MySQL com o serviço parado (receita de volume da documentação do Docker) | `mysqldump` não está na documentação que temos **[não verificado]** |

**Destino:** um segundo disco ou pasta fora do notebook, **sempre criptografado**, porque o backup junta dados de clientes e segredos. Nunca no git e nunca em serviço de nuvem sem criptografia própria.
**Quando (decidido):** no primeiro uso do dia; manter os últimos 7 diários e 4 semanais. O Heimdall avisa no relatório se o último backup tem mais de 2 dias.
**Ensaio de restauração:** um backup que nunca foi restaurado não está provado. Uma vez por mês, restaurar em pasta de teste e conferir contagens (mensagens, clientes, documentos). Roteiro a entrar em `runbooks/08-testes-de-fumaca.md`.

### Restaurar (ordem)
1. Parar os serviços (o Hermes pede parar o gateway antes de importar; a documentação de recuperação diz o mesmo para o banco de estado).
2. Acervo e arquivos: voltar a pasta e o SQLite.
3. Hindsight: `hindsight-admin restore <zip>` (**apaga todos os dados do schema de destino** antes de importar; só com backup recente à mão). Depois rodar `hindsight-admin repair-bank --all`, que a documentação manda fazer depois de restauração lógica.
4. Hermes: `hermes import <zip>`.
5. Subir tudo; conferir saúde dos serviços e as contagens; religar o `sync_hindsight` para reconciliar o que falta.
6. **Reaplicar a lista de esquecimento** (seção 4) para que dados apagados não voltem do backup.

## 3. Retenção de 90 dias
- Já decidido (D16): guardar **no mínimo 90 dias**; passado o prazo, o Heimdall **avisa** e **nada é apagado automaticamente**.
- Aviso: uma linha no relatório semanal ("Retenção: 142 áudios e 38 PDFs com mais de 90 dias, 3,1 GB. Responda `limpar mídias antigas` para ver o que seria apagado").
- Proposta: o aviso e a limpeza valem para **originais de áudio e PDF** (pesados). Texto das mensagens, transcrições e `.md` ficam, porque o aprendizado depende deles. Apagar esses é pedido à parte. (Ver pergunta no fim.)

## 4. Apagar (por período ou por cliente), com confirmação
**Princípio:** o modelo nunca apaga nada. Apagar é um caminho de código separado, acionado só por uma **frase exata sua no self-chat**, lida pelo código (não pelo modelo). Nenhuma ferramenta do MCP apaga dados (regra já definida em `fase-1-mcp.md`).

**Fluxo em duas etapas**
1. Você pede: `apagar tudo da Metalúrgica Alfa` (ou `limpar mídias antigas`).
2. O Heimdall responde com o **escopo exato**: quantas mensagens, mídias, documentos, compromissos, itens no Hindsight e tamanho, e um código (`confirmo apagar 7K2`). Nada foi apagado ainda.
3. Você digita o código. Só então o código executa e grava um registro de auditoria **sem conteúdo** (data, escopo, contagens).

**O que "apagar um cliente" remove**
- Acervo: mensagens, mídias (arquivos), transcrições, documentos e `.md`, compromissos, sinais, acompanhamento, dossiê, recomendações, ajustes e correções ligadas ao cliente.
- Hindsight: documentos do cliente (`conv:<cliente_id>:*`, `reuniao:*`) pelo apagar documento, que remove todas as memórias dele (`hindsight document delete <banco> <documento>` consta na documentação). **Não verificado:** se observações e modelos mentais já derivados são reescritos depois; testar no spike (cliente sintético: após apagar, nada deve aparecer em busca nem nos modelos mentais).
- Hermes: entradas de `MEMORY.md`/`USER.md` que citam o cliente (a documentação lista `hermes journey delete` para memória); histórico de sessões do self-chat que cita o cliente **[não verificado se dá para apagar seletivamente]**.
- Relatórios antigos que citam o cliente: **mantidos como histórico** (decisão do dono).
- **WhatsApp:** o Heimdall não apaga nada no WhatsApp (só escuta).
- Opcional: `apagar e ignorar`, para que novas mensagens desse contato não sejam absorvidas (a documentação do Baileys tem `shouldIgnoreJid`).

**Lista de esquecimento:** cada apagamento grava só o **id** do cliente (sem nome nem texto) numa lista guardada nos backups e fora deles. Ao restaurar um backup, o código reaplica a lista, para o dado apagado não ressuscitar. Backups antigos que já contêm o cliente saem do rodízio sozinhos (7 diários, 4 semanais).

## 5. Outras travas
- O envio ao WhatsApp continua uma função única, travada no self-chat (regra 1), com teste.
- Atualizar versões de Hermes/Hindsight/Baileys só depois de um backup (`hermes update --backup` existe para o Hermes) — detalhe no item 6 do quadro.

## Testes de regressão previstos
Varredura de segredos no repositório · logs sem conteúdo · backup do acervo restaurável e idêntico (contagens) · restauração reaplica a lista de esquecimento · apagar exige o código da etapa 2 e falha com código errado · mensagem de cliente com a frase de confirmação **não** executa nada · após apagar um cliente sintético, nenhuma consulta o encontra (acervo, Hindsight, dossiês) · apagar não toca em outro cliente · MCP não tem ferramenta de apagar.

## Decisões do dono (2026-10-20)
1. **Retenção:** aprovado. Após 90 dias, o Heimdall oferece limpar só áudios e PDFs originais; textos, transcrições e `.md` ficam.
2. **Backup:** destino à escolha entre HD externo, segundo disco ou pen drive, **perguntado na configuração inicial** (onboarding). Ritmo: **no primeiro uso do dia** (não precisa ser de madrugada, o notebook pode estar desligado).
3. **Relatórios antigos** de cliente apagado: **mantidos como histórico**.

## Perguntas que foram feitas (respondidas acima)
1. **Retenção:** concorda em ficar só com a limpeza de **áudios e PDFs originais** após 90 dias, mantendo textos e transcrições?
2. **Backup:** onde fica a cópia (HD externo, segundo disco, pen drive)? E aceita o ritmo "toda madrugada ou no primeiro uso do dia"?
3. **Relatórios antigos** que citam um cliente apagado: apagar o arquivo ou manter?
