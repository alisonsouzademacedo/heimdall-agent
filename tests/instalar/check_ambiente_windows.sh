#!/usr/bin/env sh
# O instalador deve checar virtualizacao e WSL (o Docker Desktop precisa dos dois; docs/docker/desktop/setup/install/windows-install.md)
# e AVISAR antes de oferecer o Docker. Roda com o PowerShell que existir (pwsh no GitHub, powershell.exe no Windows) e SEMPRE com
# -SomenteMostrar (nada e instalado). Os valores sao simulados por HEIMDALL_TESTE_VIRT / HEIMDALL_TESTE_WSL (so valem com HEIMDALL_TESTE=1).
# Uso: sh tests/instalar/check_ambiente_windows.sh   (REQUIRE_PWSH=1 faz a falta do PowerShell contar como falha)
cd "$(dirname "$0")/../.." || exit 2
PS1=instalar/instalar.ps1
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

PW=""
for c in pwsh powershell.exe powershell; do command -v "$c" >/dev/null 2>&1 && { PW="$c"; break; }; done
if [ -z "$PW" ]; then
  echo "  [NAO EXECUTADO] nenhum PowerShell encontrado"; [ "${REQUIRE_PWSH:-0}" = 1 ] && exit 1; exit 0
fi

T=$(mktemp -d)
roda() { # roda <virt> <wsl> [args...]  -> saida em $T/saida.txt, codigo em $?
  v="$1"; w="$2"; shift 2
  HEIMDALL_TESTE=1 HEIMDALL_TESTE_VIRT="$v" HEIMDALL_TESTE_WSL="$w" "$PW" -NoProfile -File "$PS1" -SomenteMostrar -SemPausa -SemClipboard -SemTestes "$@" > "$T/saida.txt" 2>&1 < /dev/null
}

# 1) virtualizacao desligada
roda 0 1; C=$?
grep -qi 'Virtualizacao.*' "$T/saida.txt" && grep -E 'FALTA.*Virtualizacao' "$T/saida.txt" >/dev/null && pass "virtualizacao desligada: aparece como FALTA" || fail "virtualizacao desligada nao foi apontada"
grep -q 'BIOS' "$T/saida.txt" && pass "virtualizacao desligada: explica a BIOS" || fail "sem a explicacao da BIOS"
[ "$C" -eq 1 ] && pass "virtualizacao desligada: termina com pendencia (codigo 1)" || fail "codigo de saida $C (esperado 1)"

# 2) virtualizacao ligada, WSL ausente
roda 1 0; C=$?
grep -E 'FALTA.*WSL' "$T/saida.txt" >/dev/null && pass "WSL ausente: aparece como FALTA" || fail "WSL ausente nao foi apontado"
grep -q 'wsl --install' "$T/saida.txt" && pass "WSL ausente: diz como instalar (wsl --install)" || fail "sem a instrucao wsl --install"
grep -q 'dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux' "$T/saida.txt" && grep -q 'featurename:VirtualMachinePlatform' "$T/saida.txt" && grep -q 'docs/wsl/install-manual.md' "$T/saida.txt" && pass "WSL ausente: traz o caminho manual (dism) para quando o wsl --install responde em circulo" || fail "sem o caminho manual do WSL (dism) quando wsl --install nao funciona"
grep -E 'FALTA.*Virtualizacao' "$T/saida.txt" >/dev/null && fail "virtualizacao ligada apontada como falta" || pass "virtualizacao ligada nao e apontada"

# 3) tudo presente
roda 1 1
grep -E 'OK.*Virtualizacao' "$T/saida.txt" >/dev/null && grep -E 'OK.*WSL' "$T/saida.txt" >/dev/null && pass "virtualizacao e WSL presentes: ambos OK" || fail "virtualizacao/WSL presentes nao aparecem como OK"

# 4) O Docker so aparece COM AVISO quando falta virtualizacao ou WSL (sempre -SomenteMostrar: este teste nunca instala nada)
roda 0 0
grep -qi 'Atencao.*Docker' "$T/saida.txt" && pass "avisa que o Docker nao vai abrir enquanto faltar virtualizacao ou WSL" || fail "o Docker e listado sem aviso"
rm -rf "$T"
[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
