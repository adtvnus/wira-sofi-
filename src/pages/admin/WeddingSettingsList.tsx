import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWedding } from '../../contexts/WeddingContext';
import AdminLayout from '../../layouts/AdminLayout';
import apiService from '../../services/apiService';

interface WeddingSettingRow {
  id: number;
  groom_full_name: string;
  groom_first_name: string;
  bride_full_name: string;
  bride_first_name: string;
  wedding_date: string;
  wedding_time: string;
  wedding_venue: string;
  wedding_address: string;
  is_active: boolean;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

const WeddingSettingsList = () => {
  const { token } = useAuth();
  const { reloadActiveSettings } = useWedding();
  const [settings, setSettings] = useState<WeddingSettingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadWeddingSettings();
  }, []);

  const loadWeddingSettings = async () => {
    try {
      setIsLoading(true);
      const result = await apiService.getAllWeddingSettings();
      
      if (result.success) {
        setSettings(result.data.data || []);
      } else {
        setMessage('❌ Gagal memuat data wedding settings');
      }
    } catch (error) {
      console.error('Error loading wedding settings:', error);
      setMessage('❌ Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const result = await apiService.activateWeddingSetting(id);

      if (result.success) {
        setMessage('✅ Wedding setting berhasil diaktifkan!');
        setTimeout(() => setMessage(''), 3000);
        await loadWeddingSettings(); // Reload data

        // Reload active settings in WeddingContext to update frontend
        try {
          await reloadActiveSettings();
          console.log('✅ Frontend data updated with new active settings');
        } catch (contextError) {
          console.warn('Failed to reload context data:', contextError);
        }
      } else {
        setMessage(`❌ Gagal mengaktifkan setting: ${result.error}`);
      }
    } catch (error) {
      console.error('Error activating setting:', error);
      setMessage('❌ Terjadi kesalahan saat mengaktifkan setting');
    }
  };

  const handleDelete = async (id: number, settingName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus wedding setting "${settingName}"?`)) {
      return;
    }

    try {
      const result = await apiService.deleteWeddingSetting(id);
      
      if (result.success) {
        setMessage('✅ Wedding setting berhasil dihapus!');
        setTimeout(() => setMessage(''), 3000);
        await loadWeddingSettings(); // Reload data
      } else {
        setMessage(`❌ Gagal menghapus setting: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting setting:', error);
      setMessage('❌ Terjadi kesalahan saat menghapus setting');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data wedding settings...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Wedding Settings Management</h1>
              <p className="text-gray-600 mt-2">Kelola dan pilih wedding setting yang aktif</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                🗄️ MySQL Database
              </span>
              <a
                href="/admin/wedding-settings"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Tambah Setting Baru
              </a>
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

          {settings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                <i className="fas fa-heart-broken"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Wedding Settings</h3>
              <p className="text-gray-500 mb-6">Silakan buat wedding setting pertama Anda</p>
              <a
                href="/admin/wedding-settings"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Buat Wedding Setting
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengantin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal & Tempat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {settings.map((setting) => (
                    <tr key={setting.id} className={setting.is_active ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {setting.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <i className="fas fa-check-circle mr-1"></i>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <i className="fas fa-circle mr-1"></i>
                            Tidak Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {setting.groom_first_name} & {setting.bride_first_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {setting.groom_full_name} & {setting.bride_full_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(setting.wedding_date)} - {setting.wedding_time}
                          </div>
                          <div className="text-sm text-gray-500">
                            {setting.wedding_venue}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">
                            {setting.created_by_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(setting.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!setting.is_active && (
                            <button
                              onClick={() => handleActivate(setting.id)}
                              className="text-green-600 hover:text-green-900 px-3 py-1 rounded border border-green-300 hover:bg-green-50"
                              title="Aktifkan setting ini"
                            >
                              <i className="fas fa-check mr-1"></i>
                              Aktifkan
                            </button>
                          )}
                          <a
                            href={`/admin/wedding-settings?edit=${setting.id}`}
                            className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50"
                            title="Edit setting"
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </a>
                          {!setting.is_active && (
                            <button
                              onClick={() => handleDelete(setting.id, `${setting.groom_first_name} & ${setting.bride_first_name}`)}
                              className="text-red-600 hover:text-red-900 px-3 py-1 rounded border border-red-300 hover:bg-red-50"
                              title="Hapus setting"
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default WeddingSettingsList;
