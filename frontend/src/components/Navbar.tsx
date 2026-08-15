import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Fungsi untuk mengecek halaman aktif
  const isActive = (path: string) => location.pathname === path ? 'text-blue-700 font-extrabold' : 'text-slate-600 hover:text-blue-600 font-medium';

  const handleLogout = () => {
    if (window.confirm('Anda yakin ingin keluar?')) {
      localStorage.clear();
      navigate('/login');
    }
  };
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo sekarang mengarah ke halaman yang aman */}
            <Link to={user.role === 'COMPANY' ? '/company/dashboard' : '/jobs'} className="flex-shrink-0 flex items-center cursor-pointer">
              <span className="text-2xl font-bold text-blue-700 tracking-tight">IndoKerja<span className="text-yellow-500">.id</span></span>
            </Link>
            
            {/* Desktop Menu */}
            {user.role === 'JOB_SEEKER' && (
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                <Link to="/jobs" className={`inline-flex items-center px-1 pt-1 text-sm ${isActive('/jobs')}`}>Job Board</Link>
                <Link to="/my-applications" className={`inline-flex items-center px-1 pt-1 text-sm ${isActive('/my-applications')}`}>My Applications</Link>
                <Link to="/profile" className={`inline-flex items-center px-1 pt-1 text-sm ${isActive('/profile')}`}>Profile</Link>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right mr-2">
              <p className="text-sm font-bold text-slate-900 leading-none">{user.name || 'User'}</p>
              <p className="text-xs text-slate-500 mt-1">{user.role === 'JOB_SEEKER' ? 'Job Seeker' : 'Perusahaan'}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center px-4 py-2 border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition">
              <LogOut size={16} className="mr-2" /> Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-slate-900 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg">
          {user.role === 'JOB_SEEKER' && (
            <>
              <Link to="/jobs" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/jobs')}`}>Job Board</Link>
              <Link to="/my-applications" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/my-applications')}`}>My Applications</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/profile')}`}>Profile</Link>
            </>
          )}
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base font-bold text-red-600 hover:bg-red-50 rounded-md">Sign Out</button>
        </div>
      )}
    </nav>
  );
};