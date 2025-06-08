import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import StorageWarning from '../components/StorageWarning';
import { useAuth } from '../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'fas fa-chart-pie' },
    { name: 'Settings List', href: '/admin/wedding-settings-list', icon: 'fas fa-list-alt' },
    { name: 'Guest Management', href: '/admin/guest-management', icon: 'fas fa-users' },
    { name: 'Invited Page', href: '/admin/invited-management', icon: 'fas fa-envelope-open-text' },
    { name: 'RSVP Management', href: '/admin/rsvp-management', icon: 'fas fa-clipboard-check' },
    { name: 'Thanks Page', href: '/admin/thanks-management', icon: 'fas fa-hands-praying' },
    { name: 'Quotes Management', href: '/admin/quotes-management', icon: 'fas fa-quote-left' },
    { name: 'Bride & Groom', href: '/admin/bride-groom-management', icon: 'fas fa-ring' },
    { name: 'Story Timeline', href: '/admin/story-management', icon: 'fas fa-timeline' },
    { name: 'Gallery', href: '/admin/gallery-management', icon: 'fas fa-images' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" style={{ fontFamily: 'Ovo, serif' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 shadow-lg border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <i className="fas fa-heart text-amber-600 text-2xl mr-3"></i>
              <h1 className="text-xl font-semibold text-amber-800">
                Wedding Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-amber-700 hover:text-amber-900 px-4 py-2 rounded-lg text-sm font-medium bg-white/50 hover:bg-white/70 transition-all duration-200 flex items-center"
              >
                <i className="fas fa-external-link-alt mr-2"></i>
                View Invitation
              </Link>
              <div className="h-6 w-px bg-amber-300"></div>

              {/* User Info */}
              <div className="flex items-center text-amber-700">
                <i className="fas fa-user-shield mr-2"></i>
                <span className="text-sm font-medium">
                  {user?.fullName || user?.username || 'Admin'}
                </span>
                <span className="text-xs text-amber-600 ml-2 px-2 py-1 bg-amber-100 rounded-full">
                  {user?.role || 'admin'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                    window.location.href = '/admin/login';
                  }
                }}
                className="text-red-600 hover:text-red-800 px-3 py-2 rounded-lg text-sm font-medium bg-white/50 hover:bg-red-50 transition-all duration-200 flex items-center"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-gradient-to-b from-white via-amber-50 to-orange-50 shadow-lg min-h-screen border-r border-amber-200">
          <div className="p-4">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                <i className="fas fa-heart text-white text-xl"></i>
              </div>
              <h3 className="text-amber-800 font-semibold text-sm">Wedding Management</h3>
            </div>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-amber-200 to-orange-200 text-amber-800 shadow-md border-l-4 border-amber-500'
                        : 'text-amber-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 hover:text-amber-800 hover:shadow-sm'
                    }`}
                  >
                    <i className={`${item.icon} mr-3 text-base w-5`}></i>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <ErrorBoundary>
            <StorageWarning />
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
