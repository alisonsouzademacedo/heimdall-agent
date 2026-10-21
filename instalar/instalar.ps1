# Instalador do Heimdall para Windows 11. Verifica o que falta, EXPLICA, PERGUNTA e so entao instala.
# So caracteres ASCII (o Windows PowerShell 5.1 le arquivo sem marca como ANSI). Use ${nome}: antes de dois-pontos.
# Parametros: -SomenteMostrar (nao instala nada)  -Sim (responde S a tudo; so para testes)  -SemPausa  -SemTestes  -SemClipboard
param([switch]$SomenteMostrar, [switch]$Sim, [switch]$SemPausa, [switch]$SemTestes, [switch]$SemClipboard)
$ErrorActionPreference = 'Continue'
# O Node escreve em UTF-8; o PowerShell 5.1 leria o console em outra codificacao e estragaria os acentos.
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }
$raiz = Split-Path -Parent $PSScriptRoot
$relatorio = Join-Path $raiz 'instalar-relatorio.txt'
try { Start-Transcript -Path $relatorio -Force | Out-Null } catch { }

function Pausa { if (-not $SemPausa) { Read-Host 'Pressione ENTER para fechar' | Out-Null } }
function Titulo($t) { Write-Host ''; Write-Host "=== $t ===" -ForegroundColor Cyan }
function Ok($t) { Write-Host "  [OK]      $t" -ForegroundColor Green }
function Falta($t) { Write-Host "  [FALTA]   $t" -ForegroundColor Yellow }
function Info($t) { Write-Host "  $t" }

# ---------- relatorio de bugs (formato igual ao de apps/core/src/bugs.ts; ver docs/plano/fase-1-instalador-e-bugs.md) ----------
function Limpa([string]$t) {
  if ($null -eq $t) { return '' }
  $t = [regex]::Replace($t, '\b(sk|fc|ghp|gho|ghs)[-_][A-Za-z0-9_-]{16,}', '$1-***')
  $t = [regex]::Replace($t, 'github_pat_[A-Za-z0-9_]{20,}', 'github_pat_***')
  $t = [regex]::Replace($t, '\bBearer\s+[A-Za-z0-9._~+/=-]{12,}', 'Bearer ***', 'IgnoreCase')
  $t = [regex]::Replace($t, '(api[_-]?key|token|secret|senha|password|passwd|authorization)(["'']?\s*[:=]\s*["'']?)[^\s"'',;]+', '$1$2***', 'IgnoreCase')
  $t = [regex]::Replace($t, '\b\d{6,}(:\d+)?@(s\.whatsapp\.net|lid|g\.us|broadcast|newsletter)\b', '<jid>', 'IgnoreCase')
  $t = [regex]::Replace($t, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '<email>')
  $t = [regex]::Replace($t, '([A-Za-z]:\\Users\\)[^\\\s"'']+', '$1<usuario>', 'IgnoreCase')
  $t = [regex]::Replace($t, '(/home/|/Users/)[^/\s"'']+', '$1<usuario>')
  return $t
}
function RegistraBug([string]$etapa, [string]$resumo, [string]$comando, [string]$saida, $codigo) {
  try {
    $pasta = Join-Path $raiz 'data\bugs'
    New-Item -ItemType Directory -Force -Path $pasta | Out-Null
    $slug = ([regex]::Replace($etapa.ToLower(), '[^a-z0-9]+', '-')).Trim('-'); if (-not $slug) { $slug = 'sem-nome' }; if ($slug.Length -gt 40) { $slug = $slug.Substring(0, 40) }
    $agora = (Get-Date).ToUniversalTime()
    $carimbo = $agora.ToString('yyyyMMdd-HHmmss')
    $arquivo = Join-Path $pasta "$carimbo-$slug.md"
    $n = 2; while (Test-Path $arquivo) { $arquivo = Join-Path $pasta "$carimbo-$slug-$n.md"; $n++ }
    $so = ''; if ($ehWindows) { try { $so = (Get-CimInstance Win32_OperatingSystem).Caption + ' ' + (Get-CimInstance Win32_OperatingSystem).Version } catch { } }
    $linhas = @('---', 'tipo: bug', "id: $carimbo-$slug", 'origem: instalador', "etapa: $slug", 'estado: aberto', ("criado_em: " + $agora.ToString('yyyy-MM-ddTHH:mm:ssZ')), '---', '',
      ('# Bug: ' + (Limpa $resumo)), '', '## Ambiente', "- sistema: $(Limpa $so)", "- powershell: $($PSVersionTable.PSVersion)", "- node: $(Limpa (PrimeiraLinha 'node' @('--version')))", "- git: $(Limpa (PrimeiraLinha 'git' @('--version')))", '',
      '## Comando e saida (sem segredos)', ('Comando: ' + (Limpa $comando)))
    if ($null -ne $codigo) { $linhas += "Codigo de saida: $codigo" }
    $limpa = Limpa $saida; if ($limpa.Length -gt 4000) { $limpa = '[...cortado...]' + $limpa.Substring($limpa.Length - 4000) }
    $linhas += @('', '```', $limpa, '```', '', '## O que a IA deve fazer (AGENTS.md, "Bugs de instalacao")',
      '1. Reproduzir com um teste automatizado que FALHA. 2. Corrigir e rodar TODOS os testes. 3. Atualizar instrucoes/runbook. 4. Registrar em docs/plano/LICOES.md.',
      '5. Trocar "estado: aberto" por "estado: resolvido" aqui. 6. Commit e envio ao GitHub (peca o login ao dono se for preciso).', '')
    [System.IO.File]::WriteAllText($arquivo, ($linhas -join "`n"), (New-Object System.Text.UTF8Encoding($false)))
    Info "Relatorio de problema salvo em: $arquivo"
  } catch { Info 'Nao consegui salvar o relatorio de problema.' }
}

# Qualquer erro inesperado vira relatorio de bug (e o instalador continua nos passos seguintes).
trap { RegistraBug 'excecao-instalador' ([string]$_.Exception.Message) ($_.InvocationInfo.PositionMessage) ($_ | Out-String) $null; continue }

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
  if ($env:HEIMDALL_TESTE -eq '1') { return }   # em teste o PATH e so o dos programas falsos; trocar pelo do sistema apagaria o isolamento
  if ($ehWindows) {
    $m = [Environment]::GetEnvironmentVariable('Path', 'Machine'); $u = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$m;$u"
  }
}

# Docker Desktop (WSL 2) precisa de virtualizacao ligada na BIOS e do WSL 2 (docs/docker/desktop/setup/install/windows-install.md).
# Valores simulados so em teste: HEIMDALL_TESTE=1 com HEIMDALL_TESTE_VIRT / HEIMDALL_TESTE_WSL = 0 ou 1.
function VirtualizacaoOk {
  if ($env:HEIMDALL_TESTE -eq '1' -and $env:HEIMDALL_TESTE_VIRT) { return ($env:HEIMDALL_TESTE_VIRT -eq '1') }
  if (-not $ehWindows) { return $true }
  try {
    $hv = (Get-CimInstance Win32_ComputerSystem).HypervisorPresent
    $fw = (Get-CimInstance Win32_Processor | Select-Object -First 1).VirtualizationFirmwareEnabled
    return ([bool]$hv -or [bool]$fw)
  } catch { return $true }   # nao consegui medir: nao bloqueio por palpite
}
function WslOk {
  if ($env:HEIMDALL_TESTE -eq '1' -and $env:HEIMDALL_TESTE_WSL) { return ($env:HEIMDALL_TESTE_WSL -eq '1') }
  if (-not $ehWindows) { return $true }
  if (-not (Tem 'wsl')) { return $false }
  try { & wsl --version *> $null; return ($LASTEXITCODE -eq 0) } catch { return $false }
}

# Minimos do Docker Desktop (docs/docker/desktop/setup/install/windows-install.md). Os MESMOS numeros ficam em apps/core/src/onboarding/ambiente.ts;
# tests/instalar/check_instalar.sh confere que os dois lugares nao divergem.
$WslMinimo = '2.1.5'
$Win10Minimo = 19045   # Windows 10 22H2
$Win11Minimo = 22631   # Windows 11 23H2
# Versao do WSL: x.y.z. A saida do "wsl --version" e UTF-16 (nulos entre as letras) e pode vir em outro idioma: tira os nulos e pega o primeiro x.y.z.
# Devolve '' quando nao leu. Em teste: HEIMDALL_TESTE=1 com HEIMDALL_TESTE_WSLVER.
function WslVersao {
  if ($env:HEIMDALL_TESTE -eq '1' -and $env:HEIMDALL_TESTE_WSLVER) { $txt = $env:HEIMDALL_TESTE_WSLVER }
  else { try { $txt = (& wsl --version 2>$null | Out-String) } catch { return '' } }
  $txt = $txt -replace [char]0, ''
  if ($txt -match '(\d+)\.(\d+)\.(\d+)') { return "$($Matches[1]).$($Matches[2]).$($Matches[3])" }
  return ''
}
function WslVersaoOk($v) { return ([version]$v -ge [version]$WslMinimo) }
# Compilacao do Windows (0 = nao leu). Em teste: HEIMDALL_TESTE=1 com HEIMDALL_TESTE_WINBUILD.
function WindowsBuild {
  if ($env:HEIMDALL_TESTE -eq '1' -and $env:HEIMDALL_TESTE_WINBUILD) { return [int]$env:HEIMDALL_TESTE_WINBUILD }
  if (-not $ehWindows) { return 0 }
  try { return [int][Environment]::OSVersion.Version.Build } catch { return 0 }
}
# 10 precisa de 22H2 (19045); 11, de 23H2 (22631). Compilacoes 22000 a 22630 sao Windows 11 mais antigo que o minimo.
function WindowsBuildOk($b) { if ($b -lt 22000) { return ($b -ge $Win10Minimo) } else { return ($b -ge $Win11Minimo) } }

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

# Virtualizacao e WSL: sem eles o Docker instala mas nao abre. So aparece no Windows (ou em teste).
$virtOk = VirtualizacaoOk
$wslOk = WslOk
$semDockerPronto = (-not $virtOk) -or (-not $wslOk)
if ($ehWindows -or $env:HEIMDALL_TESTE_VIRT -or $env:HEIMDALL_TESTE_WSL) {
  Titulo 'Virtualizacao e WSL (o Docker Desktop precisa dos dois)'
  if ($virtOk) { Ok 'Virtualizacao ligada' } else { Falta 'Virtualizacao DESLIGADA. Ligue na BIOS/UEFI: reinicie o computador e entre na configuracao da placa (a tecla e o nome da opcao variam: Intel VT-x, Virtualization Technology ou SVM). Isso so voce pode fazer.' }
  if ($wslOk) { Ok 'WSL 2 instalado' } else { Falta 'WSL 2 nao instalado. Depois da virtualizacao ligada: abra o PowerShell como administrador, rode "wsl --install" e reinicie o computador.' ; Info 'Se "wsl --install" responder em circulo ("instale executando wsl.exe --install"), use o caminho manual da Microsoft (docs/wsl/install-manual.md): como administrador, rode dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart e depois dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart; reinicie e rode "wsl --update".' }
  if ($wslOk) {
    $wv = WslVersao
    if ($wv -eq '') { Info 'Nao consegui ler a versao do WSL. Rode "wsl --version" e confira se e 2.1.5 ou mais nova.' }
    elseif (WslVersaoOk $wv) { Ok "WSL na versao $wv (minimo $WslMinimo)" }
    else { Falta "WSL na versao $wv e antigo demais (o Docker Desktop pede $WslMinimo ou mais nova). Abra o PowerShell como administrador, rode `"wsl --update`" e reinicie o computador."; $semDockerPronto = $true }
  }
  $wb = WindowsBuild
  if ($wb -gt 0) {
    if (WindowsBuildOk $wb) { Ok "Windows compilacao $wb" }
    else { Info "Windows compilacao $wb abaixo do que a documentacao do Docker pede (Windows 10 22H2 = $Win10Minimo, Windows 11 23H2 = $Win11Minimo). Atualize pelo Windows Update; o Heimdall segue, mas o Docker pode nao abrir." }
  }
  if ($semDockerPronto) { Info 'Atencao: o Docker Desktop nao vai abrir ate resolver isso. Pode instalar o resto agora e deixar o Docker para depois.' }
}

function Pergunta($texto) {
  if ($Sim) { Info "$texto -> S (modo teste)"; return $true }
  $r = Read-Host "$texto [S/N]"
  return ($r -match '^[sSyY]')
}

function InstalarWinget($i) {
  if (-not (Tem 'winget')) { RegistraBug "winget-ausente" "winget nao encontrado ao instalar $($i.Nome)" "winget install --id $($i.Winget)" '' $null; return $false }
  Info "Executando: winget install --id $($i.Winget)"
  $saida = & winget install --id $i.Winget 2>&1 | Out-String
  $codigo = $LASTEXITCODE
  Write-Host $saida
  AtualizaPath
  if ($codigo -ne 0) { RegistraBug "instalar-$($i.Chave)" "winget falhou ao instalar $($i.Nome)" "winget install --id $($i.Winget)" $saida $codigo }
  return $true
}

function InstalarDocker {
  if ($env:HEIMDALL_TESTE -eq '1') { Info "(teste) baixaria $urlDocker e rodaria o instalador"; return }
  $dest = Join-Path $env:TEMP 'DockerDesktopInstaller.exe'
  Info 'Baixando o instalador oficial do Docker Desktop (cerca de 500 MB; pode demorar, e nao mostra barra de progresso)...'
  $ProgressPreference = 'SilentlyContinue'   # no PowerShell 5.1 a barra de progresso deixa o download MUITO mais lento
  try { Invoke-WebRequest -Uri $urlDocker -OutFile $dest -UseBasicParsing } catch { RegistraBug 'baixar-docker' 'nao consegui baixar o instalador do Docker Desktop' $urlDocker ($_ | Out-String) $null; return }
  # So executa se a assinatura digital for valida e da Docker. O nome do assinante nao foi conferido contra o arquivo real nesta maquina:
  # se a conferencia recusar, o relatorio de bug mostra quem assinou, para a IA e o dono decidirem (nunca se executa por palpite).
  $bib = Join-Path $PSScriptRoot 'assinatura.ps1'
  if (-not (Test-Path $bib)) { RegistraBug 'assinatura-docker' 'instalar\assinatura.ps1 nao encontrado; nao executei o instalador do Docker' $dest '' $null; Falta 'Nao consegui conferir a assinatura do instalador do Docker; por seguranca nao vou executa-lo.'; return }
  . $bib
  $conf = AssinaturaConfere $dest 'Docker Inc'
  if (-not $conf.Ok) {
    RegistraBug 'assinatura-docker' "assinatura do instalador do Docker recusada: $($conf.Motivo)" $dest "assinante: $($conf.Assinante)" $null
    Falta "A assinatura digital do instalador do Docker NAO confere ($($conf.Motivo)). Por seguranca nao vou executa-lo. Arquivo: $dest"
    return
  }
  Ok 'assinatura digital do instalador do Docker conferida (Docker Inc)'
  Info 'Abrindo o instalador (instalacao so para o seu usuario, como recomenda a documentacao do Docker).'
  Info 'O instalador vai mostrar os termos de uso do Docker: LEIA e aceite SE concordar. Este programa nao aceita por voce.'
  $p = Start-Process -FilePath $dest -Wait -PassThru -ArgumentList 'install', '--user'
  AtualizaPath
  if ($p.ExitCode -ne 0) { RegistraBug 'instalar-docker' 'o instalador do Docker Desktop terminou com erro' 'Docker Desktop Installer.exe install --user' '' $p.ExitCode }
}

if ($faltando.Count -gt 0 -and -not $SomenteMostrar) {
  Titulo 'Instalacao (voce decide item por item)'
  foreach ($i in $faltando) {
    Write-Host ''
    Info "$($i.Nome): $($i.Pq)."
    if ($i.Chave -eq 'docker' -and $semDockerPronto) { Info 'Atencao: sem virtualizacao e WSL 2 (veja acima) o Docker Desktop instala mas nao abre. Recomendo responder N por enquanto.' }
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
elseif (DockerInstalado) { Falta 'Docker instalado, mas NAO esta rodando. Abra o Docker Desktop pelo menu Iniciar (ou por instalar\docker-fora.cmd), aceite os termos, espere ficar verde e rode iniciar.cmd de novo. NAO abra o Docker por dentro do app Claude: ele nasce com a pasta AppData redirecionada e quebra no arquivo engine.sock (instalar\docker-fora.cmd abre fora dele e ja repara o arquivo preso).' }
else { Falta 'Docker ainda nao instalado.' }

# Docker Desktop que nao abre depois de um desligamento brusco: arquivo de conexao preso (engine.sock). Ver instalar/docker-reparo.ps1 e LICOES.md (2026-10-20).
# Em teste: HEIMDALL_TESTE=1 e HEIMDALL_TESTE_SECRETS_DIR apontam para uma pasta falsa.
$bibReparo = Join-Path $PSScriptRoot 'docker-reparo.ps1'
$pastaSegredos = $null
if ($env:HEIMDALL_TESTE -eq '1' -and $env:HEIMDALL_TESTE_SECRETS_DIR) { $pastaSegredos = $env:HEIMDALL_TESTE_SECRETS_DIR }
if ($ehWindows -and -not $pastaSegredos -and (Test-Path $bibReparo)) { . $bibReparo; $pastaSegredos = PastaSegredosDocker }
$dockerFunciona = DockerRodando
if ($env:HEIMDALL_TESTE -eq '1' -and $env:HEIMDALL_TESTE_DOCKER_RODANDO) { $dockerFunciona = ($env:HEIMDALL_TESTE_DOCKER_RODANDO -eq '1') }   # so em teste: nao depender do Docker real do computador
if ($pastaSegredos -and (Test-Path $bibReparo) -and -not $dockerFunciona) {
  . $bibReparo
  $presos = @(SocketsDockerObsoletos $pastaSegredos)
  if ($presos.Count -gt 0) {
    Falta 'Arquivo preso do Docker (engine.sock) de um desligamento brusco: o Docker Desktop mostra "An unexpected error occurred ... initializing Secrets Engine ... engine.sock.stale".'
    Info "Arquivos: $($presos -join ', ') (vazios; o Docker cria de novo ao abrir)."
    if (-not $SomenteMostrar) {
      if (DockerDesktopRodando) { Info 'O Docker Desktop esta aberto (provavelmente com a janela de erro): clique em Quit nela, feche o Docker Desktop e rode iniciar.cmd de novo.' }
      elseif (Pergunta 'Posso parar o WSL (wsl --shutdown) e mover essa pasta do Docker para o lado, para ele abrir? Imagens, conteineres e volumes NAO sao apagados, mas o WSL INTEIRO sera parado: todas as distribuicoes Linux e tudo o que roda nelas fecham. Salve o trabalho antes.') {
        # Relatos do Docker (desktop-feedback #692) e esta maquina: o Windows nao abre o arquivo preso; so renomear a PASTA funciona, e so com o WSL parado.
        if ($env:HEIMDALL_TESTE -ne '1' -and (Tem 'wsl')) { Info 'Parando o WSL (wsl --shutdown)...'; & wsl.exe --shutdown 2>&1 | Out-Null; Start-Sleep -Seconds 8 }
        $rep = RepararSocketsDocker $pastaSegredos $false
        if ($rep.Ok) { $oque = if ($rep.Movida) { "pasta movida para: $($rep.Movida)" } else { "$($rep.Removidos.Count) arquivo(s) removido(s)" }; Ok "Reparo feito ($oque). Abra o Docker Desktop pelo menu Iniciar e espere ficar verde." } else { Falta "Nao consegui reparar: $($rep.Motivo)"; RegistraBug 'docker-arquivo-preso' "nao consegui remover o arquivo preso do Docker: $($rep.Motivo)" "remover $($presos -join ', ')" '' $null }
      } else { Info 'Ok, nao removi.' }
    }
  }
}

if ($ehWindows) {
  try {
    $so = Get-CimInstance Win32_OperatingSystem
    $livreMb = [math]::Round($so.FreePhysicalMemory / 1024)
    if ($env:HEIMDALL_TESTE -eq '1' -and $env:HEIMDALL_TESTE_MEM_LIVRE_MB) { $livreMb = [int]$env:HEIMDALL_TESTE_MEM_LIVRE_MB }   # so em teste: nao depender da maquina
    if ($livreMb -lt 2048) { Falta "Memoria livre baixa ($livreMb MB). Feche navegadores e outros programas antes de continuar." } else { Ok "Memoria livre: $livreMb MB" }
  } catch { }
}

# ---------- conectar a pasta ao GitHub ----------
# O ZIP do GitHub vem sem a pasta .git. Aqui ligamos a pasta ao repositorio (sem mexer nos arquivos), para a IA poder commitar e enviar.
function ConectaGit {
  if (-not (Tem 'git')) { return }
  $url = $env:HEIMDALL_REPO_URL; if (-not $url) { $url = 'https://github.com/alisonsouzademacedo/heimdall-agent.git' }
  Push-Location $raiz
  try {
    if ((Test-Path '.git') -and ((& git remote 2>$null) -contains 'origin')) { Ok 'pasta ja conectada ao GitHub'; return }
    Info "Conectando esta pasta ao GitHub ($url)..."
    $log = ''
    $passos = @(@('init', '-q'), @('checkout', '-q', '-B', 'main'), @('remote', 'add', 'origin', $url), @('fetch', '-q', 'origin', 'main'), @('reset', '-q', 'origin/main'), @('branch', '--set-upstream-to=origin/main', 'main'))
    foreach ($a in $passos) {
      if ((Test-Path '.git') -and $a[0] -eq 'init') { continue }
      $o = & git @a 2>&1 | Out-String; $log += "git $($a -join ' ')`n$o`n"
      if ($LASTEXITCODE -ne 0) { RegistraBug 'conectar-git' "falhou: git $($a -join ' ')" "git $($a -join ' ')" $log $LASTEXITCODE; Falta 'nao consegui conectar a pasta ao GitHub (o projeto funciona, mas a IA nao vai conseguir enviar correcoes).'; return }
    }
    Ok 'pasta conectada ao GitHub (branch main)'
  } finally { Pop-Location }
}
if (-not $SomenteMostrar) { Titulo 'Conexao com o GitHub'; if (Tem 'git') { ConectaGit } else { Info 'Git ainda nao instalado: conecto depois.' } }

$nucleo = Join-Path $raiz 'apps\core'
if (-not $SemTestes -and -not $SomenteMostrar -and (NodeOk) -and (Test-Path $nucleo)) {
  Titulo 'Testes do nucleo do Heimdall'
  Push-Location $nucleo
  # Sem instalar pacotes aqui: node --test nao usa nenhum (so o tsc usa; ver 'npm run typecheck').
  $saidaTestes = & npm test 2>&1 | Out-String
  $codigoTestes = $LASTEXITCODE
  ($saidaTestes -split "`n" | Select-Object -Last 12) -join "`n" | Write-Host
  if ($codigoTestes -eq 0) { Ok 'testes do nucleo passaram' } else { Falta 'algum teste falhou (relatorio salvo em data\bugs)'; RegistraBug 'testes-nucleo' 'os testes do nucleo falharam na maquina do dono' 'npm test' $saidaTestes $codigoTestes }
  Pop-Location
}

# ---------- proximo passo ----------
Titulo 'Proximo passo'
$promptArq = Join-Path $PSScriptRoot 'PROMPT-IA.txt'
$pendentes = @($itens | Where-Object { -not (& $_.Ok) }).Count
if ($semDockerPronto) { $pendentes++ }
if ((Test-Path $promptArq) -and -not $SemClipboard -and $ehWindows) {
  try { Get-Content -Raw -Encoding UTF8 $promptArq | Set-Clipboard; Ok 'O texto inicial para a IA foi COPIADO (CTRL+V). Na primeira rodada, abra uma IA nesta pasta e cole.' } catch { Info "O texto para a IA esta em: $promptArq" }
} else { Info "O texto inicial para a IA esta em: $promptArq" }
if ($pendentes -gt 0) { Info 'Ainda faltam itens acima. Resolva e de duplo clique em iniciar.cmd de novo. A tela abre mesmo assim, para voce ver o que falta.' }

$telaOk = (NodeOk) -and (Test-Path (Join-Path $raiz 'apps\core\src\onboarding\iniciar.ts'))
if ($telaOk -and -not $SomenteMostrar) {
  if ($env:HEIMDALL_TESTE -eq '1') { Info '(teste) abriria a tela de configuracao' }
  else {
    Titulo 'Tela de configuracao'
    Info 'Abrindo a tela no navegador. Deixe ESTA janela aberta enquanto usar a tela.'
    try { Stop-Transcript | Out-Null } catch { }
    Push-Location $raiz
    & node 'apps\core\src\onboarding\iniciar.ts'
    if ($LASTEXITCODE -ne 0) { RegistraBug 'abrir-tela' 'a tela de configuracao nao abriu' 'node apps\core\src\onboarding\iniciar.ts' '' $LASTEXITCODE }
    Pop-Location
  }
}

try { Stop-Transcript | Out-Null } catch { }
Pausa
if ($pendentes -gt 0) { exit 1 } else { exit 0 }
