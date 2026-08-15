import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  FileText, 
  Calendar, 
  Search, 
  X,
  Clock,
  ExternalLink
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  jobType: string;
  createdAt: string;
  status?: string;
  _count?: { applications: number };
  applications?: any[];
}

export const CompanyPortal: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'applicants' | 'settings'>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  // State Search & Filter untuk Tab "My Jobs"
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'DRAFTS' | 'CLOSED'>('ALL');

  // State Search untuk Tab "Applicants"
  const [applicantSearch, setApplicantSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);

  // State Modal Create / Edit Job
  const [showModal, setShowModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    location: '',
    salary: '',
    jobType: 'Full-time',
    description: '',
  });

  // State Settings Perusahaan
  const [companySettings, setCompanySettings] = useState({
    name: user.name || '',
    website: '',
    industry: 'Technology',
  });

  // 1. Tarik Data Lowongan Milik Perusahaan (Lengkap dengan Pelamar)
  const fetchMyJobs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/jobs/company/my-jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Gagal mengambil data jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [token]);

  // Kumpulan semua pelamar dari semua lowongan
  const allApplicants = jobs.flatMap((job) =>
    (job.applications || []).map((app) => ({
      ...app,
      jobTitle: job.title,
      jobLocation: job.location,
      jobId: job.id,
    }))
  );

  const totalApplicantsCount = jobs.reduce(
    (total, job) => total + (job._count?.applications ?? job.applications?.length ?? 0),
    0
  );

  // Handler Submit (Create / Edit Lowongan)
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingJobId
        ? `http://localhost:5000/api/jobs/${editingJobId}`
        : 'http://localhost:5000/api/jobs';
      const method = editingJobId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobForm),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingJobId(null);
        setJobForm({ title: '', location: '', salary: '', jobType: 'Full-time', description: '' });
        fetchMyJobs();
        alert(editingJobId ? 'Lowongan berhasil diperbarui!' : 'Lowongan berhasil diterbitkan!');
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.message}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const handleEditClick = (job: Job) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title,
      location: job.location,
      salary: job.salary,
      jobType: job.jobType,
      description: job.description,
    });
    setShowModal(true);
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus lowongan "${title}"?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          alert('Lowongan berhasil dihapus!');
          fetchMyJobs();
        } else {
          const err = await res.json();
          alert(`Gagal menghapus: ${err.message}`);
        }
      } catch (err) {
        alert('Terjadi kesalahan koneksi.');
      }
    }
  };

  // Handler Update Status Pelamar (Reviewing, Shortlisted, Accepted, Rejected)
  const handleUpdateApplicantStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert(`Status berhasil diubah menjadi ${newStatus}!`);
        fetchMyJobs();
        if (selectedApplicant?.id === appId) {
          setSelectedApplicant((prev: any) => ({ ...prev, status: newStatus }));
        }
      } else {
        alert('Gagal memperbarui status pelamar.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Anda yakin ingin keluar?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  // Logika Filter & Search Lowongan
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStatus = job.status || 'ACTIVE';
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && currentStatus === 'ACTIVE') ||
      (filterStatus === 'DRAFTS' && currentStatus === 'DRAFT') ||
      (filterStatus === 'CLOSED' && currentStatus === 'CLOSED');

    return matchesSearch && matchesStatus;
  });

  // Logika Search Pelamar
  const filteredApplicants = allApplicants.filter((app) => {
    const name = app.user?.name || '';
    const email = app.user?.email || '';
    const headline = app.user?.headline || '';
    const jobTitle = app.jobTitle || '';
    const query = applicantSearch.toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      headline.toLowerCase().includes(query) ||
      jobTitle.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between fixed h-full z-20">
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-700 tracking-tight">
              IndoKerja<span className="text-yellow-500">.id</span>
            </span>
          </div>

          <div className="p-4 flex items-center space-x-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base uppercase border border-blue-100">
              {(companySettings.name || 'C').charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-extrabold text-slate-900 truncate">{companySettings.name || 'Perusahaan'}</p>
              <p className="text-xs text-slate-500 font-medium">Corporate Recruiter</p>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={18} className="mr-3" /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition ${
                activeTab === 'jobs'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Briefcase size={18} className="mr-3" /> My Jobs
            </button>

            <button
              onClick={() => setActiveTab('applicants')}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition ${
                activeTab === 'applicants'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users size={18} className="mr-3" /> Applicants
              {totalApplicantsCount > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full font-bold">
                  {totalApplicantsCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-1.5">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings size={18} className="mr-3" /> Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut size={18} className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="ml-64 flex-1 p-8">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Dashboard</h1>
                <p className="text-sm text-slate-500">Overview of your real recruitment pipeline.</p>
              </div>
              <button
                onClick={() => {
                  setEditingJobId(null);
                  setJobForm({ title: '', location: '', salary: '', jobType: 'Full-time', description: '' });
                  setShowModal(true);
                }}
                className="flex items-center px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md transition active:scale-95"
              >
                <Plus size={16} className="mr-2" /> Post New Job
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">Active Jobs</p>
                  <p className="text-3xl font-extrabold text-slate-900">{jobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Briefcase size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">Total Applicants</p>
                  <p className="text-3xl font-extrabold text-blue-700">{totalApplicantsCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <Users size={24} />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Job Postings</h3>
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                    <p className="text-xs text-slate-500">{job.location} • {job.jobType}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MY JOBS */}
        {activeTab === 'jobs' && (
          <div className="max-w-5xl animate-in fade-in">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-1">My Jobs</h1>
                <p className="text-sm text-slate-500">Manage your current job postings and drafts.</p>
              </div>
              <button
                onClick={() => {
                  setEditingJobId(null);
                  setJobForm({ title: '', location: '', salary: '', jobType: 'Full-time', description: '' });
                  setShowModal(true);
                }}
                className="flex items-center px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md transition active:scale-95"
              >
                <Plus size={16} className="mr-2" /> Post New Job
              </button>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search jobs by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-full transition ${
                    filterStatus === 'ALL'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Jobs
                </button>
                <button
                  onClick={() => setFilterStatus('ACTIVE')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-full transition ${
                    filterStatus === 'ACTIVE'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('DRAFTS')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-full transition ${
                    filterStatus === 'DRAFTS'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Drafts
                </button>
                <button
                  onClick={() => setFilterStatus('CLOSED')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-full transition ${
                    filterStatus === 'CLOSED'
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>

            {/* DAFTAR LOWONGAN */}
            <div className="space-y-4">
              {loading && <p className="text-sm text-slate-500">Memuat data lowongan...</p>}
              {!loading && filteredJobs.length === 0 && (
                <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
                  <Briefcase size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-base font-bold text-slate-800">Tidak ada lowongan ditemukan</p>
                  <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci pencarian lain.</p>
                </div>
              )}

              {filteredJobs.map((job) => {
                const count = job._count?.applications ?? job.applications?.length ?? 0;

                return (
                  <div
                    key={job.id}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center hover:border-blue-300 transition-colors gap-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 text-blue-600 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="text-lg font-bold text-slate-900">{job.title}</h4>
                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-green-100 text-green-700 border border-green-200">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{job.location} • {job.jobType}</p>
                        <div className="flex items-center text-xs font-bold text-slate-500 space-x-4">
                          <span className="flex items-center">
                            <Calendar size={12} className="mr-1" /> Posted recently
                          </span>
                          <span className="flex items-center text-blue-700 font-extrabold">
                            <Users size={12} className="mr-1" /> {count} Applicants
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 md:ml-auto">
                      <button
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 rounded-lg transition"
                        title="Hapus Lowongan"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(job)}
                        className="px-5 py-2 border border-slate-200 text-sm font-bold text-slate-700 rounded-lg hover:bg-slate-50 transition active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setApplicantSearch(job.title);
                          setActiveTab('applicants');
                        }}
                        className="px-5 py-2 bg-white border border-blue-600 text-sm font-bold text-blue-700 rounded-lg hover:bg-blue-50 transition active:scale-95 shadow-sm"
                      >
                        View Applicants
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: APPLICANTS MANAGEMENT */}
        {activeTab === 'applicants' && (
          <div className="max-w-6xl animate-in fade-in">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Applicant Management</h1>
              <p className="text-sm text-slate-500">Review and process candidates who applied to your jobs.</p>
            </div>

            {/* Search Pelamar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search candidates by name, email, or applied position..."
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
              />
              <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            </div>

            {filteredApplicants.length === 0 ? (
              <div className="text-center p-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <Users size={40} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">Belum ada pelamar yang masuk</h3>
                <p className="text-xs text-slate-500">
                  Pelamar yang melamar pada lowongan Anda akan langsung tampil di sini secara real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Daftar Pelamar */}
                <div className="lg:col-span-2 space-y-4">
                  {filteredApplicants.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApplicant(app)}
                      className={`p-5 rounded-2xl border bg-white shadow-sm cursor-pointer transition-all ${
                        selectedApplicant?.id === app.id
                          ? 'border-blue-600 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                            {app.user?.avatarUrl ? (
                              <img src={app.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              (app.user?.name || 'U').charAt(0)
                            )}
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-slate-900">{app.user?.name || 'Pelamar'}</h4>
                            <p className="text-xs text-slate-500">{app.user?.headline || 'Job Seeker'}</p>
                            <p className="text-xs font-bold text-blue-700 mt-1">Melamar: {app.jobTitle}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kolom Action Center & Detail Pelamar */}
                <div className="lg:col-span-1">
                  {selectedApplicant ? (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6 space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Action Center</h3>
                        <p className="text-xs text-slate-500">Kelola status dan berkas pelamar</p>
                      </div>

                      <div className="text-center pb-4 border-b border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-blue-700 text-white flex items-center justify-center text-xl font-bold mx-auto mb-2 overflow-hidden">
                          {selectedApplicant.user?.avatarUrl ? (
                            <img src={selectedApplicant.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            (selectedApplicant.user?.name || 'U').charAt(0)
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{selectedApplicant.user?.name}</h4>
                        <p className="text-xs text-slate-500">{selectedApplicant.user?.email}</p>
                        <p className="text-xs text-slate-600 mt-1">{selectedApplicant.user?.phone || 'No Phone'}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">Update Status Lamaran:</label>
                        <select
                          value={selectedApplicant.status}
                          onChange={(e) => handleUpdateApplicantStatus(selectedApplicant.id, e.target.value)}
                          className="w-full p-2.5 text-sm font-bold border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="APPLIED">APPLIED</option>
                          <option value="REVIEWING">REVIEWING</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>

                     {/* TAMPILAN CV PELAMAR YANG BISA DIBUKA */}
                      {selectedApplicant.user?.cvUrl && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-300 transition">
                          <div className="overflow-hidden mr-3">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {selectedApplicant.user?.name}_CV.pdf
                            </p>
                            <p className="text-[10px] text-slate-500">Berkas Curriculum Vitae</p>
                          </div>
                          
                          {/* Tombol Buka CV */}
                          <a
                            href={selectedApplicant.user.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`${selectedApplicant.user?.name}_CV.pdf`}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center shadow-sm transition active:scale-95 shrink-0"
                          >
                            Buka CV <ExternalLink size={12} className="ml-1" />
                          </a>
                        </div>
                      )}
                      
                      {/* Riwayat Timeline Lamaran */}
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-500 mb-3 flex items-center">
                          <Clock size={14} className="mr-1.5" /> APPLICATION TIMELINE
                        </p>
                        <div className="space-y-3">
                          {(selectedApplicant.history || []).map((hist: any) => (
                            <div key={hist.id} className="text-xs pl-3 border-l-2 border-blue-600">
                              <p className="font-bold text-slate-800">Status changed to {hist.status}</p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(hist.changedAt).toLocaleString('id-ID')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                      Pilih salah satu pelamar di sebelah kiri untuk melihat detail dan mengubah status lamarannya.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl animate-in fade-in">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Settings</h1>
            <p className="text-sm text-slate-500 mb-6">Manage your company portal preferences.</p>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Company Name</label>
                <input
                  type="text"
                  value={companySettings.name}
                  onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Industry</label>
                <input
                  type="text"
                  value={companySettings.industry}
                  onChange={(e) => setCompanySettings({ ...companySettings, industry: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Website URL</label>
                <input
                  type="text"
                  placeholder="https://company.com"
                  value={companySettings.website}
                  onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                onClick={() => alert('Pengaturan perusahaan berhasil disimpan!')}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL POST / EDIT JOB */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingJobId ? 'Edit Job Posting' : 'Create New Job Posting'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Front End Developer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jakarta (Hybrid)"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Job Type</label>
                  <select
                    value={jobForm.jobType}
                    onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Salary Range</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rp 8.000.000 - Rp 12.000.000"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Job Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan persyaratan dan tanggung jawab pekerjaan..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md transition active:scale-95"
                >
                  {editingJobId ? 'Save Changes' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};