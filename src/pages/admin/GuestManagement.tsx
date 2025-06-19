import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useGuestName } from '../../hooks/useGuestName';
import { useAuth } from '../../contexts/AuthContext';
import GuestUrlGenerator from '../../components/admin/GuestUrlGenerator';
import GuestTable from '../../components/admin/GuestTable';

interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  guestCount: number;
  rsvpStatus: 'pending' | 'attending' | 'not_attending';
  invitationCode: string;
  invitationLinks: {
    intro: string;
    main: string;
    rsvp: string;
    thanks: string;
  };
  createdAt: string;
  updatedAt?: string;
}

const GuestManagement = () => {
  const { generateGuestUrl, encodeGuestName } = useGuestName();
  const { token, isAuthenticated, user } = useAuth();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestCount, setNewGuestCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Debug auth state (can be removed in production)
  if (import.meta.env.DEV) {
    console.log('🔐 Auth state:', {
      isAuthenticated,
      hasToken: !!token,
      user: user?.username
    });
  }

  const generateInvitationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Load guests from API when component mounts and token is available
  useEffect(() => {
    if (token && isAuthenticated) {
      loadGuests();
    }
  }, [token, isAuthenticated]);

  const loadGuests = async () => {
    if (!token) {
      setMessage('Token autentikasi tidak tersedia. Silakan login ulang.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/guests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          const formattedGuests = data.data.map(formatGuestFromAPI);
          setGuests(formattedGuests);

          // Clear any previous error messages
          if (message && message.includes('Gagal')) {
            setMessage('');
          }
        } else {
          throw new Error(data.error || 'Failed to load guests');
        }
      } else {
        if (response.status === 401) {
          setMessage('Sesi login telah berakhir. Silakan login ulang.');
        } else {
          throw new Error(`HTTP ${response.status}: Failed to fetch guests`);
        }
      }
    } catch (error) {
      console.error('Error loading guests:', error);
      setMessage('Gagal memuat data tamu dari database. Periksa koneksi internet Anda.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const formatGuestFromAPI = (apiGuest: any): Guest => {
    return {
      id: apiGuest.id.toString(),
      name: apiGuest.guest_name,
      email: apiGuest.guest_email,
      phone: apiGuest.guest_phone,
      guestCount: apiGuest.guest_count || 1,
      rsvpStatus: apiGuest.rsvp_status || 'pending',
      invitationCode: apiGuest.invitation_code || generateInvitationCode(),
      invitationLinks: generateInvitationLinks(apiGuest.guest_name),
      createdAt: apiGuest.created_at,
      updatedAt: apiGuest.updated_at
    };
  };

  const generateInvitationLinks = (guestName: string) => {
    const baseUrl = window.location.origin;
    return {
      intro: `${baseUrl}${generateGuestUrl(guestName, '/intro')}`,
      main: `${baseUrl}${generateGuestUrl(guestName, '/main')}`,
      rsvp: `${baseUrl}${generateGuestUrl(guestName, '/rsvp')}`,
      thanks: `${baseUrl}${generateGuestUrl(guestName, '/thanks')}`
    };
  };

  const addGuest = async () => {
    if (!newGuestName.trim()) {
      setMessage('Nama tamu tidak boleh kosong');
      return;
    }

    if (!token) {
      setMessage('Token autentikasi tidak tersedia. Silakan login ulang.');
      return;
    }

    // Log for debugging (can be removed in production)
    if (import.meta.env.DEV) {
      console.log('Adding new guest:', newGuestName.trim());
    }

    setIsAdding(true);

    try {
      const response = await fetch(`${API_BASE_URL}/guests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: newGuestName.trim(),
          guestEmail: newGuestEmail.trim() || null,
          guestPhone: newGuestPhone.trim() || null,
          guestCount: newGuestCount
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          await loadGuests(); // Reload from API
          setMessage('Tamu berhasil ditambahkan ke database!');

          // Reset form
          setNewGuestName('');
          setNewGuestEmail('');
          setNewGuestPhone('');
          setNewGuestCount(1);
        } else {
          throw new Error(data.error || 'Failed to add guest');
        }
      } else {
        if (response.status === 401) {
          throw new Error('Sesi login telah berakhir. Silakan login ulang.');
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding guest:', error);
      setMessage(`Gagal menambahkan tamu: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsAdding(false);
    }
  };

  const deleteGuest = async (guestId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tamu ini?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/guests/${guestId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            await loadGuests(); // Reload from API
            setMessage('Tamu berhasil dihapus dari database!');
          } else {
            throw new Error(data.error || 'Failed to delete guest');
          }
        } else {
          throw new Error('Failed to delete guest');
        }

        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting guest:', error);
        setMessage('Gagal menghapus tamu dari database');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const copyToClipboard = async (text: string, type: string = '') => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`Link ${type} berhasil disalin!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setMessage(`Link ${type} berhasil disalin!`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const bulkCopyLinks = (linkType: 'intro' | 'main' | 'rsvp' | 'thanks') => {
    const links = guests.map(guest => `${guest.name}: ${guest.invitationLinks[linkType]}`).join('\n');
    copyToClipboard(links, `semua ${linkType}`);
  };

  const exportGuestList = () => {
    const csvContent = [
      'Nama,Email,Telepon,Jumlah Tamu,Status RSVP,Kode Undangan,Link Intro,Link Utama,Link RSVP,Link Thanks',
      ...guests.map(guest =>
        `"${guest.name}","${guest.email || ''}","${guest.phone || ''}",${guest.guestCount},"${guest.rsvpStatus}","${guest.invitationCode}","${guest.invitationLinks.intro}","${guest.invitationLinks.main}","${guest.invitationLinks.rsvp}","${guest.invitationLinks.thanks}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `daftar-tamu-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage('Daftar tamu berhasil diexport!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Show authentication error if not authenticated
  if (!isAuthenticated || !token) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Authentication Required</h3>
                <p className="text-gray-600 mb-4">Anda perlu login untuk mengakses halaman ini.</p>
                <button
                  onClick={() => window.location.href = '/admin/login'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Login Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data tamu...</p>
                <p className="text-gray-500 text-sm mt-2">Token: {token ? '✅ Valid' : '❌ Missing'}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manajemen Tamu Undangan</h1>
              <p className="text-gray-600 mt-2">
                Kelola daftar tamu dan generate URL personal untuk setiap undangan
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                🗄️ MySQL Database
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                token ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                🔐 {token ? 'Authenticated' : 'Not Authenticated'}
              </span>
              <span className="text-sm text-gray-500">
                {guests.length} tamu
              </span>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('berhasil') || message.includes('disalin')
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              <div className="flex items-center">
                <i className={`fas ${
                  message.includes('berhasil') || message.includes('disalin')
                    ? 'fa-check-circle'
                    : 'fa-exclamation-triangle'
                } mr-2`}></i>
                {message}
              </div>
            </div>
          )}

          {/* Add New Guest */}
          <div className="border-b border-gray-200 pb-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <i className="fas fa-user-plus text-blue-500 mr-2"></i>
              Tambah Tamu Baru
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Tamu *
                </label>
                <input
                  type="text"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="Ahmad Budi Santoso"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && addGuest()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  placeholder="ahmad.budi@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon
                </label>
                <input
                  type="tel"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  placeholder="+62 812 3456 7890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Tamu
                </label>
                <select
                  value={newGuestCount}
                  onChange={(e) => setNewGuestCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 Orang</option>
                  <option value={2}>2 Orang</option>
                  <option value={3}>3 Orang</option>
                  <option value={4}>4 Orang</option>
                  <option value={5}>5+ Orang</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <i className="fas fa-info-circle mr-1"></i>
                URL akan dibuat otomatis: /main/{newGuestName ? encodeGuestName(newGuestName) : 'nama-tamu'}
              </div>
              <button
                onClick={addGuest}
                disabled={isAdding || !newGuestName.trim()}
                className={`px-6 py-2 rounded-md font-medium text-white flex items-center ${
                  isAdding || !newGuestName.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                } transition-colors duration-200`}
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menambah...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Tambah Tamu
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guest List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <i className="fas fa-list text-blue-500 mr-2"></i>
              Daftar Tamu & URL Personal ({guests.length})
            </h2>

            <GuestTable
              guests={guests}
              onDeleteGuest={deleteGuest}
              onCopyLink={copyToClipboard}
              onBulkCopy={bulkCopyLinks}
              onExport={exportGuestList}
            />
          </div>
        </div>

        {/* URL Generator Tool */}
        <GuestUrlGenerator className="mb-6" />

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <i className="fas fa-info-circle text-blue-500 mr-2"></i>
            Panduan Penggunaan URL Parameter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Cara Kerja:</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Setiap tamu mendapat URL personal dengan nama mereka</li>
                <li>• Format: /main/Nama-Tamu, /rsvp/Nama-Tamu</li>
                <li>• Nama otomatis tampil di undangan tanpa setup</li>
                <li>• Form RSVP pre-filled dengan nama tamu</li>
                <li>• Konsisten di semua halaman (main, rsvp, thanks)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Keuntungan:</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Personalisasi maksimal untuk setiap tamu</li>
                <li>• Mudah dibagikan via WhatsApp/Email</li>
                <li>• Tracking kunjungan per tamu</li>
                <li>• User experience yang seamless</li>
                <li>• Data tersimpan di MySQL database</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-800">
              <i className="fas fa-lightbulb mr-1"></i>
              <strong>Tips:</strong> Gunakan "Generator URL Personal" di atas untuk membuat URL untuk tamu tertentu,
              atau gunakan tabel di atas untuk copy link dari daftar tamu yang sudah ada.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GuestManagement;
