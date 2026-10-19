# Calibração da personalidade (proposta para aprovação)

Fontes: `docs/hermes-agent/user-guide/features/personality.md` e `docs/hermes-agent/developer-guide/prompt-assembly.md`. Decisão base: D29 (`fase-1-personalidade-e-prompts.md`).

## O que a documentação do Hermes diz (fatos)
- `SOUL.md` é a **identidade**, primeiro item do prompt; fica em `HERMES_HOME` (no nosso Docker, `/opt/data/SOUL.md`), nunca na pasta de trabalho. Hermes cria um padrão se não houver e **nunca sobrescreve** um existente.
- O conteúdo entra **sem moldura**, depois de verificação contra injeção de prompt e corte por tamanho. Deve ter voz e identidade, não regras de projeto (essas vão em `AGENTS.md`).
- Se estiver vazio ou ilegível, Hermes usa a identidade padrão dele (**sem** os nossos limites). Por isso os limites também ficam no código (trava de envio ao self-chat), nunca só no texto.
- `/personality` é um ajuste temporário por sessão; não usaremos.
- **Armadilha:** Hermes também carrega `AGENTS.md`/`CLAUDE.md` da pasta onde roda. O `AGENTS.md` deste repositório é para as IAs que constroem o projeto, não para o Heimdall em operação: a pasta de trabalho do Hermes em produção **não pode ser a raiz deste repositório** (a confirmar no spike).

## Peças
| Arquivo | Onde | Quem edita |
|---|---|---|
| `prompts/SOUL.md` | repositório | nós (bloco fixo de limites + estilo mínimo) |
| `data/perfil-de-voz.md` | fora do git | Heimdall (a partir das mensagens `de_mim`) |
| `/opt/data/SOUL.md` | volume do Hermes | **montado por código** = bloco fixo + bloco adaptativo aprovado |
| `data/soul-versoes/AAAA-MM-DD-vN.md` | fora do git | código guarda cada versão aprovada |

**O bloco fixo (limites) nunca passa pela adaptação:** o código monta o `SOUL.md` vivo juntando o bloco fixo do repositório com o bloco adaptativo aprovado. Mesmo que o modelo proponha mudar um limite, o código descarta.

## Quando roda
1. **Primeira calibração:** quando a carga inicial terminar (ou tiver processado ao menos os últimos 60 dias de conversa) e houver volume de mensagens do dono suficiente. Número mínimo: **a definir no spike** (não sei o suficiente ainda).
2. **Revisões:** no máximo **uma proposta por mês**, e só se o perfil de voz mudou de forma relevante. Também sob comando do dono ("recalibra a personalidade").

## O que o dono vê (uma mensagem no self-chat)
1. **Perfil de voz em 5 a 8 linhas:** tom, formalidade, jeito de abrir e fechar, expressões frequentes, tamanho típico das mensagens, diferença entre cliente, gestor e colega.
2. **Três exemplos antes/depois** do jeito do Heimdall escrever (um trecho de relatório, uma resposta no self-chat, um rascunho de resposta a cliente).
3. **O bloco adaptativo proposto** (curto).
4. Comandos aceitos: `aprovar` · `ajustar: <o que mudar>` · `recusar` · `voltar versão` (restaura a anterior).

## Regras
- Nada muda sem `aprovar` do dono no self-chat. Sem resposta = continua a versão atual.
- O perfil de voz é feito **só com mensagens do dono**; não copia trechos de clientes nem dados deles. Citações curtas de expressões do dono são permitidas.
- A voz aprendida serve a dois usos: (a) como o Heimdall fala com o dono; (b) **rascunhos** de resposta a clientes no jeito do dono (decisão de 2026-10-20). O uso (b) nunca vira envio.
- Cada versão aprovada é guardada e reversível. Registrar quem aprovou e quando.

## Teste de aceitação (spike)
Dado um acervo sintético com mensagens do dono em estilo conhecido, o perfil gerado cita traços que existem no acervo e **nenhum** que não existe; o `SOUL.md` montado sempre contém o bloco fixo intacto, mesmo se a proposta tentar removê-lo (teste automático de regressão quando houver código).
