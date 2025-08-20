export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public originalImage: HTMLImageElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to get 2D rendering context from canvas');
    }
    this.ctx = context;
  }

  loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.originalImage = img;
          this.drawImage(img);
          resolve(img);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  drawImage(img: HTMLImageElement, dimensions?: ImageDimensions) {
    const targetWidth = dimensions?.width || img.width;
    const targetHeight = dimensions?.height || img.height;
    
    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw image
    this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  }

  resize(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error('Width and height must be positive numbers');
    }
    
    // Get current canvas content as an image
    const currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Create a temporary canvas with current content
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      throw new Error('Unable to create temporary canvas context');
    }
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    tempCtx.putImageData(currentImageData, 0, 0);
    
    // Resize main canvas and draw the scaled content
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(tempCanvas, 0, 0, width, height);
  }

  crop(cropArea: CropArea) {
    if (!this.originalImage) {
      throw new Error('No original image available for cropping');
    }
    
    if (cropArea.width <= 0 || cropArea.height <= 0) {
      throw new Error('Crop area must have positive dimensions');
    }
    
    if (cropArea.x < 0 || cropArea.y < 0) {
      throw new Error('Crop area coordinates must be non-negative');
    }
    
    // Create a temporary canvas to hold the cropped image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      throw new Error('Unable to create temporary canvas context for cropping');
    }
    
    tempCanvas.width = cropArea.width;
    tempCanvas.height = cropArea.height;
    
    // Draw the cropped portion
    tempCtx.drawImage(
      this.canvas,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );
    
    // Update main canvas
    this.canvas.width = cropArea.width;
    this.canvas.height = cropArea.height;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(tempCanvas, 0, 0);
  }

  reset() {
    if (!this.originalImage) {
      throw new Error('No original image available for reset');
    }
    this.drawImage(this.originalImage);
  }

  getCurrentImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  downloadImage(filename: string, quality: number = 0.9) {
    if (quality < 0 || quality > 1) {
      throw new Error('Quality must be between 0 and 1');
    }
    
    if (!filename.trim()) {
      throw new Error('Filename cannot be empty');
    }
    
    this.canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob for download');
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.jpg`;
        link.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
      },
      'image/jpeg',
      quality
    );
  }

  static calculateAspectRatio(originalWidth: number, originalHeight: number, targetWidth?: number, targetHeight?: number): ImageDimensions {
    if (targetWidth && !targetHeight) {
      const aspectRatio = originalHeight / originalWidth;
      return { width: targetWidth, height: Math.round(targetWidth * aspectRatio) };
    }
    
    if (targetHeight && !targetWidth) {
      const aspectRatio = originalWidth / originalHeight;
      return { width: Math.round(targetHeight * aspectRatio), height: targetHeight };
    }
    
    return { width: originalWidth, height: originalHeight };
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      return { valid: false, error: 'Please select a JPEG image file.' };
    }
    
    // Check file size (30MB = 31457280 bytes)
    if (file.size > 31457280) {
      return { valid: false, error: 'File size must be less than 30MB.' };
    }
    
    return { valid: true };
  }
}
