import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();

  // Clear any existing session and redirect if already authenticated
  useEffect(() => {
    // Clear any existing demo tokens when accessing login page
    const currentToken = localStorage.getItem('auth-token');
    if (currentToken && currentToken.startsWith('demo-token-')) {
      // Allow user to see login page even with demo token
      // They can choose to login again or continue with current session
    }

    if (isAuthenticated) {
      window.location.href = '/admin';
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      // Always use API login for proper authentication
      console.log('🔐 Attempting API login for:', username.trim());

      const result = await login(username.trim(), password);

      if (result.success) {
        console.log('✅ Login successful, redirecting to admin dashboard');
        // Redirect to admin dashboard
        window.location.href = '/admin';
      } else {
        console.log('❌ Login failed:', result.error);
        setError(result.error || 'Invalid credentials. Please check username and password.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-10 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 px-8 py-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                <i className="fas fa-heart text-3xl text-white animate-pulse"></i>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Wedding Admin</h1>
              <p className="text-white/80 text-sm">✨ Manage your special day with love ✨</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 animate-shake">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-500 mr-3 text-lg"></i>
                    <span className="text-red-700 text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-user text-gray-400"></i>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="admin"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="admin"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400 hover:text-gray-600`}></i>
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim()}
                className={`w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl text-white font-bold text-lg transition-all duration-300 shadow-lg ${
                  isLoading || !username.trim() || !password.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-purple-300 transform hover:scale-105 hover:shadow-xl active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    <span className="animate-pulse">Signing in...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-3 text-xl"></i>
                    <span>🚀 LOGIN ADMIN</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-key text-purple-500 mr-2"></i>
                🎯 Quick Login Options
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin');
                  }}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
                  disabled={isLoading}
                >
                  <div className="text-xs font-medium text-purple-600">Super Admin</div>
                  <div className="text-xs text-gray-600">admin / admin</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUsername('demo');
                    setPassword('123');
                  }}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  disabled={isLoading}
                >
                  <div className="text-xs font-medium text-blue-600">Demo User</div>
                  <div className="text-xs text-gray-600">demo / 123</div>
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('wira');
                    setPassword('wira123');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-medium rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
                  disabled={isLoading}
                >
                  <i className="fas fa-heart mr-2"></i>
                  Login as Wira (Groom)
                </button>
              </div>

              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  💡 Click any button above to auto-fill credentials
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  🔧 Backend: http://localhost:3001 | Frontend: http://localhost:5174
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Wedding Invitation Management System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            🔐 Secure admin access with MySQL integration
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
