import QRCode from 'qrcode';

// Generate QR code as data URL
export const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Verify QR code data
export const verifyQRData = (qrData) => {
  try {
    const data = JSON.parse(qrData);
    return {
      isValid: data.passId && data.visitorId,
      passId: data.passId,
      visitorId: data.visitorId,
    };
  } catch (error) {
    return {
      isValid: false,
      passId: null,
      visitorId: null,
    };
  }
};
