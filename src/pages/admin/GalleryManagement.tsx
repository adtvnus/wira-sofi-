import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';

interface GalleryImage {
  id: number;
  image_src: string;
  absolute_path: string;
  image_alt: string;
  image_type: 'landscape' | 'square' | 'portrait';
  image_size: 'L' | 'S';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GallerySettings {
  header_title: string;
  header_subtitle: string;
  bottom_quote: string;
  is_active: boolean;
}

const GalleryManagement = () => {
  const { token } = useAuth();
  const [gallerySettings, setGallerySettings] = useState<GallerySettings>({
    header_title: 'Our Gallery',
    header_subtitle: 'Capturing beautiful moments of our special day',
    bottom_quote: 'Every picture tells a story of love',
    is_active: true
  });
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedImageSize, setSelectedImageSize] = useState<'L' | 'S'>('S');
  const [selectedImageType, setSelectedImageType] = useState<'landscape' | 'square' | 'portrait'>('square');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Load gallery data from database
  useEffect(() => {
    loadGalleryData();
  }, []);

  const loadGalleryData = async () => {
    try {
      setIsLoading(true);
      
      // Load gallery settings
      const settingsResponse = await fetch(`${API_BASE_URL}/gallery/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          setGallerySettings(settingsData.data);
        }
      }

      // Load gallery images
      const imagesResponse = await fetch(`${API_BASE_URL}/gallery/images`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        if (imagesData.success) {
          setGalleryImages(imagesData.data);
        }
      }
    } catch (error) {
      console.error('Error loading gallery data:', error);
      setMessage('❌ Gagal memuat data gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGallerySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/gallery/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headerTitle: gallerySettings.header_title,
          headerSubtitle: gallerySettings.header_subtitle,
          bottomQuote: gallerySettings.bottom_quote
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('✅ Gallery settings berhasil disimpan!');
        }
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving gallery settings:', error);
      setMessage('❌ Gagal menyimpan gallery settings');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // File validation function
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.';
    }

    if (file.size > maxSize) {
      return 'Ukuran file terlalu besar. Maksimal 5MB.';
    }

    return null;
  };

  // Handle single image upload
  const handleImageUpload = async (file: File) => {
    setUploading(true);

    try {
      const validationError = validateFile(file);
      if (validationError) {
        setMessage(`❌ ${validationError}`);
        setTimeout(() => setMessage(''), 5000);
        return;
      }

      // Upload to server
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageSize', selectedImageSize);
      formData.append('imageType', selectedImageType);
      formData.append('imageAlt', file.name.split('.')[0]);
      formData.append('displayOrder', galleryImages.length.toString());

      const response = await fetch(`${API_BASE_URL}/gallery/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage(`✅ Gambar berhasil diupload! Size: ${selectedImageSize}, Type: ${selectedImageType}`);
          loadGalleryData(); // Reload images
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage(`❌ Gagal mengupload gambar`);
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (files: FileList) => {
    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const validationError = validateFile(file);
        if (validationError) {
          errorCount++;
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('imageSize', selectedImageSize);
        formData.append('imageType', selectedImageType);
        formData.append('imageAlt', file.name.split('.')[0]);
        formData.append('displayOrder', (galleryImages.length + i).toString());

        const response = await fetch(`${API_BASE_URL}/gallery/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setUploading(false);
    
    if (successCount > 0) {
      setMessage(`✅ ${successCount} gambar berhasil diupload! ${errorCount > 0 ? `${errorCount} gagal.` : ''}`);
      loadGalleryData(); // Reload images
    } else {
      setMessage('❌ Semua upload gagal');
    }
    
    setTimeout(() => setMessage(''), 5000);
  };

  // Delete image
  const deleteImage = async (id: number) => {
    if (!window.confirm('Hapus gambar ini?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/gallery/images/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('✅ Gambar berhasil dihapus!');
          loadGalleryData(); // Reload images
        }
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setMessage('❌ Gagal menghapus gambar');
    } finally {
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleBulkUpload(files);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data gallery dari MySQL...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto" style={{ fontFamily: 'Ovo, serif' }}>
        <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200">
          <div className="border-b border-blue-200 px-8 py-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-images text-blue-600 text-3xl mr-4"></i>
                <div>
                  <h1 className="text-3xl font-bold text-blue-800">Gallery Management</h1>
                  <p className="text-blue-700 mt-1">Manage wedding gallery with size options (L/S) and absolute paths</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  🗄️ MySQL Database
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {galleryImages.length} Images
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('berhasil') || message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* Gallery Settings Form */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-6 flex items-center">
                <i className="fas fa-cog text-blue-600 mr-3"></i>
                Gallery Settings (Judul Gallery, Subtitle, Quote Bawah)
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Gallery
                    </label>
                    <input
                      type="text"
                      name="header_title"
                      value={gallerySettings.header_title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Our Gallery"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      name="header_subtitle"
                      value={gallerySettings.header_subtitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Capturing beautiful moments..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quote Bawah
                    </label>
                    <textarea
                      name="bottom_quote"
                      value={gallerySettings.bottom_quote}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Every picture tells a story of love"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 rounded-md font-medium text-white ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } transition-colors duration-200`}
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan Settings'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Image Upload Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-6 flex items-center">
                <i className="fas fa-cloud-upload-alt text-blue-600 mr-3"></i>
                Upload Gallery Images
              </h2>

              {/* Upload Options */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Size *
                  </label>
                  <select
                    value={selectedImageSize}
                    onChange={(e) => setSelectedImageSize(e.target.value as 'L' | 'S')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="S">S (Small)</option>
                    <option value="L">L (Large)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose image size for display</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Type
                  </label>
                  <select
                    value={selectedImageType}
                    onChange={(e) => setSelectedImageType(e.target.value as 'landscape' | 'square' | 'portrait')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="square">Square</option>
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose image orientation</p>
                </div>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50'
                    : uploading
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        if (e.target.files.length === 1) {
                          handleImageUpload(e.target.files[0]);
                        } else {
                          handleBulkUpload(e.target.files);
                        }
                      }
                    }}
                    className="hidden"
                    disabled={uploading}
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-blue-600 font-medium text-lg">Mengupload gambar...</p>
                      <p className="text-blue-500 text-sm">Size: {selectedImageSize} | Type: {selectedImageType}</p>
                    </div>
                  ) : dragOver ? (
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">📤</div>
                      <p className="text-blue-700 font-medium text-lg">Drop gambar di sini</p>
                      <p className="text-blue-600 text-sm">Size: {selectedImageSize} | Type: {selectedImageType}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">🖼️</div>
                      <p className="text-gray-700 font-medium text-lg">Upload Gallery Images</p>
                      <p className="text-gray-500 text-sm mb-4">Klik atau drag & drop (multiple files supported)</p>
                      <div className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg">
                        Pilih Gambar
                      </div>
                      <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP (Max 5MB each)</p>
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-700 font-medium">📁 Storage Path:</p>
                        <p className="text-xs text-blue-600">C:\Project\wira-sofi-\public\images\GalleryDatabase</p>
                        <p className="text-xs text-blue-600 mt-1">Selected: Size {selectedImageSize} | Type {selectedImageType}</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Gallery Images List */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800 mb-6 flex items-center">
                <i className="fas fa-images text-blue-600 mr-3"></i>
                Gallery Images ({galleryImages.length})
              </h2>

              {galleryImages.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-images text-gray-400 text-6xl mb-4"></i>
                  <p className="text-gray-600 text-lg">No images uploaded yet</p>
                  <p className="text-gray-500 text-sm">Upload your first gallery image above</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className={`relative overflow-hidden rounded-lg ${
                        image.image_type === 'landscape' ? 'aspect-video' :
                        image.image_type === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'
                      } bg-gray-200`}>
                        <img
                          src={image.image_src}
                          alt={image.image_alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <button
                            onClick={() => deleteImage(image.id)}
                            className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all"
                            title="Hapus gambar"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        {/* Size Badge */}
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            image.image_size === 'L'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {image.image_size} ({image.image_size === 'L' ? 'Large' : 'Small'})
                          </span>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                            {image.image_type}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            image.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {image.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-sm text-gray-600 truncate font-medium">{image.image_alt || 'No title'}</p>
                        <p className="text-xs text-gray-500">Order: {image.display_order}</p>
                        <p className="text-xs text-blue-600 truncate" title={image.absolute_path}>
                          📁 {image.absolute_path}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Section */}
            {galleryImages.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100 mt-6">
                <h2 className="text-xl font-semibold text-blue-800 mb-6 flex items-center">
                  <i className="fas fa-eye text-blue-600 mr-3"></i>
                  Gallery Preview
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {gallerySettings.header_title}
                    </h3>
                    <p className="text-gray-600 italic">
                      {gallerySettings.header_subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {galleryImages.filter(img => img.is_active).slice(0, 8).map((image) => (
                      <div key={image.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image.image_src}
                          alt={image.image_alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 italic">
                      "{gallerySettings.bottom_quote}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GalleryManagement;
