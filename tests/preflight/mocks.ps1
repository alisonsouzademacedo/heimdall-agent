# Simula os comandos que só existem no Windows, para executar o preflight.ps1 em qualquer sistema com PowerShell 7.
# Dados sintéticos: uma máquina fictícia com Windows 11 Pro, 16 GB de RAM, 8 núcleos e 120 GB livres.
function Get-CimInstance {
    param([string]$ClassName)
    switch ($ClassName) {
        'Win32_OperatingSystem' { [pscustomobject]@{ Caption = 'Microsoft Windows 11 Pro'; Version = '10.0.22631'; OSArchitecture = '64 bits'; FreePhysicalMemory = 8388608 } }
        'Win32_ComputerSystem'  { [pscustomobject]@{ TotalPhysicalMemory = 17179869184 } }
        'Win32_Processor'       { [pscustomobject]@{ Name = 'CPU Sintetica de Teste'; NumberOfLogicalProcessors = 8 } }
    }
}
function Get-NetTCPConnection { $null }
function Invoke-WebRequest { param($Uri, $Method, $TimeoutSec, [switch]$UseBasicParsing) [pscustomobject]@{ StatusCode = 200 } }
