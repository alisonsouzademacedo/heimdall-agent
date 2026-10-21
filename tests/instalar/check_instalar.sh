#!/usr/bin/env sh
# Testes do instalador do Windows (instalar/instalar.ps1): so ASCII, sem ${var}: perigoso, sintaxe, e comportamento com
# programas FALSOS no PATH (nada e instalado de verdade). Uso: sh tests/instalar/check_instalar.sh  (REQUIRE_PWSH=1 exige o PowerShell 7)
cd "$(dirname "$0")/../.." || exit 2
. tests/lib/so.sh   # SO, falsos (.cmd no Windows, shell no Linux) e limpeza
PS1=instalar/instalar.ps1
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

# ---- estaticos (sem PowerShell) ----
BAD=$(grep -nE '\$[A-Za-z_][A-Za-z0-9_]*:([^A-Za-z0-9_]|$)' "$PS1" | grep -vE '\$(env|script|global|local|private|using):')
[ -z "$BAD" ] && pass "nenhum \"\$nome:\" perigoso" || { fail "padrao \"\$nome:\" perigoso"; echo "$BAD" | cut -c1-120; }
if grep -nP '[^\x00-\x7F]' "$PS1" instalar/PROMPT-IA.txt iniciar.cmd >/dev/null; then fail "arquivo com caractere fora de ASCII"; else pass "instalador, prompt e iniciar.cmd so com ASCII"; fi
if grep -qiE 'Invoke-Expression|\biex\b|--accept-license|--quiet|Set-ExecutionPolicy|Add-MpPreference|-Verb RunAs' "$PS1"; then fail "o instalador usa comando proibido (iex, aceitar licenca por voce, mexer em seguranca do Windows, elevar sem pedir)"; else pass "sem iex, sem aceitar licenca pelo dono, sem mexer em seguranca do Windows"; fi
URLS=$(grep -oE 'https?://[^ "'"'"')]+' "$PS1" | sed -E 's|(https?://[^/]+).*|\1|' | sort -u | tr '\n' ' ')
for u in $URLS; do case "$u" in https://desktop.docker.com|https://git-scm.com|https://nodejs.org|https://www.python.org|https://docs.docker.com|https://github.com) ;; *) fail "endereco nao previsto no instalador: $u";; esac; done
pass "enderecos no instalador: $URLS"
for g in $(grep -oE 'github\.com/[A-Za-z0-9_./-]+' "$PS1" | sort -u); do case "$g" in github.com/alisonsouzademacedo/heimdall-agent.git) ;; *) fail "repositorio GitHub inesperado: $g";; esac; done
pass "o unico repositorio GitHub citado e o do projeto"
grep -q 'Git.Git' "$PS1" && grep -q 'OpenJS.NodeJS.LTS' "$PS1" && grep -q 'Python.Python.3.14' "$PS1" && pass "IDs do winget iguais aos da documentacao (codex-manual.md)" || fail "IDs do winget diferem da documentacao"
grep -qF 'instalar\instalar.ps1' iniciar.cmd && grep -q "ExecutionPolicy Bypass" iniciar.cmd && grep -q "pause" iniciar.cmd && pass "iniciar.cmd chama o instalador e pausa" || fail "iniciar.cmd incompleto"
grep -qx 'instalar-relatorio.txt' .gitignore && pass ".gitignore cobre o relatorio do instalador" || fail ".gitignore sem instalar-relatorio.txt"
# O texto inicial da IA precisa apontar para o que JA existe (Compose e imagens no repositorio) e para a meta combinada (D30: validar no Windows, depois a VPS).
if grep -q 'infra/compose' instalar/PROMPT-IA.txt && grep -q 'tests/infra' instalar/PROMPT-IA.txt && grep -q 'fase-2-migracao-para-vps' instalar/PROMPT-IA.txt; then pass "PROMPT-IA.txt aponta para o Compose do repositorio, os testes de infra e o plano da VPS (D30)"; else fail "PROMPT-IA.txt desatualizado: nao cita infra/compose, tests/infra e fase-2-migracao-para-vps"; fi
# Os testes do nucleo (node --test) nao usam pacote nenhum: o instalador nao deve baixar dependencias (npm ci) antes deles (PROGRESS.md, pendencias 2026-10-19).
if grep -q 'npm ci' "$PS1"; then fail "o instalador roda npm ci (os testes do nucleo nao precisam; so o tsc precisa)"; else pass "o instalador nao roda npm ci antes dos testes do nucleo"; fi
# Saida do Node e UTF-8; o PowerShell 5.1 le o console em outra codificacao e estraga os acentos se nao for ajustado.
if grep -q 'Console\]::OutputEncoding' "$PS1" && grep -q 'UTF8Encoding' "$PS1"; then pass "o instalador ajusta a saida do console para UTF-8"; else fail "o instalador nao ajusta [Console]::OutputEncoding para UTF-8 (acentos do Node saem quebrados)"; fi

# ---- com PowerShell ----
PW="${PWSH:-}"
[ -z "$PW" ] && command -v pwsh >/dev/null 2>&1 && PW=$(command -v pwsh)
[ -z "$PW" ] && [ -n "$PWSH_PATH_FILE" ] && [ -r "$PWSH_PATH_FILE" ] && PW=$(cat "$PWSH_PATH_FILE")
if [ -z "$PW" ] || [ ! -x "$PW" ]; then
  echo "  [NAO EXECUTADO] testes de comportamento: PowerShell 7 nao encontrado"; [ "${REQUIRE_PWSH:-0}" = 1 ] && FAIL=$((FAIL+1))
else
  export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1 HEIMDALL_TESTE=1
  T=$(mktemp -d)
  # sintaxe pelo analisador do PowerShell
  PS1_PATH="$(caminho_nativo "$PWD/$PS1")" "$PW" -NoProfile -Command '$e=$null;[void][System.Management.Automation.Language.Parser]::ParseFile($env:PS1_PATH,[ref]$null,[ref]$e); if($e.Count){$e|%{$_.Message};exit 1}' >/dev/null 2>&1 && pass "o PowerShell analisa o instalador sem erros" || fail "erro de sintaxe no instalador"

  # Os programas falsos vem de tests/lib/so.sh (no Windows sao .cmd; um script sem extensao abriria "escolher programa").
  # No Windows o instalador mede o computador de verdade (memoria livre, virtualizacao, WSL, engine.sock do Docker): fixa tudo,
  # para o resultado nao depender da maquina onde o teste roda (AGENTS.md).
  if [ "$SO" = windows ]; then
    mkdir -p "$T/segredos"
    export HEIMDALL_TESTE_VIRT=1 HEIMDALL_TESTE_WSL=1 HEIMDALL_TESTE_SECRETS_DIR="$(caminho_nativo "$T/segredos")" HEIMDALL_TESTE_MEM_LIVRE_MB=8000
  fi
  fake() { falso_saida "$@"; } # fake <pasta> <nome> <saida> [codigo]
  novo_bin() { B="$T/$1"; mkdir -p "$B"; falso_anota "$B" winget "$T/winget-chamadas.txt"; }
  roda() { # roda <bin> <entrada> [args...]
    b="$1"; entrada="$2"; shift 2
    printf '%s' "$entrada" | PATH="$b" "$PW" -NoProfile -File "$PWD/$PS1" -SemPausa -SemTestes -SemClipboard "$@" > "$T/saida.txt" 2>&1
    return $?; }

  # A) tudo instalado
  novo_bin a; fake "$T/a" git "git version 2.50.0"; fake "$T/a" node "v22.22.0"; fake "$T/a" python "Python 3.12.1"; fake "$T/a" docker "Docker version 29"
  rm -f "$T/winget-chamadas.txt"; roda "$T/a" "" -SomenteMostrar; C=$?
  [ "$C" -eq 0 ] && pass "A) tudo instalado: termina sem pendencias" || fail "A) codigo $C"
  [ "$(grep -c '\[OK\]' "$T/saida.txt")" -ge 4 ] && pass "A) mostra os 4 itens como OK" || fail "A) nao mostrou os 4 OK"
  [ ! -f "$T/winget-chamadas.txt" ] && pass "A) nao chamou o winget" || fail "A) chamou o winget sem precisar"

  # B) nada instalado, so mostrar
  novo_bin b; rm -f "$T/winget-chamadas.txt"; roda "$T/b" "" -SomenteMostrar; C=$?
  [ "$C" -eq 1 ] && pass "B) nada instalado: termina com pendencias" || fail "B) codigo $C"
  [ "$(grep -c 'FALTA' "$T/saida.txt")" -ge 4 ] && pass "B) lista os 4 itens que faltam" || fail "B) lista incompleta"
  [ ! -f "$T/winget-chamadas.txt" ] && pass "B) somente mostrar NAO instala nada" || fail "B) instalou em modo somente mostrar"

  # C) nada instalado, dono responde N a tudo
  rm -f "$T/winget-chamadas.txt"; roda "$T/b" "N
N
N
N
"; C=$?
  [ ! -f "$T/winget-chamadas.txt" ] && pass "C) respondendo N, nada e instalado" || fail "C) instalou mesmo com N"

  # D) nada instalado, dono responde S a tudo (Sim): winget com os IDs documentados
  rm -f "$T/winget-chamadas.txt"; roda "$T/b" "" -Sim; C=$?
  for id in Git.Git OpenJS.NodeJS.LTS Python.Python.3.14; do grep -q "install --id $id" "$T/winget-chamadas.txt" 2>/dev/null && pass "D) instalou com o ID $id" || fail "D) faltou o ID $id"; done
  [ "$(wc -l < "$T/winget-chamadas.txt")" -eq 3 ] && pass "D) exatamente 3 chamadas ao winget (Docker usa o instalador oficial)" || fail "D) numero inesperado de chamadas ao winget"
  grep -q "teste) baixaria" "$T/saida.txt" && pass "D) Docker: so descreve o download no modo de teste" || fail "D) Docker nao tratado"

  # E) Node antigo (v20) conta como faltando
  novo_bin e; fake "$T/e" git "git version 2.50.0"; fake "$T/e" node "v20.11.0"; fake "$T/e" python "Python 3.12.1"; fake "$T/e" docker "Docker version 29"
  rm -f "$T/winget-chamadas.txt"; roda "$T/e" "" -SomenteMostrar; C=$?
  [ "$C" -eq 1 ] && grep -q "Node.js 22.18" "$T/saida.txt" && grep -q "FALTA.*Node" "$T/saida.txt" && pass "E) Node 20 e tratado como insuficiente" || fail "E) Node antigo passou"
  # F) Node 22.17 (um abaixo do minimo) falha; 22.18 passa
  fake "$T/e" node "v22.17.9"; roda "$T/e" "" -SomenteMostrar; [ $? -eq 1 ] && pass "F) Node 22.17 insuficiente" || fail "F) 22.17 passou"
  fake "$T/e" node "v22.18.0"; roda "$T/e" "" -SomenteMostrar; [ $? -eq 0 ] && pass "F) Node 22.18 suficiente" || fail "F) 22.18 falhou"
  fake "$T/e" node "v24.1.0"; roda "$T/e" "" -SomenteMostrar; [ $? -eq 0 ] && pass "F) Node 24 suficiente" || fail "F) Node 24 falhou"
  # G) Python que nao e o 3 (ex.: loja do Windows) nao conta
  fake "$T/e" python "Python 2.7.18"; roda "$T/e" "" -SomenteMostrar; [ $? -eq 1 ] && pass "G) Python 2 nao conta" || fail "G) Python 2 passou"
  # H) Docker instalado mas parado: avisa e termina com pendencia
  fake "$T/e" python "Python 3.12.1"; fake "$T/e" docker "erro" 1; roda "$T/e" "" -SomenteMostrar; C=$?
  grep -q "NAO esta rodando" "$T/saida.txt" && pass "H) Docker parado e avisado" || fail "H) Docker parado nao avisado"

  # L) memoria livre (a medicao so existe no Windows): pouca memoria avisa; bastante memoria mostra OK. Em teste a medida e FIXADA.
  if [ "$SO" = windows ]; then
    HEIMDALL_TESTE_MEM_LIVRE_MB=1000 roda "$T/a" "" -SomenteMostrar
    grep -q "Memoria livre baixa (1000 MB)" "$T/saida.txt" && pass "L) com 1000 MB livres o instalador avisa que a memoria esta baixa" || fail "L) nao avisou memoria baixa com 1000 MB"
    HEIMDALL_TESTE_MEM_LIVRE_MB=8000 roda "$T/a" "" -SomenteMostrar
    grep -q "Memoria livre: 8000 MB" "$T/saida.txt" && ! grep -q "Memoria livre baixa" "$T/saida.txt" && pass "L) com 8000 MB livres mostra OK e nao avisa" || fail "L) com 8000 MB nao mostrou OK"
  else
    echo "  [NAO SE APLICA] L) memoria livre: so o instalador do Windows mede a memoria (no Linux o bloco nao existe)"
  fi

  # I) conectar a pasta ao GitHub (com git de verdade e um "GitHub" local)
  if command -v git >/dev/null 2>&1; then
    GIT_REAL=$(command -v git)
    ORIGEM="$T/origem"; mkdir -p "$ORIGEM"; (cd "$ORIGEM" && git init -q -b main && git config user.email t@t && git config user.name t && mkdir -p instalar && echo "ola" > arquivo.txt && git add -A && git commit -q -m inicial)
    git clone -q --bare "$ORIGEM" "$T/remoto.git"
    PROJ="$T/proj"; mkdir -p "$PROJ/instalar"; cp "$PS1" "$PROJ/instalar/instalar.ps1"; cp "$ORIGEM/arquivo.txt" "$PROJ/arquivo.txt"   # como o conteudo do ZIP: sem .git
    novo_bin g; falso_script "$T/g" git 'exec "'"$GIT_REAL"'" "$@"' '"'"$(caminho_nativo "$GIT_REAL")"'" %*'; fake "$T/g" node "v22.22.0"; fake "$T/g" python "Python 3.12.1"; fake "$T/g" docker "Docker version 29"
    printf '' | HEIMDALL_REPO_URL="$(caminho_nativo "$T/remoto.git")" PATH="$T/g$PATH_GIT" "$PW" -NoProfile -File "$PROJ/instalar/instalar.ps1" -SemPausa -SemTestes -SemClipboard > "$T/saida.txt" 2>&1
    (cd "$PROJ" && [ "$(git rev-parse --abbrev-ref HEAD)" = main ] && [ "$(git remote get-url origin)" = "$(caminho_nativo "$T/remoto.git")" ] && [ "$(git rev-parse --abbrev-ref main@{upstream})" = origin/main ]) && pass "I) a pasta do ZIP virou repositorio ligado ao GitHub (main acompanha origin/main)" || fail "I) git nao foi conectado"
    (cd "$PROJ" && [ -z "$(git status --porcelain | grep -v '^?? instalar' | grep -v '^?? instalar-relatorio' | grep -v '^?? data')" ]) && pass "I) os arquivos baixados nao aparecem como alterados" || fail "I) o git mostra arquivos alterados apos conectar"
    printf '' | HEIMDALL_REPO_URL="$(caminho_nativo "$T/remoto.git")" PATH="$T/g$PATH_GIT" "$PW" -NoProfile -File "$PROJ/instalar/instalar.ps1" -SemPausa -SemTestes -SemClipboard > "$T/saida2.txt" 2>&1
    grep -q "ja conectada" "$T/saida2.txt" && pass "I) rodar de novo nao refaz a conexao" || fail "I) segunda execucao refez a conexao"
    # J) URL do GitHub quebrada: vira relatorio de bug, sem derrubar o instalador
    PROJ2="$T/proj2"; mkdir -p "$PROJ2/instalar"; cp "$PS1" "$PROJ2/instalar/instalar.ps1"
    printf '' | HEIMDALL_REPO_URL="$(caminho_nativo "$T/nao-existe.git")" PATH="$T/g$PATH_GIT" "$PW" -NoProfile -File "$PROJ2/instalar/instalar.ps1" -SemPausa -SemTestes -SemClipboard > "$T/saida3.txt" 2>&1
    BUG=$(ls "$PROJ2"/data/bugs/*conectar-git*.md 2>/dev/null | head -1)
    [ -n "$BUG" ] && grep -q "^estado: aberto" "$BUG" && grep -q "^origem: instalador" "$BUG" && pass "J) falha ao conectar o git gera relatorio de bug aberto em data/bugs" || fail "J) sem relatorio de bug ao falhar o git"
    grep -q "Bugs de instalacao" "$BUG" 2>/dev/null && pass "J) o relatorio instrui a IA (teste que falha, correcao, LICOES, commit)" || fail "J) relatorio sem instrucoes para a IA"
    # K) winget falha e imprime segredo: o relatorio nao pode conter o segredo
    novo_bin k; FALSO_GHP="ghp""_abcdefghijklmnopqrstuvwxyz1234567890"   # segredo FALSO montado em partes (o teste de higiene procura chaves nos arquivos)
    falso_script "$T/k" winget 'echo "erro token=SEGREDO123456 e '"$FALSO_GHP"' em C:\\Users\\Joao\\x"
exit 1' 'echo erro token=SEGREDO123456 e '"$FALSO_GHP"' em C:\Users\Joao\x
exit /b 1'
    PROJ3="$T/proj3"; mkdir -p "$PROJ3/instalar"; cp "$PS1" "$PROJ3/instalar/instalar.ps1"
    printf '' | PATH="$T/k" "$PW" -NoProfile -File "$PROJ3/instalar/instalar.ps1" -SemPausa -SemTestes -SemClipboard -Sim > "$T/saida4.txt" 2>&1
    BUG3=$(ls "$PROJ3"/data/bugs/*instalar-git*.md 2>/dev/null | head -1)
    [ -n "$BUG3" ] && pass "K) falha do winget gera relatorio" || fail "K) falha do winget nao gerou relatorio"
    if [ -n "$BUG3" ]; then
      ! grep -q "SEGREDO123456\|ghp_abcdefghijkl\|Joao" "$BUG3" && pass "K) segredos e nome de usuario NAO vao para o relatorio" || fail "K) o relatorio vazou segredo ou usuario"
      grep -q "Codigo de saida: 1" "$BUG3" && pass "K) o relatorio traz o codigo de saida" || fail "K) sem codigo de saida"
    fi
  else
    echo "  [NAO EXECUTADO] cenarios I-K: git nao encontrado"; [ "${REQUIRE_PWSH:-0}" = 1 ] && FAIL=$((FAIL+1))
  fi
  limpar_pasta "$T"
fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
