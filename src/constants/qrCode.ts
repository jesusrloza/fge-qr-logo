import QRCodeStyling from 'qr-code-styling'
import fgeLogo from '/fge400.png'

export const qrCode = new QRCodeStyling({
  width: 250,
  height: 250,
  margin: 10,
  image: fgeLogo,
  imageOptions: {
    imageSize: 0.4,
  },
  qrOptions: {
    errorCorrectionLevel: 'Q', // High quality error correction for printing/copying
    // Removed typeNumber to allow automatic sizing based on data length
    mode: 'Byte',
  },
  backgroundOptions: { color: '#fff' },
  cornersSquareOptions: { color: '#c09f77', type: 'square' },
  cornersDotOptions: { color: '#152f4a', type: 'square' },
  dotsOptions: { color: '#152f4a', type: 'extra-rounded' },
})
