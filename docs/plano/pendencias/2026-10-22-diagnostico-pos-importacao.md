# Diagnóstico depois de importar o acervo do Windows (2026-10-22)

Escrito para o dono (linguagem simples) e para a próxima IA. **[V]** = verificado (código lido, teste rodado ou comando executado nesta VPS); **[NV]** = não verificado (só o WhatsApp real, o login do ChatGPT ou o uso mostram). Só números e fatos: nenhum conteúdo de conversa.

## 1. O que chegou do Windows (contagens do acervo importado) [V]
- 6.526 mensagens (25/03/2026 a 21/10/2026): 6.488 vieram do histórico do WhatsApp, 36 em tempo real, 2 de reenvio. Nenhum id repetido na mesma conversa.
- 662 conversas: 658 diretas, 3 grupos, 1 self-chat. 677 contatos.
- Mídias: 634 áudios e 22 PDFs. Dos 656 downloads, **134 foram baixados e transcritos** e **522 foram abandonados** (arquivo expirado no WhatsApp).
- Busca antiga de histórico: 29 pedidos feitos, **todas as 29 respostas vieram vazias**; a trava `historico.antigo` está **liberada** (`liberado: true`); 660 conversas pendentes, 1 em andamento.
- Equipe interna: 11 pessoas cadastradas (papel `interno`). Os outros 666 contatos estão como `desconhecido`. **Clientes cadastrados: 0** (ver seção 4, lacuna 1).
- Migração: o acervo já estava na versão 14 do banco. Provado sobre uma **cópia**: voltando para a 13 e migrando de novo, só mudaram `crm_leads`, `crm_propostas` e a versão; rodar a migração 3 vezes não muda nada; integridade `ok`; 0 violações de chave estrangeira; as 6.526 mensagens continuam.

## 2. O que acontece no primeiro QR (carga incremental)
**Pergunta do dono: "ao ligar o WhatsApp, puxa só o novo ou tudo de novo?"**

**Resposta curta:** o Heimdall **nunca guarda duas vezes** a mesma mensagem, não importa quantas vezes o WhatsApp a reenvie. Se o WhatsApp mandar o histórico inteiro de novo, o custo é só tempo de gravação (centenas de mensagens por segundo); nada duplica e nada do que já foi feito (transcrição, memória, relatórios) volta atrás.

- **O WhatsApp reenvia o histórico num aparelho novo?** [NV] A documentação (`docs/baileys/advanced/history-sync.md`, `faq.md`) diz que o histórico chega pelo evento `messaging-history.set` "depois que a conexão abre", do mais novo para o mais antigo, e **não diz** que o WhatsApp saiba o que o programa já tem. Um QR novo registra um aparelho novo; o esperado é uma sincronização inicial nova, mas só o QR real confirma, e o que o celular decide mandar também varia. Na primeira vez (Windows) chegaram 6.488 mensagens.
- **Duplicar? Não [V].** Regra do banco: `UNIQUE (conversa_id, wa_msg_id)` + `INSERT OR IGNORE` (`apps/core/src/db.ts`, `ingestao.ts`). Uma mensagem repetida devolve "duplicada" e a escuta **para ali**: não enfileira download, não reabre tarefa (`apps/core/src/whatsapp/escuta.ts`).
- **Teste novo (falha se o reenvio duplicar): `tests/carga/reentrega-apos-troca-de-aparelho.test.ts`** [V], com dados sintéticos. Parte de um acervo "já usado" (áudios transcritos, mídias abandonadas, busca antiga andando, memória enviada) e reenvia o histórico inteiro **embaralhado, em outros lotes, uma parte como `append`, parte com os ids na forma LID e com outro índice de dispositivo do dono**. Exige: nenhuma mensagem nova, nenhuma tarefa nova ou reaberta, texto transcrito intacto, mídia abandonada continua abandonada, busca antiga e memória intactas, o self-chat continua sendo **uma** conversa, e uma mensagem realmente nova entra **uma vez só** (com uma tarefa de download). Três quebras propositais (parar de ligar o apelido LID ao contato; `INSERT OR REPLACE`; duplicada reabrindo tarefa) foram todas detectadas.
- **Efeito colateral bom:** o reenvio em LID **ensina** ao banco o apelido LID de cada contato (linhas novas em `contato_jids` apontando para o mesmo contato; nenhum contato nem conversa novos).
- **Cursor / "trava" da busca antiga [V]:** o ponto de partida de cada pedido é calculado do **próprio acervo** (a mensagem mais antiga de cada conversa, `apps/core/src/historico-antigo.ts`), e o estado fica em `historico_pedidos`. Por isso tudo isso **vale depois da troca de aparelho**. O pedido é uma mensagem "peer" para o próprio celular do dono (nunca para contato).
- **Atenção, decisão do dono:** como a trava está **liberada**, assim que o WhatsApp conectar a busca antiga recomeça sozinha, a ~1 pedido a cada 105 s (45 s de espera + 60 s de pausa): a primeira volta nas 660 conversas leva ~19 h. No Windows as 29 respostas vieram **vazias** e o risco de o WhatsApp limitar a conta com esse ritmo **não foi medido**. Recomendação: **pausar a busca antiga no passo "Sincronizar" da tela antes de ler o QR** e só liberar depois que a sincronização inicial terminar e o dono quiser testar.
- **Mídia antiga e já transcrita [V]:** as 134 transcrições ficam (o texto está na mensagem; reenviar não mexe). As 522 abandonadas **não voltam** sozinhas (`hash_abandono`). Mídia com mais de ~30 dias costuma não existir mais no WhatsApp [NV: é o que mostram os 522 abandonos, não uma regra documentada]. Possibilidade futura (não feita): pedir ao celular o reenvio das abandonadas depois do QR novo, com o OK do dono.
- **Fragilidade encontrada (registrada, a corrigir):** a detecção do self-chat olha só o `remoteJid` e ignora o `remoteJidAlt`. Funciona porque o Baileys informa o LID do dono em `creds.me.lid`; se faltasse, o self-chat em forma LID viraria uma conversa de cliente falsa. Correção de uma linha, com teste, na lista da seção 7.

**O que dizer ao dono sobre o primeiro QR:** (1) pode chegar muita coisa de uma vez (milhares de mensagens, minutos); (2) nada se duplica; (3) o que já foi transcrito e guardado continua; (4) a busca antiga está ligada: pause antes; (5) o celular mostra "sincronizando"; é normal.

## 3. Hindsight, LLM e custo (recomendação: uma opção)

### (a) O que o Hindsight faz COM e SEM modelo de linguagem [V: `docs/hindsight/developer/{retain,retrieval,reflect,mental-models,configuration,models}.md`]
- **Sem modelo (hoje, `HINDSIGHT_API_LLM_PROVIDER=none`):** o `retain` guarda cada conversa-dia **em pedaços, como estão** (modo `chunks`, sem nenhuma chamada ao modelo); gera só os vetores de significado (modelo multilíngue `multilingual-e5-small`, local). O `recall` funciona normal: busca por significado + palavras (dicionário português) + grafo + tempo. **Não há** fatos extraídos, entidades, observações, nem `reflect` (devolve erro HTTP 400).
- **Com modelo:** o `retain` extrai fatos ("o que, quando, quem, por quê"), reconhece pessoas e empresas e junta as variações do mesmo nome (entidades), liga fatos por causa e tempo; a **consolidação** em segundo plano cria "observações" (crenças duráveis que se atualizam com evidências); o `reflect` raciocina sobre isso e cita fontes; "mental models" são páginas-resumo que se reescrevem sozinhas.

### (b) Quem chama modelo no Heimdall (confirmado no código) [V]
O Heimdall só fala com o modelo **pelo Hermes** (login do ChatGPT Plus), no processo **ponte** (`apps/ponte/src/iniciar.ts`): (1) conversa livre no self-chat; (2) redação do relatório diário/semanal (se falhar, sai o texto montado por código); (3) extração de compromissos e sinais, **um pedido por conversa-dia de cliente**, e só com a trava `extracao.liberada` aberta pelo dono. O processo **memória** só fala com o Hindsight por HTTP (guardar). Dentro do Hindsight, o modelo entra na extração de fatos, na consolidação e no `reflect`.

### (c) Ligar o modelo no Hindsight muda a qualidade do que o Heimdall entrega? [V + análise]
- **Relatórios, acompanhamento e CRM não dependem do Hindsight**: nenhum código do Heimdall chama `recall`, e os dados vêm do banco por código. O Hermes *poderia* consultar o `recall` ao redigir o relatório (a skill `relatorio-diario` manda fazer isso), mas essa skill **não está instalada** (lacuna 2). Ligar o modelo no Hindsight **não muda** esses entregáveis hoje.
- Só muda a **pergunta livre no self-chat** ("o que combinei com X?"): hoje o Hermes recebe o resumo do dia calculado por código e pode consultar o Hindsight (`recall`/`reflect` pelo MCP). Sem modelo no Hindsight, o `recall` devolve os trechos de conversa originais mais parecidos com a pergunta (o Hermes lê e responde); com modelo, devolve fatos e observações já organizados por pessoa/empresa e tempo, melhor para perguntas que cruzam várias conversas.
- **Atenção:** o `reflect` está na lista de ferramentas liberadas do Hermes, mas com `provider=none` ele dá erro 400 (o modelo pode tentar e falhar). Sugestão (não feita): tirar `reflect` da lista enquanto não houver modelo no Hindsight.
- O Hermes **não tem acesso ao acervo** (arquivos e terminal desligados de propósito; o MCP próprio do Heimdall não existe), então o Hindsight é hoje o **único** caminho dele até as conversas antigas.

### (d) Custo e limite [estimativas; V nos números do acervo e do plano]
- Acervo a guardar: **1.062 documentos** (conversa × dia fechado; 1.012 diretas + 50 de grupos), ~**661 mil caracteres** → ~**1.114 pedaços** de 3.000 caracteres (padrão do Hindsight).
- Com modelo no Hindsight: ~1.114 chamadas de extração (~17 fatos por pedaço → ~19 mil fatos) + consolidação em lotes de 8 fatos → ~2.400 chamadas, **≈ 3.500 chamadas**, várias grandes (a consolidação inclui fatos de apoio).
- Hermes (extração de compromissos): hoje **0** (não há clientes cadastrados). Se as 658 conversas diretas virassem clientes: até ~1.012 chamadas (uma por conversa-dia). Mais relatórios e conversas.
- **Limite do ChatGPT Plus** (`docs/openai-codex/docs/pricing.md`): estimativa de **350 a 3.000 mensagens locais por janela de 5 horas** no GPT-6 Luna (não é limite fixo; depende do tamanho; "weekly limits may also apply"), **compartilhada** com todos os apps do plano (`siwc/..._profiles-and-sessions.md`). 3.500 chamadas grandes só do Hindsight ≈ de 1 a 10 janelas de 5 h (6 a 50 h) **se nada mais usar o plano**, e competindo com o Hermes. O Hindsight adia o trabalho e tenta de novo 30 min depois quando bate no limite (não falha), mas **o dono ficaria sem o Hermes durante a carga** [NV: o consumo real só se mede com 20 documentos de teste].

### (e) Atualizar o Hindsight 1.0.0 → 1.1.0 [V: notas da versão pelo Firecrawl; imagem `1.1.0-slim` existe no registro]
- O provedor `chatgpt` (e o comando `hindsight-admin chatgpt login`) **só existem a partir da 1.1.0** (publicada em 21/10/2026, PR #5688). Na 1.0.0 só existe `openai-codex` (usa o `auth.json` do Codex CLI; a própria documentação o marca "somente uso pessoal de desenvolvimento").
- A 1.1.0 também traz reranker ONNX, respeito a limite de CPU/threads e correções de migração. Não há seção de "mudanças que quebram" nas notas [V]; **se a migração do banco é compatível com o volume da 1.0.0 não foi verificado [NV]**.
- Riscos e cuidados: **backup antes** (`hindsight-admin backup` existe na 1.0.0 [V] + cópia do volume com os serviços parados); o volume `heimdall_pg_data` e o cache do modelo de embeddings `heimdall_hindsight_modelos` ficam (mesmo modelo = mesmos vetores, sem reindexar); a imagem do projeto (`infra/hindsight/Dockerfile`) fixa `transformers 5.15.1` e `safetensors 0.8.0` para a 1.0.0 e precisa ser reconstruída e retestada com `tests/infra/smoke_hindsight.sh` (a 1.1.0 pode pedir outras versões); trocar de volta = restaurar o backup.

### Recomendação (uma só)
**Manter o Hindsight SEM modelo por enquanto.** Motivos: (1) relatórios, acompanhamento e CRM não dependem dele; (2) a cota do Plus é pequena e compartilhada e o Hermes precisa dela para o self-chat, relatórios e extração; (3) sem modelo a memória já funciona para "o que combinei com X?" (trechos originais) a custo zero; (4) não há risco de migração agora; (5) é **provavelmente reversível**: a documentação (`retain.md`) descreve `POST /v1/default/banks/{bank_id}/documents/{document_id}/reprocess`, que re-extrai o texto já guardado, então ligar o modelo mais tarde deve enriquecer o que já foi guardado **[NV: não testei o reprocessamento de um documento guardado em modo `chunks`]**. **Reavaliar em 1 a 2 semanas de uso real**: se as respostas livres ficarem fracas, atualizar para a 1.1.0 (com backup e teste), ligar o `chatgpt` com concorrência baixa e começar pelos últimos 60 dias, medindo a cota nos primeiros 20 documentos. Nada foi atualizado nem ligado.

## 4. O que o Heimdall FAZ sozinho depois de absorver tudo, e o que NÃO faz

**Faz sozinho [V no código/testes]:**
- Guarda texto; transcreve áudio (Whisper) e converte PDF (markitdown); manda tudo à memória (Hindsight).
- Calcula por código o acompanhamento de cada **cliente** (7 tentativas, 2 dias úteis, zera ao responder, quem nunca respondeu fica de fora, "aguardando você" no topo) e monta os relatórios diário (ter–sex 08:00) e semanal (seg).
- Com a trava de extração aberta e o Hermes logado: extrai **compromissos, sinais de potencial e dúvidas** de cada conversa-dia **de cliente** (só aceita a saída do modelo depois de validar por código).
- Propõe (C1–C5, no máximo 5 por dia) mover leads no CRM; o dono aprova no self-chat.
- Aprende com as **suas correções** no self-chat (`A1`, `F2`, `P1`): ajusta aquele cliente por código; com 3 casos parecidos em 30 dias **propõe** mudar um critério e só aplica com aprovação; guarda versões e dá para desfazer (`apps/core/src/aprendizado.ts`).

**NÃO faz:** envia mensagem a qualquer pessoa além do self-chat; apaga ou move lead sozinho; marca **ganho** (não existe sinal para isso); decide "objeção irreversível"; muda regra que você fixou sem ordem sua; usa texto de cliente como instrução.

### Lacunas do ciclo "absorver → entender cada cliente → propor no CRM → aprender com as respostas"
1. **[Crítica] Ninguém cria os clientes.** Nenhum código de produção insere em `clientes` nem liga `contatos.cliente_id` (só testes e o cadastro da equipe interna). Hoje: 677 contatos, **0 clientes**. Efeito: o relatório diário sai sem clientes ("nenhum cliente aguardando"), a extração por modelo não roda (ela só olha contato ligado a cliente), o CRM não propõe nada. Falta o passo de **classificar os contatos** (cliente × fornecedor × interno × pessoal, a "inferência com cadastro prioritário" da D13) e **criar o cliente por empresa** (`fase-1-modelo-de-dados.md`).
2. O Hermes roda com o **`SOUL.md` padrão dele** ("You are Hermes Agent…", 668 bytes), não o do Heimdall (`prompts/SOUL.md`, 1.351 bytes), e **as 6 skills do Heimdall não estão instaladas** no volume do Hermes. Falta o passo que copia `SOUL.md` e `prompts/skills/` para `/opt/data` (o `config-hermes` só grava o `config.yaml`).
3. **Não existe o MCP próprio do Heimdall** (só o contrato em `mcp-contrato.ts`): o Hermes não consegue consultar o acervo (`cliente`, `buscar_conversas`…). As skills citam essas ferramentas e hoje não funcionam; o **perfil de voz** (skill `calibrar-personalidade`, que lê as mensagens do dono e grava `data/perfil-de-voz.md`) **não roda** por isso.
4. Dossiês por cliente (`data/dossies/`) e o aprendizado pelo **resultado das recomendações** (tabela `recomendacoes`) estão no plano, mas **não existem** no código.
5. CRM: ganho sem sinal; perdido só por 7 tentativas; o **motivo da perda não é enviado ao Krayin** (`moverEtapa` não manda `lost_reason`, e a rota de mover etapa o ignora: precisa de `PUT /leads/{id}` com `status: 0`); mover um cartão à mão no Krayin não atualiza o Heimdall.
6. Cota do Plus, velocidade do Whisper (~5× o tempo real) e disco apertado (31 GB) limitam o ritmo.

## 5. "Joga tudo pro CRM": a diferença e uma proposta (NÃO implementada)
Pela D32 o CRM é **Fase A**: o Heimdall **propõe**, o dono **aprova** no self-chat; nada é criado ou movido sozinho; ganho e perdido sempre exigem confirmação. O limite é **5 propostas por dia** (`MAX_PROPOSTAS`), só para cliente que **já respondeu**. Das 658 conversas diretas: **258 têm ida e volta** (candidatas), 313 nunca responderam (fora, por regra) e 80 tiveram atividade nos últimos 30 dias. Com 5 por dia, os 258 levariam ~52 dias.

**Proposta de "carga inicial em lote" com uma aprovação (só desenho):**
- Depois de classificar os contatos (lacuna 1), o Heimdall monta **uma lista única** dos clientes que responderam, todos propostos em **"Contato iniciado"** (nunca ganho, nunca perdido), e envia ao self-chat em páginas de ~20 (uma mensagem não comporta 258 itens; envio de `.md` anexo ainda não foi verificado).
- Aprovação: `ok lote` (tudo) ou `ok lote menos 3 7 12`; recusas ficam registradas e não voltam.
- Mantém as travas: vínculo `crm_leads` impede lead duplicado; idempotente (rodar de novo não repete); tem teto por dia configurável (ex.: 30/dia) e pode ser pausado; só self-chat aprova; registra tudo.
- **Riscos:** classificar errado polui o CRM (fornecedor, colega e conversa pessoal virando lead); empresa com vários contatos vira vários leads se o agrupamento por empresa falhar; 258 leads de uma vez mudam o Kanban do dono de um dia para o outro; sem o motivo de perda e sem sinal de ganho o funil nasce "raso"; exige decisão nova do dono (uma **D33**) e testes de contrato antes.
- Recomendação: **não liberar antes** de a classificação existir e de o dono revisar uma amostra; começar pelos 80 com atividade nos últimos 30 dias.

## 6. Disco (31 GB livres de 77 GB) — plano seguro, sem `prune` geral
Medido: imagens 16,9 GB (Hermes 4,55; Krayin derivado 3,3; Hindsight 2,08; áudio 1,87; MySQL 1,1; pgvector 0,64); **cache de construção 7,8 GB** (63 entradas, nenhuma ativa; compartilhado com os outros projetos do servidor); volumes 0,8 GB; `data/` ocupa pouco. Plano: (1) **não** usar `docker system/image/builder prune` sem filtro; (2) o cache de construção é o único candidato grande: ver na documentação (`docs/docker/reference/cli/docker/builder/prune.md`) um filtro que atinja só o cache dos nossos builds; sem isso, pedir decisão ao dono; (3) a imagem base `webkul/krayin:2.2.0` (3,14 GB) e a derivada dividem camadas: não remover; (4) acompanhar o crescimento de `data/` (mídias e banco) depois da carga; (5) proposta: alerta no relatório/painel quando o disco passar de 80% (hoje a tela já marca "atenção" com 31 GB livres). Conferido: o acervo e os arquivos sensíveis têm modo 600; `/home/pedro` é 750; o único outro usuário local (`doca`) já é administrador (sudo/docker).

## 7. O que fazer a seguir (ordem sugerida)
1. Corrigir o interpretador de respostas do CRM (achado desta rodada, seção 8) e a detecção do self-chat por `remoteJidAlt`, ambos com teste que falha antes.
2. Decidir com o dono: pausar a busca antiga antes do QR; manter o Hindsight sem modelo; navegador de teste (Playwright).
3. Implementar a classificação de contatos → clientes (lacuna 1) com revisão do dono, e instalar `SOUL.md`/skills no Hermes (lacuna 2).
4. MCP próprio do Heimdall (lacuna 3) e só então a calibração de voz.

## 8. Defeito encontrado ao validar o CRM contra o Krayin real
Mensagem do dono `ok 1 e 3, nao o 2 fica` **aprovou os três** (`aprovados: [1, 3, 2]`): `interpretarRespostaCrm` junta todos os números que vêm depois do "ok", então a recusa do 2 no mesmo texto não vale. Risco: aprovar uma mudança no CRM que o dono acabou de recusar. Correção e teste: ver `LICOES.md` (2026-10-22, "interpretador de respostas do CRM") e `apps/core/src/crm/fluxo.test.ts`.

## 9. Regras obrigatórias do `AGENTS.md` e quais testes as cobrem (conferido em 2026-10-22)
| Regra | Arquivos de teste (nº de testes) |
|---|---|
| Acompanhamento (7 tentativas, 2 dias úteis, zera ao responder, nunca respondeu, aguardando você, fuso `America/Sao_Paulo`) | `acompanhamento.test.ts` (17), `calendario.test.ts` (15) |
| Segurança: só envia ao self-chat | `envio.test.ts` (12), `listener/transporte.test.ts` (6), `arquitetura.test.ts` do núcleo (11), do listener (7) e da ponte (6), `saida.test.ts` (7) |
| Entrada: duplicadas/apagadas/editadas, LID × número, PDF, áudio | `ingestao.test.ts` (16), `whatsapp/escuta.test.ts` (20), `whatsapp/traduzir.test.ts` (19), `jid.test.ts` (6), `midia.test.ts` (10), `tests/carga/ingestao-historico.test.ts` (8), `tests/carga/reentrega-apos-troca-de-aparelho.test.ts` (1, novo) |
| Banco: migrações e idempotência | `db.test.ts` (11), `backup.test.ts` (9) + migração provada sobre uma cópia do acervo real (seção 1) |
| MCP: contrato (nenhuma ferramenta apaga) | `mcp-contrato.test.ts` (5) |
| Relatórios: retrato e uma página | `relatorio.test.ts` (21), `relatorio-semanal.test.ts` (9), `ponte/agenda.test.ts` (11); prova extra em banco sintético com 60 clientes: diário **331** palavras (limite 350) e semanal **438** (limite 450), os dois cabem |
| CRM | `crm/fluxo.test.ts` (24), `crm/krayin.test.ts` (8) |
**Cuidado descoberto:** o botão "Agenda" da tela (`gerarRelatorioDeTeste`) **enfileira mensagens "[TESTE]" na caixa de saída** do self-chat; elas seriam entregues ao dono quando o WhatsApp conectar. Por isso não foi acionado no acervo real. O botão serve para o dono clicar de propósito.

