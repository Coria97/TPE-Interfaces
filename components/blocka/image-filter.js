export class ImageFilter {
  static grayscale(imageData) {
    // Convert image to grayscale
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const gray = (r + g + b) / 3;
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    return imageData;
  }

  static brightness(imageData, factor = 1.3) {
    // Increase brightness by a factor
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);
      data[i + 1] = Math.min(255, data[i + 1] * factor);
      data[i + 2] = Math.min(255, data[i + 2] * factor);
    }
    return imageData;
  }

  static invert(imageData) {
    // Invert colors
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    return imageData;
  }

  static applyFilter(image, filterType) {
    // Apply specified filter to the image and return a new Image object
    
    // Create a temporary canvas to manipulate image data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(image, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    // Apply the selected filter
    switch (filterType) {
      case 'grayscale':
        ImageFilter.grayscale(imageData);
        break;
      case 'brightness':
        ImageFilter.brightness(imageData, 1.3);
        break;
      case 'invert':
        ImageFilter.invert(imageData);
        break;
      default:
        break;
    }

    // Put the modified image data back and create a new Image
    tempCtx.putImageData(imageData, 0, 0);
    const filteredImage = new Image();
    filteredImage.src = tempCanvas.toDataURL();
    return new Promise((resolve) => {
      filteredImage.onload = () => resolve(filteredImage);
    });
  }
}