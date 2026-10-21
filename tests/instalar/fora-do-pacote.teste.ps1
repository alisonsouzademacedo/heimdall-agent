# Teste de instalar/fora-do-pacote.ps1 (LICOES.md, 2026-10-20, "Docker do Claude"): o app Claude do Windows e EMPACOTADO e o que ele (e os
# programas que ele abre) grava em AppData\Local e REDIRECIONADO para uma pasta privada. Um Docker Desktop aberto por dentro dele nao consegue
# mexer no engine.sock real (erro 1920 / "different disk drive"). Fora do app o mesmo arquivo some sem reiniciar. So ASCII.
# Cada linha de saida comeca com PASSOU: ou FALHOU: (lida por check_fora_do_pacote.sh).
$ErrorActionPreference = 'Continue'
$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$lib = Join-Path $raiz 'instalar/fora-do-pacote.ps1'
function Resultado($ok, $texto) { if ($ok) { Write-Output "PASSOU: $texto" } else { Write-Output "FALHOU: $texto" } }

if (-not (Test-Path $lib)) { Resultado $false 'existe instalar/fora-do-pacote.ps1'; exit 0 }
. $lib
foreach ($f in 'CaminhosEmPacote', 'EmAppEmpacotado', 'ComandoAbrirFora', 'AbrirForaDoApp', 'PlanoDockerFora') {
  if (-not (Get-Command $f -ErrorAction SilentlyContinue)) { Resultado $false "a funcao $f existe"; exit 0 }
}

# 1) deteccao pelos caminhos dos processos ancestrais
$app = 'C:\Program Files\WindowsApps\Claude_3.1623.0.0_x64__pzs8sxrjxfjjc\app\claude.exe'
Resultado ((CaminhosEmPacote @('C:\WINDOWS\System32\cmd.exe', $app, 'C:\WINDOWS\explorer.exe')) -eq $true) 'processo ancestral em ...\WindowsApps\... = dentro de app empacotado'
Resultado ((CaminhosEmPacote @('C:\WINDOWS\System32\cmd.exe', 'C:\WINDOWS\explorer.exe')) -eq $false) 'cadeia sem WindowsApps = fora'
Resultado ((CaminhosEmPacote @('c:\program files\windowsapps\Algo\a.exe')) -eq $true) 'a comparacao ignora maiusculas'
Resultado ((CaminhosEmPacote @()) -eq $false -and (CaminhosEmPacote @($null, '')) -eq $false) 'lista vazia ou com nulos = fora (sem erro)'
Resultado ((CaminhosEmPacote @('C:\Users\x\WindowsAppsFalso\a.exe')) -eq $false) 'pasta de nome parecido (WindowsAppsFalso) nao conta'

# 2) estado fixado em teste (o resultado nao pode depender de onde o teste roda)
$env:HEIMDALL_TESTE = '1'
$env:HEIMDALL_TESTE_EMPACOTADO = '1'; Resultado ((EmAppEmpacotado) -eq $true) 'em teste, HEIMDALL_TESTE_EMPACOTADO=1 fixa "dentro"'
$env:HEIMDALL_TESTE_EMPACOTADO = '0'; Resultado ((EmAppEmpacotado) -eq $false) 'em teste, HEIMDALL_TESTE_EMPACOTADO=0 fixa "fora"'
Remove-Item Env:HEIMDALL_TESTE_EMPACOTADO -ErrorAction SilentlyContinue
$env:HEIMDALL_TESTE = '0'; $env:HEIMDALL_TESTE_EMPACOTADO = '1'
$real = EmAppEmpacotado
Resultado ($real -is [bool]) 'sem HEIMDALL_TESTE a variavel de teste e ignorada (mede de verdade e devolve verdadeiro/falso)'
Remove-Item Env:HEIMDALL_TESTE_EMPACOTADO -ErrorAction SilentlyContinue; Remove-Item Env:HEIMDALL_TESTE -ErrorAction SilentlyContinue

# 3) como abrir: de dentro do app, pelo Explorer (que nasce fora); de fora, direto
$c1 = ComandoAbrirFora 'C:\Heimdall\instalar\docker-fora.cmd' $true
Resultado ($c1.Exe -eq 'explorer.exe' -and ($c1.Args -join ' ') -eq '"C:\Heimdall\instalar\docker-fora.cmd"') 'dentro do app: explorer.exe com o caminho entre aspas'
$c2 = ComandoAbrirFora 'C:\Heimdall\instalar\docker-fora.cmd' $false
Resultado ($c2.Exe -eq 'C:\Heimdall\instalar\docker-fora.cmd') 'fora do app: abre direto'
$log = Join-Path ([IO.Path]::GetTempPath()) ('hm-fora-' + [guid]::NewGuid().ToString('N') + '.txt')
$env:HEIMDALL_TESTE = '1'; $env:HEIMDALL_TESTE_EMPACOTADO = '1'; $env:HEIMDALL_TESTE_ABRIR_LOG = $log
AbrirForaDoApp 'C:\Heimdall\instalar\docker-fora.cmd'
$ok = (Test-Path $log) -and ((Get-Content $log -Raw) -match 'explorer\.exe')
Resultado $ok 'AbrirForaDoApp em teste so anota o comando (nao abre nada) e ele usa o Explorer'
Remove-Item $log -ErrorAction SilentlyContinue
Remove-Item Env:HEIMDALL_TESTE_EMPACOTADO, Env:HEIMDALL_TESTE_ABRIR_LOG, Env:HEIMDALL_TESTE -ErrorAction SilentlyContinue

# 4) o que o ajudante do Docker faz em cada situacao (tabela)
Resultado ((PlanoDockerFora $true 0 $false) -eq 'nada') 'Docker ja funciona: nao faz nada'
Resultado ((PlanoDockerFora $false 0 $false) -eq 'abrir') 'Docker parado, sem arquivo preso: so abre'
Resultado ((PlanoDockerFora $false 1 $false) -eq 'reparar+abrir') 'Docker parado com engine.sock preso: repara e abre'
Resultado ((PlanoDockerFora $false 2 $true) -eq 'feche-o-docker') 'Docker Desktop aberto mas sem motor (janela de erro): pede para fechar antes (nao mata o programa)'
Resultado ((PlanoDockerFora $true 1 $true) -eq 'nada') 'Docker funcionando vence qualquer outro sinal'
