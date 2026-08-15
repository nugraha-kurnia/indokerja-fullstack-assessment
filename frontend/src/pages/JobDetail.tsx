import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MapPin, CheckCircle2 } from 'lucide-react';

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Mengambil ID Pekerjaan dari URL
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const token = localStorage.getItem('token');

  // Tarik Data Lowongan Asli dari Backend
  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/jobs', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const allJobs = await res.json();
          // Cari lowongan yang ID-nya cocok dengan URL
          const foundJob = allJobs.find((j: any) => j.id === id);
          setJob(foundJob);
        }
      } catch (error) {
        console.error("Gagal memuat lowongan", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetail();
  }, [id, token]);

  // Fungsi Tombol Apply yang Real
  const handleApply = async () => {
    if (!token) {
      alert('Silakan login sebagai Job Seeker untuk melamar.');
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      const res = await fetch('http://localhost:5000/api/applications/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ jobId: id })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Lamaran berhasil dikirim! Silakan pantau di tab My Applications.');
        navigate('/my-applications');
      } else {
        alert(data.message || 'Gagal mengirim lamaran.');
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi saat melamar.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center font-bold text-blue-700">Memuat data lowongan...</div>;
  if (!job) return <div className="min-h-screen bg-slate-50 flex justify-center items-center font-bold text-red-500">Lowongan tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        
        {/* Kolom Kiri: Detail Pekerjaan (REAL DATA) */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-bold text-xl border border-blue-100 uppercase shadow-sm">
                {job.company?.name ? job.company.name.substring(0, 2) : 'ID'}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{job.title}</h1>
                <div className="flex items-center text-sm text-slate-600 mt-1 space-x-3">
                  <span className="font-bold text-blue-700">{job.company?.name || 'Perusahaan'}</span>
                  <span className="flex items-center"><MapPin size={14} className="mr-1"/> {job.location}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-2">{job.jobType}</span>
              <p className="text-sm font-bold text-slate-900">{job.salary}</p>
              <p className="text-xs text-slate-500 mt-1">Status: Active</p>
            </div>
          </div>

          {/* Tombol Aksi (Save Job Dihapus) */}
          <div className="flex space-x-3">
            <button 
              onClick={handleApply} 
              disabled={applying}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-[0_4px_14px_rgba(29,78,216,0.39)] transition active:scale-95 disabled:opacity-50"
            >
              {applying ? 'Mengirim...' : 'Apply Now →'}
            </button>
          </div>

          {/* ... (kode About the Role biarkan saja) ... */}

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">About the Role</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Key Responsibilities & Requirements</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start"><CheckCircle2 size={16} className="text-blue-600 mr-2 mt-0.5 shrink-0"/> Detail lengkap dapat dilihat pada deskripsi di atas.</li>
                <li className="flex items-start"><CheckCircle2 size={16} className="text-blue-600 mr-2 mt-0.5 shrink-0"/> Pastikan profil Anda sudah terisi lengkap sebelum melamar.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Info Perusahaan & MAPS */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">About the Company</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center font-bold uppercase shadow-sm">
                 {job.company?.name ? job.company.name.substring(0, 2) : 'ID'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{job.company?.name || 'Perusahaan'}</h4>
                {/* Tautan yang langsung mengarah ke website perusahaan (atau pencarian Google jika belum diatur) */}
                <a 
                  href={job.company?.website ? (job.company.website.startsWith('http') ? job.company.website : `https://${job.company.website}`) : `https://www.google.com/search?q=${job.company?.name}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  View Company Website ↗
                </a>
              </div>
            </div>
            
            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between"><span className="text-slate-500">Industry:</span><span className="font-bold text-slate-900">Information Technology</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Location:</span><span className="font-bold text-slate-900">{job.location}</span></div>
            </div>
            
            {/* GOOGLE MAPS IFRAME */}
            <div className="w-full h-40 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126920.24056263591!2d106.75936856525167!3d-6.22974648780373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x100c5e82dd4b820!2sJakarta!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
};