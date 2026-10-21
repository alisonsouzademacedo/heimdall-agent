# Pendência: busca do histórico antigo — o celular responde, mas sempre vazio (29 pedidos, 0 mensagens)

**Estado (2026-10-21, 19:15 local):** aberta. Comportamento observado e registrado a pedido do dono; nenhuma causa confirmada. Tudo foi desligado em 21/10 (~19:14) para a troca de máquina (Omarchy/Linux). A busca retoma do ponto onde parou (o estado fica em `historico_pedidos`; o módulo é retomável e idempotente por desenho).

## O que se observa
- A busca antiga foi liberada pelo dono ~18:21 (21/10). Ritmo: um pedido a cada ~1min45s (45 s de espera + 60 s de pausa).
- Até 19:12:33 — **29 pedidos, 0 mensagens novas, 0 conversas concluídas** (661 pendentes de 662 conversas no acervo).
- O celular do dono RESPONDE aos pedidos (eventos `messaging-history.set` ~3 s depois: 18:44:38, 18:56:53, ~19:11:36), mas as respostas não trazem mensagem alguma (só protocolo/itens vazios). Tudo o que existe de origem 'historico' (6.488 mensagens) veio da sincronização inicial, não da busca.
- No aparelho do dono (print 19:09): "2 de 4 dispositivos conectados"; a sessão "Heimdall" mostra **"Última sessão ativa hoje às 15:10"** e **não atualizou** depois da reconexão das 18:13 nem durante os pedidos respondidos às 18:44/18:56/19:11. **Conclusão de diagnóstico: esse rótulo do aparelho não serve como prova de conexão** — a prova real é o banco (`whatsapp.estado = conectado` desde 18:13:30) + as respostas aos pedidos.
- A queda real do listener (entre ~15:10/15:50 e 18:13) bate com o "sincronização parou" visto mais cedo no aparelho; nenhum pedido foi feito nesse período. **Causa da queda: não registrada.** Hipótese não verificada: rede/suspensão do Windows; não insistir sem evidência nova.

## Hipótese do dono (não verificada)
Conversas cujo histórico não existe mais (ou nunca existiu no aparelho) respondem vazio. O pedido é servido **pelo próprio aparelho principal** (documentação do Baileys, `docs/baileys/advanced/history-sync.md`: "ask the main device for older messages"; no código, a resposta chega como mensagem da própria conta). Se o aparelho não tem aquele trecho, não há o que devolver.

## Como saber (critério já desenhado no código)
- Resposta vazia conta em `historico_pedidos.vazias`; **2 vazias seguidas = conversa `concluida`**; 40 pedidos sem concluir = `esgotada` (`apps/core/src/historico-antigo.ts`: `VAZIAS_PARA_CONCLUIR = 2`, `maxPaginas = 40`).
- Volta completa: 661 conversas ≈ **~19 h** para o primeiro pedido de cada uma; **~38 h** para todas concluírem (2 pedidos cada) no ritmo de 105 s.
- Se, ao fim da volta, **todas** concluírem com 2 vazias e nenhuma entregar mensagem → a hipótese ganha força grande (o aparelho não devolve histórico dessas conversas).
- Se **alguma** conversa entregar mensagens → a busca funciona; o vazio passa a ser específico das outras (provável: nada mais antigo que o ponto de sincronização inicial).
- Alternativas ainda não descartadas: (a) conversas recentes — nada mais antigo do que já sincronizado; (b) aparelho sem aquele histórico (troca/reinstalação/limpeza do WhatsApp); (c) algum detalhe do pedido (cursor) que o aparelho não aceita — **não verificado**.

## O que NÃO fazer
- Não concluir "não tem como recuperar" antes de fechar a volta completa.
- Não aumentar o ritmo "para ir mais rápido": o risco de limitação da conta não foi medido.

## Próximo passo
1. Na máquina nova (Omarchy/Linux): parear o WhatsApp (QR novo), ligar o listener, liberar a busca antiga no passo "Sincronizar" e **deixar rodar** a volta completa (~19 h; ~38 h para concluir todas).
2. Quando a primeira conversa ficar `concluida`, conferir `vazias = 2` e o total de mensagens novas no painel.
3. Decidir com os números: todas vazias → hipótese forte; misto → investigar o pedido/cursor.

## Referências
- Código: `apps/core/src/historico-antigo.ts`, `apps/listener/src/historico-antigo.ts`; tabela `historico_pedidos`.
- Documentação: `docs/baileys/advanced/history-sync.md`.
- Registro da rodada: `docs/plano/PROGRESS.md` (entradas de 2026-10-21, noite).
