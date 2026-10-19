# Confere se um arquivo baixado tem assinatura digital (Authenticode) VALIDA e feita por quem esperamos.
# Usado por instalar.ps1 antes de executar o instalador do Docker. So caracteres ASCII.
# Devolve @{ Ok = $true/$false; Motivo = '...'; Assinante = '...' }. Na duvida, recusa (nunca aprova por falta de informacao).
function AssinaturaConfere([string]$arquivo, [string]$assinante) {
  if (-not (Test-Path -LiteralPath $arquivo)) { return @{ Ok = $false; Motivo = 'arquivo nao encontrado'; Assinante = '' } }
  try { $s = Get-AuthenticodeSignature -FilePath $arquivo -ErrorAction Stop }
  catch { return @{ Ok = $false; Motivo = 'nao consegui ler a assinatura'; Assinante = '' } }
  $nome = ''
  if ($s.SignerCertificate) { $nome = [string]$s.SignerCertificate.Subject }
  if ($s.Status -ne 'Valid') { return @{ Ok = $false; Motivo = "assinatura ausente ou invalida (estado: $($s.Status))"; Assinante = $nome } }
  if ($nome -notmatch [regex]::Escape($assinante)) { return @{ Ok = $false; Motivo = 'assinatura valida, mas de outra empresa'; Assinante = $nome } }
  return @{ Ok = $true; Motivo = ''; Assinante = $nome }
}
