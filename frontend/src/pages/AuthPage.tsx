import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Building2, User, Eye, EyeOff } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'JOB_SEEKER' | 'COMPANY'>('JOB_SEEKER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // PERUBAHAN DISINI: Tambahkan "role" di dalam kurung kurawal
        const { data } = await api.post('/auth/login', { email, password, role }); 
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'COMPANY') {
          navigate('/company/dashboard');
        } else {
          navigate('/jobs');
        }
      } else {
        await api.post('/auth/register', { name, email, password, role });
        setIsLogin(true);
        setError('Registrasi berhasil! Silakan login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl flex w-full max-w-4xl overflow-hidden border border-gray-100 min-h-[560px]">
        {/* Banner Samping */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-blue-700 text-white p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600 via-blue-700 to-indigo-900">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-white">IndoKerja<span className="text-yellow-400">.id</span></span>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold mb-3 leading-snug">Empowering Your Career Journey</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Bergabunglah dengan ribuan profesional dan temukan lowongan pekerjaan impianmu di seluruh Indonesia.
            </p>
          </div>
          <div className="text-xs text-blue-200">
            © 2026 IndoKerja.id. Gerbang Karier Indonesia.
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">{isLogin ? 'Welcome back' : 'Join IndoKerja today'}</h3>
            <p className="text-sm text-gray-500 mt-1">{isLogin ? 'Log in to access your account' : 'Choose your account type to get started'}</p>
          </div>

          {/* Toggle Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('JOB_SEEKER')}
              className={`flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold border transition ${
                role === 'JOB_SEEKER'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User size={16} className="mr-2" /> Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole('COMPANY')}
              className={`flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold border transition ${
                role === 'COMPANY'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building2 size={16} className="mr-2" /> Company
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name / Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition text-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-bold text-blue-700 hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};