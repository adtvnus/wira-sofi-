import React, { useState, useEffect } from 'react';
import { useWedding } from '../../contexts/WeddingContext';
import { TimelineItem } from '../../types/wedding';
import AdminLayout from '../../layouts/AdminLayout';

const StoryManagement = () => {
  const { weddingData, updateStorySettings } = useWedding();
  const [formData, setFormData] = useState(weddingData.storySettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Load story settings from database when component mounts
  useEffect(() => {
    loadStorySettings();
  }, []);

  const loadStorySettings = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('auth-token');

      const response = await fetch(`${API_BASE_URL}/story-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFormData(data.data);
          console.log('✅ Story settings loaded from database:', data.data);
        }
      } else {
        console.log('⚠️ Using default story settings from context');
      }
    } catch (error) {
      console.error('Error loading story settings:', error);
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

  const handleTimelineChange = (index: number, field: keyof TimelineItem, value: string | boolean) => {
    const updatedTimeline = [...formData.timelineItems];
    updatedTimeline[index] = {
      ...updatedTimeline[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      timelineItems: updatedTimeline
    }));
  };

  const addNewTimelineItem = () => {
    const newItem: TimelineItem = {
      id: Date.now().toString(),
      year: '',
      title: '',
      date: '',
      description: '',
      icon: '💕',
      color: 'from-rose-200 to-pink-200',
      bgColor: 'from-rose-100/20 to-pink-100/20',
      isActive: true
    };
    setFormData(prev => ({
      ...prev,
      timelineItems: [...prev.timelineItems, newItem]
    }));
  };

  const deleteTimelineItem = (index: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus timeline item ini?')) {
      const updatedTimeline = formData.timelineItems.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        timelineItems: updatedTimeline
      }));
    }
  };

  const moveTimelineItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.timelineItems.length) return;

    const updatedTimeline = [...formData.timelineItems];
    [updatedTimeline[index], updatedTimeline[newIndex]] = [updatedTimeline[newIndex], updatedTimeline[index]];
    
    setFormData(prev => ({
      ...prev,
      timelineItems: updatedTimeline
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('auth-token');

      console.log('💾 Saving story settings to database:', formData);

      // Map frontend data to backend expected format
      const dataToSend = {
        title: formData.headerTitle,
        subtitle: formData.headerSubtitle,
        timelineItems: formData.timelineItems
      };

      console.log('📤 Data being sent to API:', dataToSend);

      const response = await fetch(`${API_BASE_URL}/story-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update context as well for immediate UI update
          updateStorySettings(formData);

          setMessage('✅ Story settings berhasil disimpan ke database!');
          console.log('✅ Story settings saved successfully to database');
          setTimeout(() => setMessage(''), 5000);
        } else {
          throw new Error(data.message || 'Failed to save story settings');
        }
      } else {
        throw new Error('Failed to save story settings to database');
      }
    } catch (error) {
      setMessage('❌ Terjadi kesalahan saat menyimpan story settings ke database.');
      console.error('Error saving story settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = [
    { label: 'Amber to Orange', value: 'from-amber-200 to-orange-200', bg: 'from-amber-100/20 to-orange-100/20' },
    { label: 'Rose to Pink', value: 'from-rose-200 to-pink-200', bg: 'from-rose-100/20 to-pink-100/20' },
    { label: 'Purple to Violet', value: 'from-purple-200 to-violet-200', bg: 'from-purple-100/20 to-violet-100/20' },
    { label: 'Emerald to Teal', value: 'from-emerald-200 to-teal-200', bg: 'from-emerald-100/20 to-teal-100/20' },
    { label: 'Blue to Cyan', value: 'from-blue-200 to-cyan-200', bg: 'from-blue-100/20 to-cyan-100/20' },
    { label: 'Indigo to Purple', value: 'from-indigo-200 to-purple-200', bg: 'from-indigo-100/20 to-purple-100/20' }
  ];

  const iconOptions = ['👫', '💕', '💍', '👰🤵', '❤️', '💖', '🌹', '💐', '🎉', '✨', '🌟', '💫'];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading story settings...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Manajemen Story Timeline</h1>

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
            {/* Header Settings */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">Pengaturan Header</h2>
              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Header
                  </label>
                  <input
                    type="text"
                    name="headerTitle"
                    value={formData.headerTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Our Story"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle Header
                  </label>
                  <textarea
                    name="headerSubtitle"
                    value={formData.headerSubtitle}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Perjalanan cinta kami dimulai dari pertemuan sederhana hingga janji suci yang akan kami ikrarkan"
                  />
                </div>
              </div>
            </div>

            {/* Timeline Management */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Timeline Items</h2>
                {/* <button
                  type="button"
                  onClick={addNewTimelineItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  + Tambah Timeline Item
                </button> */}
              </div>

              <div className="space-y-6">
                {formData.timelineItems.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Timeline Item #{index + 1}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => moveTimelineItem(index, 'up')}
                          disabled={index === 0}
                          className="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTimelineItem(index, 'down')}
                          disabled={index === formData.timelineItems.length - 1}
                          className="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={(e) => handleTimelineChange(index, 'isActive', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Aktif</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => deleteTimelineItem(index)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Judul
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleTimelineChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="First Meet"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tahun
                        </label>
                        <input
                          type="text"
                          value={item.year}
                          onChange={(e) => handleTimelineChange(index, 'year', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="2024"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal
                        </label>
                        <input
                          type="text"
                          value={item.date}
                          onChange={(e) => handleTimelineChange(index, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Januari 2024"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Icon
                        </label>
                        <select
                          value={item.icon}
                          onChange={(e) => handleTimelineChange(index, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {iconOptions.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Warna Theme
                        </label>
                        <select
                          value={item.color}
                          onChange={(e) => {
                            const selectedColor = colorOptions.find(c => c.value === e.target.value);
                            handleTimelineChange(index, 'color', e.target.value);
                            if (selectedColor) {
                              handleTimelineChange(index, 'bgColor', selectedColor.bg);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {colorOptions.map(color => (
                            <option key={color.value} value={color.value}>{color.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deskripsi
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleTimelineChange(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ceritakan momen spesial ini..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.timelineItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">Belum ada timeline items</p>
                  <p className="text-sm mt-2">Klik tombol "Tambah Timeline Item" untuk menambahkan item pertama</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-md font-medium text-white ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                } transition-colors duration-200`}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Preview</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-light mb-4" style={{ color: "#644F44" }}>
                {formData.headerTitle}
              </h3>
              <p className="text-lg opacity-70 italic" style={{ color: "#644F44" }}>
                {formData.headerSubtitle}
              </p>
            </div>
            
            <div className="space-y-6">
              {formData.timelineItems.filter(item => item.isActive).slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center`}>
                      <span className="text-lg">{item.icon}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold" style={{ color: "#644F44" }}>{item.title}</h4>
                      <span className="text-sm bg-gray-200 px-2 py-1 rounded" style={{ color: "#644F44" }}>{item.year}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{item.date}</p>
                    <p className="text-sm" style={{ color: "#644F44" }}>{item.description}</p>
                  </div>
                </div>
              ))}
              {formData.timelineItems.filter(item => item.isActive).length > 3 && (
                <p className="text-center text-sm text-gray-500">
                  ... dan {formData.timelineItems.filter(item => item.isActive).length - 3} item lainnya
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StoryManagement;
