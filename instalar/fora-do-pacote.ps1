# Abrir programas FORA do app Claude (LICOES.md, 2026-10-20, "Docker do Claude"). So caracteres ASCII.
# O app Claude do Windows e empacotado: o que ele, e os programas que ele abre, grava em AppData\Local e REDIRECIONADO para uma pasta privada.
# Um Docker Desktop aberto por dentro dele nao consegue mexer no engine.sock real (erro 1920, "different disk drive"); fora do app o mesmo
# arquivo some sem reiniciar. Provado nesta maquina: um arquivo criado por dentro nao aparece para um programa aberto pelo Explorer.
# Funcoes de biblioteca; nada aqui roda sozinho.

# Verdadeiro se algum caminho for de um programa instalado por pacote do Windows (pasta ...\WindowsApps\...). Funcao pura (testavel).
function CaminhosEmPacote([string[]]$caminhos) {
  foreach ($c in @($caminhos)) { if ($c -and $c -match '(?i)[\\/]WindowsApps[\\/]') { return $true } }
  return $false
}

# Caminhos dos programas que abriram este processo (pai, avo...). Se algum pai ja terminou a cadeia se interrompe; nesse caso a medicao so sabe o que viu.
function CaminhosDosAncestrais {
  $r = @()
  $id = $PID
  for ($i = 0; $i -lt 16 -and $id -gt 0; $i++) {
    $p = Get-CimInstance Win32_Process -Filter "ProcessId=$id" -ErrorAction SilentlyContinue
    if (-not $p) { break }
    if ($p.ExecutablePath) { $r += $p.ExecutablePath }
    $id = [int]$p.ParentProcessId
  }
  return $r
}

# Em teste (HEIMDALL_TESTE=1) HEIMDALL_TESTE_EMPACOTADO fixa a resposta: o teste nao pode depender de onde roda.
function EmAppEmpacotado {
  if ($env:HEIMDALL_TESTE -eq '1' -and $env:HEIMDALL_TESTE_EMPACOTADO) { return ($env:HEIMDALL_TESTE_EMPACOTADO -eq '1') }
  if ($env:OS -ne 'Windows_NT') { return $false }
  return (CaminhosEmPacote (CaminhosDosAncestrais))
}

# Como abrir um arquivo: de dentro do app, pelo Explorer (que ja esta rodando fora e abre o arquivo la); de fora, direto.
function ComandoAbrirFora([string]$arquivo, [bool]$empacotado) {
  if ($empacotado) { return @{ Exe = 'explorer.exe'; Args = @('"' + $arquivo + '"') } }
  return @{ Exe = $arquivo; Args = @() }
}

function AbrirForaDoApp([string]$arquivo) {
  $c = ComandoAbrirFora $arquivo (EmAppEmpacotado)
  if ($env:HEIMDALL_TESTE -eq '1' -and $env:HEIMDALL_TESTE_ABRIR_LOG) { Add-Content -LiteralPath $env:HEIMDALL_TESTE_ABRIR_LOG -Value ($c.Exe + ' ' + ($c.Args -join ' ')); return }
  if ($c.Args.Count -gt 0) { Start-Process -FilePath $c.Exe -ArgumentList $c.Args } else { Start-Process -FilePath $c.Exe }
}

# O que o ajudante do Docker faz. $presos = quantos arquivos de conexao presos; $desktopAberto = o programa Docker Desktop esta aberto.
#   nada            o Docker ja funciona
#   feche-o-docker  o programa esta aberto sem o motor (janela de erro): o dono clica em Quit (o ajudante nunca mata o programa)
#   reparar+abrir   remove os arquivos presos (0 bytes) e abre o Docker
#   abrir           so abre o Docker
function PlanoDockerFora([bool]$dockerFunciona, [int]$presos, [bool]$desktopAberto) {
  if ($dockerFunciona) { return 'nada' }
  if ($desktopAberto) { return 'feche-o-docker' }
  if ($presos -gt 0) { return 'reparar+abrir' }
  return 'abrir'
}
