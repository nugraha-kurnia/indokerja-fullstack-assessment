import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { MapPin, UploadCloud, Trash2 } from 'lucide-react';

export const JobSeekerProfile: React.FC = () => {
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', headline: '', cvUrl: '', avatarUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || '', email: data.email || '', phone: data.phone || '',
            headline: data.headline || '', cvUrl: data.cvUrl || '', avatarUrl: data.avatarUrl || ''
          });
        }
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, avatarUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  // Upload CV asli ke format Data URL (Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file CV maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, cvUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { email, ...dataYangDikirim } = profile;
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(dataYangDikirim)
      });
      
      if (res.ok) alert("Profil berhasil disimpan permanen!");
      else {
        const err = await res.json();
        alert(`Gagal: ${err.message}`);
      }
    } catch (err) { alert("Terjadi kesalahan jaringan."); }
    setLoading(false);
  };

  // LOGIKA PERSENTASE REAL-TIME
  const calculateProgress = () => {
    let score = 0;
    if (profile.name) score += 20;
    if (profile.phone) score += 20;
    if (profile.headline) score += 20;
    if (profile.avatarUrl) score += 20;
    if (profile.cvUrl) score += 20;
    return score;
  };
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Complete Your Profile</h1>
        <p className="text-sm text-slate-600 mb-8">A strong profile increases your chances of standing out.</p>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div className="relative inline-block mx-auto mb-4 group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-blue-700 text-white flex items-center justify-center text-3xl font-bold shadow-lg overflow-hidden border-4 border-white ring-2 ring-slate-100">
                  {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                </div>
                <label className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <UploadCloud size={20} />
                  <span className="text-[10px] mt-1 font-bold">Ubah Foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">{profile.name || 'Nama Anda'}</h2>
              <p className="text-sm text-slate-700 mb-2">{profile.headline || 'Headline Profesional'}</p>
              <p className="text-xs text-slate-500 flex items-center justify-center mb-6"><MapPin size={12} className="mr-1" /> Indonesia</p>
              
              <div className="text-left">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-800">Profile Completion</span>
                  <span className="text-blue-600">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 transition-all">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div><label className="block text-xs font-bold text-slate-800 mb-1.5">Full Name</label><input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600" /></div>
                <div><label className="block text-xs font-bold text-slate-800 mb-1.5">Email Address</label><input type="email" value={profile.email} className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed" readOnly /></div>
                <div><label className="block text-xs font-bold text-slate-800 mb-1.5">Phone Number</label><input type="text" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600" /></div>
                <div><label className="block text-xs font-bold text-slate-800 mb-1.5">Professional Headline</label><input type="text" name="headline" value={profile.headline} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600" /></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Resume / CV</h3>
              {profile.cvUrl ? (
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center mr-3 font-bold text-xs">PDF</div>
                    <div><p className="text-sm font-bold text-slate-900">{profile.cvUrl}</p><p className="text-xs text-slate-500">Tersimpan</p></div>
                  </div>
                  <button onClick={() => setProfile({...profile, cvUrl: ''})} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer">
                  <UploadCloud size={32} className="mx-auto text-blue-500 mb-3" />
                  <p className="text-sm font-bold text-slate-900 mb-1">Upload CV</p>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                </label>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={handleSave} disabled={loading} className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl transition">
                {loading ? 'Menyimpan...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};