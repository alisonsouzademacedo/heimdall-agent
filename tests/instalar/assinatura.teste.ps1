# Teste de instalar/assinatura.ps1 (so Windows: Get-AuthenticodeSignature nao existe fora dele). So ASCII.
# Cada linha de saida comeca com PASSOU: ou FALHOU: ou PULADO: (lida por check_assinatura.sh).
$ErrorActionPreference = 'Continue'
$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$lib = Join-Path $raiz 'instalar\assinatura.ps1'
function Resultado($ok, $texto) { if ($ok) { Write-Output "PASSOU: $texto" } else { Write-Output "FALHOU: $texto" } }

if (-not (Test-Path $lib)) { Resultado $false 'existe instalar\assinatura.ps1'; exit 0 }
. $lib
if (-not (Get-Command AssinaturaConfere -ErrorAction SilentlyContinue)) { Resultado $false 'a funcao AssinaturaConfere existe'; exit 0 }

$assinado = Join-Path $env:windir 'System32\notepad.exe'   # assinado pela Microsoft
$r = AssinaturaConfere $assinado 'Microsoft'
Resultado ($r.Ok -eq $true) 'arquivo assinado pela Microsoft confere com "Microsoft"'
$r = AssinaturaConfere $assinado 'Docker Inc'
Resultado (($r.Ok -eq $false) -and ($r.Motivo -match 'outra empresa')) 'assinatura valida, mas de OUTRA empresa, e recusada'

$tmp = Join-Path ([IO.Path]::GetTempPath()) ('hm-assin-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp | Out-Null
try {
  $semAssinatura = Join-Path $tmp 'instalador-falso.exe'
  [IO.File]::WriteAllText($semAssinatura, 'isto nao e um programa assinado')
  $r = AssinaturaConfere $semAssinatura 'Docker Inc'
  Resultado ($r.Ok -eq $false) 'arquivo sem assinatura e recusado'
  $r = AssinaturaConfere (Join-Path $tmp 'nao-existe.exe') 'Docker Inc'
  Resultado ($r.Ok -eq $false) 'arquivo inexistente e recusado'

  # Adulterado: copia de um executavel com assinatura embutida (node.exe, se existir) com 1 byte trocado no meio.
  $node = (Get-Command node -ErrorAction SilentlyContinue).Source
  if ($node -and ((Get-AuthenticodeSignature $node).Status -eq 'Valid')) {
    $copia = Join-Path $tmp 'node-adulterado.exe'
    Copy-Item $node $copia
    $fs = [IO.File]::Open($copia, 'Open', 'ReadWrite'); try { $fs.Seek([long]($fs.Length / 2), 'Begin') | Out-Null; $b = $fs.ReadByte(); $fs.Seek(-1, 'Current') | Out-Null; $fs.WriteByte([byte](($b + 1) % 256)) } finally { $fs.Close() }
    $ok = AssinaturaConfere $node 'OpenJS'
    $adu = AssinaturaConfere $copia 'OpenJS'
    Resultado ($ok.Ok -eq $true) 'node.exe original confere com o assinante dele'
    Resultado ($adu.Ok -eq $false) 'node.exe com 1 byte alterado e recusado (assinatura quebrada)'
  } else { Write-Output 'PULADO: teste do arquivo adulterado (node.exe assinado nao encontrado)' }
} finally { Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue }
