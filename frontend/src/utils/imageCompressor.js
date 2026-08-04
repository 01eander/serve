/**
 * Compresses and resizes an image file client-side before upload or base64 conversion.
 * Reduces 10MB+ mobile camera photos to lightweight ~50KB JPEGs.
 * 
 * @param {File} file - The image file from an input[type="file"] element.
 * @param {number} maxWidth - Maximum target width in pixels (default 600px).
 * @param {number} maxHeight - Maximum target height in pixels (default 600px).
 * @param {number} quality - JPEG compression quality from 0.1 to 1.0 (default 0.75).
 * @returns {Promise<string>} Compressed Base64 Data URL.
 */
export const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG base64 Data URL
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
