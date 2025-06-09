// Enhanced image upload utility functions with compression and security
export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
}

export interface CompressionOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'jpeg' | 'webp' | 'png';
}

// Security: Validate file content (not just extension)
export const validateImageSecurity = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      try {
        // Try to draw image to canvas - this will fail for malicious files
        canvas.width = 1;
        canvas.height = 1;
        ctx?.drawImage(img, 0, 0, 1, 1);

        // Additional checks
        const imageData = ctx?.getImageData(0, 0, 1, 1);
        if (!imageData || imageData.data.length !== 4) {
          resolve(false);
          return;
        }

        resolve(true);
      } catch (error) {
        console.warn('Image security validation failed:', error);
        resolve(false);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      resolve(false);
    };

    // Set timeout for validation
    setTimeout(() => {
      resolve(false);
    }, 5000);

    img.src = URL.createObjectURL(file);
  });
};

// Compress image with multiple format support
export const compressImage = async (
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<File> => {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${format}`),
              {
                type: `image/${format}`,
                lastModified: Date.now()
              }
            );

            resolve(compressedFile);
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = URL.createObjectURL(file);
  });
};

// Convert file to base64 with compression
export const fileToBase64 = async (file: File, compress: boolean = true): Promise<string> => {
  let processedFile = file;

  if (compress && file.type.startsWith('image/')) {
    try {
      // Compress large images
      if (file.size > 500 * 1024) { // 500KB threshold
        processedFile = await compressImage(file, {
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1080,
          format: 'jpeg'
        });
      }
    } catch (error) {
      console.warn('Compression failed, using original file:', error);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(processedFile);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Handle image upload with security validation and compression
export const handleImageUpload = async (
  input: File | string,
  maxSizeKB: number = 5000
): Promise<ImageUploadResult> => {
  try {
    // If input is a string (URL), validate and return
    if (typeof input === 'string') {
      if (input.trim() === '') {
        return { success: true, url: '' };
      }

      // Validate URL format
      if (input.startsWith('http') || input.startsWith('/') || input.startsWith('./') || input.startsWith('data:')) {
        return { success: true, url: input };
      }

      return { success: false, error: 'Invalid URL format' };
    }

    // If input is a File, process it
    if (input instanceof File) {
      const originalSize = input.size;

      // Validate file type
      if (!input.type.startsWith('image/')) {
        return { success: false, error: 'Please select an image file' };
      }

      // Security validation
      const isSecure = await validateImageSecurity(input);
      if (!isSecure) {
        return { success: false, error: 'Invalid or potentially malicious image file' };
      }

      // Compress if needed
      let processedFile = input;
      if (input.size > 500 * 1024) { // 500KB threshold
        try {
          processedFile = await compressImage(input, {
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080,
            format: 'jpeg'
          });
        } catch (compressionError) {
          console.warn('Compression failed, using original:', compressionError);
        }
      }

      // Final size check after compression
      if (processedFile.size > maxSizeKB * 1024) {
        return {
          success: false,
          error: `File size (${Math.round(processedFile.size / 1024)}KB) exceeds limit of ${maxSizeKB}KB. Try a smaller image.`
        };
      }

      // Convert to base64
      const base64 = await fileToBase64(processedFile, false); // Already compressed
      const compressedSize = processedFile.size;
      const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;

      return {
        success: true,
        url: base64,
        originalSize,
        compressedSize,
        compressionRatio: Math.round(compressionRatio)
      };
    }

    return { success: false, error: 'Invalid input type' };
  } catch (error) {
    return { success: false, error: `Failed to process image: ${(error as Error).message}` };
  }
};

// Validate image URL
export const validateImageUrl = (url: string): boolean => {
  if (!url) return true; // Empty URL is valid
  
  // Check for valid URL patterns
  const urlPattern = /^(https?:\/\/|\/|\.\/)/;
  const base64Pattern = /^data:image\//;
  
  return urlPattern.test(url) || base64Pattern.test(url);
};

// Get image preview URL
export const getImagePreviewUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already a complete URL or base64, return as is
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }
  
  // If it's a relative path, ensure it starts with /
  if (!url.startsWith('/')) {
    return `/${url}`;
  }
  
  return url;
};

// Image upload component props
export interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (url: string) => void;
  label: string;
  placeholder?: string;
  maxSizeKB?: number;
  className?: string;
}
