# Teste de instalar/docker-reparo.ps1: o Docker Desktop pode nao abrir depois de um desligamento brusco, com o erro
#   "initializing Secrets Engine ... rename ...engine.sock ...engine.sock.stale: The file cannot be accessed by the system"
# (LICOES.md, 2026-10-20). So mexe em arquivos de uma pasta de teste; roda no Windows e no Linux. So ASCII.
# Cada linha de saida comeca com PASSOU: ou FALHOU: (lida por check_docker_reparo.sh).
$ErrorActionPreference = 'Continue'
$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$lib = Join-Path $raiz 'instalar/docker-reparo.ps1'
function Resultado($ok, $texto) { if ($ok) { Write-Output "PASSOU: $texto" } else { Write-Output "FALHOU: $texto" } }

if (-not (Test-Path $lib)) { Resultado $false 'existe instalar/docker-reparo.ps1'; exit 0 }
. $lib
foreach ($f in 'SocketsDockerObsoletos', 'RepararSocketsDocker', 'PastaSegredosDocker') {
  if (-not (Get-Command $f -ErrorAction SilentlyContinue)) { Resultado $false "a funcao $f existe"; exit 0 }
}

$tmp = Join-Path ([IO.Path]::GetTempPath()) ('hm-dock-' + [guid]::NewGuid().ToString('N'))
function Nova($nome) { $p = Join-Path $tmp $nome; New-Item -ItemType Directory -Path $p -Force | Out-Null; return $p }
try {
  # 1) pasta com os dois arquivos presos (0 bytes): sao achados
  $a = Nova 'a'; New-Item -ItemType File -Path (Join-Path $a 'engine.sock') | Out-Null; New-Item -ItemType File -Path (Join-Path $a 'engine.sock.stale') | Out-Null
  $achados = @(SocketsDockerObsoletos $a)
  Resultado ($achados.Count -eq 2) 'acha engine.sock e engine.sock.stale de 0 bytes'

  # 2) pasta vazia ou inexistente: nada a fazer, sem erro
  $vazia = Nova 'vazia'
  Resultado (@(SocketsDockerObsoletos $vazia).Count -eq 0) 'pasta sem os arquivos: nada achado'
  Resultado (@(SocketsDockerObsoletos (Join-Path $tmp 'nao-existe')).Count -eq 0) 'pasta inexistente: nada achado, sem erro'

  # 3) arquivo com conteudo NAO e socket preso: nunca e tocado
  $b = Nova 'b'; [IO.File]::WriteAllText((Join-Path $b 'engine.sock'), 'conteudo de verdade')
  Resultado (@(SocketsDockerObsoletos $b).Count -eq 0) 'arquivo com conteudo nao e tratado como preso'

  # 4) uma PASTA chamada engine.sock tambem nao e tocada
  $c = Nova 'c'; New-Item -ItemType Directory -Path (Join-Path $c 'engine.sock') | Out-Null
  Resultado (@(SocketsDockerObsoletos $c).Count -eq 0) 'pasta com o nome engine.sock nao e tratada como arquivo preso'

  # 5) Docker Desktop RODANDO: nao remove nada
  $r = RepararSocketsDocker $a $true
  Resultado (($r.Ok -eq $false) -and (Test-Path (Join-Path $a 'engine.sock')) -and (Test-Path (Join-Path $a 'engine.sock.stale'))) 'com o Docker Desktop rodando nao remove nada'

  # 6) Docker parado: remove SO os dois arquivos presos e nada mais
  New-Item -ItemType File -Path (Join-Path $a 'outro-arquivo.txt') | Out-Null
  $r = RepararSocketsDocker $a $false
  $sobrou = @(Get-ChildItem $a -Force | ForEach-Object Name)
  Resultado (($r.Ok -eq $true) -and ($r.Removidos.Count -eq 2) -and ($sobrou -contains 'outro-arquivo.txt') -and ($sobrou.Count -eq 1)) 'com o Docker parado remove so os arquivos presos e preserva o resto'

  # 7) repetir nao da erro
  $r = RepararSocketsDocker $a $false
  Resultado (($r.Ok -eq $true) -and ($r.Removidos.Count -eq 0)) 'repetir o reparo e inofensivo'

  # 7b) CASO REAL (2026-10-20): o Windows nao consegue nem abrir/remover o engine.sock (erro 1920). Simulado com um "removedor" que sempre falha.
  # Reparo alternativo: MOVER a pasta para o lado (renomear nao toca no arquivo); o Docker cria outra ao abrir.
  $falha = { param($caminho) throw 'Nao e possivel o acesso ao arquivo pelo sistema.' }
  $d = Nova 'd'; New-Item -ItemType File -Path (Join-Path $d 'engine.sock') | Out-Null
  $r = RepararSocketsDocker $d $false $falha
  $irmaos = @(Get-ChildItem $tmp -Directory | Where-Object { $_.Name -like 'd.preso-*' })
  Resultado (($r.Ok -eq $true) -and $r.Movida -and (-not (Test-Path $d)) -and ($irmaos.Count -eq 1)) 'se nao da para remover, move a pasta para o lado (d.preso-AAAAMMDD-HHMMSS) e a pasta original some'
  Resultado ($irmaos.Count -eq 1 -and (Test-Path (Join-Path $irmaos[0].FullName 'engine.sock'))) 'a pasta movida guarda o arquivo (nada e apagado)'

  # 7c) pasta com OUTROS arquivos: nunca e movida (poderia esconder dados do Docker)
  $e = Nova 'e'; New-Item -ItemType File -Path (Join-Path $e 'engine.sock') | Out-Null; [IO.File]::WriteAllText((Join-Path $e 'segredo.dat'), 'x')
  $r = RepararSocketsDocker $e $false $falha
  Resultado (($r.Ok -eq $false) -and (Test-Path $e) -and (Test-Path (Join-Path $e 'segredo.dat'))) 'pasta com outros arquivos nao e movida: o reparo recusa e explica'

  # 7d) com o Docker rodando, nem tenta mover
  $g = Nova 'g'; New-Item -ItemType File -Path (Join-Path $g 'engine.sock') | Out-Null
  $r = RepararSocketsDocker $g $true $falha
  Resultado (($r.Ok -eq $false) -and (Test-Path $g)) 'com o Docker rodando nao move a pasta'

  # 8) a pasta padrao e a do erro real
  $esperada = Join-Path $(if ($env:LOCALAPPDATA) { $env:LOCALAPPDATA } else { (Join-Path $HOME '.local/share') }) 'docker-secrets-engine'
  Resultado ((PastaSegredosDocker) -eq $esperada) 'a pasta padrao e LOCALAPPDATA\docker-secrets-engine'
} finally { Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue }
