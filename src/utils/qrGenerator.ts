import QRCode from 'qrcode';

export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    // Try to use the qrcode library if available
    try {
      const QRCode = await import('qrcode');
      const dataURL = await QRCode.toDataURL(text, {
        width: 80,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      console.log('✅ QR code generated locally');
      return dataURL;
    } catch (libError) {
      console.log('⚠️ QRCode library not available, using external service');
    }
    
    // Fallback to external service
    const externalUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=000000&margin=1`;
    console.log('🔗 Using external QR code service');
    return externalUrl;
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    
    // Ultimate fallback - a simple placeholder with text
    const placeholderText = encodeURIComponent(`PNR: ${text}`);
    return `https://via.placeholder.com/80x80/cccccc/666666?text=${placeholderText}`;
  }
}