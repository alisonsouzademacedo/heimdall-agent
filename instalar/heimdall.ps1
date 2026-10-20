# Liga, desliga e mostra o estado do Heimdall no Windows (os servicos do Docker e os 5 processos do Node). So caracteres ASCII.
# Uso (na raiz do projeto):  powershell -NoProfile -ExecutionPolicy Bypass -File instalar\heimdall.ps1 -Acao iniciar
#   -Acao iniciar        sobe o Docker Compose e os processos (tela, listener, executor, memoria, ponte); cria infra\compose\.env se nao existir
#   -Acao parar          para os processos que este script iniciou (o Docker continua; use -ComDocker para parar tambem)
#   -Acao estado         mostra o que esta rodando e o fim dos registros em data\logs
#   -Acao config-hermes  gera o config.yaml do Hermes e grava no volume dele (precisa do Docker rodando)
#   -SomenteMostrar      so mostra o plano, sem iniciar, parar nem criar nada
param([ValidateSet('iniciar', 'parar', 'estado', 'config-hermes')][string]$Acao = 'estado', [switch]$SomenteMostrar, [switch]$SemDocker, [switch]$ComDocker, [switch]$SemPausa)
$ErrorActionPreference = 'Continue'
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }
$ehWindows = ($env:OS -eq 'Windows_NT')
$raiz = Split-Path -Parent $PSScriptRoot
$dados = if ($env:HEIMDALL_DATA) { $env:HEIMDALL_DATA } else { Join-Path $raiz 'data' }
$pastaLogs = Join-Path $dados 'logs'
$arquivoPids = Join-Path $dados 'processos.json'
$envCompose = Join-Path $raiz 'infra\compose\.env'
$compose = Join-Path $raiz 'infra\compose\docker-compose.yml'
# Ordem de subida: a tela primeiro (mostra o link), depois quem escuta, quem processa, a memoria e a ponte.
$processos = @(
  @{ nome = 'tela'; script = 'apps/core/src/onboarding/iniciar.ts' },
  @{ nome = 'listener'; script = 'apps/listener/src/iniciar.ts'; pasta = 'apps/listener' },
  @{ nome = 'executor'; script = 'apps/trabalhos/src/iniciar.ts'; pasta = 'apps/trabalhos' },
  @{ nome = 'memoria'; script = 'apps/memoria/src/iniciar.ts'; pasta = 'apps/memoria' },
  @{ nome = 'ponte'; script = 'apps/ponte/src/iniciar.ts'; pasta = 'apps/ponte' }
)
function Info($t) { Write-Host "  $t" }
function Plano($t) { Write-Host "  [PLANO]  $t" -ForegroundColor Cyan }
function Ok($t) { Write-Host "  [OK]     $t" -ForegroundColor Green }
function Aviso($t) { Write-Host "  [ATENCAO] $t" -ForegroundColor Yellow }
function Pausa { if (-not $SemPausa) { Read-Host 'Pressione ENTER para fechar' | Out-Null } }

function LePids {
  if (-not (Test-Path $arquivoPids)) { return @{} }
  $mapa = @{}
  try { $o = Get-Content -Raw -Path $arquivoPids | ConvertFrom-Json; foreach ($p in $o.PSObject.Properties) { if ($null -ne $p.Value -and [int]$p.Value -gt 0) { $mapa[$p.Name] = [int]$p.Value } } } catch { }
  return $mapa
}
function GravaPids($mapa) {
  New-Item -ItemType Directory -Force -Path $dados | Out-Null
  [System.IO.File]::WriteAllText($arquivoPids, ($mapa | ConvertTo-Json), (New-Object System.Text.UTF8Encoding($false)))
}
function Vivo([int]$id) { if ($id -le 0) { return $false }; try { return ($null -ne (Get-Process -Id $id -ErrorAction Stop)) } catch { return $false } }

function VersaoDoNodeServe {
  $s = ''
  try { $s = (& node --version 2>$null | Select-Object -First 1) } catch { }
  if ($s -notmatch '^v(\d+)\.(\d+)') { return $false }
  $maior = [int]$Matches[1]; $menor = [int]$Matches[2]
  return ($maior -gt 22) -or ($maior -eq 22 -and $menor -ge 18)
}

function NovaChave([int]$bytes) {
  $b = New-Object byte[] $bytes
  $r = [System.Security.Cryptography.RandomNumberGenerator]::Create(); $r.GetBytes($b); $r.Dispose()
  return (($b | ForEach-Object { $_.ToString('x2') }) -join '')
}

function GarantirEnv {
  if (Test-Path $envCompose) { Ok 'infra\compose\.env ja existe (nao vou mexer nele)'; return }
  if ($SomenteMostrar) { Plano 'criaria infra\compose\.env com senha do banco e chave do Hermes aleatorias (LLM do Hindsight = none ate o login do ChatGPT)'; return }
  $linhas = @('# Criado por instalar\heimdall.ps1. Fora do git (.gitignore). Nao compartilhe este arquivo.',
    ('POSTGRES_PASSWORD=' + (NovaChave 16)), ('API_SERVER_KEY=' + (NovaChave 32)), 'HINDSIGHT_API_LLM_PROVIDER=none', '')
  [System.IO.File]::WriteAllText($envCompose, ($linhas -join "`n"), (New-Object System.Text.UTF8Encoding($false)))
  Ok 'criei infra\compose\.env com senha e chave aleatorias (so neste computador)'
}

function ComposeArgs([string[]]$resto) { return @('compose', '--env-file', $envCompose, '-f', $compose) + $resto }

function Iniciar {
  if (-not (VersaoDoNodeServe)) { Aviso 'Preciso do Node.js 22.18 ou mais novo. Rode iniciar.cmd (o instalador) primeiro.'; if (-not $SomenteMostrar) { exit 1 } }
  GarantirEnv
  if (-not $SemDocker) {
    if ($SomenteMostrar) { Plano ('docker ' + ((ComposeArgs @('up', '-d')) -join ' ')) }
    else {
      & docker (ComposeArgs @('up', '-d')) 2>&1 | ForEach-Object { Info $_ }
      if ($LASTEXITCODE -ne 0) { Aviso 'O Docker nao subiu os servicos. O Docker Desktop esta aberto? Seguindo com os processos (a memoria e a ponte vao esperar).' }
    }
  }
  $pids = LePids
  New-Item -ItemType Directory -Force -Path $pastaLogs | Out-Null
  foreach ($p in $processos) {
    $n = $p.nome
    if ($pids.ContainsKey($n) -and (Vivo $pids[$n])) { Ok "$n ja esta rodando (pid $($pids[$n]))"; continue }
    if ($p.pasta -and -not (Test-Path (Join-Path $raiz ($p.pasta + '\node_modules')))) {
      if ($SomenteMostrar) { Plano "npm ci em $($p.pasta) (dependencias com versao fixa)" }
      else { Info "instalando as dependencias de $($p.pasta) (npm ci)..."; Push-Location (Join-Path $raiz $p.pasta); & npm ci --no-audit --no-fund 2>&1 | ForEach-Object { Info $_ }; Pop-Location }
    }
    if ($SomenteMostrar) { Plano "node $($p.script)   (registro em data\logs\$n.log)"; continue }
    $saida = Join-Path $pastaLogs "$n.log"; $erro = Join-Path $pastaLogs "$n.erro.log"
    $janela = @{}; if ($ehWindows) { $janela.WindowStyle = 'Hidden' } # so o Windows tem janela para esconder
    $proc = Start-Process -FilePath 'node' -ArgumentList @($p.script) -WorkingDirectory $raiz -RedirectStandardOutput $saida -RedirectStandardError $erro -PassThru @janela
    if ($null -eq $proc -or -not $proc.Id) { Aviso "$n nao iniciou (veja data\logs\$n.erro.log)"; continue }
    $pids[$n] = $proc.Id
    GravaPids $pids
    Ok "$n iniciado (pid $($proc.Id))"
  }
  if ($SomenteMostrar) { return }
  # A tela imprime o link com o codigo de uso unico; mostra aqui para o caso de o navegador nao abrir sozinho.
  $link = $null
  for ($i = 0; $i -lt 20 -and -not $link; $i++) {
    Start-Sleep -Milliseconds 500
    $arq = Join-Path $pastaLogs 'tela.log'
    if (Test-Path $arq) { $m = Select-String -Path $arq -Pattern 'http://127\.0\.0\.1:\d+/\?codigo=\S+' | Select-Object -First 1; if ($m) { $link = $m.Matches[0].Value } }
  }
  if ($link) { Write-Host ''; Info "Tela de configuracao (so nesta maquina; o codigo vale uma vez): $link" } else { Aviso 'Ainda nao achei o link da tela; veja data\logs\tela.log' }
  Info 'Para ver o estado: instalar\heimdall.ps1 -Acao estado.  Para parar: -Acao parar.'
}

function Parar {
  $pids = LePids
  foreach ($p in $processos) {
    $n = $p.nome
    if (-not $pids.ContainsKey($n)) { Info "${n}: nao estava registrado"; continue }
    if ($SomenteMostrar) { Plano "pararia $n (pid $($pids[$n]))"; continue }
    if (Vivo $pids[$n]) { try { Stop-Process -Id $pids[$n] -Force -ErrorAction Stop; Ok "$n parado" } catch { Aviso "$n nao parou: $($_.Exception.Message)" } } else { Info "$n ja estava parado" }
    $pids.Remove($n)
  }
  if (-not $SomenteMostrar) { GravaPids $pids }
  if ($ComDocker) {
    if ($SomenteMostrar) { Plano ('docker ' + ((ComposeArgs @('stop')) -join ' ')) } else { & docker (ComposeArgs @('stop')) 2>&1 | ForEach-Object { Info $_ } }
  }
}

function Estado {
  $pids = LePids
  foreach ($p in $processos) {
    $n = $p.nome
    if ($pids.ContainsKey($n) -and (Vivo $pids[$n])) { Ok "$n rodando (pid $($pids[$n]))" } else { Aviso "$n parado" }
    $erro = Join-Path $pastaLogs "$n.erro.log"
    if (Test-Path $erro) { $f = Get-Content -Path $erro -Tail 3 -ErrorAction SilentlyContinue | Where-Object { $_ -notmatch 'ExperimentalWarning|trace-warnings' }; foreach ($l in $f) { Info ("   erro.log: " + $l) } }
  }
  if (-not $SemDocker) { try { & docker (ComposeArgs @('ps')) 2>&1 | ForEach-Object { Info $_ } } catch { Aviso 'Docker nao respondeu.' } }
}

function ConfigHermes {
  $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ('heimdall-hermes-' + (NovaChave 4) + '.yaml')
  if ($SomenteMostrar) { Plano 'gerar o config.yaml (node apps/ponte/scripts/gerar-config.ts), copiar para o volume do Hermes (docker cp) e reiniciar o Hermes'; return }
  & node 'apps/ponte/scripts/gerar-config.ts' 'heimdall' | Out-File -FilePath $tmp -Encoding ascii
  if (-not (Test-Path $tmp) -or (Get-Item $tmp).Length -eq 0) { Aviso 'Nao consegui gerar o config.yaml.'; return }
  & docker (ComposeArgs @('create', 'hermes')) 2>&1 | ForEach-Object { Info $_ }
  $cont = (& docker (ComposeArgs @('ps', '-aq', 'hermes')) 2>$null | Select-Object -First 1)
  if (-not $cont) { Aviso 'Nao achei o conteiner do Hermes.'; return }
  & docker cp $tmp ($cont + ':/opt/data/config.yaml') 2>&1 | ForEach-Object { Info $_ }
  & docker (ComposeArgs @('restart', 'hermes')) 2>&1 | ForEach-Object { Info $_ }
  Remove-Item -Force $tmp -ErrorAction SilentlyContinue
  Ok 'config.yaml do Hermes gravado; o Hermes foi reiniciado'
}

Set-Location $raiz
Write-Host ''; Write-Host "=== Heimdall: $Acao ===" -ForegroundColor Cyan
if ($SomenteMostrar) { Info '(modo somente mostrar: nada sera iniciado, parado nem criado)' }
switch ($Acao) { 'iniciar' { Iniciar } 'parar' { Parar } 'estado' { Estado } 'config-hermes' { ConfigHermes } }
Pausa
