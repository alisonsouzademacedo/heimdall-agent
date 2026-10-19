# Fase 1 — Troca de provedor de modelo (versão comercial com chave de API)

Status: **proposta para aprovação** (item 8 do quadro; decisões D7 e D26). Fontes lidas: `docs/hermes-agent/integrations/providers.md` (tabela de provedores, planos de assinatura, provedores de reserva), `docs/hindsight/developer/models.md` (seção de LLM, modelos testados e embeddings), `docs/hindsight/developer/multilingual.md` (inteira), `docs/plano/runbooks/07-logins.md`. O que não está nelas vai marcado **[não verificado]**.

## Resumo
O provedor do modelo é **configuração, não código**. Só duas peças usam modelo de linguagem: o **Hermes** (conversa e relatórios) e o **Hindsight** (extração e memória). O áudio é transcrito localmente (faster-whisper) e o `core` não usa modelo. Trocar de "assinatura do ChatGPT" para "chave de API do cliente" é mexer em dois conjuntos de variáveis, escolhidos num passo do assistente de configuração.

## Os dois modos
| | **A. Assinatura (o seu uso)** | **B. Chave de API (cliente comercial)** |
|---|---|---|
| Hermes | `hermes model` → "ChatGPT or Codex Subscription" (login por código de dispositivo) | uma chave no `.env` do Hermes. Opções documentadas, entre outras: `OPENAI_API_KEY` (provedor `openai-api`), Anthropic (chave de API), `GOOGLE_API_KEY`/`GEMINI_API_KEY` (`gemini`), `OPENROUTER_API_KEY` |
| Hindsight | `HINDSIGHT_API_LLM_PROVIDER=chatgpt` (login `hindsight-admin chatgpt login`) | `HINDSIGHT_API_LLM_PROVIDER` = `openai`, `openai-responses`, `anthropic`, `gemini`... com `HINDSIGHT_API_LLM_API_KEY` e `HINDSIGHT_API_LLM_MODEL` |
| Limite | janela de 5 horas do Plus, compartilhada entre apps | só o limite da conta de API do cliente; **sem** janela de 5 horas |
| Custo | dentro do plano | por token, pago pelo cliente |
| Onde vale | uso próprio, local (documentado para apps de código aberto e locais) | qualquer hospedagem; **é o caminho garantido para vender** (app pago ou hospedado remotamente pede formulário da OpenAI no modo A; `runbooks/07-logins.md`) |

Outros fatos da documentação que pesam na escolha:
- **Assinaturas de outros fornecedores:** Claude Pro **não** funciona no Hermes (só Claude Max com créditos extras comprados); Gemini de consumidor **não** tem caminho, só chave de API. Logo, um cliente com assinatura "comum" do Claude ou do Gemini precisa criar uma chave de API.
- **Requisito do Hindsight:** o modelo precisa aceitar **pelo menos 65.000 tokens de saída** (ou reduzir o limite de extração, com perda de qualidade). Plano gratuito do Groq **não serve** (limite de 8.000 tokens por minuto). Modelos testados pela documentação do Hindsight: OpenAI `gpt-5.2`, `gpt-5`, `gpt-5-mini`, `gpt-5-nano`, `gpt-4.1-mini`, `gpt-4.1-nano`, `gpt-4o-mini`; Anthropic `claude-sonnet-4-20250514`, `claude-3-5-sonnet-20241022`; Gemini `gemini-3.5-flash`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`; Groq `openai/gpt-oss-120b`, `gpt-oss-20b`; Meta `muse-spark-1.3`. Há um quadro de comparação público de modelos (Model Leaderboard) para custo e qualidade.
- **Reserva (opcional):** o Hermes aceita uma lista de provedores de reserva (`fallback_providers`) para quando o principal falha; o Hindsight aceita cadeias de provedores com ordem. Útil para a versão comercial; **não** é necessário no seu uso.
- O Hindsight também aceita **qualquer API compatível com OpenAI** (`HINDSIGHT_API_LLM_BASE_URL`): isso permite **testes automáticos com um servidor falso**, sem gastar nada.

## ⚠️ Achado importante: idioma (vale para os dois modos, e para o seu uso desde já)
Todo o conteúdo do Heimdall está em **português**. A documentação do Hindsight (`multilingual.md`) diz que, por padrão:
- o **modelo de embeddings** (`BAAI/bge-small-en-v1.5`) é **só em inglês**;
- o **reranker** padrão (`cross-encoder/ms-marco-MiniLM-L-6-v2`) é **só em inglês**;
- a busca por palavras (BM25) usa o dicionário **inglês** do PostgreSQL.
Com os padrões, o conteúdo é armazenado certo, mas a **qualidade da busca cai**. Configuração recomendada pela documentação:
- embeddings: `HINDSIGHT_API_EMBEDDINGS_LOCAL_MODEL` = `BAAI/bge-m3` (100+ idiomas, melhor qualidade) **ou** `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (50+ idiomas, mais leve);
- reranker: `HINDSIGHT_API_RERANKER_LOCAL_MODEL` = `BAAI/bge-reranker-v2-m3` (100+ idiomas) **ou** `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` (14 idiomas, mais leve);
- busca por palavras: `HINDSIGHT_API_TEXT_SEARCH_EXTENSION=native` com `HINDSIGHT_API_TEXT_SEARCH_EXTENSION_NATIVE_LANGUAGE=portuguese` (o dicionário `native` cobre português).
**Por que decidir agora:** trocar o modelo de embeddings **depois** exige migrar o banco (exportar e importar em instância nova, `admin-cli.md`); portanto escolhemos **antes da carga inicial**. **Tamanho e consumo de memória** desses modelos não estão na documentação que temos **[não verificado]**; com 8 GB de RAM no seu notebook, o spike deve **medir** a opção leve contra a melhor (qualidade de busca com texto sintético em português × RAM) e escolher.

## Como fica a configuração (proposta)
- Um passo do assistente de configuração (passo 4 do onboarding) pergunta: "assinatura do ChatGPT" ou "chave de API" (e qual fornecedor).
- O sistema grava, **sem nunca imprimir a chave**: no modo B, a chave no `.env` do Hermes e as variáveis `HINDSIGHT_API_LLM_*` no arquivo de ambiente do Hindsight; no modo A, dispara os logins documentados em `runbooks/07-logins.md`.
- Faz uma **chamada de teste mínima** nas duas peças e mostra "ok" ou o erro em português. Se for chave de API, avisa que o teste tem custo (centavos).
- Trocar de modo depois = repetir esse passo. **Embeddings não mudam** quando só o LLM muda (rodam localmente), então a memória existente continua valendo **[observações já derivadas por outro modelo: comportamento não verificado]**.

## Para vender (o que isto exige além da troca)
1. **Uma instalação por cliente** (cada um com o próprio WhatsApp, banco e chave): proposta simples; multi-cliente numa só instalação é projeto à parte.
2. **Custo por cliente:** medir no spike o consumo real por dia (mensagens, áudios, PDFs, relatórios) para estimar o gasto mensal de API. Sem esse número não dá para dizer preço **[não medido]**.
3. **Privacidade:** o conteúdo das conversas dos clientes vai ao fornecedor de modelo escolhido. Os termos do fornecedor e o enquadramento na LGPD precisam ser definidos antes de vender; **não tenho base na documentação do projeto para afirmar nada jurídico**.
4. **Docker Desktop** pode exigir licença paga para empresas maiores (`docs/docker/`); e o fluxo de login por assinatura **não** é usado em venda.
5. A conta e a chave são **do cliente**; o seu `AGENTS.md` já proíbe segredos no git.

## Testes de regressão previstos
Gerar a configuração do modo B nunca grava a chave em log nem no git · modo A e modo B geram variáveis diferentes sem sobrar resíduo do outro · modelo abaixo de 65.000 tokens de saída é recusado ou avisado · o arquivo de ambiente do Hindsight sempre traz os modelos de embeddings e reranker multilíngues e o dicionário `portuguese` (impede voltar ao padrão em inglês sem perceber) · fluxo completo roda contra um servidor falso compatível com OpenAI.

## Pendências
Modelo de linguagem a usar no modo B (decidir com o quadro de comparação e custo medido) · embeddings e reranker (leve × melhor, medido no spike) · uso e consumo reais por dia · termos de privacidade para venda · se a conta do cliente exige alguma configuração de limites.
