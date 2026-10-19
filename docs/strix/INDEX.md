# Strix (documentação)

> **Não adotado por ora** (cobra por uso, decisão do dono em 2026-10-19). A biblioteca fica como referência.

Fonte: https://docs.strix.ai/ e https://github.com/usestrix/strix. Páginas obtidas em 2026-10-19 a partir de `https://docs.strix.ai/llms.txt` (30 páginas); lista em `_lista.txt`.

## Como foram obtidas (e uma lição)
Primeiro pelo Firecrawl (`onlyMainContent`). **Esse caminho perdeu informação**: os nomes das opções (`--target`, `--scan-mode`...) vivem em componentes `<ParamField>` do Mintlify e sumiram do texto, e vários títulos vieram com `\#` e `\>`. As páginas finais são o **Markdown original servido pelo próprio site** (basta acrescentar `.md` ao endereço), com a origem na primeira linha. Teste: `tests/docs/check_docs.sh`. Registro em `docs/plano/LICOES.md`.

**Nome de arquivo:** a página inicial do site (`index.md` na origem) está salva como `introducao.md`, porque `index.md` e este `INDEX.md` colidem no Windows (nomes só diferentes por maiúscula viram um arquivo só). Teste: `tests/repo/check_higiene.sh`.

## O que o Strix é (resumo do que as páginas dizem)
Agentes de IA "hackers" de código aberto que rodam o seu código ou aplicação num **contêiner Docker isolado** (baseado em Kali Linux), tentam explorar falhas de verdade e **validam com prova de conceito**. Cobrem controle de acesso, injeção, SSRF, XSS, lógica de negócio, autenticação e infraestrutura (`index.md`, `tools/sandbox.md`).

## O que ele exige (importante para nós)
- **Docker rodando** e **uma chave de API de modelo** (formato LiteLLM, `STRIX_LLM` e `LLM_API_KEY`) — `quickstart.md`, `advanced/configuration.md`. Não há, nas páginas lidas, login por assinatura do ChatGPT: **tem custo por token**. Há `--max-budget` para travar o gasto (`usage/cli.md`).
- **Modelos locais** são possíveis (Ollama), mas a própria documentação avisa que os menores de 70B têm dificuldade com agentes (`llm-providers/local.md`): inviável no notebook de 8 GB.
- Um diretório local usado como alvo é montado **gravável** no ambiente; "o agente edita seus arquivos reais" (`usage/cli.md`). **Por isso só rodamos contra uma cópia.**
- **Telemetria ligada por padrão** (`STRIX_TELEMETRY`, `advanced/configuration.md`). Desligamos com `STRIX_TELEMETRY=0`.
- Existe a versão **gerenciada na nuvem** (app.strix.ai), que envia o código para o serviço deles (`cloud/overview.md`). **Não usamos** sem decisão do dono.
- Aviso oficial: **só testar o que é seu ou tem permissão** (`index.md`).

## Como usamos
Ver `docs/plano/fase-1-testes-de-seguranca-strix.md`.

## Páginas
`index`, `quickstart`, `usage/{cli,scan-modes,instructions,viewer}`, `advanced/{configuration,skills}`, `llm-providers/*`, `tools/{overview,sandbox,browser,proxy,terminal}`, `integrations/{ci-cd,github-actions,coding-agents,mcp}`, `cloud/{overview,cli}`, `contributing`.
