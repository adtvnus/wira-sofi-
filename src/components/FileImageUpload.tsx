import React, { useState, useRef } from 'react';

interface FileImageUploadProps {
  currentImage?: string;
  onImageChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  maxSizeKB?: number;
  className?: string;
}

const FileImageUpload: React.FC<FileImageUploadProps> = ({
  currentImage = '',
  onImageChange,
  label = 'Upload Image',
  placeholder = 'Click to upload an image',
  maxSizeKB = 5000,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    // Validate file size
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSizeKB) {
      setError(`File size (${Math.round(fileSizeKB)}KB) exceeds maximum (${maxSizeKB}KB)`);
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      console.log('🔍 Starting upload process:', {
        fileName: file.name,
        fileSize: `${Math.round(fileSizeKB)}KB`,
        fileType: file.type,
        maxSizeKB
      });

      // Upload to backend API
      const formData = new FormData();
      formData.append('image', file);

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('❌ No auth token found');
        throw new Error('Authentication required');
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const uploadUrl = `${API_BASE_URL}/quotes/upload-image`;

      console.log('🔍 Upload details:', {
        url: uploadUrl,
        hasToken: !!token,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => [key, value instanceof File ? `File: ${value.name}` : value])
      });

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('🔍 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ Upload failed:', errorData);
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);

      if (result.success) {
        onImageChange(result.url);

        console.log('📁 File uploaded successfully:', {
          name: file.name,
          size: `${Math.round(fileSizeKB)}KB`,
          type: file.type,
          url: result.url,
          filename: result.filename
        });
      } else {
        throw new Error('Upload failed');
      }

    } catch (err) {
      console.error('❌ Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    setError('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
        <i className="fas fa-image mr-2 text-amber-600"></i>
        {label}
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragOver
            ? 'border-amber-400 bg-amber-50'
            : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-3"></div>
            <p className="text-amber-600 font-medium">Uploading image...</p>
            <p className="text-sm text-gray-500">Please wait</p>
          </div>
        ) : (
          <div className="py-4">
            <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
            <p className="text-gray-600 font-medium mb-2">{placeholder}</p>
            <p className="text-sm text-gray-500 mb-4">
              Drag & drop an image here, or click to browse
            </p>
            <button
              type="button"
              onClick={handleUploadClick}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-medium"
            >
              <i className="fas fa-folder-open mr-2"></i>
              Choose File
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Supported: JPG, PNG, WebP • Max size: {maxSizeKB}KB
            </p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
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
      {currentImage && !error && (
        <div className="mt-4">
          <div className="text-sm text-gray-700 mb-2 flex items-center">
            <i className="fas fa-eye mr-2"></i>
            Preview:
          </div>
          <div className="relative inline-block">
            <img
              src={currentImage}
              alt="Preview"
              className="max-w-xs max-h-48 rounded-lg shadow-md border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                setError('Failed to load image preview');
              }}
              onLoad={() => setError('')}
            />
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-xs"
              title="Remove image"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <i className="fas fa-info-circle mr-1"></i>
            Path: {currentImage}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <i className="fas fa-info-circle mr-2"></i>
        <strong>Upload Instructions:</strong>
        <ul className="mt-1 ml-4 list-disc">
          <li>Select an image file from your computer</li>
          <li>Supported formats: JPG, PNG, WebP</li>
          <li>Maximum file size: {maxSizeKB}KB</li>
          <li>Image will be saved to /public/images/quotes/ folder</li>
        </ul>
      </div>
    </div>
  );
};

export default FileImageUpload;
