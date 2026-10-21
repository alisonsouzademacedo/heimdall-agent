# Teste do reparo com um socket Unix DE VERDADE (nao um arquivo vazio de mentira): um processo filho cria o socket e e MORTO de repente,
# como num desligamento brusco do Docker; o arquivo fica la (0 bytes, ReparsePoint no Windows), igual ao engine.sock preso (LICOES.md, 2026-10-20).
# Precisa do PowerShell 7 (o 5.1 nao tem UnixDomainSocketEndPoint). So ASCII. Saida: linhas PASSOU:/FALHOU:/NAOEXEC:.
$ErrorActionPreference = 'Continue'
$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
function Resultado($ok, $texto) { if ($ok) { Write-Output "PASSOU: $texto" } else { Write-Output "FALHOU: $texto" } }
if (-not ('System.Net.Sockets.UnixDomainSocketEndPoint' -as [type])) { Write-Output 'NAOEXEC: este PowerShell nao tem UnixDomainSocketEndPoint (use o PowerShell 7)'; exit 0 }
. (Join-Path $raiz 'instalar/docker-reparo.ps1')

$dados = Join-Path $raiz 'data'
$pasta = Join-Path $dados ('teste-socket-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $pasta -Force | Out-Null
$sock = Join-Path $pasta 'engine.sock'
$filho = $null; $scriptFilho = $null
try {
  $exe = (Get-Process -Id $PID).Path
  $cod = '$s = New-Object System.Net.Sockets.Socket([System.Net.Sockets.AddressFamily]::Unix, [System.Net.Sockets.SocketType]::Stream, [System.Net.Sockets.ProtocolType]::Unspecified); $s.Bind((New-Object System.Net.Sockets.UnixDomainSocketEndPoint($args[0]))); $s.Listen(1); Start-Sleep 120'
  $scriptFilho = Join-Path $dados ('teste-socket-filho-' + [guid]::NewGuid().ToString('N') + '.ps1')
  Set-Content -LiteralPath $scriptFilho -Value $cod -Encoding ASCII
  $filho = Start-Process -FilePath $exe -ArgumentList @('-NoProfile', '-File', $scriptFilho, $sock) -PassThru -WindowStyle Hidden
  for ($i = 0; $i -lt 50 -and -not (Test-Path -LiteralPath $sock); $i++) { Start-Sleep -Milliseconds 300 }
  Resultado (Test-Path -LiteralPath $sock) 'o socket de verdade existe enquanto o processo vive'
  Stop-Process -Id $filho.Id -Force -ErrorAction SilentlyContinue
  $filho.WaitForExit(10000) | Out-Null
  Start-Sleep -Milliseconds 500
  Resultado (Test-Path -LiteralPath $sock) 'depois de matar o processo de repente o arquivo do socket continua la (o caso do engine.sock preso)'
  $item = Get-Item -LiteralPath $sock -Force -ErrorAction SilentlyContinue
  Resultado ($item -and $item.Length -eq 0 -and -not $item.PSIsContainer) 'o socket preso tem 0 bytes e nao e pasta'
  Resultado (@(SocketsDockerObsoletos $pasta).Count -eq 1) 'SocketsDockerObsoletos acha o socket real preso'
  $rep = RepararSocketsDocker $pasta $false
  Resultado ($rep.Ok -and $rep.Removidos.Count -eq 1) 'RepararSocketsDocker remove o socket real preso'
  Resultado (-not (Test-Path -LiteralPath $sock)) 'o arquivo do socket real sumiu'
  Resultado (Test-Path -LiteralPath $pasta -PathType Container) 'a pasta fica (so o arquivo preso e removido)'
} finally {
  if ($filho -and -not $filho.HasExited) { Stop-Process -Id $filho.Id -Force -ErrorAction SilentlyContinue }
  Remove-Item -LiteralPath $pasta -Recurse -Force -ErrorAction SilentlyContinue
  if ($scriptFilho) { Remove-Item -LiteralPath $scriptFilho -Force -ErrorAction SilentlyContinue }
}
