// Desenha o QR do WhatsApp como SVG para a tela de configuracao. So texto entra e so texto sai (biblioteca qrcode, MIT).
// A tela mostra o resultado numa <img> (data:image/svg+xml), nunca como HTML: um SVG assim nao executa nada.
import QRCode from 'qrcode';

export async function qrParaSvg(texto: string): Promise<string> {
  if (typeof texto !== 'string' || texto.length === 0 || texto.length > 1500) throw new Error('QR invalido');
  return QRCode.toString(texto, { type: 'svg', margin: 2, errorCorrectionLevel: 'L' });
}
