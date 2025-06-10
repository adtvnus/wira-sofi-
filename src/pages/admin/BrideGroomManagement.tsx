import React, { useState, useEffect } from 'react';
import { useWedding } from '../../contexts/WeddingContext';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';

const BrideGroomManagement = () => {
  const { weddingData, updateBrideGroomSettings, updateCouple } = useWedding();
  const { token } = useAuth();
  const [formData, setFormData] = useState(weddingData.brideGroomSettings);
  const [coupleData, setCoupleData] = useState(weddingData.couple);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load fresh data from database when component mounts
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounted

    const loadFreshData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Loading fresh bride-groom data from database...');

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

        // Load couple data
        const coupleResponse = await fetch(`${API_BASE_URL}/bride-groom`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Load detail settings data
        const detailResponse = await fetch(`${API_BASE_URL}/bride-groom-detail`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Only update state if component is still mounted
        if (!isMounted) return;

        if (coupleResponse.ok) {
          const coupleData = await coupleResponse.json();
          if (coupleData.success && coupleData.data) {
            console.log('✅ Fresh couple data loaded:', coupleData.data);

            // Update couple data with fresh database data
            const freshCoupleData = {
              groomFirstName: coupleData.data.groom_first_name || '',
              groomLastName: coupleData.data.groom_last_name || '',
              groomFullName: coupleData.data.groom_full_name || '',
              groomParentNames: coupleData.data.groom_parent_names || '',
              groomPhoto: coupleData.data.groom_photo || 'public/images/BrideGroom/groom.jpg',
              brideFirstName: coupleData.data.bride_first_name || '',
              brideLastName: coupleData.data.bride_last_name || '',
              brideFullName: coupleData.data.bride_full_name || '',
              brideParentNames: coupleData.data.bride_parent_names || '',
              bridePhoto: coupleData.data.bride_photo || 'public/images/BrideGroom/bride.jpg'
            };

            setCoupleData(freshCoupleData);
            // Don't call updateCouple to avoid triggering context updates
          }
        }

        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          if (detailData.success && detailData.data) {
            console.log('✅ Fresh detail data loaded:', detailData.data);

            // Update form data with fresh detail settings
            const freshFormData = {
              brideSettings: {
                headerTitle: detailData.data.bride_header_title || 'The Bride',
                headerSubtitle: detailData.data.bride_header_subtitle || 'A beautiful soul with a heart full of love',
                label: detailData.data.bride_label || 'Calon Pengantin Wanita',
                parentLabel: detailData.data.bride_parent_label || 'Putri dari',
                fatherName: detailData.data.bride_father_name || '',
                motherName: detailData.data.bride_mother_name || '',
                quote: detailData.data.bride_quote || '',
                photo: detailData.data.bride_photo || 'public/images/BrideGroom/bride.jpg'
              },
              groomSettings: {
                headerTitle: detailData.data.groom_header_title || 'The Groom',
                headerSubtitle: detailData.data.groom_header_subtitle || 'A gentle soul with strength and devotion',
                label: detailData.data.groom_label || 'Calon Pengantin Pria',
                parentLabel: detailData.data.groom_parent_label || 'Putra dari',
                fatherName: detailData.data.groom_father_name || '',
                motherName: detailData.data.groom_mother_name || '',
                quote: detailData.data.groom_quote || '',
                photo: detailData.data.groom_photo || 'public/images/BrideGroom/groom.jpg'
              }
            };

            setFormData(freshFormData);
            // Don't call updateBrideGroomSettings to avoid triggering context updates
          }
        }

        console.log('✅ All fresh data loaded and updated');

      } catch (error) {
        console.error('❌ Error loading fresh data:', error);
        console.log('⚠️ Using context data as fallback');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFreshData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleInputChange = (section: 'brideSettings' | 'groomSettings', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCoupleInputChange = (field: string, value: string) => {
    setCoupleData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate full name when first or last name changes
    if (field === 'groomFirstName' || field === 'groomLastName') {
      const firstName = field === 'groomFirstName' ? value : coupleData.groomFirstName;
      const lastName = field === 'groomLastName' ? value : coupleData.groomLastName;
      setCoupleData(prev => ({
        ...prev,
        groomFullName: `${firstName} ${lastName}`.trim()
      }));
    }

    if (field === 'brideFirstName' || field === 'brideLastName') {
      const firstName = field === 'brideFirstName' ? value : coupleData.brideFirstName;
      const lastName = field === 'brideLastName' ? value : coupleData.brideLastName;
      setCoupleData(prev => ({
        ...prev,
        brideFullName: `${firstName} ${lastName}`.trim()
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!coupleData.groomFirstName || !coupleData.brideFirstName) {
        setMessage('❌ Nama depan pengantin pria dan wanita wajib diisi');
        setTimeout(() => setMessage(''), 5000);
        setIsSubmitting(false);
        return;
      }

      // Save couple data to database via API
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      console.log('💾 Saving couple data...');
      const coupleResponse = await fetch(`${API_BASE_URL}/bride-groom/1`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groomFirstName: coupleData.groomFirstName,
          groomLastName: coupleData.groomLastName,
          groomFullName: coupleData.groomFullName,
          groomParentNames: coupleData.groomParentNames,
          brideFirstName: coupleData.brideFirstName,
          brideLastName: coupleData.brideLastName,
          brideFullName: coupleData.brideFullName,
          brideParentNames: coupleData.brideParentNames,
        }),
      });

      console.log('💾 Saving detail settings...');
      const detailResponse = await fetch(`${API_BASE_URL}/bride-groom-detail/1`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brideHeaderTitle: formData.brideSettings.headerTitle,
          brideHeaderSubtitle: formData.brideSettings.headerSubtitle,
          brideLabel: formData.brideSettings.label,
          brideParentLabel: formData.brideSettings.parentLabel,
          brideFatherName: formData.brideSettings.fatherName,
          brideMotherName: formData.brideSettings.motherName,
          brideQuote: formData.brideSettings.quote,
          bridePhoto: formData.brideSettings.photo,
          groomHeaderTitle: formData.groomSettings.headerTitle,
          groomHeaderSubtitle: formData.groomSettings.headerSubtitle,
          groomLabel: formData.groomSettings.label,
          groomParentLabel: formData.groomSettings.parentLabel,
          groomFatherName: formData.groomSettings.fatherName,
          groomMotherName: formData.groomSettings.motherName,
          groomQuote: formData.groomSettings.quote,
          groomPhoto: formData.groomSettings.photo,
        }),
      });

      // Check both responses
      if (coupleResponse.ok && detailResponse.ok) {
        const coupleData = await coupleResponse.json();
        const detailData = await detailResponse.json();

        if (coupleData.success && detailData.success) {
          console.log('✅ Both couple data and detail settings saved successfully');

          // Update context with new data
          updateCouple(coupleData);
          updateBrideGroomSettings(formData);

          setMessage('✅ Data pengantin dan pengaturan berhasil disimpan ke database!');
          setTimeout(() => setMessage(''), 5000);
        } else {
          throw new Error(coupleData.error || detailData.error || 'Failed to save data');
        }
      } else {
        let errorMessage = 'Failed to save data: ';
        if (!coupleResponse.ok) {
          const coupleError = await coupleResponse.text();
          errorMessage += `Couple data error (${coupleResponse.status}): ${coupleError}. `;
        }
        if (!detailResponse.ok) {
          const detailError = await detailResponse.text();
          errorMessage += `Detail settings error (${detailResponse.status}): ${detailError}.`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving bride groom data:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`❌ Terjadi kesalahan: ${errorMessage}`);
      setTimeout(() => setMessage(''), 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // File validation function (same as Gallery Management)
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

  // Convert file to base64 (same as Gallery Management)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle image upload for bride/groom photos (LOCAL PROCESSING ONLY)
  const handleImageUpload = async (file: File, type: 'bride' | 'groom') => {
    setUploading(true);

    try {
      console.log(`🖼️ Processing ${type} image upload:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const validationError = validateFile(file);
      if (validationError) {
        console.log('❌ Validation failed:', validationError);
        setMessage(`❌ ${validationError}`);
        setTimeout(() => setMessage(''), 5000);
        return;
      }

      console.log('✅ File validation passed, converting to base64...');

      // Convert to base64 for preview (NO API CALL)
      const base64 = await fileToBase64(file);

      console.log('✅ Base64 conversion completed, updating form data...');

      // Update form data with new image (LOCAL STATE ONLY)
      if (type === 'bride') {
        handleInputChange('brideSettings', 'photo', base64);
        console.log('✅ Bride photo updated in form data');
      } else {
        handleInputChange('groomSettings', 'photo', base64);
        console.log('✅ Groom photo updated in form data');
      }

      setMessage(`✅ Foto ${type === 'bride' ? 'pengantin wanita' : 'pengantin pria'} berhasil diupload!`);
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('❌ Error processing image:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`❌ Gagal mengupload gambar: ${errorMessage}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setUploading(false);
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

  const handleDrop = (e: React.DragEvent, type: 'bride' | 'groom') => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0], type);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto" style={{ fontFamily: 'Ovo, serif' }}>
        <div className="bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-2xl shadow-xl border border-amber-200">
          <div className="border-b border-amber-200 px-8 py-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-2xl">
            <div className="flex items-center">
              <i className="fas fa-ring text-amber-600 text-3xl mr-4"></i>
              <div>
                <h1 className="text-3xl font-bold text-amber-800">Bride & Groom Pages</h1>
                <p className="text-amber-700 mt-1">Manage bride and groom profile pages</p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="mx-8 mt-6 p-4 rounded-xl border shadow-sm flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              Loading fresh data from database...
            </div>
          )}

          {message && (
            <div className={`mx-8 mt-6 p-4 rounded-xl border shadow-sm flex items-center ${
              message.includes('berhasil')
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300'
                : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300'
            }`}>
              <i className={`fas ${message.includes('berhasil') ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-3`}></i>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-12">
            {/* Couple Names Section */}
            <div className="border border-purple-300 rounded-2xl p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 shadow-lg">
              <div className="flex items-center mb-8">
                <i className="fas fa-heart text-purple-600 text-3xl mr-4"></i>
                <div>
                  <h2 className="text-2xl font-bold text-purple-800">Nama Pengantin</h2>
                  <p className="text-purple-700">Edit nama pengantin pria dan wanita</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Groom Names */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <i className="fas fa-male mr-2"></i>
                    Pengantin Pria
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Depan *
                      </label>
                      <input
                        type="text"
                        value={coupleData.groomFirstName}
                        onChange={(e) => handleCoupleInputChange('groomFirstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Wira"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Belakang
                      </label>
                      <input
                        type="text"
                        value={coupleData.groomLastName}
                        onChange={(e) => handleCoupleInputChange('groomLastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Maulana"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={coupleData.groomFullName}
                        onChange={(e) => handleCoupleInputChange('groomFullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        placeholder="Wira Maulana"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">Otomatis dibuat dari nama depan + belakang</p>
                    </div>
                  </div>
                </div>

                {/* Bride Names */}
                <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
                  <h3 className="text-lg font-semibold text-pink-800 mb-4 flex items-center">
                    <i className="fas fa-female mr-2"></i>
                    Pengantin Wanita
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Depan *
                      </label>
                      <input
                        type="text"
                        value={coupleData.brideFirstName}
                        onChange={(e) => handleCoupleInputChange('brideFirstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Sofi"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Belakang
                      </label>
                      <input
                        type="text"
                        value={coupleData.brideLastName}
                        onChange={(e) => handleCoupleInputChange('brideLastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Kumala"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={coupleData.brideFullName}
                        onChange={(e) => handleCoupleInputChange('brideFullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50"
                        placeholder="Sofi Kumala"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">Otomatis dibuat dari nama depan + belakang</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bride Settings */}
            <div className="border border-pink-300 rounded-2xl p-8 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 shadow-lg">
              <div className="flex items-center mb-8">
                <i className="fas fa-female text-pink-600 text-3xl mr-4"></i>
                <div>
                  <h2 className="text-2xl font-bold text-pink-800">Bride Profile</h2>
                  <p className="text-pink-700">Manage bride page content</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Title
                  </label>
                  <input
                    type="text"
                    value={formData.brideSettings.headerTitle}
                    onChange={(e) => handleInputChange('brideSettings', 'headerTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="The Bride"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.brideSettings.headerSubtitle}
                    onChange={(e) => handleInputChange('brideSettings', 'headerSubtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="A beautiful soul with a heart full of love"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label Pengantin
                  </label>
                  <input
                    type="text"
                    value={formData.brideSettings.label}
                    onChange={(e) => handleInputChange('brideSettings', 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Calon Pengantin Wanita"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label Orang Tua
                  </label>
                  <input
                    type="text"
                    value={formData.brideSettings.parentLabel}
                    onChange={(e) => handleInputChange('brideSettings', 'parentLabel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Putri dari"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Ayah
                  </label>
                  <input
                    type="text"
                    value={formData.brideSettings.fatherName}
                    onChange={(e) => handleInputChange('brideSettings', 'fatherName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Bapak Adit"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Ibu
                  </label>
                  <input
                    type="text"
                    value={formData.brideSettings.motherName}
                    onChange={(e) => handleInputChange('brideSettings', 'motherName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Ibu Shikimori"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bride Photo
                  </label>

                  {/* Current Image Preview */}
                  {formData.brideSettings.photo && (
                    <div className="mb-4">
                      <img
                        src={formData.brideSettings.photo}
                        alt="Bride Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-pink-200"
                      />
                    </div>
                  )}

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                      dragOver
                        ? 'border-pink-400 bg-pink-50'
                        : uploading
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'bride')}
                  >
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(e.target.files[0], 'bride');
                          }
                        }}
                        className="hidden"
                        disabled={uploading}
                      />

                      {uploading ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mb-2"></div>
                          <p className="text-pink-600 font-medium">Mengupload...</p>
                        </div>
                      ) : dragOver ? (
                        <div className="flex flex-col items-center">
                          <div className="text-4xl mb-2">📤</div>
                          <p className="text-pink-700 font-medium">Drop foto di sini</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="text-4xl mb-2">👰</div>
                          <p className="text-gray-700 font-medium">Upload Foto Bride</p>
                          <p className="text-gray-500 text-sm mb-2">Klik atau drag & drop</p>
                          <div className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors">
                            Pilih Foto
                          </div>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Bride
                  </label>
                  <textarea
                    value={formData.brideSettings.quote}
                    onChange={(e) => handleInputChange('brideSettings', 'quote', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Cinta sejati dimulai ketika tidak ada yang diharapkan sebagai balasan"
                  />
                </div>
              </div>
            </div>

            {/* Groom Settings */}
            <div className="border border-blue-300 rounded-2xl p-8 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 shadow-lg">
              <div className="flex items-center mb-8">
                <i className="fas fa-male text-blue-600 text-3xl mr-4"></i>
                <div>
                  <h2 className="text-2xl font-bold text-blue-800">Groom Profile</h2>
                  <p className="text-blue-700">Manage groom page content</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Title
                  </label>
                  <input
                    type="text"
                    value={formData.groomSettings.headerTitle}
                    onChange={(e) => handleInputChange('groomSettings', 'headerTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="The Groom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.groomSettings.headerSubtitle}
                    onChange={(e) => handleInputChange('groomSettings', 'headerSubtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A gentle soul with strength and devotion"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label Pengantin
                  </label>
                  <input
                    type="text"
                    value={formData.groomSettings.label}
                    onChange={(e) => handleInputChange('groomSettings', 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Calon Pengantin Pria"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label Orang Tua
                  </label>
                  <input
                    type="text"
                    value={formData.groomSettings.parentLabel}
                    onChange={(e) => handleInputChange('groomSettings', 'parentLabel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Putra dari"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Ayah
                  </label>
                  <input
                    type="text"
                    value={formData.groomSettings.fatherName}
                    onChange={(e) => handleInputChange('groomSettings', 'fatherName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Bapak Agata"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Ibu
                  </label>
                  <input
                    type="text"
                    value={formData.groomSettings.motherName}
                    onChange={(e) => handleInputChange('groomSettings', 'motherName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ibu Ayaka"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groom Photo
                  </label>

                  {/* Current Image Preview */}
                  {formData.groomSettings.photo && (
                    <div className="mb-4">
                      <img
                        src={formData.groomSettings.photo}
                        alt="Groom Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-blue-200"
                      />
                    </div>
                  )}

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                      dragOver
                        ? 'border-blue-400 bg-blue-50'
                        : uploading
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'groom')}
                  >
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(e.target.files[0], 'groom');
                          }
                        }}
                        className="hidden"
                        disabled={uploading}
                      />

                      {uploading ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                          <p className="text-blue-600 font-medium">Mengupload...</p>
                        </div>
                      ) : dragOver ? (
                        <div className="flex flex-col items-center">
                          <div className="text-4xl mb-2">📤</div>
                          <p className="text-blue-700 font-medium">Drop foto di sini</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="text-4xl mb-2">🤵</div>
                          <p className="text-gray-700 font-medium">Upload Foto Groom</p>
                          <p className="text-gray-500 text-sm mb-2">Klik atau drag & drop</p>
                          <div className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Pilih Foto
                          </div>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Groom
                  </label>
                  <textarea
                    value={formData.groomSettings.quote}
                    onChange={(e) => handleInputChange('groomSettings', 'quote', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cinta sejati adalah ketika kamu menemukan seseorang yang membuatmu menjadi versi terbaik dari dirimu"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8 border-t border-amber-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-12 py-4 rounded-2xl font-medium text-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                }`}
              >
                <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'} mr-3`}></i>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          {/* Bride Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-pink-800 mb-4 flex items-center">
              <span className="mr-2">👰</span>
              Preview Bride
            </h3>
            <div className="bg-pink-50 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-medium text-pink-700">{formData.brideSettings.headerTitle}</h4>
                <p className="text-sm text-gray-600 italic">"{formData.brideSettings.headerSubtitle}"</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">{formData.brideSettings.label}</span>
                <p className="font-semibold">{coupleData.brideFirstName} {coupleData.brideLastName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">{formData.brideSettings.parentLabel}</span>
                <p className="text-sm">{formData.brideSettings.fatherName} & {formData.brideSettings.motherName}</p>
              </div>
              <div>
                <p className="text-sm italic text-gray-600">"{formData.brideSettings.quote}"</p>
              </div>
            </div>
          </div>

          {/* Groom Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <span className="mr-2">🤵</span>
              Preview Groom
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-medium text-blue-700">{formData.groomSettings.headerTitle}</h4>
                <p className="text-sm text-gray-600 italic">"{formData.groomSettings.headerSubtitle}"</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">{formData.groomSettings.label}</span>
                <p className="font-semibold">{coupleData.groomFirstName} {coupleData.groomLastName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">{formData.groomSettings.parentLabel}</span>
                <p className="text-sm">{formData.groomSettings.fatherName} & {formData.groomSettings.motherName}</p>
              </div>
              <div>
                <p className="text-sm italic text-gray-600">"{formData.groomSettings.quote}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BrideGroomManagement;
