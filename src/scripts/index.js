import QRCode from 'qrcode';

window.addEventListener('DOMContentLoaded', () => {
  const year = document.querySelector('.main-footer__copyright').innerHTML.replace('$year', `${new Date().getFullYear()}`);

  document.querySelector('.main-footer__copyright').innerHTML = year;

  document.querySelector('.btn-create').addEventListener('click', () => {
    const textInput = document.getElementById('yourtext');
    const opts = {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 1,
      margin: 1,
      color: {
        dark: '#0170fe',
        light: '#fff',
      },
    };

    if (textInput.value) {
      QRCode.toDataURL(textInput.value, opts, (err, url) => {
        if (err) throw err;
        document.getElementById('qr-code-display').src = url;
      });
    }
  });
});
