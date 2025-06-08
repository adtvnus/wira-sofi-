import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';

interface WeddingSettingsData {
  weddingDate: string;
  weddingTime: string;
  weddingVenue: string;
  weddingAddress: string;
  receptionDate: string;
  receptionTime: string;
  receptionVenue: string;
  receptionAddress: string;
}

const WeddingSettings = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<WeddingSettingsData>({
    weddingDate: '',
    weddingTime: '',
    weddingVenue: '',
    weddingAddress: '',
    receptionDate: '',
    receptionTime: '',
    receptionVenue: '',
    receptionAddress: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Load wedding settings from MySQL
  useEffect(() => {
    loadWeddingSettings();
  }, []);

  const loadWeddingSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/wedding-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const settings = data.data;
          setFormData({
            weddingDate: settings.wedding_date || '',
            weddingTime: settings.wedding_time || '',
            weddingVenue: settings.wedding_venue || '',
            weddingAddress: settings.wedding_address || '',
            receptionDate: settings.reception_date || '',
            receptionTime: settings.reception_time || '',
            receptionVenue: settings.reception_venue || '',
            receptionAddress: settings.reception_address || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading wedding settings:', error);
      setMessage('Gagal memuat data pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const requiredFields = [
      { key: 'weddingDate', label: 'Tanggal Pernikahan' },
      { key: 'weddingTime', label: 'Waktu Pernikahan' },
      { key: 'weddingVenue', label: 'Tempat Pernikahan' },
      { key: 'weddingAddress', label: 'Alamat Pernikahan' }
    ];

    const missingFields = requiredFields.filter(field =>
      !formData[field.key as keyof typeof formData] ||
      formData[field.key as keyof typeof formData].toString().trim() === ''
    );

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(f => f.label).join(', ');
      setMessage(`❌ Field wajib belum diisi: ${missingLabels}`);
      setTimeout(() => setMessage(''), 8000);
      setIsSubmitting(false);
      return;
    }

    // Debug logging
    console.log('🔍 Wedding Settings Submit Debug:');
    console.log('   API_BASE_URL:', API_BASE_URL);
    console.log('   Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    console.log('   Form Data:', formData);
    console.log('   ✅ All required fields validated');

    try {
      const requestUrl = `${API_BASE_URL}/wedding-settings`;
      const requestHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const requestBody = JSON.stringify(formData);

      console.log('   Request URL:', requestUrl);
      console.log('   Request Headers:', requestHeaders);
      console.log('   Request Body:', requestBody);

      // Test network connectivity first
      console.log('   🌐 Testing network connectivity...');
      try {
        const healthCheck = await fetch(`${API_BASE_URL}/health`);
        console.log('   Health check status:', healthCheck.status);
        if (!healthCheck.ok) {
          throw new Error(`Health check failed: ${healthCheck.status}`);
        }
      } catch (healthError) {
        console.error('   ❌ Health check failed:', healthError);
        const errorMessage = healthError instanceof Error ? healthError.message : String(healthError);
        throw new Error(`Network connectivity issue: ${errorMessage}`);
      }

      console.log('   📡 Making wedding settings request...');
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody,
      });

      console.log('   Response Status:', response.status);
      console.log('   Response OK:', response.ok);
      console.log('   Response Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('   Response Data:', data);

        if (data.success) {
          console.log('   ✅ Success! Setting success message...');
          setMessage('✅ Data berhasil disimpan ke MySQL database!');
          setTimeout(() => setMessage(''), 5000);
        } else {
          console.log('   ❌ API returned success=false');
          throw new Error(data.error || 'Failed to save settings');
        }
      } else {
        const errorText = await response.text();
        console.log('   ❌ Response not OK, error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error saving wedding settings:', error);
      console.error('   Error type:', typeof error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('   Error message:', errorMessage);
      if (errorStack) {
        console.error('   Error stack:', errorStack);
      }

      setMessage(`❌ Terjadi kesalahan saat menyimpan data ke database: ${errorMessage}`);
      setTimeout(() => setMessage(''), 8000);
    } finally {
      console.log('   🏁 Submit process finished, setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data pengaturan dari MySQL...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Pengaturan Undangan Pernikahan</h1>
              <p className="text-gray-600 mt-2">Kelola detail acara pernikahan dan resepsi</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                🗄️ MySQL Database
              </span>
            </div>
          </div>
          
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('berhasil') 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">



            {/* Wedding Details */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                <i className="fas fa-calendar-alt text-purple-500 mr-2"></i>
                Detail Pernikahan
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Pernikahan
                  </label>
                  <input
                    type="date"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Pernikahan
                  </label>
                  <input
                    type="time"
                    name="weddingTime"
                    value={formData.weddingTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Pernikahan
                  </label>
                  <input
                    type="text"
                    name="weddingVenue"
                    value={formData.weddingVenue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Gedung Serbaguna"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="weddingAddress"
                    value={formData.weddingAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jl. Merdeka No. 123, Jakarta"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Reception Details */}
            <div className="pb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                <i className="fas fa-glass-cheers text-green-500 mr-2"></i>
                Detail Resepsi (Opsional)
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Resepsi
                  </label>
                  <input
                    type="date"
                    name="receptionDate"
                    value={formData.receptionDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Resepsi
                  </label>
                  <input
                    type="time"
                    name="receptionTime"
                    value={formData.receptionTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Resepsi
                  </label>
                  <input
                    type="text"
                    name="receptionVenue"
                    value={formData.receptionVenue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ballroom Hotel"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Resepsi
                  </label>
                  <textarea
                    name="receptionAddress"
                    value={formData.receptionAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jl. Sudirman No. 456, Jakarta"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <i className="fas fa-info-circle mr-1"></i>
                Data akan disimpan ke MySQL database
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={loadWeddingSettings}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-md font-medium text-white flex items-center ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  } transition-colors duration-200`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan ke MySQL...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Simpan ke Database
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WeddingSettings;
