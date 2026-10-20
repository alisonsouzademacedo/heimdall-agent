# Fase 1 — MCP (como o Hermes consulta o acervo)

Fontes: `docs/hermes-agent/user-guide/features/mcp.md`, `docs/hindsight/developer/mcp-server.md`, `docs/markitdown/packages/markitdown-mcp_README.md`.

## O que é
MCP (Model Context Protocol) é um **padrão para um agente usar ferramentas e dados que ficam fora dele**. O Hermes conecta a "servidores MCP", descobre as ferramentas que cada um oferece e passa a chamá-las como se fossem dele. No Hermes, basta declarar o servidor em `~/.hermes/config.yaml` (`mcp_servers:`); há servidores locais (processo na mesma máquina) e remotos (HTTP), e filtro por servidor (`tools.include` / `tools.exclude`) para expor só as ferramentas desejadas.

## Por que precisamos
O Hermes **não tem o acervo** (conversas, áudios, PDFs, compromissos) na cabeça: a memória nativa dele tem 2.200 caracteres. Para escrever o relatório ou responder "o que combinei com o cliente X?", ele precisa **perguntar ao acervo**. O MCP é a porta controlada para isso.

## Duas peças, dois papéis
1. **MCP do Hindsight** (já existe, na documentação): busca por significado e memória de longo prazo. Ferramentas principais: `retain` (guardar), `recall` (buscar), `reflect` (análise), modelos mentais e diretivas. Modo **banco único** recomendado (27 ferramentas, isolado por banco) e as de leitura vêm marcadas como somente leitura. É o "o que sabemos sobre o cliente X?".
2. **MCP do Heimdall (nosso)**: fatos exatos e regras. Responde "quais clientes estão com follow-up devido hoje?" ou "quem aguarda resposta minha?". **Não deve ser deixado ao modelo**: contar 7 tentativas, 2 dias úteis e resetar a cada resposta é cálculo; feito em código dá o mesmo resultado sempre. O modelo só **redige** o relatório a partir de fatos prontos.

## Ferramentas propostas do MCP do Heimdall (rascunho)
Somente leitura, exceto a última:
- `clientes_aguardando_usuario()` · `followups_devidos(data)` · `compromissos_do_dia(data)` · `compromissos_atrasados()` · `clientes_com_potencial()`
- `cliente(id)` (dossiê, estado, contagem de tentativas, últimos eventos) · `buscar_conversas(cliente, periodo)` · `reunioes_sem_transcricao()`
- `dados_do_relatorio(tipo, data)`: pacote já calculado (janelas de tempo e regras aplicadas) para o relatório diário ou semanal
- `registrar_feedback(texto, referencia)`: a **única escrita**; guarda correções do usuário ("esse cliente não é prioridade") para o aprendizado

## Salvaguardas
- Nenhuma ferramenta envia mensagem. O envio ao self-chat fica no listener (ponte Q).
- Nenhuma ferramenta apaga dados. O MCP do Hindsight tem ferramentas de apagar/criar banco: filtrar com `tools.exclude` no Hermes.
- Conteúdo de conversas e PDFs devolvido pelas ferramentas é **dado**, não instrução.

## Alternativas descartadas por ora
- Hermes lendo arquivos e o SQLite direto (`read_file`/terminal): poderia alterar ou apagar dados e recalcularia regras de forma inconsistente.
- Só o Hindsight, sem MCP próprio: regras de contagem e prazo dependeriam do modelo.

## Pendências
- Linguagem do servidor MCP (Python ou TypeScript) — decidir junto com o listener.
- Se `dados_do_relatorio` fica no MCP ou em um passo anterior ao cron (o cron já receberia o pacote pronto no prompt).

## Decisão de 2026-10-20: servidor MCP próprio adiado
- **Motivo técnico (verificado):** o Hermes roda em contêiner e só enxerga serviços da rede do Compose. Um servidor MCP do Heimdall no computador (Node, lendo o SQLite) escutaria em `127.0.0.1`, que o contêiner **não alcança** no Linux/VPS; para alcançar seria preciso abrir a porta para a rede do Docker, o que quebra a regra "portas só em 127.0.0.1". No Docker Desktop do Windows o alcance via `host.docker.internal` não foi testado.
- **Solução adotada por ora:** os fatos exatos (estados, contagens, prazos) são calculados pelo `core` e entregues ao Hermes **dentro do pedido**, como dados (`apps/ponte/src/agenda.ts` para os relatórios e `selfchat.ts` para o self-chat, que injeta o pacote do dia). O Hermes não recebe ferramenta nenhuma além de `memory`, `session_search` e o MCP do **Hindsight só com `recall` e `reflect`** (lista branca testada em `tests/infra/smoke_hermes.sh`).
- **Quando retomar:** se precisarmos de consultas livres ao acervo ("o que combinei com o cliente X?"), o caminho é um serviço do Compose com **cópia somente leitura** do acervo ou uma ponte HTTP na rede interna com chave; decidir com o dono. O contrato das ferramentas continua em `apps/core/src/mcp-contrato.ts`.
