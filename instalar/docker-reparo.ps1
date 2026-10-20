# Reparo do Docker Desktop que nao abre depois de um desligamento brusco do computador (LICOES.md, 2026-10-20).
# Erro visto: "An unexpected error occurred ... starting services: initializing Secrets Engine: listening on
# unix:C:/Users/<usuario>/AppData/Local/docker-secrets-engine/engine.sock: rename ...engine.sock ...engine.sock.stale:
# The file cannot be accessed by the system". Causa provavel: o arquivo de conexao (socket) da execucao anterior ficou preso.
# So caracteres ASCII. Funcoes puras sobre uma PASTA (testadas em pastas de teste); nada aqui roda sozinho.
function PastaSegredosDocker {
  $base = $env:LOCALAPPDATA
  if (-not $base) { $base = Join-Path $HOME '.local/share' }
  return (Join-Path $base 'docker-secrets-engine')
}

# Arquivos presos: engine.sock e engine.sock.stale, SO se forem arquivos de 0 bytes (um socket nao tem conteudo).
# Um arquivo com conteudo ou uma pasta com esse nome nunca e considerado preso.
function SocketsDockerObsoletos([string]$pasta) {
  # Armadilha do PowerShell: "return , $x" embrulha o array (vazio vira 1 item). Aqui devolve solto; quem chama usa @(...).
  $achados = @()
  if (-not $pasta -or -not (Test-Path -LiteralPath $pasta -PathType Container)) { return $achados }
  foreach ($nome in 'engine.sock', 'engine.sock.stale') {
    $caminho = Join-Path $pasta $nome
    if (Test-Path -LiteralPath $caminho) {
      $item = Get-Item -LiteralPath $caminho -Force -ErrorAction SilentlyContinue
      if ($item -and -not $item.PSIsContainer -and $item.Length -eq 0) { $achados += $caminho }
    }
  }
  return $achados
}

function DockerDesktopRodando {
  return [bool](Get-Process -Name 'Docker Desktop', 'com.docker.backend' -ErrorAction SilentlyContinue)
}

# Remove SO os arquivos presos, e SO com o Docker Desktop fechado (senao pode ser um socket em uso).
# CASO REAL (2026-10-20): o Windows pode nem conseguir abrir esse arquivo (erro 1920: Remove-Item, del, fsutil e ate o lstat do Python falham).
# Entao, se remover falhar e a pasta so tiver esses arquivos, MOVE a pasta para o lado (renomear nao toca no arquivo) e o Docker cria outra.
# Nada e apagado: a pasta movida fica como <pasta>.preso-AAAAMMDD-HHMMSS. $remover existe para os testes simularem a falha.
function RepararSocketsDocker([string]$pasta, [bool]$dockerRodando, [scriptblock]$remover = $null) {
  $pasta = $pasta.TrimEnd('\', '/')
  if ($dockerRodando) { return @{ Ok = $false; Removidos = @(); Movida = ''; Motivo = 'o Docker Desktop esta rodando; feche-o antes (botao Quit)' } }
  if (-not $remover) { $remover = { param($c) Remove-Item -LiteralPath $c -Force -ErrorAction Stop } }
  $removidos = @()
  $falhou = $false
  foreach ($arq in (SocketsDockerObsoletos $pasta)) {
    try { & $remover $arq; $removidos += $arq } catch { $falhou = $true; break }
  }
  if (-not $falhou) { return @{ Ok = $true; Removidos = $removidos; Movida = ''; Motivo = '' } }

  $outros = @(Get-ChildItem -LiteralPath $pasta -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne 'engine.sock' -and $_.Name -ne 'engine.sock.stale' })
  if ($outros.Count -gt 0) { return @{ Ok = $false; Removidos = $removidos; Movida = ''; Motivo = 'nao consegui remover o arquivo e a pasta tem outros arquivos; nao vou mover a pasta' } }
  $novoNome = (Split-Path -Leaf $pasta) + '.preso-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
  try { Rename-Item -LiteralPath $pasta -NewName $novoNome -ErrorAction Stop }
  catch { return @{ Ok = $false; Removidos = $removidos; Movida = ''; Motivo = "nao consegui mover a pasta: $($_.Exception.Message)" } }
  return @{ Ok = $true; Removidos = $removidos; Movida = (Join-Path (Split-Path -Parent $pasta) $novoNome); Motivo = '' }
}
