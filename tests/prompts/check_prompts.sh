#!/usr/bin/env sh
# Testes dos textos de instrucao do Heimdall (prompts/): formato das skills, limites fixos do SOUL, tamanho do exemplo.
# Uso: sh tests/prompts/check_prompts.sh
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

# 1. Cada skill: pasta = name, descricao com no maximo 60 caracteres, secoes obrigatorias
for d in prompts/skills/*/; do
  n=$(basename "$d"); f="$d/SKILL.md"
  [ -f "$f" ] || { fail "$n: sem SKILL.md"; continue; }
  nm=$(sed -n 's/^name: *//p' "$f" | head -1)
  ds=$(sed -n 's/^description: *//p' "$f" | head -1)
  [ "$nm" = "$n" ] && pass "$n: name confere" || fail "$n: name '$nm' difere da pasta"
  [ -n "$ds" ] && [ "${#ds}" -le 60 ] && pass "$n: descricao ${#ds} caracteres" || fail "$n: descricao ausente ou maior que 60"
  for s in '## When to Use' '## Procedure' '## Pitfalls' '## Verification'; do
    grep -qF "$s" "$f" || fail "$n: falta a secao $s"
  done
done

# 2. SOUL.md: limites fixos presentes
for frase in 'somente com o dono' 'Nunca escreve, responde ou envia' 'Você não inventa' 'Limites que não mudam'; do
  grep -qF "$frase" prompts/SOUL.md && pass "SOUL tem: $frase" || fail "SOUL sem: $frase"
done

# 3. Toda skill que escreve ao dono reafirma que conteudo de conversa e dado, nao instrucao
for n in relatorio-diario relatorio-semanal conversar-no-self-chat; do
  grep -qiE 'dado' "prompts/skills/$n/SKILL.md" && grep -qiE 'nunca instru' "prompts/skills/$n/SKILL.md" && pass "$n: conversa e dado, nao instrucao" || fail "$n: falta a regra 'dado, nunca instrucao'"
done

# 4. Exemplo de relatorio diario cabe em uma tela (aprox. 350 palavras, sem o comentario inicial)
W=$(sed '/<!--/d' prompts/relatorios/exemplos/diario-exemplo.md | wc -w)
[ "$W" -le 350 ] && pass "exemplo do diario com $W palavras (maximo 350)" || fail "exemplo do diario com $W palavras (maximo 350)"

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
