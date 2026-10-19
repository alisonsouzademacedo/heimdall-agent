# Instalador do Heimdall para Windows 11. Verifica o que falta, EXPLICA, PERGUNTA e so entao instala.
# So caracteres ASCII (o Windows PowerShell 5.1 le arquivo sem marca como ANSI). Use ${nome}: antes de dois-pontos.
# Parametros: -SomenteMostrar (nao instala nada)  -Sim (responde S a tudo; so para testes)  -SemPausa  -SemTestes  -SemClipboard
param([switch]$SomenteMostrar, [switch]$Sim, [switch]$SemPausa, [switch]$SemTestes, [switch]$SemClipboard)
$ErrorActionPreference = 'Continue'
$raiz = Split-Path -Parent $PSScriptRoot
$relatorio = Join-Path $raiz 'instalar-relatorio.txt'
try { Start-Transcript -Path $relatorio -Force | Out-Null } catch { }

function Pausa { if (-not $SemPausa) { Read-Host 'Pressione ENTER para fechar' | Out-Null } }
function Titulo($t) { Write-Host ''; Write-Host "=== $t ===" -ForegroundColor Cyan }
function Ok($t) { Write-Host "  [OK]      $t" -ForegroundColor Green }
function Falta($t) { Write-Host "  [FALTA]   $t" -ForegroundColor Yellow }
function Info($t) { Write-Host "  $t" }

Titulo 'Heimdall: instalador'
$ehWindows = ($env:OS -eq 'Windows_NT')
if (-not $ehWindows -and $env:HEIMDALL_TESTE -ne '1') {
  Info 'Este instalador e para Windows 11. Em outros sistemas, siga docs/plano/runbooks/.'
  Pausa; exit 2
}
Info 'Vou verificar o que o Heimdall precisa. NADA e instalado sem a sua resposta.'
if ($SomenteMostrar) { Info '(modo somente mostrar: nenhuma instalacao sera feita)' }

# ---------- deteccao ----------
function Tem($nome) { return [bool](Get-Command $nome -ErrorAction SilentlyContinue) }
function PrimeiraLinha($cmd, $argumentos) {
  try { $r = & $cmd @argumentos 2>$null; if ($null -eq $r) { return '' } else { return (@($r)[0]).ToString().Trim() } } catch { return '' }
}
function NodeOk {
  if (-not (Tem 'node')) { return $false }
  $v = PrimeiraLinha 'node' @('--version')
  if ($v -notmatch '^v(\d+)\.(\d+)') { return $false }
  $maior = [int]$Matches[1]; $menor = [int]$Matches[2]
  return ($maior -gt 22) -or ($maior -eq 22 -and $menor -ge 18)
}
function PythonOk {
  foreach ($c in @(@('python', @('--version')), @('py', @('-3', '--version')))) {
    if (Tem $c[0]) { if ((PrimeiraLinha $c[0] $c[1]) -match '^Python 3\.') { return $true } }
  }
  return $false
}
function DockerInstalado { return (Tem 'docker') }
function DockerRodando {
  if (-not (Tem 'docker')) { return $false }
  try { & docker info 2>$null | Out-Null; return ($LASTEXITCODE -eq 0) } catch { return $false }
}
function AtualizaPath {
  if ($ehWindows) {
    $m = [Environment]::GetEnvironmentVariable('Path', 'Machine'); $u = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$m;$u"
  }
}

# ---------- itens ----------
# IDs do winget: documentados em docs/openai-codex/docs/codex-manual.md (Git.Git, OpenJS.NodeJS.LTS, Python.Python.3.14).
# Docker Desktop: instalador oficial e comando de instalacao em docs/docker/desktop/setup/install/windows-install.md.
$urlDocker = 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe'
$itens = @(
  @{ Chave = 'git';    Nome = 'Git';            Pq = 'baixar e atualizar o projeto; tambem fornece o "sh" dos testes'; Ok = { Tem 'git' };  Winget = 'Git.Git';            Manual = 'https://git-scm.com/downloads/win' },
  @{ Chave = 'node';   Nome = 'Node.js 22.18+'; Pq = 'rodar o nucleo do Heimdall e os testes';                         Ok = { NodeOk };     Winget = 'OpenJS.NodeJS.LTS';  Manual = 'https://nodejs.org' },
  @{ Chave = 'python'; Nome = 'Python 3';       Pq = 'ferramentas de teste do projeto';                                Ok = { PythonOk };   Winget = 'Python.Python.3.14'; Manual = 'https://www.python.org/downloads/' },
  @{ Chave = 'docker'; Nome = 'Docker Desktop'; Pq = 'rodar Hindsight, Hermes e demais servicos isolados';             Ok = { DockerInstalado }; Winget = $null;                Manual = 'https://docs.docker.com/desktop/setup/install/windows-install/' }
)

Titulo 'O que ja existe neste computador'
$faltando = @()
foreach ($i in $itens) {
  if (& $i.Ok) { Ok "$($i.Nome)" } else { Falta "$($i.Nome)  (para: $($i.Pq))"; $faltando += $i }
}

function Pergunta($texto) {
  if ($Sim) { Info "$texto -> S (modo teste)"; return $true }
  $r = Read-Host "$texto [S/N]"
  return ($r -match '^[sSyY]')
}

function InstalarWinget($i) {
  if (-not (Tem 'winget')) { return $false }
  Info "Executando: winget install --id $($i.Winget)"
  & winget install --id $i.Winget
  AtualizaPath
  return $true
}

function InstalarDocker {
  if ($env:HEIMDALL_TESTE -eq '1') { Info "(teste) baixaria $urlDocker e rodaria o instalador"; return }
  $dest = Join-Path $env:TEMP 'DockerDesktopInstaller.exe'
  Info 'Baixando o instalador oficial do Docker Desktop (cerca de 500 MB; pode demorar)...'
  Invoke-WebRequest -Uri $urlDocker -OutFile $dest -UseBasicParsing
  Info 'Abrindo o instalador (instalacao so para o seu usuario, como recomenda a documentacao do Docker).'
  Info 'O instalador vai mostrar os termos de uso do Docker: LEIA e aceite SE concordar. Este programa nao aceita por voce.'
  Start-Process -FilePath $dest -Wait -ArgumentList 'install', '--user'
  AtualizaPath
}

if ($faltando.Count -gt 0 -and -not $SomenteMostrar) {
  Titulo 'Instalacao (voce decide item por item)'
  foreach ($i in $faltando) {
    Write-Host ''
    Info "$($i.Nome): $($i.Pq)."
    if (Pergunta "Posso instalar $($i.Nome) agora?") {
      if ($i.Chave -eq 'docker') { InstalarDocker }
      elseif (-not (InstalarWinget $i)) { Info "O winget nao foi encontrado. Baixe manualmente em: $($i.Manual)" }
      if (& $i.Ok) { Ok "$($i.Nome) pronto" } else { Info "$($i.Nome): se acabou de instalar, FECHE esta janela e de duplo clique em iniciar.cmd de novo (o Windows so enxerga o programa novo numa janela nova)." }
    } else { Info "Ok, pulei $($i.Nome). O Heimdall nao funciona sem ele." }
  }
} elseif ($faltando.Count -gt 0) {
  Titulo 'O que seria instalado (somente mostrar)'
  foreach ($i in $faltando) { if ($i.Winget) { Info "$($i.Nome): winget install --id $($i.Winget)" } else { Info "$($i.Nome): instalador oficial ($urlDocker)" } }
}

# ---------- depois da instalacao ----------
Titulo 'Estado do Docker'
if (DockerRodando) { Ok 'Docker rodando' }
elseif (DockerInstalado) { Falta 'Docker instalado, mas NAO esta rodando. Abra o Docker Desktop pelo menu Iniciar, aceite os termos, espere ficar verde e rode iniciar.cmd de novo.' }
else { Falta 'Docker ainda nao instalado.' }

if ($ehWindows) {
  try {
    $so = Get-CimInstance Win32_OperatingSystem
    $livreMb = [math]::Round($so.FreePhysicalMemory / 1024)
    if ($livreMb -lt 2048) { Falta "Memoria livre baixa ($livreMb MB). Feche navegadores e outros programas antes de continuar." } else { Ok "Memoria livre: $livreMb MB" }
  } catch { }
}

$nucleo = Join-Path $raiz 'apps\core'
if (-not $SemTestes -and -not $SomenteMostrar -and (NodeOk) -and (Test-Path $nucleo)) {
  Titulo 'Testes do nucleo do Heimdall'
  Push-Location $nucleo
  if (-not (Test-Path 'node_modules')) { Info 'Preparando (npm ci)...'; & npm ci --no-audit --no-fund 2>&1 | Out-Null }
  & npm test 2>&1 | Select-Object -Last 12
  if ($LASTEXITCODE -eq 0) { Ok 'testes do nucleo passaram' } else { Falta 'algum teste falhou: mande o arquivo instalar-relatorio.txt para a IA/ao suporte' }
  Pop-Location
}

# ---------- proximo passo: uma IA continua a configuracao ----------
Titulo 'Proximo passo'
$promptArq = Join-Path $PSScriptRoot 'PROMPT-IA.txt'
$pendentes = @($itens | Where-Object { -not (& $_.Ok) }).Count
if ($pendentes -gt 0 -or -not (DockerRodando)) {
  Info 'Ainda faltam itens acima. Resolva e de duplo clique em iniciar.cmd de novo.'
} else {
  Ok 'Tudo que o Heimdall precisa neste computador esta pronto.'
  Info 'A configuracao dos servicos (Hindsight, Hermes, WhatsApp) e feita por uma IA seguindo as regras do projeto (AGENTS.md).'
  Info 'Se voce ainda nao tem uma, instale o Claude Code: winget install Anthropic.ClaudeCode (comando da documentacao oficial dele).'
  if ((Test-Path $promptArq) -and -not $SemClipboard -and $ehWindows) {
    try { Get-Content -Raw -Encoding UTF8 $promptArq | Set-Clipboard; Ok 'O texto inicial para a IA ja foi COPIADO. Abra a IA nesta pasta e use CTRL+V.' } catch { Info "Abra o arquivo $promptArq e copie o texto." }
  } else { Info "O texto inicial para a IA esta em: $promptArq" }
}

try { Stop-Transcript | Out-Null } catch { }
Pausa
if ($pendentes -gt 0) { exit 1 } else { exit 0 }
