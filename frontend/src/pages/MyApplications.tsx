import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Navbar } from '../components/Navbar';
import { Clock, MapPin, Building2 } from 'lucide-react';


export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const { data } = await api.get('/applications/my-applications');
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
      REVIEWING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      SHORTLISTED: 'bg-purple-50 text-purple-700 border-purple-200',
      ACCEPTED: 'bg-green-50 text-green-700 border-green-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">My Applications</h1>
        <p className="text-sm text-slate-500 mb-8">Pantau perkembangan status berkas lamaran kerja Anda.</p>
        
        <div className="space-y-6">
          {applications.map((app: any) => (
            <div key={app.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{app.job.title}</h3>
                  <p className="text-sm font-medium text-blue-600 mt-1">{app.job.company?.name || 'Perusahaan'}</p>
                </div>
                <span className="px-4 py-1.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 uppercase border border-blue-100">
                  {app.status}
                </span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-4 flex items-center">
                  <Clock size={14} className="mr-1.5" /> APPLICATION TIMELINE
                </p>
                
                {/* Looping History Timeline */}
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {app.history?.map((hist: any, index: number) => (
                    <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded-lg border border-slate-100 bg-slate-50 shadow-sm">
                        <p className="text-sm font-bold text-slate-800">Status changed to {hist.status}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(hist.changedAt).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};