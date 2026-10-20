"""Teste dos testes: estraga o codigo de proposito (mutacao) e confirma que algum teste FALHA.
Se uma mutacao passar despercebida, os testes nao protegem aquela regra. Uso: python3 tests/core/mutacao.py"""
import os, shutil, subprocess, sys, tempfile, pathlib

# HEIMDALL_CORE_DIR so existe para o teste do proprio teste (tests/core/check_core.sh)
RAIZ = pathlib.Path(os.environ.get("HEIMDALL_CORE_DIR") or pathlib.Path(__file__).resolve().parents[2] / "apps" / "core")
COMANDO = ["node", "--test", "src/**/*.test.ts"]

def roda(cwd):
    # utf-8 explicito: no Windows o padrao e cp1252 e quebra com acentos
    return subprocess.run(COMANDO, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace")

# Linha de base: sem estrago nenhum os testes precisam PASSAR; senao toda mutacao pareceria "pega" por engano.
base = roda(RAIZ)
if base.returncode != 0:
    print("[LINHA DE BASE] os testes ja falham SEM nenhuma mutacao; conserte isso antes. Primeiras falhas:")
    print("\n".join([l for l in base.stdout.splitlines() if l.startswith("not ok")][:5]))
    sys.exit(2)
print("[LINHA DE BASE] os testes passam sem mutacao")

# (arquivo, trecho original, trecho estragado, regra protegida)
MUTACOES = [
    ("src/acompanhamento.ts", "tentativas >= cfg.maxTentativas", "tentativas > cfg.maxTentativas", "7 tentativas desconsideram"),
    ("src/acompanhamento.ts", "if (doCliente.length === 0) {", "if (false) {", "quem nunca respondeu nao gera follow-up"),
    ("src/acompanhamento.ts", "ordenadas.filter((m) => m.deMim && m.em > ultimaCliente.em)", "ordenadas.filter((m) => m.deMim)", "resposta do cliente zera a contagem"),
    ("src/acompanhamento.ts", "hoje >= proximo ? 'follow_up_devido'", "hoje > proximo ? 'follow_up_devido'", "follow-up vence no dia certo"),
    ("src/calendario.ts", "return s >= 1 && s <= 5 &&", "return s >= 1 && s <= 6 &&", "sabado nao e dia util"),
    ("src/calendario.ts", "const ontem = somarDias(diaLocal(agora, fuso), -1);", "const ontem = diaLocal(agora, fuso);", "diario cobre o dia anterior"),
    ("src/envio.ts", "await transporte.enviar(destino, { tipo: 'texto', texto });", "await transporte.enviar(texto, { tipo: 'texto', texto });", "envio so ao self-chat"),
    ("src/envio.ts", "if (!msg.fromMe) return false;", "", "so o dono comanda o self-chat"),
    ("src/envio.ts", "if (!pn || tipoDoJid(pn) !== 'pn')", "if (!pn)", "identidade do dono validada"),
    ("src/apagar.ts", "if (origem.selfChat !== true) return { ok: false, motivo: 'origem_nao_permitida' };", "", "so o self-chat confirma apagar"),
    ("src/apagar.ts", "if (agora - p.criado_em > VALIDADE_CODIGO_MS)", "if (false)", "codigo expira"),
    ("src/apagar.ts", "db.prepare('DELETE FROM contatos WHERE cliente_id = ?').run(clienteId);", "db.prepare('DELETE FROM contatos').run();", "apagar um cliente nao toca em outro"),
    ("src/apagar.ts", "db.prepare('DELETE FROM apagar_pendente WHERE codigo = ?').run(codigo);\n  return p.tipo", "return p.tipo", "codigo de uso unico"),
    ("src/ingestao.ts", "INSERT OR IGNORE INTO mensagens", "INSERT INTO mensagens", "mensagem duplicada nao duplica"),
    ("src/ingestao.ts", "SET texto_original = texto, texto = ?, estado = 'editada'", "SET texto = ?, estado = 'editada'", "edicao guarda o original"),
    ("src/ingestao.ts", "UPDATE mensagens SET estado = 'apagada'", "DELETE FROM mensagens", "apagada fica marcada"),
    ("src/ingestao.ts", "if (t !== 'pn' && t !== 'lid') return null;", "", "transmissao/status/canal ignorados"),
    ("src/aprendizado.ts", "if (origem.selfChat !== true) throw new EnsinoNaoPermitido('so mensagens do proprio dono no self-chat ensinam o Heimdall');", "", "so o self-chat ensina"),
    ("src/aprendizado.ts", "if (casos < MIN_CASOS) return null;", "", "proposta so com casos suficientes"),
    ("src/aprendizado.ts", "if (p.chave.includes(k) || conteudoNovo.includes(k))", "if (false)", "regras do dono protegidas"),
    ("src/relatorio.ts", "aguardando.sort((x, y) => x.desde - y.desde);", "", "aguardando ordenado por espera"),
    ("src/relatorio.ts", "if (chave === 'aguardando' && lista.length <= MIN_AGUARDANDO) continue;", "", "corte preserva 'aguardando'"),
    ("src/backup.ts", "if (existsSync(destino)) throw new Error('o arquivo de backup ja existe');", "", "backup nao sobrescreve"),
    ("src/backup.ts", "return diaLocal(ultimoBackupEm, fuso) < diaLocal(agora, fuso);", "return agora - ultimoBackupEm > 86_400_000;", "primeiro uso do dia no fuso do dono"),
    ("src/onboarding/servidor.ts", "if (!hostsOk.includes(req.headers.host ?? ''))", "if (false)", "tela: confere o Host (DNS rebinding)"),
    ("src/onboarding/servidor.ts", "codigoUsado = true;", "", "tela: codigo de uso unico"),
    ("src/onboarding/servidor.ts", "if (req.headers['x-heimdall'] !== '1')", "if (false)", "tela: POST exige cabecalho proprio (CSRF)"),
    ("src/onboarding/servidor.ts", "origem !== undefined && !hostsOk.some", "false && !hostsOk.some", "tela: confere a Origin"),
    ("src/onboarding/servidor.ts", "server.listen(porta, '127.0.0.1'", "server.listen(porta", "tela: escuta so em 127.0.0.1"),
    ("src/onboarding/servidor.ts", "HttpOnly; SameSite=Strict", "SameSite=Strict", "tela: cookie HttpOnly"),
    ("src/onboarding/servidor.ts", "if (!temSessao(req)) return", "if (false) return", "tela: exige sessao"),
    ("src/onboarding/ambiente.ts", "memTotalBytes / GIB); // 7,8 GiB", "memTotalBytes / GIB) + 1; // 7,8 GiB", "ambiente: memoria arredondada como no verificador"),
    ("src/onboarding/ambiente.ts", "estado: m.virtualizacao ? 'ok' : 'falha'", "estado: 'ok'", "ambiente: virtualizacao desligada e falha"),
    ("src/onboarding/ambiente.ts", "estado: m.wsl ? 'ok' : 'falha'", "estado: 'ok'", "ambiente: WSL ausente e falha"),
    ("src/onboarding/servidor.ts", "server.listen(porta, '127.0.0.1'", "server.listen(porta, '0.0.0.0'", "tela: escuta so em 127.0.0.1"),
    ("src/onboarding/servidor.ts", "ambiente: { sistema: platform(), arquitetura: arch(), node: process.version }", "ambiente: {}", "tela: relatorio de bug leva o ambiente"),
    ("src/onboarding/perfil.ts", "if (gb < 8) return 'insuficiente';", "if (gb < 7) return 'insuficiente';", "perfil: menos de 8 GB e insuficiente"),
    ("src/onboarding/perfil.ts", "if (gb < 12) return 'enxuto';", "if (gb < 13) return 'enxuto';", "perfil: 12 GB ja e equilibrado"),
    ("src/onboarding/perfil.ts", "if (gb < 24) return 'equilibrado';", "if (gb < 25) return 'equilibrado';", "perfil: 24 GB ja e folgado"),
    ("src/onboarding/perfil.ts", "livreGb < 2) avisos.push", "livreGb < 1) avisos.push", "perfil: avisa de memoria livre abaixo de 2 GB"),
    ("src/onboarding/perfil.ts", "if (disco < 30) { adequacao", "if (disco < 20) { adequacao", "perfil: disco abaixo de 30 GB reprova"),
    ("src/onboarding/perfil.ts", "m.cpus !== undefined && m.cpus < 4", "m.cpus !== undefined && m.cpus < 2", "perfil: avisa de poucas CPUs"),
    ("src/onboarding/perfil.ts", "if (!SISTEMAS.includes(m.plataforma)) {", "if (false) {", "perfil: sistema desconhecido reprova"),
    ("src/onboarding/perfil.ts", "const gpuNoPadrao = id === 'folgado' && !!m.gpuNvidia && m.plataforma !== 'darwin' && m.gpuNvidia.vramMb >= 4096;", "const gpuNoPadrao = false;", "perfil: GPU boa vira padrao so no perfil folgado"),
    ("src/onboarding/perfil.ts", "const gpuBoa = !!m.gpuNvidia && m.plataforma !== 'darwin' && m.gpuNvidia.vramMb >= 4096;", "const gpuBoa = false;", "perfil: Whisper na GPU no perfil folgado"),
    ("src/onboarding/ambiente.ts", "vramMb > 0 && (melhor === null || vramMb > melhor.vramMb)", "vramMb > 0 && (melhor === null || vramMb < melhor.vramMb)", "ambiente: varias placas, fica com a de mais memoria"),
    ("src/onboarding/servidor.ts", "perfil ? { verificacoes, ok: !falhas, perfil } :", "false ? { verificacoes, ok: !falhas, perfil } :", "tela: o perfil viaja na resposta do Testar ambiente"),
    ("src/onboarding/perfil.ts", "const win = m.plataforma === 'win32';", "const win = true;", "perfil: Linux nao herda a conclusao medida no Windows"),
    ("src/whatsapp/traduzir.ts", "const STUB_REVOKE = 1;", "const STUB_REVOKE = 2;", "whatsapp: apagada para todos reconhecida pelo codigo do Baileys"),
    ("src/whatsapp/traduzir.ts", "protocolMessage: 'protocolo (apagar/editar chega por messages.update)', ", "", "whatsapp: o envelope de apagar/editar nao vira mensagem nova"),
    ("src/whatsapp/traduzir.ts", "if (tj !== 'pn' && tj !== 'lid' && tj !== 'grupo') return", "if (false) return", "whatsapp: status, transmissao e canais ficam de fora"),
    ("src/memoria.ts", "if (dia < hoje) ids.add", "if (dia <= hoje) ids.add", "memoria: o dia de hoje nunca vai ao Hindsight"),
    ("src/memoria.ts", "if (!conv || conv.tipo === 'self') return null;", "if (!conv) return null;", "memoria: o self-chat nao entra na memoria de negocio"),
    ("src/memoria.ts", "if (s?.hash_conteudo === hash) { concluir(db, job.id, agora); return 'ok'; }", "", "memoria: conteudo igual nao e reenviado"),
    ("src/memoria.ts", "return falhar(db, job.id, 'falha_ao_enviar_ao_hindsight', agora);", "return falhar(db, job.id, (e as Error).message, agora);", "memoria: o conteudo da conversa nao vai para o erro da fila"),
    ("src/memoria.ts", "const marca = l.estado === 'editada' ? '[editada] ' : l.estado === 'apagada' ? '[apagada pelo autor] ' : '';", "const marca = '';", "memoria: editada e apagada ficam marcadas"),
    ("src/fila.ts", "AND estado IN ('ok','erro','abandonada')", "AND estado IN ('ok','erro','abandonada','em_andamento')", "fila: reenfileirar nao atropela o que esta em andamento"),
    ("src/saida.ts", "const completo = texto.startsWith(MARCA) ? texto : `${MARCA}${texto}`;", "const completo = texto;", "saida: todo texto nosso leva a marca anti-eco"),
    ("src/saida.ts", "if (texto?.startsWith(MARCA)) return true;", "", "saida: mensagem com a marca nunca e tratada como comando do dono"),
    ("src/saida.ts", "if (tentativas >= MAX_TENTATIVAS_SAIDA) {", "if (tentativas > 1000) {", "saida: depois de muitas falhas abandona em vez de insistir para sempre"),
    ("src/relatorio-semanal.ts", "if (estado === 'desconsiderado') { desconsiderados.push(c.nome); continue; }", "", "semanal: cliente desconsiderado aparece na evolucao"),
    ("src/relatorio-semanal.ts", "if (naSemana.some((m) => !m.deMim)) avancaram.push(c.nome);", "if (naSemana.some((m) => m.deMim)) avancaram.push(c.nome);", "semanal: avancou quem RESPONDEU na semana"),
    ("src/relatorio-semanal.ts", "if (c.estado !== 'marcado') continue;", "", "semanal: compromisso cumprido ou cancelado nao aparece como pendente"),
    ("src/relatorio-semanal.ts", "if (i === listas.length - 1 && lista.length <= 3) continue;", "", "semanal: nunca corta 'Aguardando voce' abaixo de 3 itens"),
    ("src/whatsapp/identidade.ts", "tipoDoJid(j) === 'pn')", "tipoDoJid(j) === 'lid')", "whatsapp: a identidade do dono exige o numero de telefone"),
    ("src/whatsapp/estado.ts", "user.slice(-4)", "user.slice(0)", "whatsapp: a tela so recebe o final do numero do dono"),
    ("src/whatsapp/escuta.ts", "db.exec(`ROLLBACK TO ${nome}`);\n      db.exec(`RELEASE ${nome}`);\n      r.falhas++;", "db.exec(`RELEASE ${nome}`);\n      r.falhas++;", "whatsapp: falha numa mensagem desfaz so aquela mensagem"),
    ("src/bugs.ts", "t = t.replace(/\\bBearer", "t = t; t.replace(/\\bBearer", "bugs: Bearer mascarado"),
    ("src/bugs.ts", "existentes.has(nome); n++", "false; n++", "bugs: repeticoes no mesmo segundo ganham numero"),
    ("src/mcp-contrato.ts", "escreve: true, escreveEm: ['feedback']", "escreve: true, escreveEm: ['feedback', 'mensagens']", "MCP so escreve em feedback"),
]

falhas = 0
for arquivo, antes, depois, regra in MUTACOES:
    with tempfile.TemporaryDirectory() as tmp:
        copia = pathlib.Path(tmp) / "core"
        shutil.copytree(RAIZ, copia, ignore=shutil.ignore_patterns("node_modules"))
        alvo = copia / arquivo
        texto = alvo.read_text(encoding="utf-8")
        if texto.count(antes) != 1:
            print(f"[MUTACAO DESATUALIZADA] {arquivo}: trecho nao encontrado exatamente uma vez -> {antes[:60]}")
            falhas += 1
            continue
        alvo.write_text(texto.replace(antes, depois), encoding="utf-8")
        r = roda(copia)
        if r.returncode == 0:
            print(f"[SOBREVIVEU] {regra}  ({arquivo}) -- nenhum teste percebeu a quebra")
            falhas += 1
        else:
            print(f"[PEGOU] {regra}")
print("RESULTADO:", "todas as mutacoes foram detectadas" if falhas == 0 else f"{falhas} problema(s)")
sys.exit(1 if falhas else 0)
