# Fase 2 — CRM e Kanban

Status: **avaliação de candidatos** (dados de 2026-10-19). Fontes: páginas do GitHub lidas pelo Firecrawl; `https://devdocs.krayincrm.com/llms.txt` e `llms-full.txt`; código de `krayin/rest-api`; README de `trycompai/crm`.

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

## Decisões pendentes
1. Confirmar o Krayin.
2. Autonomia da escrita no CRM (propor primeiro ou executar e avisar).
3. Etapas do funil (você já usa quais? Krayin permite criar as suas).
4. Já existem clientes/negócios em algum CRM ou planilha para importar?
