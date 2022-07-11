import QRCode from 'qrcode';
import image from '../assets/images/placeholder-image.jpg';

window.addEventListener('DOMContentLoaded', () => {
  const year = document.querySelector('.main-footer__copyright').innerHTML.replace('$year', `${new Date().getFullYear()}`);

  document.querySelector('.main-footer__copyright').innerHTML = year;
  const textInput = document.getElementById('yourtext');

  textInput.addEventListener('keyup', () => {
    const opts = {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 1,
      margin: 1,
      color: {
        dark: '#000',
        light: '#fff',
      },
      width: 3000
    };

    if (textInput.value) {
      QRCode.toDataURL(textInput.value, opts, (err, url) => {
        if (err) throw err;
        document.getElementById('qr-code-display').src = url;
      });
    } else {
      document.getElementById('qr-code-display').src = image;
    }
  });
});