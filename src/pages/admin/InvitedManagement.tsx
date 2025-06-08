import React, { useState, useEffect } from 'react';
import { useWedding } from '../../contexts/WeddingContext';
import AdminLayout from '../../layouts/AdminLayout';

const InvitedManagement: React.FC = () => {
  const { weddingData, updateInvitedSettings } = useWedding();
  const { invitedSettings } = weddingData;
  
  const [formData, setFormData] = useState({
    eventTitle: invitedSettings.eventTitle,
    venueName: invitedSettings.venueName,
    venueAddress: invitedSettings.venueAddress,
    // Wedding details
    weddingDate: '',
    weddingTime: '',
    weddingVenue: '',
    weddingAddress: '',
    // Reception details
    receptionDate: '',
    receptionTime: '',
    receptionVenue: '',
    receptionAddress: ''
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      eventTitle: invitedSettings.eventTitle,
      venueName: invitedSettings.venueName,
      venueAddress: invitedSettings.venueAddress
    }));
  }, [invitedSettings]);

  // Load existing wedding settings
  useEffect(() => {
    const loadWeddingSettings = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/wedding-settings/active', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const settings = data.data;
            setFormData(prev => ({
              ...prev,
              weddingDate: settings.wedding_date || '',
              weddingTime: settings.wedding_time || '',
              weddingVenue: settings.wedding_venue || '',
              weddingAddress: settings.wedding_address || '',
              receptionDate: settings.reception_date || '',
              receptionTime: settings.reception_time || '',
              receptionVenue: settings.reception_venue || '',
              receptionAddress: settings.reception_address || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error loading wedding settings:', error);
      }
    };

    loadWeddingSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Save invited settings
      updateInvitedSettings({
        eventTitle: formData.eventTitle,
        venueName: formData.venueName,
        venueAddress: formData.venueAddress
      });

      // Save wedding and reception details to backend
      const response = await fetch('http://localhost:3001/api/wedding-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          weddingDate: formData.weddingDate,
          weddingTime: formData.weddingTime,
          weddingVenue: formData.weddingVenue,
          weddingAddress: formData.weddingAddress,
          receptionDate: formData.receptionDate,
          receptionTime: formData.receptionTime,
          receptionVenue: formData.receptionVenue,
          receptionAddress: formData.receptionAddress
        })
      });

      if (response.ok) {
        setMessage('Pengaturan Invited dan detail acara berhasil disimpan!');
      } else {
        setMessage('Pengaturan Invited disimpan, tetapi ada error pada detail acara.');
      }
    } catch (error) {
      setMessage('Pengaturan Invited disimpan, tetapi ada error pada detail acara.');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto" style={{ fontFamily: 'Ovo, serif' }}>
        <div className="bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-2xl shadow-xl border border-amber-200">
          <div className="border-b border-amber-200 px-8 py-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-2xl">
            <div className="flex items-center">
              <i className="fas fa-envelope-open-text text-amber-600 text-3xl mr-4"></i>
              <div>
                <h1 className="text-3xl font-bold text-amber-800">Invitation Page</h1>
                <p className="text-amber-700 mt-1">Manage invitation page content</p>
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
            {/* Essential Event Information */}
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-calendar-heart text-amber-600 mr-3"></i>
                <h3 className="text-xl font-semibold text-amber-800">Event Information</h3>
              </div>

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
            </div>

            {/* Wedding Details */}
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-rings-wedding text-amber-600 mr-3"></i>
                <h3 className="text-xl font-semibold text-amber-800">Wedding Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-calendar mr-2"></i>
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-clock mr-2"></i>
                    Wedding Time
                  </label>
                  <input
                    type="time"
                    name="weddingTime"
                    value={formData.weddingTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-building mr-2"></i>
                    Wedding Venue
                  </label>
                  <input
                    type="text"
                    name="weddingVenue"
                    value={formData.weddingVenue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="Wedding venue name"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-location-dot mr-2"></i>
                    Wedding Address
                  </label>
                  <textarea
                    name="weddingAddress"
                    value={formData.weddingAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900 resize-none"
                    placeholder="Wedding venue address..."
                  />
                </div>
              </div>
            </div>

            {/* Reception Details */}
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-glass-cheers text-amber-600 mr-3"></i>
                <h3 className="text-xl font-semibold text-amber-800">Reception Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-calendar mr-2"></i>
                    Reception Date
                  </label>
                  <input
                    type="date"
                    name="receptionDate"
                    value={formData.receptionDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-clock mr-2"></i>
                    Reception Time
                  </label>
                  <input
                    type="time"
                    name="receptionTime"
                    value={formData.receptionTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-building mr-2"></i>
                    Reception Venue
                  </label>
                  <input
                    type="text"
                    name="receptionVenue"
                    value={formData.receptionVenue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900"
                    placeholder="Reception venue name"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-amber-800 mb-3">
                    <i className="fas fa-location-dot mr-2"></i>
                    Reception Address
                  </label>
                  <textarea
                    name="receptionAddress"
                    value={formData.receptionAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/70 text-amber-900 resize-none"
                    placeholder="Reception venue address..."
                  />
                </div>
              </div>
            </div>

            {/* Venue Information */}
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-map-marker-alt text-amber-600 mr-3"></i>
                <h3 className="text-xl font-semibold text-amber-800">Venue Information</h3>
              </div>

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
                  placeholder="Wedding Venue Name"
                />
              </div>

              <div>
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

export default InvitedManagement;
