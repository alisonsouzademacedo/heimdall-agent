# Abre o Docker Desktop FORA do app Claude, reparando antes o engine.sock preso se houver (LICOES.md, 2026-10-20, "Docker do Claude").
# Nao rode este arquivo de dentro do app Claude: use instalar\docker-fora.cmd (ou deixe o launcher chamar). So caracteres ASCII.
# Nunca fecha o Docker Desktop, nunca para o WSL, nunca apaga nada alem dos arquivos de 0 bytes engine.sock / engine.sock.stale (docker-reparo.ps1).
param([switch]$SemPausa)
$ErrorActionPreference = 'Continue'
$raiz = Split-Path -Parent $PSScriptRoot
$dados = if ($env:HEIMDALL_DATA) { $env:HEIMDALL_DATA } else { Join-Path $raiz 'data' }
$pastaLogs = Join-Path $dados 'logs'
New-Item -ItemType Directory -Force -Path $pastaLogs | Out-Null
$arqLog = Join-Path $pastaLogs 'docker-fora.log'
function Log($t) { $l = ('{0} {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $t); Write-Host $l; Add-Content -LiteralPath $arqLog -Value $l -Encoding ASCII }

. (Join-Path $PSScriptRoot 'fora-do-pacote.ps1')
. (Join-Path $PSScriptRoot 'docker-reparo.ps1')

if (EmAppEmpacotado) {
  Log 'ERRO: este script esta rodando por dentro do app Claude (AppData redirecionado); o Docker abriria quebrado. Use instalar\docker-fora.cmd pelo Explorer.'
  exit 3
}

function DockerFunciona { try { & docker info 2>$null | Out-Null; return ($LASTEXITCODE -eq 0) } catch { return $false } }
$pasta = PastaSegredosDocker
$presos = @(SocketsDockerObsoletos $pasta).Count
$plano = PlanoDockerFora (DockerFunciona) $presos (DockerDesktopRodando)
Log "plano: $plano (arquivos presos: $presos)"

if ($plano -eq 'nada') { Log 'O Docker ja esta funcionando.'; exit 0 }
if ($plano -eq 'feche-o-docker') { Log 'O Docker Desktop esta aberto mas sem motor (provavel janela de erro). Clique em Quit nela e rode de novo.'; if (-not $SemPausa) { Read-Host 'ENTER para fechar' | Out-Null }; exit 2 }
if ($plano -eq 'reparar+abrir') {
  $rep = RepararSocketsDocker $pasta $false
  if (-not $rep.Ok) { Log "ERRO: nao consegui reparar: $($rep.Motivo)"; exit 1 }
  $oque = if ($rep.Movida) { "pasta movida para $($rep.Movida)" } else { "$($rep.Removidos.Count) arquivo(s) removido(s)" }
  Log "Reparo feito ($oque)."
}
$exe = @((Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\Docker Desktop.exe'), (Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe')) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $exe) { Log 'ERRO: nao achei o Docker Desktop instalado.'; exit 1 }
Start-Process -FilePath $exe
Log 'Docker Desktop aberto (fora do app Claude). Ele leva alguns minutos para ficar verde.'
exit 0
