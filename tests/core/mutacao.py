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
    ("src/crm/fluxo.ts", "if (!m && SINAL_DE_RECUSA.test(resto)) decisao = 'recusar';", "", "\"o 2 fica\" na mesma mensagem do \"ok 1 e 3\" recusa o 2 (defeito de 2026-10-22: aprovava os tres)"),
    ("src/crm/fluxo.ts", "if (aprovados.some((n) => recusados.includes(n))) ambigua = true;", "", "o mesmo numero aprovado e recusado e ambiguo (nada e feito)"),
    ("src/crm/fluxo.ts", "if (m && decisao === 'aprovar' && SINAL_DE_RECUSA.test(resto)) ambigua = true;", "", "\"ok 1 e 3 e nao o 2\" (sem separador) e ambiguo"),
    ("src/crm/fluxo.ts", "if (pedido.ambigua) return {", "if (false) return {", "resposta ambigua nunca chama nem altera o CRM"),
    ("src/ingestao.ts", " || (alt !== undefined && mesmoUsuario(alt, dono.pn))", "", "o self-chat tambem e reconhecido pelo numero do dono em remoteJidAlt (sem cliente falso)"),
    ("src/crm/krayin.ts", "/api/v1${caminho}", "/api/admin${caminho}", "o CRM chama o prefixo real da API do Krayin (/api/v1, medido no Krayin 2.2.0)"),
    ("src/crm/krayin.ts", "chaveEtapa(x.nome) === chaveEtapa(e.nome)", "x.nome === e.nome", "nome da etapa e comparado sem acento, caixa e simbolo ordinal"),
    ("src/crm/krayin.ts", "redirect: 'error'", "redirect: 'follow'", "o token do CRM nunca segue redirecionamento para outro endereco"),
    ("src/acompanhamento.ts", "tentativas >= cfg.maxTentativas", "tentativas > cfg.maxTentativas", "7 tentativas desconsideram"),
    ("src/acompanhamento.ts", "if (doCliente.length === 0) {", "if (false) {", "quem nunca respondeu nao gera follow-up"),
    ("src/acompanhamento.ts", "ordenadas.filter((m) => m.deMim && m.em > ultimaCliente.em)", "ordenadas.filter((m) => m.deMim)", "resposta do cliente zera a contagem"),
    ("src/acompanhamento.ts", "hoje >= proximo ? 'follow_up_devido'", "hoje > proximo ? 'follow_up_devido'", "follow-up vence no dia certo"),
    ("src/db.ts", "if (m.versao <= versaoAtual(db)) { db.exec('COMMIT'); continue; }", "", "migrar le a versao DENTRO da transacao (5 processos migram o mesmo banco)"),
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
    ("src/backup-copia.ts", "if (existsSync(destino)) throw new Error('o arquivo de backup ja existe');", "", "backup nao sobrescreve"),
    ("src/backup-copia.ts", "return diaLocal(ultimoBackupEm, fuso) < diaLocal(agora, fuso);", "return agora - ultimoBackupEm > 86_400_000;", "primeiro uso do dia no fuso do dono"),
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
    ('src/whatsapp/escuta.ts', 'guardarNomePendente(db, jid, nome, agora()); // o contato ainda nao existe', '/* nao guarda */', 'contatos: nome que chega antes do contato e guardado'),
    ('src/ingestao.ts', "WHERE id = ?').get(contatoId) as { nome: string | null }).nome === null) {", "WHERE id = ?').get(contatoId) as { nome: string | null }).nome !== null) {", 'contatos: nome pendente e aplicado so a contato sem nome'),
    ('src/whatsapp/escuta.ts', 'aplicarAlteracoesPendentes(db, a.evento.waMsgId, agora());', '/* sem aplicar pendentes */', 'ressincronizacao: edicao/apagada que chegou antes e aplicada quando a original entra'),
    ('src/fila.ts', 'AND tipo IN (${marcas}) LIMIT 1', 'AND tipo IN (${marcas}) AND 0 LIMIT 1', 'fila: haProntos enxerga trabalho pronto (agendador so varre com a fila vazia)'),
    ('src/fila.ts', 'return r !== undefined && r.h === hashConteudo;', 'return r !== undefined && r.h !== hashConteudo;', 'fila: abandonado so volta se o conteudo mudou'),
    ('src/extracao.ts', "if (abandonadaComEsteConteudo(db, 'extrair', ref, c.hash)) continue;", 'if (false) continue;', 'extracao: dia abandonado nao volta a cada varredura'),
    ('src/extracao.ts', "if (r === 'abandonada') registrarAbandono(db, job.id, p.hash);", 'if (false) registrarAbandono(db, job.id, p.hash);', 'extracao: abandono registra o hash do conteudo'),
    ('src/memoria.ts', "if (abandonadaComEsteConteudo(db, 'retain', documentId, hash)) continue;", 'if (false) continue;', 'memoria: documento recusado nao volta a cada varredura'),
    ('src/memoria.ts', "if (r === 'abandonada') registrarAbandono(db, job.id, hash);", 'if (false) registrarAbandono(db, job.id, hash);', 'memoria: abandono registra o hash do conteudo'),
    ("src/onboarding/ambiente.ts", 'const WSL_MINIMO = [2, 1, 5] as const;', 'const WSL_MINIMO = [2, 1, 4] as const;', 'ambiente: WSL minimo e 2.1.5'),
    ("src/onboarding/ambiente.ts", 'return b < 22000 ? b >= 19045 : b >= 22631;', 'return b < 22000 ? b >= 19045 : b >= 22000;', 'ambiente: Windows 11 exige 23H2 (22631)'),
    ("src/onboarding/ambiente.ts", "estado: m.wslVersao === null ? 'atencao' : ok ? 'ok' : 'falha'", "estado: 'ok'", 'ambiente: WSL antigo e falha'),
    ("src/onboarding/ambiente.ts", "estado: f.length === 0 ? 'ok' : 'atencao'", "estado: 'ok'", 'ambiente: imagem faltando avisa'),
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
    ("src/extracao.ts", "if (c.confianca < CONFIANCA_MINIMA) continue;\n      if (c.acao === 'novo')", "if (c.acao === 'novo')", "extracao: compromisso de pouca confianca nao entra"),
    ("src/extracao.ts", "if (!m || m.d === 1) continue;", "if (!m) continue;", "extracao: sinal de potencial so vale quando o CLIENTE o produz"),
    ("src/extracao.ts", "if (p.papel !== 'interno') {", "if (true) {", "extracao: pessoa interna nunca gera sinal de potencial"),
    ("src/extracao.ts", "WHERE id = ? AND cliente_id = ?\").run(c.idExistente!, p.clienteId)", "WHERE id = ? AND cliente_id > ?\").run(c.idExistente!, 0)", "extracao: cancelar so mexe em compromisso do MESMO cliente"),
    ("src/extracao.ts", "if (s?.h === p.hash) { concluir(db, job.id, agora); return 'ok'; }", "", "extracao: conversa igual nao chama o modelo de novo"),
    ("src/apagar.ts", "db.prepare('DELETE FROM duvidas WHERE cliente_id = ?').run(clienteId);", "", "apagar: duvidas do cliente saem junto"),
    ("src/relatorio.ts", "substr(data_hora, 1, 10) <= ?", "substr(data_hora, 1, 10) >= ?", "relatorio: 'Hoje / atrasados' so traz o que venceu"),
    ("src/relatorio.ts", "estado = 'marcado' AND data_hora IS NOT NULL", "data_hora IS NOT NULL", "relatorio: compromisso cancelado ou cumprido nao aparece"),
    ("src/backup-rodizio.ts", "if (d >= hoje) return false;", "", "rodizio: o backup de hoje nunca e apagado"),
    ("src/backup-rodizio.ts", "if (d === maisRecenteValido) return false;", "", "rodizio: o ultimo backup valido nunca e apagado"),
    ("src/backup-rodizio.ts", "diasEntre(d, hoje) > RETENCAO_BACKUP_DIAS", "diasEntre(d, hoje) >= RETENCAO_BACKUP_DIAS", "rodizio: 30 dias exatos ainda ficam"),
    ("src/backup-rodizio.ts", "if (!a.valido) return true;", "if (!a.valido) return false;", "rodizio: backup invalido sai"),
    ("src/backup-rodizio.ts", "const nossos = arquivos.filter((a) => NOME_BACKUP.test(a.nome));", "const nossos = arquivos;", "rodizio: so mexe em arquivo com o nome que o Heimdall grava"),
    ("src/backup-rodizio.ts", "if (ic?.integrity_check !== 'ok') return false;", "", "rodizio: backup corrompido e detectado"),
    ("src/apagar.ts", "=== 0 ? null : proporLimparMidiasAntigas(db, agora)", "=== -1 ? null : proporLimparMidiasAntigas(db, agora)", "apagar arquivos antigos: sem arquivo velho nao cria codigo"),
    ("src/memoria.ts", "if (dia < hoje) ids.add", "if (dia <= hoje) ids.add", "memoria: o dia de hoje nunca vai ao Hindsight"),
    ("src/memoria.ts", "if (!conv || conv.tipo === 'self') return null;", "if (!conv) return null;", "memoria: o self-chat nao entra na memoria de negocio"),
    ("src/memoria.ts", "if (s?.hash_conteudo === hash) { concluir(db, job.id, agora); return 'ok'; }", "", "memoria: conteudo igual nao e reenviado"),
    ("src/memoria.ts", ": falhar(db, job.id, 'falha_ao_enviar_ao_hindsight', agora);", ": falhar(db, job.id, (e as Error).message, agora);", "memoria: o conteudo da conversa nao vai para o erro da fila"),
    ("src/memoria.ts", "const marca = l.estado === 'editada' ? '[editada] ' : l.estado === 'apagada' ? '[apagada pelo autor] ' : '';", "const marca = '';", "memoria: editada e apagada ficam marcadas"),
    ("src/fila.ts", "AND estado IN ('ok','erro','abandonada')", "AND estado IN ('ok','erro','abandonada','em_andamento')", "fila: reenfileirar nao atropela o que esta em andamento"),
    ("src/saida.ts", "const completo = texto.startsWith(MARCA) ? texto : `${MARCA}${texto}`;", "const completo = texto;", "saida: todo texto nosso leva a marca anti-eco"),
    ("src/saida.ts", "if (texto?.startsWith(MARCA)) return true;", "", "saida: mensagem com a marca nunca e tratada como comando do dono"),
    ("src/saida.ts", "if (tentativas >= MAX_TENTATIVAS_SAIDA) {", "if (tentativas > 1000) {", "saida: depois de muitas falhas abandona em vez de insistir para sempre"),
    ("src/apagar.ts", "        if (resta) {", "        if (false) {", "apagar: arquivo usado por outro cliente nao e apagado"),
    ("src/apagar.ts", "          if (m && m.caminho !== '') caminhos.push(m.caminho);", "", "apagar: o arquivo de midia sai junto com o cliente"),
    ("src/apagar.ts", "db.prepare('INSERT OR IGNORE INTO memoria_apagar (document_id, pedido_em) VALUES (?, ?)').run(d.d, agora);", "", "apagar: o que foi ao Hindsight tambem e esquecido la"),
    ("src/memoria.ts", "if (!ID.test(d)) continue; // nunca manda", "if (false) continue; // nunca manda", "memoria: so ids de documento de conversa nossos vao ao Hindsight para apagar"),
    ("src/relatorio-semanal.ts", "if (estado === 'desconsiderado') { desconsiderados.push(c.nome); continue; }", "", "semanal: cliente desconsiderado aparece na evolucao"),
    ("src/relatorio-semanal.ts", "if (naSemana.some((m) => !m.deMim)) avancaram.push(c.nome);", "if (naSemana.some((m) => m.deMim)) avancaram.push(c.nome);", "semanal: avancou quem RESPONDEU na semana"),
    ("src/relatorio-semanal.ts", "if (c.estado !== 'marcado') continue;", "", "semanal: compromisso cumprido ou cancelado nao aparece como pendente"),
    ("src/relatorio-semanal.ts", "if (i === listas.length - 1 && lista.length <= 3) continue;", "", "semanal: nunca corta 'Aguardando voce' abaixo de 3 itens"),
    ("src/onboarding/painel.ts", "const qr = w.estado === 'conectado' ? null : lerQr(db);", "const qr = lerQr(db);", "painel: conectado nunca mostra QR"),
    ("src/onboarding/painel.ts", "if (/<script|<foreignObject|<image|<a[ >]|<use|<style|\\son[a-z]+\\s*=|href\\s*=|javascript:/i.test(svg)) return null;", "", "painel: SVG com script, link ou evento nao vai para a tela"),
    ("src/onboarding/painel.ts", "return msgs.some((m) => !ehMensagemNossa(db, m.texto, m.wa)) ? 'ok' : 'aguardando_resposta';", "return msgs.length > 0 ? 'ok' : 'aguardando_resposta';", "painel: o eco da nossa mensagem de teste nao conta como resposta do dono"),
    ("src/onboarding/painel.ts", "if (e === 'aguardando_envio' || e === 'aguardando_resposta') return false;", "", "painel: teste do self-chat em andamento nao e repetido"),
    ("src/onboarding/painel.ts", "marca('whatsapp', w.estado === 'conectado' ? 'verde'", "marca('whatsapp', w.estado === 'conectado' || w.estado === 'reconectar' ? 'verde'", "painel: so conectado deixa o passo do WhatsApp verde"),
    ("src/whatsapp/identidade.ts", "tipoDoJid(j) === 'pn')", "tipoDoJid(j) === 'lid')", "whatsapp: a identidade do dono exige o numero de telefone"),
    ("src/whatsapp/estado.ts", "user.slice(-4)", "user.slice(0)", "whatsapp: a tela so recebe o final do numero do dono"),
    ("src/whatsapp/escuta.ts", "db.exec(`ROLLBACK TO ${nome}`);\n      db.exec(`RELEASE ${nome}`);\n      r.falhas++;", "db.exec(`RELEASE ${nome}`);\n      r.falhas++;", "whatsapp: falha numa mensagem desfaz so aquela mensagem"),
    ("src/bugs.ts", "t = t.replace(/\\bBearer", "t = t; t.replace(/\\bBearer", "bugs: Bearer mascarado"),
    ("src/bugs.ts", "existentes.has(nome); n++", "false; n++", "bugs: repeticoes no mesmo segundo ganham numero"),
    ("src/mcp-contrato.ts", "escreve: true, escreveEm: ['feedback']", "escreve: true, escreveEm: ['feedback', 'mensagens']", "MCP so escreve em feedback"),
    ("src/historico-antigo.ts", "if (!c.liberado) return null;", "", "historico antigo: trava fechada nao pede"),
    ("src/historico-antigo.ts", "const estado = vazias >= VAZIAS_PARA_CONCLUIR ? 'concluida' : h.pedidos >= c.maxPaginas ? 'esgotada' : 'pendente';", "const estado = 'concluida';", "historico antigo: precisa de 2 vazias para concluir"),
    ("src/extracao.ts", "return r?.valor === 'true';", "return true;", "extracao: padrao fechado se nao configurado"),
    ("src/onboarding/painel.ts", "if (!p.processamento.liberada) processar = { estado: 'pendente', percentual: null, detalhe: 'Aguardando o seu OK para liberar o processamento.' };", "if (false) processar = { estado: 'pendente', percentual: null, detalhe: 'Aguardando o seu OK para liberar o processamento.' };", "estadosAoVivo: processar fica pendente com trava fechada"),
    ("src/onboarding/painel.ts", "else if (!recebido || pend > 0) extrair = { estado: 'processando'", "else if (false) extrair = { estado: 'processando'", "estadosAoVivo: extrair fica processando com pendencias"),
    ("src/cadastro.ts", "if (c.cliente !== null) return { ok: false, motivo: 'Este numero e de um cliente; o cadastro aqui e so da equipe interna.' };", "", "cadastro: recusa numero de cliente"),
    ("src/cadastro.ts", "if (n.length === 9) {", "if (false) {", "cadastro: celular de 9 digitos gera variante sem 9"),
    ("src/modelo-teste.ts", "if (lerTesteDoModelo(db).estado !== 'pedido') return false;", "", "modelo-teste: executarTeste so age se ha pedido"),
    ("src/modelo-teste.ts", "if (t.estado === 'pedido' && t.pedidoEm !== null && agora - t.pedidoEm < PEDIDO_VALE_MS) return false;", "", "modelo-teste: pedido recente nao empilha"),
    ("src/onboarding/servidor.ts", "esperaRespostaSegundos: Math.round(c.esperaRespostaMs / 1000),", "esperaRespostaSegundos: 0,", "tela: o tempo de espera por resposta chega ao cartao para a estimativa"),
    ("src/fila.ts", "t.tentativas >= (opcoes.maximo ?? MAX_TENTATIVAS)", "t.tentativas >= MAX_TENTATIVAS", "fila: midia indisponivel desiste na 3a tentativa, nao na 5a"),
    ("src/onboarding/fontes.ts", "const semArquivo = q('baixar_midia').indisponivel ?? 0;", "const semArquivo = 0;", "fontes: midia que o WhatsApp nao tem mais nao conta como sem arquivo"),
    ("src/midia.ts", "ehMidiaIndisponivel(erro) ? { maximo: MAX_TENTATIVAS_INDISPONIVEL } : {}", "{}", "midia: erro de arquivo indisponivel usa o limite menor"),
    ("src/consumo.ts", "return e.entrada + e.saida >= tetoDiario(db);", "return false;", "consumo: teto diario atingido pausa a extracao"),
    ("src/processamento.ts", "if (atual && atual.concluidas + atual.falhas < atual.total) return;", "", "processamento: liberar de novo retoma a rodada que nao terminou"),
    ("src/modelos.ts", "if (sessao.startsWith('heimdall:extracao:')) return 'extracao';", "", "modelos: o pedido de extracao usa a tarefa extracao"),
    ("src/onboarding/servidor.ts", "if (dados.liberar) iniciarRodada(op.banco, agora());", "", "tela: liberar abre a rodada do progresso"),
    ("src/candidatos-cliente.ts", "r.situacao === 'ida_e_volta' && r.papel === 'desconhecido' && r.clienteId === null", "r.situacao !== 'vazia' && r.papel === 'desconhecido' && r.clienteId === null", "clientes: so quem respondeu (ida e volta) vira cliente"),
    ("src/extracao.ts", "if (c.origem === 'provisorio') {", "if (true) {", "identificacao: nome do cadastro ou do dono nunca e trocado pelo modelo"),
    ("src/extracao.ts", "(diaDe(a) < diaDe(b) ? 1 : diaDe(a) > diaDe(b) ? -1 : a < b ? -1 : 1)", "(diaDe(a) < diaDe(b) ? -1 : diaDe(a) > diaDe(b) ? 1 : a < b ? -1 : 1)", "extracao: do dia mais novo para o mais antigo"),
    ("src/extracao.ts", "v.identificacao.confianca >= CONFIANCA_IDENTIFICACAO", "true", "identificacao: confianca baixa nao troca o nome"),
    ("src/historico-antigo.ts", "if (seguidas >= LIMITE_VAZIAS_SEGUIDAS) encerrarBusca(db, agora);", "", "historico antigo: respostas vazias seguidas encerram a busca inteira"),
    ("src/historico-antigo.ts", "const seguidas = novas > 0 ? 0 : lerNum(db, K_VAZIAS) + 1;", "const seguidas = lerNum(db, K_VAZIAS) + 1;", "historico antigo: resposta com mensagens zera a contagem do freio"),
    ("src/onboarding/ambiente.ts", "return m.dockerRodando && m.imagensFaltando !== undefined && m.imagensFaltando.length === 0;", "return true;", "ambiente: so com tudo instalado o disco usa o limite menor"),
    ("src/extracao.ts", "  return m ? Number(m[1]) : null;", "  return null;", "extracao: mensagem_origem em TEXTO vale (formato real do modelo)"),
    ("src/extracao.ts", "if (v.brutos > 0 && v.aceitos === 0) registrarDescarte(db);", "", "extracao: resposta toda recusada fica contada (nao e silenciosa)"),
    ("src/processamento.ts", "const restantes = c.novos + c.refeitos;", "const restantes = c.novos + c.refeitos + naFila;", "processamento: o que falta nao conta a fila duas vezes"),
    ("src/historico-antigo.ts", "(SELECT COUNT(*) FROM mensagens m WHERE m.conversa_id = h.conversa_id) DESC, h.conversa_id", "h.conversa_id", "historico antigo: pede primeiro as conversas com mais mensagens"),
    ("src/historico-antigo.ts", "WHERE estado = 'esgotada' AND pedidos = 0", "WHERE estado = 'esgotada'", "historico antigo: reabrir so as conversas nunca pedidas"),
    ("src/extracao.ts", "(aguardandoComOrigem ? 1 : 0) + (identComConteudo ? 1 : 0)", "(objeto(a) ? 1 : 0) + (objeto(idt) ? 1 : 0)", "extracao: nada encontrado legitimo nao e descarte (falso alarme)"),
    ("src/onboarding/recursos.ts", "bLiberar.textContent=r.liberada?'Processamento em andamento':'Comecar o processamento';", "", "tela: o botao Comecar muda quando o processamento esta liberado"),
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
