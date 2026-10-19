# Heimdall preflight (Windows 10/11, PowerShell 5.1 ou superior). Texto em ASCII de proposito.
# So le informacoes da maquina; nao instala nada nem envia dados.
# Uso (PowerShell):  powershell -ExecutionPolicy Bypass -File .\preflight.ps1
# Codigo de saida: 0 = atende, 1 = atende com ressalvas, 2 = nao atende
$ErrorActionPreference = 'SilentlyContinue'
# Guarda o relatorio completo em arquivo (util se a janela fechar) e evita que a janela feche sozinha no fim.
try { Start-Transcript -Path 'preflight-relatorio.txt' -Force | Out-Null } catch { }
function Pausa { if (($Host.Name -eq 'ConsoleHost') -and (-not $env:PREFLIGHT_NOPAUSE)) { Read-Host 'Pressione Enter para fechar' | Out-Null } }
trap { Write-Host "ERRO: $_"; try { Stop-Transcript | Out-Null } catch { }; Pausa; exit 3 }
$out = if ($env:PREFLIGHT_OUT) { $env:PREFLIGHT_OUT } else { 'preflight-resultado.json' }
$script:fail = 0; $script:warn = 0
function Ok($m)   { Write-Host "  [OK]      $m" }
function Warn($m) { Write-Host "  [ATENCAO] $m"; $script:warn++ }
function Bad($m)  { Write-Host "  [FALHA]   $m"; $script:fail++ }
function Has($n)  { return [bool](Get-Command $n -ErrorAction SilentlyContinue) }
function FirstLine($s) { return (($s | Out-String).Trim() -split "`r?`n")[0] }

# ---------- sistema ----------
$os   = Get-CimInstance Win32_OperatingSystem
$cs   = Get-CimInstance Win32_ComputerSystem
$cpu  = Get-CimInstance Win32_Processor | Select-Object -First 1
$osName = $os.Caption; $osVer = $os.Version; $arch = $os.OSArchitecture
$isArm = ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') -or ($arch -like 'ARM*')

# ---------- hardware ----------
$cores  = [int]($cpu.NumberOfLogicalProcessors)
$ramMb  = [int]([math]::Round($cs.TotalPhysicalMemory / 1MB))
$ramFree= [int]([math]::Round($os.FreePhysicalMemory / 1KB))
$drive  = (Get-Location).Drive
$diskGb = if ($drive -and $drive.Free) { [int]([math]::Floor($drive.Free / 1GB)) } else { 0 }
$avx2 = 'nao_verificado'
try { $avx2 = if ([System.Runtime.Intrinsics.X86.Avx2]::IsSupported) { 'sim' } else { 'nao' } } catch { if ($isArm) { $avx2 = 'nao_se_aplica(arm64)' } }
$gpuName = ''; $vramMb = 0
if (Has 'nvidia-smi') {
  $g = FirstLine (nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits)
  if ($g) { $p = $g -split ','; $gpuName = $p[0].Trim(); $vramMb = [int](($p[1] -replace '[^0-9]','')) }
}

# ---------- ferramentas ----------
$dockerV = ''; $dockerUp = 'nao'
if (Has 'docker') { $dockerV = FirstLine (docker --version); docker info *> $null; if ($LASTEXITCODE -eq 0) { $dockerUp = 'sim' } }
$nodeV = ''; if (Has 'node') { $nodeV = FirstLine (node --version) }
$pyV = ''; if (Has 'python') { $pyV = FirstLine (python --version 2>&1) } elseif (Has 'py') { $pyV = FirstLine (py --version 2>&1) }
$gitV = ''; if (Has 'git') { $gitV = FirstLine (git --version) }

# ---------- rede ----------
function Reach($h) { try { Invoke-WebRequest -Uri "https://$h" -Method Head -TimeoutSec 8 -UseBasicParsing | Out-Null; return 'sim' } catch { if ($_.Exception.Response) { return 'sim' } else { return 'nao' } } }
$net = [ordered]@{ 'web.whatsapp.com' = Reach 'web.whatsapp.com'; 'chatgpt.com' = Reach 'chatgpt.com'; 'huggingface.co' = Reach 'huggingface.co'; 'github.com' = Reach 'github.com' }

# ---------- fuso e portas ----------
$tz = (Get-TimeZone).Id   # Brasilia = "E. South America Standard Time"
function PortState($p) { if (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) { return 'ocupada' } else { return 'livre' } }
$p1455 = PortState 1455; $p8888 = PortState 8888

# ---------- relatorio ----------
Write-Host "=== Heimdall: verificacao do ambiente ==="; Write-Host ""
Write-Host "Sistema:  $osName ($osVer, $arch)"
Write-Host "CPU:      $($cpu.Name.Trim()) | $cores nucleos | AVX2: $avx2"
Write-Host ("Memoria:  {0} GB total, {1} GB livres agora" -f [math]::Round($ramMb/1024), [math]::Round($ramFree/1024))
Write-Host "Disco:    $diskGb GB livres na unidade atual"
Write-Host ("GPU:      " + $(if ($gpuName) { "$gpuName ($([math]::Round($vramMb/1024)) GB de VRAM)" } else { 'nenhuma NVIDIA detectada' }))
Write-Host "Fuso:     $tz"; Write-Host ""; Write-Host "Verificacoes:"

if ($osName -match 'Windows (10|11)') { Ok "$osName: suportado (docs do Hermes: Windows 10 e 11)" } else { Warn "versao do Windows nao listada como suportada: $osName" }
if ($isArm) { Warn "Windows ARM64: a transcricao local de audio (faster-whisper) NAO e suportada pelo Hermes nesta arquitetura (docs do Hermes)" }
if ($ramMb -ge 15000) { Ok ("memoria {0} GB (recomendado: 16 GB ou mais)" -f [math]::Round($ramMb/1024)) }
elseif ($ramMb -ge 7500) { Warn ("memoria {0} GB: atende o minimo (8 GB), mas apertado para rodar tudo junto" -f [math]::Round($ramMb/1024)) }
else { Bad ("memoria {0} GB: abaixo do minimo (8 GB)" -f [math]::Round($ramMb/1024)) }
if ($cores -ge 4) { Ok "CPU com $cores nucleos" } else { Warn "CPU com $cores nucleos (recomendado: 4 ou mais)" }
if ($diskGb -ge 30) { Ok "disco livre $diskGb GB" } elseif ($diskGb -ge 15) { Warn "disco livre $diskGb GB (recomendado: 30 GB ou mais)" } else { Bad "disco livre $diskGb GB (minimo: 15 GB)" }
if ($avx2 -eq 'nao') { Warn "CPU sem AVX2: a transcricao de audio (faster-whisper) pode ficar muito lenta" }
if (-not $dockerV) { Bad "Docker nao encontrado (necessario para Hindsight e Krayin; no Windows, Docker Desktop)" } elseif ($dockerUp -eq 'sim') { Ok "Docker ativo ($dockerV)" } else { Warn "Docker instalado, mas o servico nao esta rodando" }
if ($nodeV) { $maj = [int](($nodeV -replace '[^0-9.]','') -split '\.')[0]; if ($maj -ge 20) { Ok "Node $nodeV (Baileys exige 20 ou mais)" } else { Bad "Node ${nodeV}: o Baileys exige 20 ou mais" } } else { Warn "Node nao encontrado (o Baileys exige 20 ou mais)" }
if ($pyV) { Ok $pyV } else { Warn "Python 3 nao encontrado (markitdown e faster-whisper; o Hermes traz o proprio Python)" }
if ($gitV) { Ok $gitV } else { Warn "Git nao encontrado" }
foreach ($k in $net.Keys) { if ($net[$k] -eq 'sim') { Ok "rede: $k acessivel" } else { Warn "rede: $k inacessivel" } }
if ($p1455 -eq 'livre') { Ok "porta 1455 livre (login do ChatGPT)" } else { Warn "porta 1455 ocupada (login do ChatGPT no Hindsight usa 127.0.0.1:1455)" }
if ($p8888 -eq 'livre') { Ok "porta 8888 livre (Hindsight)" } else { Warn "porta 8888 ocupada (Hindsight)" }
if ($tz -eq 'E. South America Standard Time') { Ok "fuso de Brasilia" } else { Warn "fuso do sistema: $tz (o Heimdall usa America/Sao_Paulo; sera configurado no Hermes)" }

$whisper = 'small (CPU, int8)'
if ($isArm) { $whisper = 'transcricao local indisponivel no Windows ARM64: usar outra maquina ou servico externo' }
elseif ($vramMb -ge 10000) { $whisper = 'large-v3 (GPU NVIDIA, float16)' }
elseif ($vramMb -ge 6000)  { $whisper = 'turbo (GPU NVIDIA, float16)' }
elseif ($vramMb -ge 5000)  { $whisper = 'medium (GPU NVIDIA)' }
elseif ($ramMb -ge 15000 -and $cores -ge 8) { $whisper = 'turbo ou large-v3 na CPU (int8): testar; com poucos audios curtos o tempo nao e problema' }
elseif ($ramMb -ge 11000) { $whisper = 'medium (CPU, int8)' }
Write-Host ""; Write-Host "Modelo de transcricao sugerido (a confirmar no teste): $whisper"

$verdict = 'ATENDE'; $code = 0
if ($script:warn -gt 0) { $verdict = 'ATENDE COM RESSALVAS'; $code = 1 }
if ($script:fail -gt 0) { $verdict = 'NAO ATENDE'; $code = 2 }
Write-Host ""; Write-Host "Resultado: $verdict ($($script:fail) falha(s), $($script:warn) atencao(oes))"

[ordered]@{
  resultado = $verdict; falhas = $script:fail; atencoes = $script:warn
  sistema = [ordered]@{ nome = $osName; versao = $osVer; arquitetura = $arch; wsl = $false }
  hardware = [ordered]@{ cpu = $cpu.Name.Trim(); nucleos = $cores; avx2 = $avx2; ram_mb = $ramMb; ram_livre_mb = $ramFree; disco_livre_gb = $diskGb; gpu = $gpuName; vram_mb = $vramMb }
  ferramentas = [ordered]@{ docker = $dockerV; docker_ativo = $dockerUp; node = $nodeV; python = $pyV; git = $gitV }
  rede = $net; fuso = $tz; portas = [ordered]@{ '1455' = $p1455; '8888' = $p8888 }; whisper_sugerido = $whisper
} | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 $out
Write-Host "Detalhes gravados em $out (e o relatorio completo em preflight-relatorio.txt)"
try { Stop-Transcript | Out-Null } catch { }
Pausa
exit $code
