# Fase 2 — CRM e Kanban

Status: **Krayin escolhido**; fundação local implementada em 2026-10-22 (configuração segura, cliente REST, teste de conexão e passo 13 da tela). **Ainda não validado contra um Krayin real**: instalação, pacote REST e carga ficam para a VPS (D31). Fontes: páginas do GitHub lidas pelo Firecrawl; `https://devdocs.krayincrm.com/llms.txt` e `llms-full.txt`; código de `krayin/rest-api`; README de `trycompai/crm`.

## O que o Heimdall precisa do CRM
Cadastrar, mover entre etapas do Kanban, registrar **ganho** e **perda**. O CRM é o **registro do funil**; as conversas continuam no acervo. Para isso precisa de uma **API externa com token** que um agente consiga usar sem interface.

## Candidatos
| | Krayin CRM (`krayin/laravel-crm`) | Comp AI CRM (`trycompai/crm`) |
|---|---|---|
| Estrelas / licença | 24,0 mil / MIT | 11,5 mil / MIT |
| Atividade | último commit 16/10/2026 | último commit 21/08/2026, release 1.15.3 |
| Stack | PHP 8.3+, Laravel 11, Vue 3; MySQL 8.0.32+ ou MariaDB; Apache/Nginx; ~3 GB de RAM | TypeScript: Next.js, NestJS, Bun, Postgres, agente em "eve" (Vercel) |
| Kanban com etapas | **Sim**: visão Kanban por etapas e **vários funis com etapas personalizadas** (documentação) | **Não confirmado** (o README fala em "pipeline" de demonstração, sem descrever Kanban) |
| API externa | **Sim**, pacote `krayin/rest-api`: token (Sanctum), Swagger, CRUD de leads, pessoas, organizações, cotações, produtos | API é **tRPC do próprio app**, autenticação por sessão (Better Auth, login Google/Microsoft); API externa com token **não documentada** |
| Mover etapa / ganho / perda | **Sim**: rota `PUT /api/admin/leads/stage/edit/{id}` (campo `lead_pipeline_stage_id`); etapas com código `won` e `lost` registram a data de fechamento | não verificado |
| Pessoas e empresas | Pessoas e organizações (encaixa em "cliente = empresa" com vários contatos) | Contatos, empresas e negócios |
| Eventos | Eventos de criar/atualizar/apagar, que a API também dispara | n/d |
| Extras | atributos personalizados, tags, atividades, e-mail, importação CSV/XLSX | agente autônomo próprio de pesquisa e enriquecimento; lê Gmail e Calendar; não lê WhatsApp |
| Hospedagem | Docker documentado; instalação por Composer | três serviços (app, API, agente) + Postgres |

## Análise
**Krayin** cobre exatamente o necessário: Kanban com etapas configuráveis, API com token, rota explícita para mover etapa e etapas de ganho e perda. Custo: é outra pilha (PHP + MySQL) para hospedar ao lado de Hermes, Hindsight (Postgres), listener e Whisper, e a API REST é um pacote **separado** a instalar.

**Comp AI CRM** é um CRM **com agente próprio**, pensado para pesquisar e enriquecer contatos. O Heimdall teria **dois agentes** disputando o mesmo registro, e a API disponível é interna ao app. A filosofia dele de "nada sobre uma pessoa é adivinhado; fatos têm evidência" é boa e pode inspirar nossa regra de confiança, mas ele não é o CRM passivo que o Heimdall precisa.

**Recomendação: Krayin.**

## Implementado localmente (2026-10-22)
- **Configuração segura:** `apps/core/src/crm/config.ts` grava `data/krayin.json` (fora do git) com URL e token, modo `0600` no Linux; valida `http/https`, recusa credenciais na URL e token vazio/curto/com quebra de linha. O token **nunca** volta para a tela, vai para log ou para o banco.
- **Cliente REST:** `apps/core/src/crm/krayin.ts` usa o prefixo `/api/admin`, `Authorization: Bearer`, tempo limite de 8 s e **não segue redirecionamento** (para o token não vazar para outro endereço). Lê funis/etapas (`GET /settings/pipelines`), cria lead (`POST /leads`) e move etapa (`PUT /leads/stage/edit/{id}`).
- **Funil:** `verificarFunil` reconhece as três primeiras etapas por nome e ganho/perda pelo código interno `won`/`lost`; devolve exatamente o que falta. **Não cria o funil pela API** (o formato de criação de pipeline não foi confirmado): a tela orienta o dono a criar em *Configurações >> Pipeline* e testa de novo.
- **Estado:** `apps/core/src/crm/estado.ts` guarda no banco só o último resultado (ok/falhou, motivo curto, funis, completo e etapas faltando). O cartão de fontes fica **vermelho** se a conexão falhar, **em andamento** se o funil estiver incompleto e **verde** só com conexão + 5 etapas.
- **Tela:** passo 13 "CRM (Krayin)" com URL, token (campo de senha), "Salvar e testar" e "Testar de novo"; o token é limpo do campo antes do pedido.
- **Testes locais:** 431 testes do núcleo, `tsc` limpo, sintaxe do `app.js` conferida; testes do cliente contra servidor HTTP falso, sem Krayin real.

## Pendente para a VPS
- Instalar o Krayin com a imagem oficial `webkul/krayin:2.2.0` (digest `sha256:5a5e6e86bdede8ecd72db7805c4a471c9111513efae95de3e8c80a7bb0e517b9`) **e** o pacote `krayin/rest-api` (a imagem sozinha não garante a API); medir RAM/disco e confirmar persistência.
- Gerar o token da API (a coleção oficial tem o pedido de Login) e colar na tela; validar as rotas e os formatos reais de lead/pipeline (os payloads de `LeadForm`/`PipelineForm` não estão na documentação copiada).
- Criar a tabela de vínculo `cliente ↔ lead` e o fluxo de **propor movimento no self-chat e esperar o OK** antes de mover; o cliente REST já existe, mas nada o chama automaticamente ainda.

## Como se ligaria ao Heimdall (proposta)
- **MCP próprio do CRM** (fino), por cima da API do Krayin, com poucas ferramentas: `criar_lead`, `buscar_lead`, `mover_etapa`, `marcar_ganho`, `marcar_perdido` (com motivo), `registrar_atividade`. **Sem apagar.**
- Tabela de correspondência no acervo: `cliente_id ↔ organização/pessoa/lead do Krayin`.
- Regra: o CRM guarda **onde o cliente está no funil**; o acervo guarda a conversa. O relatório combina os dois.
- Nível de autonomia da escrita (a decidir): propor e esperar confirmação no self-chat, ou executar e avisar no relatório.

## Não verificado
- Motivo de perda: campo e rota exatos (não localizei no código lido).
- Versões compatíveis entre `krayin/laravel-crm` 2.2 e `krayin/rest-api`.
- Se o Comp AI CRM tem Kanban ou token de API na aplicação (o README não diz).
- Existência e preço de integrações pagas com WhatsApp do ecossistema Krayin (irrelevantes: o Heimdall usa o Baileys).

## Funil do usuário (2026-10-19)
| # | Etapa | Entra quando |
|---|---|---|
| 1 | **Contato iniciado** | o cliente **respondeu** |
| 2 | **1ª Reunião Agendada** | o usuário conseguiu marcar a primeira reunião |
| 3 | **2ª Reunião Agendada** | depois da 1ª reunião, o cliente marcou a segunda, para **apresentação de proposta personalizada** ao cenário e necessidade da indústria/fábrica |
| 4 | **Fechamento / Ganho** | o cliente virou cliente de fato (etapa `won`) |
| 5 | **Perdido / Arquivado** | o usuário não dá mais continuidade (etapa `lost`): (a) **estourou a tentativa de follow-up** (7 sem retorno) ou (b) **objeção clara e irreversível** |

**Objeções irreversíveis** (exemplos do usuário): doença grave na família, falência da fábrica/indústria, total satisfação com o marketing atual. **Todo o resto é objeção contornável**: o usuário tenta converter, e o cliente **não** vai para Perdido.

Alinhamento com as regras anteriores: quem **nunca respondeu** não está no funil (só no acervo, com contagem no semanal); o lead nasce na etapa 1 quando o cliente responde pela primeira vez. Motivos de perda do CRM: `tentativas_esgotadas`, `doenca_grave_familiar`, `falencia`, `satisfeito_com_marketing_atual`, `outro_irreversivel`. Objeções **contornáveis** são registradas como objeção (alimentam o "padrão de objeções" do semanal) sem mudar a etapa.

Gatilhos propostos (o Heimdall detecta, o usuário aprova):
- 1 → 2: surge compromisso do tipo reunião com aquele cliente (primeira).
- 2 → 3: a 1ª reunião ocorreu (data passou ou chegou transcrição) e foi marcada uma segunda.
- → Ganho: o cliente confirma que fecha; sempre proposto.
- → Perdido: 7 tentativas esgotadas (o acervo já marca `desconsiderado` sozinho e para os lembretes; **a mudança no CRM é proposta**) ou objeção irreversível identificada (sempre proposta, pois exige julgamento).

## Autonomia (decisão do usuário: seguir a sugestão)
Fase A: o Heimdall **propõe** cada movimento e **espera o "ok" do usuário**. As propostas vêm **dentro do relatório das 08:00** (sem alertas fora de hora), numeradas, para aprovar com uma resposta curta no self-chat ("ok 1 e 3", "não, o 2 fica"). O usuário também pode ordenar a qualquer momento ("mova a empresa X para ganho"), e isso o Heimdall executa. Fase B (depois de acertar bastante): liberar automático só para o que é determinístico e de baixo risco (criar lead em Contato iniciado; avançar para Reunião Agendada); **Ganho e Perdido continuam sempre com confirmação**.

## Dados
**Começar do zero**, sem importação.

## Dúvida do usuário: "é pesado para um CRM?"
O Krayin declara "Servidor: Apache 2 ou NGINX (com PHP-FPM recomendado); RAM: 3 GB ou mais; PHP 8.3+; Composer 2.5+". A documentação **não diz se os 3 GB são só para instalar ou para rodar**. É normal para um app Laravel com banco próprio, mas é mais do que a necessidade de um único usuário. O custo real deve ser **medido no spike** (memória do Krayin parado e em uso).

## Alternativa enxuta (não descartada)
O nosso modelo de dados já tem clientes, contatos, compromissos e estados. Cinco etapas cabem numa coluna `etapa` com histórico, **sem outra pilha**. Perde-se a tela de Kanban pronta (teria de ser construída e mantida). Comparação:
| | Krayin | Funil próprio |
|---|---|---|
| Tela Kanban | pronta | a construir |
| Pilha extra | PHP + MySQL + servidor web | nenhuma |
| API para o Heimdall | pacote `krayin/rest-api` | interna |
| Manutenção | atualizar o Krayin | manter nosso código |
| Atividades, e-mail, custom fields | prontos | não |

## Decisão pendente
**Krayin ou funil próprio?** (recomendação: Krayin, desde que o spike confirme um consumo aceitável de memória na máquina escolhida; sem o Krayin, o funil próprio cobre a necessidade com menos peças).

## Achados após ler a documentação do Krayin (2026-10-19)
Documentação salva em `docs/krayin/` (portal de desenvolvedores 2.2, guia de usuário, pacote `krayin/rest-api`).
- **Funil:** em Configurações → Pipeline cria-se o funil, com nome, "dias para apodrecer" (*rotten days*) e etapas; a visão Kanban aparece em Leads. Os leads do funil padrão do Krayin precisam ser **substituídos** pelas 5 etapas do usuário; as de ganho e perda devem usar os códigos `won` e `lost`, que o código da API reconhece (`closed_at`).
- **Motivo de perda:** **não é um campo nativo documentado** (nenhuma ocorrência na documentação nem no controlador da API). Opções a testar no spike (E8): atributo personalizado do lead, tag ou nota em atividade. Os motivos definidos (`tentativas_esgotadas`, `doenca_grave_familiar`, `falencia`, `satisfeito_com_marketing_atual`, `outro_irreversivel`) entrariam por um desses caminhos.
- **Webhooks:** o Krayin envia webhooks quando lead, pessoa, organização, produto, cotação ou armazém mudam (Configurações → Webhooks, com URL, cabeçalhos e corpo JSON). Útil para o Heimdall **saber quando o usuário move um cartão à mão** e manter o acervo coerente (sincronização nos dois sentidos).
- **Eventos e workflows:** as escritas pela API disparam os mesmos eventos do painel; há "workflows" automáticos (a avaliar se são necessários).
- **API:** autenticação por `POST /api/admin/login` (token), rotas de leads, pessoas, organizações, atividades, tags, pipelines, origens, tipos e atributos. Pacote exige PHP ^8.2 (Krayin 2.2 pede 8.3+).
- **Importação em massa:** existe (CSV/XLSX), mas o usuário começa do zero.

## Decisão
**Krayin** escolhido pelo usuário em 2026-10-19. O peso (memória parado e em uso) será medido no spike E8.
