import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Navbar } from '../components/Navbar';
import { MapPin, DollarSign, Briefcase, Search } from 'lucide-react';

export const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const companyName = job.company?.name || '';
    const matchesSearch =
      (job.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
      companyName.toLowerCase().includes(search.toLowerCase()) ||
      (job.location?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesType = selectedType === 'All' || job.jobType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Filter */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <Search size={16} className="mr-2 text-blue-600" /> Filter Lowongan
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cari Pekerjaan</label>
                <input
                  type="text"
                  placeholder="Keahlian / Posisi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Job Type</label>
                {/* Menambahkan opsi Internship ke dalam array filter */}
                {['All', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map((type) => (
                  <label key={type} className="flex items-center space-x-2 text-xs text-gray-700 mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={selectedType === type}
                      onChange={() => setSelectedType(type)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Job List */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-900">Recommended Jobs</h2>
              <span className="text-xs text-gray-500">Menampilkan {filteredJobs.length} posisi</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500">Memuat lowongan pekerjaan...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500">
                Tidak ada lowongan yang sesuai dengan filter Anda.
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-base font-bold text-gray-900 hover:text-blue-600 transition mb-1">{job.title}</h3>
                    <p className="text-sm font-semibold text-blue-700 mb-3">{job.company?.name || 'Perusahaan'}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center"><MapPin size={13} className="mr-1" /> {job.location}</span>
                      <span className="flex items-center"><Briefcase size={13} className="mr-1" /> {job.jobType}</span>
                      <span className="flex items-center"><DollarSign size={13} className="mr-1" /> {job.salary}</span>
                    </div>
                  </div>
                  <button className="hidden sm:inline-flex px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-semibold text-xs rounded-lg transition border border-blue-200">
                    Quick View
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};