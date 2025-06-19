import React, { useState, useEffect } from 'react';
import { useWedding } from '../../contexts/WeddingContext';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';

const ThanksManagement: React.FC = () => {
  const { weddingData, updateThanksSettings } = useWedding();
  const { thanksSettings, couple } = weddingData;
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    headerTitle: thanksSettings.headerTitle,
    mainMessage: thanksSettings.mainMessage
  });

  const [coupleData, setCoupleData] = useState({
    groomFirstName: '',
    brideFirstName: '',
    groomFullName: '',
    brideFullName: ''
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load couple data and thanks settings from API
  useEffect(() => {
    loadCoupleData();
    loadThanksSettings();
  }, []);

  useEffect(() => {
    setFormData({
      headerTitle: thanksSettings.headerTitle,
      mainMessage: thanksSettings.mainMessage
    });
  }, [thanksSettings]);

  const loadCoupleData = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${API_BASE_URL}/bride-groom`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const couple = data.data;
          setCoupleData({
            groomFirstName: couple.groom_first_name || '',
            brideFirstName: couple.bride_first_name || '',
            groomFullName: couple.groom_full_name || '',
            brideFullName: couple.bride_full_name || ''
          });
        }
      } else {
        // Fallback to context data if API fails
        setCoupleData({
          groomFirstName: couple.groomFirstName || '',
          brideFirstName: couple.brideFirstName || '',
          groomFullName: couple.groomFullName || '',
          brideFullName: couple.brideFullName || ''
        });
      }
    } catch (error) {
      console.error('Error loading couple data:', error);
      // Fallback to context data
      setCoupleData({
        groomFirstName: couple.groomFirstName || '',
        brideFirstName: couple.brideFirstName || '',
        groomFullName: couple.groomFullName || '',
        brideFullName: couple.brideFullName || ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadThanksSettings = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${API_BASE_URL}/thanks-settings`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const settings = data.data;
          setFormData({
            headerTitle: settings.headerTitle || 'Thank You',
            mainMessage: settings.mainMessage || 'Atas kehadiran, doa, dan restu yang telah diberikan dalam hari bahagia kami, kami mengucapkan terima kasih yang sebesar-besarnya.'
          });

          // Update context with API data
          updateThanksSettings({
            headerTitle: settings.headerTitle,
            headerSubtitle: settings.headerSubtitle,
            mainMessage: settings.mainMessage,
            subMessage: settings.subMessage,
            coupleNames: settings.coupleNames,
            blessingQuoteArabic: settings.blessingQuoteArabic,
            blessingQuoteTranslation: settings.blessingQuoteTranslation,
            backgroundImage: settings.backgroundImage,
            showSocialMedia: settings.showSocialMedia,
            socialMedia: {
              instagram: settings.socialMediaInstagram,
              facebook: settings.socialMediaFacebook,
              twitter: settings.socialMediaTwitter
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading thanks settings:', error);
    }
  };

  // Generate couple names from loaded data
  const getCoupleNames = () => {
    if (coupleData.groomFirstName && coupleData.brideFirstName) {
      return `${coupleData.groomFirstName} & ${coupleData.brideFirstName}`;
    }
    return 'Pengantin Pria & Pengantin Wanita';
  };

  const getCoupleFullNames = () => {
    if (coupleData.groomFullName && coupleData.brideFullName) {
      return `${coupleData.groomFullName} & ${coupleData.brideFullName}`;
    }
    return getCoupleNames();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      // Include couple names from relational data
      const updatedData = {
        headerTitle: formData.headerTitle,
        headerSubtitle: thanksSettings.headerSubtitle || 'Terima Kasih',
        mainMessage: formData.mainMessage,
        subMessage: thanksSettings.subMessage || 'Semoga keberkahan dan kebahagiaan senantiasa menyertai kita semua.',
        coupleNames: getCoupleNames(), // Auto-generated from bride-groom data
        blessingQuoteArabic: thanksSettings.blessingQuoteArabic || 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fi khair',
        blessingQuoteTranslation: thanksSettings.blessingQuoteTranslation || 'Semoga Allah memberkati kalian dan menyatukan kalian dalam kebaikan',
        backgroundImage: thanksSettings.backgroundImage || '',
        showSocialMedia: thanksSettings.showSocialMedia || false,
        socialMediaInstagram: thanksSettings.socialMedia?.instagram || '',
        socialMediaFacebook: thanksSettings.socialMedia?.facebook || '',
        socialMediaTwitter: thanksSettings.socialMedia?.twitter || ''
      };

      const response = await fetch(`${API_BASE_URL}/thanks-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update context with saved data
          updateThanksSettings({
            headerTitle: updatedData.headerTitle,
            headerSubtitle: updatedData.headerSubtitle,
            mainMessage: updatedData.mainMessage,
            subMessage: updatedData.subMessage,
            coupleNames: updatedData.coupleNames,
            blessingQuoteArabic: updatedData.blessingQuoteArabic,
            blessingQuoteTranslation: updatedData.blessingQuoteTranslation,
            backgroundImage: updatedData.backgroundImage,
            showSocialMedia: updatedData.showSocialMedia,
            socialMedia: {
              instagram: updatedData.socialMediaInstagram,
              facebook: updatedData.socialMediaFacebook,
              twitter: updatedData.socialMediaTwitter
            }
          });

          setMessage('✅ Pengaturan Thanks berhasil disimpan ke database!');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('❌ Gagal menyimpan pengaturan: ' + result.error);
          setTimeout(() => setMessage(''), 5000);
        }
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unknown error';
        }
        setMessage(`❌ Gagal menyimpan pengaturan ke database (Status: ${response.status})${errorText ? ': ' + errorText : ''}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error saving thanks settings:', error);
      if (error instanceof Error) {
        setMessage('❌ Error: ' + error.message);
      } else {
        setMessage('❌ Error: ' + String(error));
      }
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data pengantin...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto" style={{ fontFamily: 'Ovo, serif' }}>
        <div className="bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-2xl shadow-xl border border-amber-200">
          <div className="border-b border-amber-200 px-8 py-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-hands-praying text-amber-600 text-3xl mr-4"></i>
                <div>
                  <h1 className="text-3xl font-bold text-amber-800">Thanks Page</h1>
                  <p className="text-amber-700 mt-1">Manage thank you page content</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-sm text-amber-700 opacity-90">Data Source</p>
                  <p className="text-lg font-bold text-amber-800">Bride Groom Management</p>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className="mx-8 mt-6 p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300 shadow-sm">
              <div className="flex items-center">
                <i className="fas fa-check-circle mr-3"></i>
                {message}
              </div>
            </div>
          )}

          <div className="p-8 space-y-8">
            {/* Essential Fields Only */}
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-heading text-amber-600 mr-3"></i>
                <h3 className="text-xl font-semibold text-amber-800">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-font mr-2"></i>
                    Main Title
                  </label>
                  <input
                    type="text"
                    name="headerTitle"
                    value={formData.headerTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="Thank You"
                  />
                </div>

                {/* Couple Names - Auto-generated from Bride Groom Management */}
                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-link text-blue-500 mr-2"></i>
                    Couple Names (Auto-generated)
                  </label>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-blue-800">{getCoupleNames()}</p>
                        <p className="text-sm text-blue-600">{getCoupleFullNames()}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <i className="fas fa-database mr-1"></i>
                          From Database
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-600">
                        <i className="fas fa-info-circle mr-1"></i>
                        Data diambil otomatis dari <strong>Bride Groom Management</strong>.
                        Untuk mengubah nama, edit di halaman
                        <a href="/admin/bride-groom-management" className="underline hover:text-blue-800 ml-1">
                          Bride Groom Management
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-comment-dots text-amber-600 mr-3"></i>
                <h3 className="text-xl font-semibold text-amber-800">Thank You Message</h3>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                  <i className="fas fa-message mr-2"></i>
                  Main Message
                </label>
                <textarea
                  name="mainMessage"
                  value={formData.mainMessage}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900 resize-none"
                  placeholder="Your heartfelt thank you message..."
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-8 border-t border-amber-200">
              <button
                onClick={handleSave}
                className="px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-[#644F44] rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-lg flex items-center"
              >
                <i className="fas fa-save mr-3"></i>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ThanksManagement;
