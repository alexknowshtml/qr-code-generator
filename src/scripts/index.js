import QRCode from 'qrcode';
import image from '../assets/images/placeholder-image.jpg';

window.addEventListener('DOMContentLoaded', () => {
  const footerEl = document.querySelector('.footer-copyright');
  if (footerEl) {
    footerEl.innerHTML = footerEl.innerHTML.replace('$year', `${new Date().getFullYear()}`);
  }
  const textInput = document.getElementById('yourtext');

  // Check URL parameters first, then localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const urlFromParam = urlParams.get('url');
  const savedURL = localStorage.getItem('qrCodeURL');

  console.log('URL from parameter:', urlFromParam);
  console.log('Saved URL from localStorage:', savedURL);

  if (urlFromParam) {
    console.log('Setting input value from URL parameter:', urlFromParam);
    textInput.value = urlFromParam;
    // Save to localStorage too
    localStorage.setItem('qrCodeURL', urlFromParam);
    // Generate QR code for URL from parameter
    setTimeout(() => {
      textInput.dispatchEvent(new Event('keyup'));
    }, 100);
  } else if (savedURL) {
    console.log('Setting input value from localStorage:', savedURL);
    textInput.value = savedURL;
    // Generate QR code for saved URL
    setTimeout(() => {
      textInput.dispatchEvent(new Event('keyup'));
    }, 100);
  }

  // Handle paste events to ensure https:// prefix
  textInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const cleanedText = pastedText.trim();

    // If the pasted text doesn't have a protocol, add https://
    if (cleanedText && !cleanedText.match(/^https?:\/\//i)) {
      textInput.value = 'https://' + cleanedText;
    } else {
      textInput.value = cleanedText;
    }

    // Trigger keyup event to generate QR code
    textInput.dispatchEvent(new Event('keyup'));
  });

  // Prevent user from deleting https:// prefix when typing
  textInput.addEventListener('keydown', (e) => {
    const cursorPos = textInput.selectionStart;
    const value = textInput.value;

    // If user tries to delete/backspace into the https:// prefix, prevent it
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos <= 8 && value.startsWith('https://')) {
      e.preventDefault();
    }
  });

  // Clear button functionality
  const clearBtn = document.getElementById('clear-btn');
  clearBtn.addEventListener('click', () => {
    textInput.value = 'https://';
    localStorage.setItem('qrCodeURL', 'https://');

    // Remove URL parameter
    const newURL = new URL(window.location);
    newURL.searchParams.delete('url');
    window.history.replaceState({}, '', newURL);

    // Reset to placeholder image
    document.getElementById('qr-code-display').src = image;

    // Focus the input
    textInput.focus();
  });

  // Copy button functionality
  const copyBtn = document.getElementById('copy-btn');
  const copyIcon = document.getElementById('copy-icon');
  const copyText = document.getElementById('copy-text');

  copyBtn.addEventListener('click', async () => {
    const qrImage = document.getElementById('qr-code-display');

    try {
      // Create a canvas to convert the image
      const canvas = document.createElement('canvas');
      canvas.width = qrImage.naturalWidth || qrImage.width;
      canvas.height = qrImage.naturalHeight || qrImage.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(qrImage, 0, 0);

      // Try clipboard API first (works on HTTPS)
      if (navigator.clipboard && navigator.clipboard.write && ClipboardItem && window.isSecureContext) {
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);

            // Show success feedback
            copyIcon.textContent = '✅';
            copyText.textContent = 'Copied!';

            setTimeout(() => {
              copyIcon.textContent = '📋';
              copyText.textContent = 'Copy Image';
            }, 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
            copyIcon.textContent = '❌';
            copyText.textContent = 'Failed';

            setTimeout(() => {
              copyIcon.textContent = '📋';
              copyText.textContent = 'Copy Image';
            }, 2000);
          }
        }, 'image/png');
      } else {
        // Fallback: Create a temporary link and trigger download
        console.log('Using download fallback (HTTP context)');
        canvas.toBlob((blob) => {
          const currentURL = textInput.value;

          // Create a safe filename from the URL
          let filename = 'qrcode';
          if (currentURL && currentURL.length > 8) {
            // Remove protocol and clean up URL for filename
            filename = currentURL
              .replace(/^https?:\/\//, '')
              .replace(/[^a-z0-9]/gi, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')
              .substring(0, 50); // Limit length
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr-${filename}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          copyIcon.textContent = '⬇️';
          copyText.textContent = 'Downloaded!';

          setTimeout(() => {
            copyIcon.textContent = '📋';
            copyText.textContent = 'Copy Image';
          }, 2000);
        }, 'image/png');
      }

    } catch (err) {
      console.error('Failed to process image:', err);
      copyIcon.textContent = '❌';
      copyText.textContent = 'Failed';

      setTimeout(() => {
        copyIcon.textContent = '📋';
        copyText.textContent = 'Copy Image';
      }, 2000);
    }
  });

  // Download button functionality
  const downloadBtn = document.getElementById('download-btn');

  downloadBtn.addEventListener('click', () => {
    const qrImage = document.getElementById('qr-code-display');
    const currentURL = textInput.value;

    // Create a safe filename from the URL
    let filename = 'qrcode';
    if (currentURL && currentURL.length > 8) {
      // Remove protocol and clean up URL for filename
      filename = currentURL
        .replace(/^https?:\/\//, '')
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50); // Limit length
    }

    const link = document.createElement('a');
    link.href = qrImage.src;
    link.download = `qr-${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

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
      width: 1000
    };

    const value = textInput.value;

    // Save URL to localStorage
    localStorage.setItem('qrCodeURL', value);

    // Update URL parameter for sharing
    if (value && value.length > 8) {
      const newURL = new URL(window.location);
      newURL.searchParams.set('url', value);
      window.history.replaceState({}, '', newURL);
    } else {
      // Remove URL parameter if input is cleared
      const newURL = new URL(window.location);
      newURL.searchParams.delete('url');
      window.history.replaceState({}, '', newURL);
    }

    // Only generate QR code if there's content after https://
    if (value && value.length > 8) {
      QRCode.toDataURL(value, opts, (err, url) => {
        if (err) throw err;
        document.getElementById('qr-code-display').src = url;
      });
    } else {
      document.getElementById('qr-code-display').src = image;
    }
  });
});