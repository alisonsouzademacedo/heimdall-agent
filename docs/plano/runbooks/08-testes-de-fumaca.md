# 8. Testes de fumaça (depois de instalar tudo)

Cada linha: o que rodar, o que se espera, de onde vem. Registrar a saída real em `../PROGRESS.md`.

| # | Teste | Resultado esperado | Origem |
|---|---|---|---|
| 1 | `docker version` e `docker run hello-world` | mensagem de confirmação | `ubuntu.md`, `windows-install.md` |
| 2 | `GET http://127.0.0.1:8888/health/live` e `/health` | 200 (o segundo consulta o banco) | `monitoring.md` do Hindsight |
| 3 | `hindsight-admin chatgpt status` | conta e validade, sem tokens | `models.md` |
| 4 | `GET http://127.0.0.1:8642/health` e uma chamada ao `/v1/chat/completions` com a chave | 200 e resposta do modelo | `api-server.md` |
| 5 | `docker exec hermes hermes doctor` | sem erro de fuso nem de banco de sessões | `configuration.md`, `docker.md` |
| 6 | Tentar abrir as portas **de fora da máquina** (outro dispositivo da rede) | recusado | R1 |
| 7 | Chamar `/v1/chat/completions` **sem** a chave | 401 | `api-server.md` |
| 8 | Hermes sem ferramenta de terminal/navegador: pedir "rode `ls`" | recusa ou ferramenta ausente | `configuration.md` (toolsets) |
| 9 | Krayin: login com nova senha; criar, mover e remover lead de teste pela API | todas as operações funcionam | `rest-api` |
| 10 | Listener: parear, receber mensagem de teste, reiniciar sem novo QR | mensagem no banco; sem QR | `session-management.md` |
| 11 | Listener: tentar enviar a outro número | falha (teste de segurança) | `AGENTS.md` regra 1 |
| 12 | Transcrever áudio de teste (pt) e converter PDF de exemplo | textos corretos | faster-whisper, markitdown |
| 13 | Cron de teste `--deliver local` (um minuto à frente) e ler `/opt/data/cron/output/` | arquivo `.md` gerado | `cron.md` |
| 14 | Relatório de teste enviado ao self-chat como `.md` | chega íntegro | spike E2 |
| 15 | `docker compose down` e `up` | nada se perde (volumes nomeados) | R2 |
