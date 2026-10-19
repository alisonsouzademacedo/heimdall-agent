# Fase 1 — Manutenção: atualização de versões

Status: **proposta para aprovação** (item 6 do quadro). Fontes: `docs/hermes-agent/getting-started/updating.md` (li o índice da página inteira e as seções de atualização, reversão, backup prévio, validação, versão e instalação em Docker), `docs/baileys/migration/{v7,v8}.md` (inteiras), `docs/hindsight/developer/{installation,admin-cli}.md`. O resto da página de atualização trata de instalação por código-fonte, Desktop e Nix, que **não usamos**.

## Regra de ouro
**Versão fixada, atualização só quando você aprovar, sempre depois de backup.** Nada se atualiza sozinho, nem o Heimdall se atualiza (regra 4 do `AGENTS.md`: instalar ou mudar programas pede a sua confirmação).

## O que a documentação diz de cada peça
| Peça | Como atualiza | Cuidados documentados |
|---|---|---|
| **Hermes (Docker)** | puxar a imagem escolhida e recriar o contêiner **com o mesmo volume de dados**. O comando `hermes update` **se recusa** dentro de imagem Docker (a imagem tem um marcador de origem) | uma versão antiga **não roda** num `state.db` já gravado pela versão nova: voltar de versão = restaurar o backup anterior (`hermes import`) e usar a imagem antiga. Sessões criadas depois do backup se perdem |
| **Hindsight (Docker)** | trocar a etiqueta da imagem (existem etiquetas por versão, ex. `0.4.9` e `0.4.9-slim`, e a assinatura pode ser verificada com `cosign`) | o banco migra sozinho ao subir (`HINDSIGHT_API_RUN_MIGRATIONS_ON_STARTUP`); dá para desligar e rodar `hindsight-admin run-db-migration` à parte. **Não verificado:** se migração é reversível; por segurança, voltar = `hindsight-admin restore` do backup feito antes. Depois de restaurar, rodar `repair-bank --all` |
| **Baileys (no `core`)** | mudar a versão no `package.json` e reinstalar | v7 (já é a nossa linha): só ESM, LID como identificador, não envia mais confirmações de entrega, e o **armazenamento de login precisa suportar as chaves `lid-mapping`, `device-list` e `tctoken`**. v8 (em desenvolvimento): formato de login novo, com um **script de migração** que deve rodar **separado** do processo vivo, depois de backup; sessões não migradas **não conectam** |
| **Krayin** | **não verificado** (a documentação que temos não descreve atualização) | só na fase 2 |
| **Docker Desktop / Windows** | **não verificado** | tratar como mudança de risco: fazer backup antes |

## Política de versões
1. **Nada de `latest`.** Cada serviço usa uma versão específica, anotada em `infra/compose/versions.env` e no quadro `docs/plano/versoes.md` (a criar no spike) com a **combinação testada junta**.
2. **Baileys fica na linha 7.x** (a mesma que o Hermes fixa, 7.0.0-rc13 conforme o plano). **Não migrar para a v8** enquanto não houver versão final, guia final de migração e um ensaio do script em **cópia** do backup do login.
3. **Atualizar no máximo uma peça por vez**, para saber quem quebrou o quê.
4. Atualizações de segurança importantes podem ser adiantadas, com o mesmo roteiro.

## Roteiro de atualização (uma peça)
1. **Ler as notas de versão** (página de releases do projeto) e anotar mudanças que quebram compatibilidade.
2. **Pausa na escuta?** Não é preciso parar o WhatsApp, mas o Heimdall pode perder eventos durante a troca; ao subir, o histórico recente é reconciliado (`messages.upsert` e sincronização). Fazer fora do horário de pico.
3. **Backup completo** (seção 2 de `fase-1-seguranca-operacional.md`), incluindo o do componente que vai mudar. Para o Hermes, o backup completo traz as chaves; guardar com cuidado.
4. **Trocar a versão** (um serviço), subir e esperar a saúde do contêiner.
5. **Validar:** testes de regressão do repositório + testes de fumaça (`runbooks/08-testes-de-fumaca.md`): chega mensagem de teste no self-chat, relatório de teste gerado, consulta ao Hindsight devolve resultado, envio a outro número **falha** (trava). Para o Hermes, a página de atualização recomenda `hermes doctor` e `hermes --version`; **se esses comandos existem e funcionam dentro do contêiner é não verificado**.
6. **Registrar** em `PROGRESS.md` (versões antes e depois, resultado) e, se houve erro, seguir a regra de erro resolvido (teste de regressão, instruções, `LICOES.md`).
7. **Se falhou:** voltar a versão anterior da imagem e restaurar o backup do passo 3 (Hermes: restaurar antes de subir a imagem antiga; Hindsight: `restore`; Baileys: voltar o login do backup se uma migração tiver rodado).

## Quem faz
A IA instaladora (Claude Code, Codex ou Antigravity) executa o roteiro seguindo o `AGENTS.md`, **depois de você aprovar** a atualização. O Heimdall em operação **não** atualiza nada; o comando de atualização pelo chat existe no Hermes, e deve ficar sem uso (em Docker ele já se recusa). Os avisos de "nova versão" aparecem como uma linha no relatório semanal ("Hermes tem versão nova: X; atual: Y"), só se conseguirmos obter essa informação sem expor dados **[a decidir no spike]**.

## Ritmo proposto
Verificar novidades **uma vez por mês** e atualizar só se houver motivo (correção importante, recurso que precisamos, risco de segurança). Estabilidade vale mais que novidade neste projeto: o Baileys é de uso não oficial e o protocolo muda sem aviso.

## Testes de regressão previstos
Teste de fumaça pós-atualização automatizado onde der (envio a terceiros falha; relatório de exemplo dentro de uma página; leitura do acervo) · verificação de que `versions.env` não contém `latest` · verificação de que o código de armazenamento do login suporta as chaves exigidas pelo Baileys 7 (`lid-mapping`, `device-list`, `tctoken`).

## Pendências
Criar `versoes.md` no spike com as versões realmente testadas · confirmar `hermes doctor` no contêiner · confirmar reversão do Hindsight · atualização do Krayin.
