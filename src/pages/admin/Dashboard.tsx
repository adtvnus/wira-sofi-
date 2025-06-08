// Admin Dashboard Page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from "../../layouts/AdminLayout";
import { useWedding } from "../../contexts/WeddingContext";
import apiService from '../../services/apiService';

const Dashboard = () => {
  const { weddingData } = useWedding();
  const [guestCount, setGuestCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load guest count from API
      const guestsResult = await apiService.getGuests();
      if (guestsResult.success && guestsResult.data.data) {
        setGuestCount(guestsResult.data.data.length);
      } else {
        // Fallback to localStorage
        const savedGuests = localStorage.getItem('wedding-guests');
        if (savedGuests) {
          try {
            const guests = JSON.parse(savedGuests);
            setGuestCount(guests.length);
          } catch (error) {
            console.error('Error loading guests:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Calculate RSVP stats
  const rsvpStats = {
    total: weddingData.rsvpSettings.responses.length,
    attending: weddingData.rsvpSettings.responses.filter(r => r.attendance === 'yes').length,
    pending: weddingData.rsvpSettings.responses.filter(r => r.status === 'pending').length
  };

  const stats = [
    {
      title: 'Pengantin Pria',
      value: weddingData.couple.groomFirstName + ' ' + weddingData.couple.groomLastName,
      icon: '🤵',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Pengantin Wanita',
      value: weddingData.couple.brideFirstName + ' ' + weddingData.couple.brideLastName,
      icon: '👰',
      color: 'bg-pink-100 text-pink-800'
    },
    {
      title: 'Total Tamu',
      value: guestCount.toString(),
      icon: '👥',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Acara',
      value: weddingData.events.length.toString(),
      icon: '📅',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'RSVP Response',
      value: rsvpStats.total.toString(),
      icon: '📝',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      title: 'Akan Hadir',
      value: rsvpStats.attending.toString(),
      icon: '✅',
      color: 'bg-green-100 text-green-800'
    }
  ];

  const quickActions = [
    {
      title: 'Edit Pengaturan Wedding',
      description: 'Ubah nama pengantin, pesan, dan informasi lainnya',
      href: '/admin/wedding-settings',
      icon: '💒',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Kelola Tamu',
      description: 'Tambah, edit, atau hapus daftar tamu undangan',
      href: '/admin/guest-management',
      icon: '👥',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Kelola Quotes',
      description: 'Edit quotes, foto, dan pesan di halaman quotes',
      href: '/admin/quotes-management',
      icon: '💬',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Kelola Bride & Groom',
      description: 'Edit konten halaman bride dan groom',
      href: '/admin/bride-groom-management',
      icon: '💑',
      color: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      title: 'Kelola Story Timeline',
      description: 'Edit timeline perjalanan cinta dan story',
      href: '/admin/story-management',
      icon: '📖',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      title: 'Kelola Gallery',
      description: 'Edit foto-foto dan konten gallery',
      href: '/admin/gallery-management',
      icon: '🖼️',
      color: 'bg-teal-600 hover:bg-teal-700'
    },
    {
      title: 'Kelola RSVP',
      description: 'Kelola pengaturan RSVP dan response tamu',
      href: '/admin/rsvp-management',
      icon: '📝',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      title: 'Kelola Thanks Page',
      description: 'Kelola halaman terima kasih untuk tamu',
      href: '/admin/thanks-management',
      icon: '🙏',
      color: 'bg-emerald-600 hover:bg-emerald-700'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Kelola undangan pernikahan Anda</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`block p-6 rounded-lg text-white transition-colors duration-200 ${action.color}`}
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-4">{action.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{action.title}</h3>
                    <p className="text-sm opacity-90 mt-1">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-server mr-2 text-blue-500"></i>
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <i className="fas fa-database text-2xl text-green-500 mb-2"></i>
              <div className="text-sm font-medium text-green-800">Database</div>
              <div className="text-xs text-green-600">Connected</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <i className="fas fa-server text-2xl text-blue-500 mb-2"></i>
              <div className="text-sm font-medium text-blue-800">API Server</div>
              <div className="text-xs text-blue-600">Running</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <i className="fas fa-shield-alt text-2xl text-purple-500 mb-2"></i>
              <div className="text-sm font-medium text-purple-800">Security</div>
              <div className="text-xs text-purple-600">Protected</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Undangan</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Link Undangan Utama</p>
                <p className="text-sm text-gray-600">Untuk tamu umum tanpa nama khusus</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={window.location.origin}
                  readOnly
                  className="px-3 py-1 text-sm bg-gray-50 border border-gray-200 rounded"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.origin)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Salin
                </button>
              </div>
            </div>
            <div className="py-3">
              <p className="font-medium text-gray-900">Status Undangan</p>
              <p className="text-sm text-gray-600 mt-1">
                Undangan siap untuk dibagikan. Anda dapat mengelola tamu dan pengaturan melalui menu di atas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
