# Fase 1 — PDF (markitdown)

Fontes: `docs/markitdown/` (README, pacotes, conversor de PDF), `docs/hermes-agent/user-guide/features/document-extraction.md`, `docs/baileys/messaging/media-messages.md`.

## Escopo (decisão do usuário)
Só **PDF**, e quase sempre **transcrições de reuniões**, que somam ao contexto do cliente. Qualquer outro documento ou imagem fica **de fora** por enquanto; incluir depois que o Heimdall estiver bem alinhado.

## Ferramenta: markitdown (Microsoft)
- Dados da página do GitHub em 2026-10-18: **190,9 mil estrelas**, licença **MIT**, último commit em 04/10/2026. (Versão/data do último release: não consegui ler.)
- Utilitário Python (3.10 a 3.14) que converte arquivos para Markdown para uso com LLMs. Instalação só para PDF: `pip install 'markitdown[pdf]'`. Uso: `markitdown arquivo.pdf -o arquivo.md` ou pela API Python.
- Conversor de PDF embutido usa **pdfminer.six + pdfplumber**: lê a **camada de texto**, com extração de tabelas e de formulários por posição das palavras. Não faz OCR por si só.
- OCR existe só como plugin (`markitdown-ocr`) e funciona por **visão de LLM** com cliente compatível com OpenAI (`llm_client`). Fora do escopo agora.
- Há também servidor MCP (`markitdown-mcp`), que pode servir ao Hermes depois.
- **Serve para o caso:** transcrição de reunião exportada de Meet/Zoom/Teams/Otter/Fireflies costuma ter camada de texto, então o conversor embutido deve bastar. A qualidade com **falas por interlocutor e marcas de tempo** não está documentada: precisa de teste com PDFs reais.

## Segurança (do README do markitdown)
"Não passe entrada não confiável diretamente ao MarkItDown": ele faz I/O com os privilégios do processo e o `convert()` aceita arquivos locais, URIs e streams. Como os PDFs vêm de terceiros pelo WhatsApp:
1. Chamar só a função mais estreita (`convert_local()` ou `convert_stream()`), **nunca** `convert()` com caminho ou URL vindos da mensagem.
2. Salvar o PDF com nome gerado por nós (hash), não o nome do remetente.
3. Limites: tamanho máximo, número de páginas, tempo máximo; processo separado e sem rede.
4. O texto do PDF é **dado, não instrução**: pode conter tentativa de injeção de prompt. O blast radius é pequeno porque o agente só envia ao self-chat, mas o texto deve entrar no contexto como conteúdo citado.

## Fluxo proposto
1. Baileys recebe mensagem de documento; só `application/pdf` segue, o resto é ignorado (registrar só que existiu).
2. Baixar **na chegada** (`downloadMediaMessage` com `reuploadRequest`) e guardar o original em `data/` com nome por hash; deduplicar por hash.
3. Converter com markitdown em processo isolado; salvar `.md` ao lado do original.
4. **Verificação de texto:** se a conversão sair vazia ou com quase nenhum texto (PDF escaneado), marcar `sem_texto` e avisar no relatório; sem OCR na v1.
5. Associar ao **contato/conversa** de origem e à data; registrar remetente, quem enviou (usuário ou cliente) e nome original do arquivo como metadado.
6. Destilar para o dossiê do cliente (camada 2): decisões, objeções, próximos passos, prazos, valores, quem participou; reter no Hindsight com data da reunião quando constar.

## Riscos
- Transcrição longa: pode passar do que cabe numa única extração do LLM; dividir por trechos e consolidar.
- Falas sem rótulo de quem falou perdem sentido comercial: testar.
- PDF protegido por senha ou corrompido: falha esperada, registrar e seguir.
- Mesmo PDF reenviado várias vezes: deduplicação por hash.

## Respostas do usuário (2026-10-18)
- Sem PDFs de amostra agora: usar exemplos na configuração, no teste.
- Origem: reuniões **sempre pelo Google Meet**.
- A data da reunião "se não me engano aparece" no PDF; se não aparecer, não é problema.
- **O Heimdall já sabe da reunião**, porque o usuário a marca com o cliente pelo próprio WhatsApp. Ao ler a transcrição, ele deve correlacionar com o cliente e o compromisso combinado, e integrar ao contexto do cliente, ao contexto geral e ao aprendizado do próprio agente.

## Consequência: compromissos como entidade
Para correlacionar, o pipeline precisa extrair das conversas os **compromissos** (reunião marcada, retorno prometido, proposta a enviar) e mantê-los num registro próprio: cliente, data e hora, assunto, estado (`marcado → ocorreu → transcrição recebida → follow-up feito`). Isso serve também ao relatório diário (reuniões do dia; reunião que ocorreu e ainda não tem transcrição; follow-ups atrasados).

## Como correlacionar a transcrição (da evidência mais forte para a mais fraca)
1. **Conversa de origem:** se o PDF chegou dentro do chat do cliente.
2. **Compromisso aberto:** reunião marcada para a data do PDF (ou próxima dela) com um cliente específico.
3. **Conteúdo:** nome dos participantes, empresa, assunto citados na transcrição contra os contatos conhecidos.
4. **Pergunta no self-chat:** abaixo de um limiar de confiança, o Heimdall pergunta ao usuário em vez de adivinhar. Como o self-chat já é o canal de conversa, perguntar custa pouco.
Cada correlação guarda o motivo e a confiança, para ser corrigida pelo usuário e aprendida.

## Aprendizado do agente
Correções do usuário ("essa transcrição é da empresa X") viram memória e skills do Hermes; os acertos e erros de correlação alimentam a melhoria do próprio Heimdall. Precisa de um mecanismo de registro de correções (a definir na fase de aprendizado).

## Incertezas
- O formato real do PDF de transcrição do Meet (título, data, participantes, rótulos de fala) **não foi verificado**; depende dos exemplos do teste.
- Se a data aparece no PDF: o usuário acha que sim.

## Pendências
- **Como o PDF chega ao WhatsApp?** Dentro do chat do cliente, ou o usuário o envia ao self-chat (ou a outro lugar)? Define o peso da correlação por conversa de origem.
- Tamanho típico (páginas) para definir os limites.
