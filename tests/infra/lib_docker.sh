#!/usr/bin/env sh
# Funcoes comuns dos testes com Docker de verdade (smoke_docker.sh, smoke_midia.sh). Usar com ".": . tests/infra/lib_docker.sh
# Python 3 de verdade (no Windows "python3" costuma ser o atalho falso da Loja: usa o primeiro que RODA; LICOES.md, 2026-10-19).
PY=""; for c in python3 python py; do if "$c" -c "import sys; sys.exit(0 if sys.version_info[0] >= 3 else 1)" >/dev/null 2>&1; then PY="$c"; break; fi; done

# construir <contexto> <tag> <imagem-base> : com HEIMDALL_CA_PEM (rede com inspecao TLS) o certificado entra so numa base de TESTE, nunca nas imagens do projeto.
construir() {
  ctx="$1"; tag="$2"; base="$3"
  if [ -n "${HEIMDALL_CA_PEM:-}" ] && [ -r "$HEIMDALL_CA_PEM" ]; then
    mkdir -p "$T/ca" && cp "$HEIMDALL_CA_PEM" "$T/ca/ca.crt"
    printf 'FROM %s\nUSER root\nCOPY ca.crt /usr/local/share/ca-certificates/ca.crt\nRUN cat /usr/local/share/ca-certificates/ca.crt >> /etc/ssl/certs/ca-certificates.crt\nENV UV_SYSTEM_CERTS=1 SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt PIP_CERT=/etc/ssl/certs/ca-certificates.crt\n' "$base" > "$T/ca/Dockerfile"
    docker build -q -t "smoke-base-$(echo "$tag" | tr ':/' '__')" "$T/ca" >/dev/null || return 1
    docker buildx build --load --build-context "$base=docker-image://smoke-base-$(echo "$tag" | tr ':/' '__')" -t "$tag" "$ctx" >"$T/build.txt" 2>&1
  else
    docker build -t "$tag" "$ctx" >"$T/build.txt" 2>&1
  fi
}

# Git Bash (Windows): converte argumentos que parecem caminho, como /app/api/... (vira C:/Program Files/Git/app/api/...), antes de o Docker ver.
# LICOES.md, 2026-10-20. drun = "docker run" sem essa conversao; hpath = caminho nativo de uma pasta do COMPUTADOR (C:/... no Windows) para -v.
# Os demais comandos (docker compose --env-file, docker cp) precisam da conversao e seguem normais.
drun() { MSYS_NO_PATHCONV=1 docker run "$@"; }
hpath() { case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) cygpath -m "$1" ;; *) printf '%s' "$1" ;; esac; }
