import React, { useState, useEffect } from 'react';
import { useWedding } from '../../contexts/WeddingContext';
import AdminLayout from '../../layouts/AdminLayout';

const InvitedManagement: React.FC = () => {
  const { weddingData, updateInvitedSettings } = useWedding();
  const { invitedSettings } = weddingData;
  
  // Single form state for all invited settings
  const [formData, setFormData] = useState({
    // Header settings
    headerTitle: invitedSettings.headerTitle,
    headerSubtitle: invitedSettings.headerSubtitle,
    // Event information
    eventTitle: invitedSettings.eventTitle,
    eventName: invitedSettings.eventName,
    eventDate: invitedSettings.eventDate,
    eventTime: invitedSettings.eventTime,
    // Venue information
    venueName: invitedSettings.venueName,
    venueAddress: invitedSettings.venueAddress,
    googleMapsUrl: invitedSettings.googleMapsUrl,
    // Save the date
    saveTheDateTitle: invitedSettings.saveTheDateTitle,
    saveTheDateMessage: invitedSettings.saveTheDateMessage,
    // Page status
    isEnabled: invitedSettings.isEnabled
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    setFormData({
      headerTitle: invitedSettings.headerTitle,
      headerSubtitle: invitedSettings.headerSubtitle,
      eventTitle: invitedSettings.eventTitle,
      eventName: invitedSettings.eventName,
      eventDate: invitedSettings.eventDate,
      eventTime: invitedSettings.eventTime,
      venueName: invitedSettings.venueName,
      venueAddress: invitedSettings.venueAddress,
      googleMapsUrl: invitedSettings.googleMapsUrl,
      saveTheDateTitle: invitedSettings.saveTheDateTitle,
      saveTheDateMessage: invitedSettings.saveTheDateMessage,
      isEnabled: invitedSettings.isEnabled
    });
  }, [invitedSettings]);

  // Input change handler
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

      console.log('🔍 Saving invited settings:', formData);

      // Check if token exists - use the correct key from AuthContext
      const token = localStorage.getItem('auth-token');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

      // Save to database via API
      const response = await fetch('http://localhost:3001/api/invited-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Database save successful:', result);

        // Also save to context for immediate UI update
        updateInvitedSettings(formData);

        setMessage('✅ Settings saved to database successfully!');
      } else {
        const errorText = await response.text();
        console.error('❌ Database save failed - Status:', response.status);
        console.error('❌ Database save failed - Response:', errorText);

        // Try to parse as JSON
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }

        // Fallback: save to context only
        updateInvitedSettings(formData);
        setMessage(`⚠️ Database error (${response.status}): ${errorData.error || 'Unknown error'}. Settings saved locally.`);
      }
    } catch (error) {
      console.error('❌ Network/Fetch error:', error);

      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Error details:', errorMessage);

      // Fallback: save to context only
      updateInvitedSettings(formData);
      setMessage(`❌ Network error: ${errorMessage}. Settings saved locally only.`);
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto" style={{ fontFamily: 'Ovo, serif' }}>
        <div className="bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-2xl shadow-xl border border-amber-200">
          <div className="border-b border-amber-200 px-8 py-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-2xl">
            <div className="flex items-center">
              <i className="fas fa-envelope-open-text text-amber-600 text-3xl mr-4"></i>
              <div>
                <h1 className="text-3xl font-bold text-amber-800">Invitation Settings</h1>
                <p className="text-amber-700 mt-1">Manage invitation page content</p>
              </div>
            </div>
          </div>

          {message && (
            <div className={`mx-8 mt-6 p-4 rounded-xl border shadow-sm ${
              message.includes('❌') || message.includes('Error')
                ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300'
                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300'
            }`}>
              <div className="flex items-center">
                <i className={`fas ${message.includes('❌') || message.includes('Error') ? 'fa-exclamation-circle' : 'fa-check-circle'} mr-3`}></i>
                {message}
              </div>
            </div>
          )}

          <div className="p-8 space-y-8">
            {/* Page Status */}
            <div className="bg-white/60 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fas fa-toggle-on text-amber-600 mr-3"></i>
                  <h3 className="text-xl font-semibold text-amber-800">Page Status</h3>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, isEnabled: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${formData.isEnabled ? 'bg-amber-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${formData.isEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="ml-3 text-amber-800 font-medium">
                    {formData.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>

            {/* Header Settings */}
            <div className="bg-white/60 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center mb-6">
                <i className="fas fa-heading text-amber-600 mr-3"></i>
                <h3 className="text-xl font-semibold text-amber-800">Header Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-heading mr-2"></i>
                    Header Title
                  </label>
                  <input
                    type="text"
                    name="headerTitle"
                    value={formData.headerTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="You're Invited"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-quote-left mr-2"></i>
                    Header Subtitle
                  </label>
                  <input
                    type="text"
                    name="headerSubtitle"
                    value={formData.headerSubtitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="We would be honored by your presence"
                  />
                </div>
              </div>
            </div>

            {/* Event Information */}
            <div className="bg-white/60 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center mb-6">
                <i className="fas fa-calendar-heart text-amber-600 mr-3"></i>
                <h3 className="text-xl font-semibold text-amber-800">Event Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-heading mr-2"></i>
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="eventTitle"
                    value={formData.eventTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="Wedding Ceremony"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-tag mr-2"></i>
                    Event Name
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="Akad Nikah"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-calendar mr-2"></i>
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-clock mr-2"></i>
                    Event Time
                  </label>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                  />
                </div>
              </div>
            </div>

            {/* Venue Information */}
            <div className="bg-white/60 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center mb-6">
                <i className="fas fa-map-marker-alt text-amber-600 mr-3"></i>
                <h3 className="text-xl font-semibold text-amber-800">Venue Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-building mr-2"></i>
                    Venue Name
                  </label>
                  <input
                    type="text"
                    name="venueName"
                    value={formData.venueName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="Wedding venue name"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-map mr-2"></i>
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    name="googleMapsUrl"
                    value={formData.googleMapsUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-location-dot mr-2"></i>
                    Venue Address
                  </label>
                  <textarea
                    name="venueAddress"
                    value={formData.venueAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900 resize-none"
                    placeholder="Complete venue address..."
                  />
                </div>
              </div>
            </div>

            {/* Save The Date Settings */}
            <div className="bg-white/60 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center mb-6">
                <i className="fas fa-calendar-check text-amber-600 mr-3"></i>
                <h3 className="text-xl font-semibold text-amber-800">Save The Date Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-heading mr-2"></i>
                    Save The Date Title
                  </label>
                  <input
                    type="text"
                    name="saveTheDateTitle"
                    value={formData.saveTheDateTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="Save the Date"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-comment mr-2"></i>
                    Save The Date Message
                  </label>
                  <input
                    type="text"
                    name="saveTheDateMessage"
                    value={formData.saveTheDateMessage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="We can't wait to celebrate with you!"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-8 border-t border-amber-200">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-lg flex items-center ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-3"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-3"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InvitedManagement;
