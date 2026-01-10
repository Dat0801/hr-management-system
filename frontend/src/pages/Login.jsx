import { useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600 opacity-95" />
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 text-white">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
              <Building2 size={32} strokeWidth={2} />
            </div>
            <h1 className="text-5xl xl:text-6xl font-bold mb-4 leading-tight">
              HR Management
              <br />
              <span className="text-primary-100">System</span>
            </h1>
            <p className="text-xl text-primary-50 max-w-md leading-relaxed">
              Streamline your workforce management with our comprehensive HR solution.
            </p>
          </div>
          
          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Employee Management</h3>
                <p className="text-primary-100 text-sm">Centralized database for all employee information</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Attendance Tracking</h3>
                <p className="text-primary-100 text-sm">Real-time monitoring and automated reporting</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Leave Management</h3>
                <p className="text-primary-100 text-sm">Simplified leave requests and approval workflows</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-10 lg:p-12">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                <Building2 size={24} strokeWidth={2} />
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-600 text-center">
                  <span className="font-semibold text-gray-700">Demo Credentials:</span>
                  <br />
                  admin@example.com / password
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <p className="text-center text-sm text-white/80 mt-6">
            © 2026 HR Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
