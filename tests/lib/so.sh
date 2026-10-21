#!/usr/bin/env sh
# Biblioteca dos testes de shell para Windows (Git Bash) e Linux. Uso: . tests/lib/so.sh   (depois de "cd" para a raiz do projeto)
# Por que existe (LICOES.md, 2026-10-20): as suites do launcher e do instalador criam node/docker/python/winget FALSOS. Um script de shell sem extensao nao e
# um programa no Windows: o sistema pergunta "com que programa abrir" e o teste falha. No Windows os falsos sao .cmd; no Linux continuam scripts de shell.
# Matriz completa dos dois sistemas: docs/plano/runbooks/10-testes-windows-e-linux.md
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) SO=windows ;;
  Darwin*) SO=mac ;;
  *) SO=linux ;;
esac

# PATH_GIT: pastas que o Git REAL precisa quando o PATH do teste e so a pasta dos falsos. No Windows, sem elas o "git fetch" trava (violacao de acesso);
# no Linux nao precisa de nada. Uso: PATH="$B$PATH_GIT"
PATH_GIT=""
[ "$SO" = windows ] && PATH_GIT=":/mingw64/bin:/usr/bin"

# caminho_nativo <caminho>: no Windows vira C:/pasta/arquivo (para variaveis de ambiente e arquivos .cmd); no Linux fica igual.
caminho_nativo() { if [ "$SO" = windows ]; then cygpath -m "$1"; else printf '%s' "$1"; fi; }

# falso_saida <pasta> <nome> <texto> [codigo]: programa falso que imprime <texto> e sai com <codigo> (padrao 0).
falso_saida() {
  if [ "$SO" = windows ]; then
    printf '@echo off\r\necho %s\r\nexit /b %s\r\n' "$3" "${4:-0}" > "$1/$2.cmd"
  else
    printf '#!/bin/sh\necho "%s"\nexit %s\n' "$3" "${4:-0}" > "$1/$2"; chmod +x "$1/$2"
  fi
}

# falso_anota <pasta> <nome> <arquivo-de-registro>: programa falso que anota os argumentos (uma linha por chamada) e sai com 0.
falso_anota() {
  if [ "$SO" = windows ]; then
    printf '@echo off\r\n>> "%s" echo %%*\r\nexit /b 0\r\n' "$(caminho_nativo "$3")" > "$1/$2.cmd"
  else
    printf '#!/bin/sh\necho "$@" >> "%s"\nexit 0\n' "$3" > "$1/$2"; chmod +x "$1/$2"
  fi
}

# falso_script <pasta> <nome> <corpo-sh> <corpo-cmd>: programa falso com logica propria, um corpo por sistema.
# O corpo-sh comeca depois de "#!/bin/sh"; o corpo-cmd comeca depois de "@echo off". As quebras de linha do corpo-cmd viram CRLF.
falso_script() {
  if [ "$SO" = windows ]; then
    { printf '@echo off\r\n'; printf '%s\n' "$4" | sed 's/$/\r/'; } > "$1/$2.cmd"
  else
    { printf '#!/bin/sh\n'; printf '%s\n' "$3"; } > "$1/$2"; chmod +x "$1/$2"
  fi
}

# vivo <pid>: o processo existe (e nao e zumbi, no Linux). No Windows o pid e o do Windows (o que o PowerShell registra).
vivo() {
  if [ "$SO" = windows ]; then
    powershell -NoProfile -Command "if (Get-Process -Id $1 -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >/dev/null 2>&1
  else
    kill -0 "$1" 2>/dev/null && ! grep -q '^State:.*Z' "/proc/$1/status" 2>/dev/null
  fi
}

# matar <pid>: encerra um processo de teste (so os que o proprio teste criou).
matar() {
  if [ "$SO" = windows ]; then
    powershell -NoProfile -Command "Stop-Process -Id $1 -Force -ErrorAction SilentlyContinue" >/dev/null 2>&1
  else
    kill "$1" 2>/dev/null
  fi
}

# limpar_pasta <pasta>: apaga a pasta de teste. No Windows o fake de "node" ainda tem um "ping" vivo por ate ~25 s segurando os logs:
# tenta de novo (ate 40 s) em vez de falhar com "Device or resource busy". No Linux apaga de primeira.
limpar_pasta() {
  _n=0
  while [ "$_n" -lt 40 ]; do
    rm -rf "$1" 2>/dev/null
    [ ! -e "$1" ] && return 0
    _n=$((_n+1)); sleep 1
  done
  rm -rf "$1"
}
