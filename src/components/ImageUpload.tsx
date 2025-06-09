import React, { useState, useRef } from 'react';
import { handleImageUpload, getImagePreviewUrl, ImageUploadProps } from '../utils/imageUpload';

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage = '',
  onImageChange,
  label,
  placeholder = 'Enter image URL or upload file',
  maxSizeKB = 5000,
  className = ''
}) => {
  const [urlInput, setUrlInput] = useState(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize?: number;
    compressedSize?: number;
    compressionRatio?: number;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlInput(url);
    setError('');
    onImageChange(url);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const result = await handleImageUpload(file, maxSizeKB);
      
      if (result.success && result.url) {
        setUrlInput(result.url);
        onImageChange(result.url);

        // Update compression info
        if (result.originalSize && result.compressedSize) {
          setCompressionInfo({
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            compressionRatio: result.compressionRatio
          });
        }
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    setUrlInput('');
    setError('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const previewUrl = getImagePreviewUrl(urlInput);

  return (
    <div className={`space-y-4 ${className}`} style={{ fontFamily: 'Ovo, serif' }}>
      {/* Label */}
      <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
        <i className="fas fa-image mr-2"></i>
        {label}
      </label>

      {/* URL Input */}
      <div className="relative">
        <input
          type="text"
          value={urlInput}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-24 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
          {urlInput && (
            <button
              type="button"
              onClick={handleClearImage}
              className="p-2 text-amber-600 hover:text-red-600 transition-colors"
              title="Clear image"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
        >
          <i className={`fas ${isUploading ? 'fa-spinner fa-spin' : 'fa-upload'} mr-2`}></i>
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
        <span className="text-xs text-amber-700">
          Max size: {maxSizeKB}KB
        </span>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm flex items-center">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && !error && (
        <div className="mt-4">
          <div className="text-sm text-amber-700 mb-2 flex items-center">
            <i className="fas fa-eye mr-2"></i>
            Preview:
          </div>
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-xs max-h-48 rounded-lg shadow-md border border-amber-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                setError('Failed to load image');
              }}
              onLoad={() => setError('')}
            />
            <div className="absolute top-2 right-2">
              <button
                type="button"
                onClick={handleClearImage}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-xs"
                title="Remove image"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compression Info */}
      {compressionInfo.originalSize && compressionInfo.compressedSize && (
        <div className="text-xs text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
          <i className="fas fa-compress-alt mr-2"></i>
          <strong>Compression Applied:</strong>
          <div className="mt-1">
            Original: {Math.round(compressionInfo.originalSize / 1024)}KB →
            Compressed: {Math.round(compressionInfo.compressedSize / 1024)}KB
            ({compressionInfo.compressionRatio}% reduction)
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
        <i className="fas fa-info-circle mr-2"></i>
        <strong>Options:</strong>
        <ul className="mt-1 ml-4 list-disc">
          <li>Upload a file (JPG, PNG, WebP) - max {maxSizeKB}KB</li>
          <li>Large images are automatically compressed</li>
          <li>Enter a URL (http://... or https://...)</li>
          <li>Use local path (/images/photo.jpg)</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;
