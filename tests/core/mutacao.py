"""Teste dos testes: estraga o codigo de proposito (mutacao) e confirma que algum teste FALHA.
Se uma mutacao passar despercebida, os testes nao protegem aquela regra. Uso: python3 tests/core/mutacao.py"""
import shutil, subprocess, sys, tempfile, pathlib

RAIZ = pathlib.Path(__file__).resolve().parents[2] / "apps" / "core"

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
        texto = alvo.read_text()
        if texto.count(antes) != 1:
            print(f"[MUTACAO DESATUALIZADA] {arquivo}: trecho nao encontrado exatamente uma vez -> {antes[:60]}")
            falhas += 1
            continue
        alvo.write_text(texto.replace(antes, depois))
        r = subprocess.run(["node", "--test", "src/**/*.test.ts"], cwd=copia, capture_output=True, text=True)
        if r.returncode == 0:
            print(f"[SOBREVIVEU] {regra}  ({arquivo}) -- nenhum teste percebeu a quebra")
            falhas += 1
        else:
            print(f"[PEGOU] {regra}")
print("RESULTADO:", "todas as mutacoes foram detectadas" if falhas == 0 else f"{falhas} problema(s)")
sys.exit(1 if falhas else 0)
