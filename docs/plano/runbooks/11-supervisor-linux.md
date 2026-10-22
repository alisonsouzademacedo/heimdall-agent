# 11. Supervisor Linux (scripts/heimdall.sh)

Substitui o antigo `instalar/heimdall.ps1` (Windows, removido em 2026-10-22). Fontes: `LICOES.md` (2026-10-21, pid reaproveitado), `scripts/heimdall.sh` (o código), `tests/ops/check_supervisor.sh` (o teste, com `node` e `docker` falsos).

## O que faz
`sh scripts/heimdall.sh <ação>` (na raiz do projeto):
| Ação | Efeito |
|---|---|
| `iniciar` | `docker compose up -d` e sobe os 5 processos do Node que não estiverem rodando: **tela, listener, executor, memória, ponte** (nesta ordem). Não imprime o link da tela. |
| `parar` | para só os processos que são NOSSOS (`--com-docker` também faz `docker compose stop`). |
| `estado` | mostra cada processo (pid e desde quando) e `docker compose ps`; para os parados mostra até 3 linhas do `erro.log`. |
| `link` | mostra o endereço da tela **com o código de uso único** (lido de `data/logs/tela.log`). **Nunca cole na conversa nem em log** (regra 2). |
| `supervisionar` | fica em primeiro plano: sobe tudo e **reinicia quem cair**, com espera crescente (`HEIMDALL_BACKOFF_BASE_S`, dobra a cada falha seguida até 300 s; zera depois de 60 s de pé). A cada ~30 ciclos garante o Compose de pé (o Docker pode demorar no boot). |
| `instalar-servico` | escreve `~/.config/systemd/user/heimdall.service` (unidade de **usuário**, `Restart=always`) e **mostra** os comandos de ativar; não ativa nada. |
| `config-hermes` | gera o `config.yaml` do Hermes (lista branca de ferramentas), copia para o volume (`docker cp`) e reinicia o Hermes. |
Opções: `--somente-mostrar` (nada é iniciado, criado nem chamado), `--sem-docker`.

## Como o registro funciona (a lição do pid)
`data/processos.json` guarda, por processo, `{"pid", "inicio", "iniciado_em"}`; `inicio` é o campo 22 de `/proc/<pid>/stat` (a hora em que o processo nasceu). Um processo só conta como NOSSO se o pid está vivo **e** a hora de início confere **e** a linha de comando contém o nosso script. O Linux reaproveita pids: só o pid faria o `iniciar` dizer "já rodando" para um programa alheio e o `parar` poderia matá-lo. O teste cobre os três casos (pid alheio com hora errada, hora igual e comando errado, hora errada com comando certo).

## Ativar o reinício automático (precisa da confirmação do dono: regra 4)
```
sh scripts/heimdall.sh instalar-servico
systemctl --user daemon-reload
systemctl --user enable --now heimdall.service
sudo loginctl enable-linger "$USER"      # mantém de pé sem sessão aberta e depois de reiniciar o servidor
```
Ver: `systemctl --user status heimdall.service`. Desativar: `systemctl --user disable --now heimdall.service`. Não mexe em nginx, pm2, firewall, SSH nem nos contêineres dos outros projetos.

## Armadilhas (medidas)
- **`sh` não tem variável local.** Duas vezes uma função "emprestou" o nome de uma variável do chamador: `reg_gravar` usava `n` (todas as mensagens saíam "ponte iniciado") e `vivo`/`inicio_de` usavam `s` (o processo era lançado com o conteúdo de `/proc/<pid>/stat` como argumento, só quando havia registro velho). Regra: variáveis de função com prefixo próprio (`_vs`, `_np`...).
- **Mudança no `docker-compose.yml` não é aplicada sozinha:** a checagem periódica usa `up -d --no-recreate` (só sobe o que caiu). Para aplicar uma mudança de propósito: `sh scripts/heimdall.sh iniciar` (ou `docker compose ... up -d`).
- A unidade de usuário não ordena depois do `docker.service` (outro gerenciador): por isso o supervisor repete o `docker compose up -d` de tempos em tempos.
- `iniciar` roda `npm ci` (versões do `package-lock.json`) em `apps/<x>` sem `node_modules`; não instala programas no sistema.
- Se `infra/compose/.env` não existe, recusa: não inventa senhas.

## Não verificado
Execução real sob o systemd do servidor (a unidade foi só escrita e lida pelo teste); comportamento do `Restart=always` com `loginctl enable-linger`; consumo de memória dos 5 processos do Node com WhatsApp real.
