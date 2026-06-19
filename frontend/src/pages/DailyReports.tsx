import { useEffect, useState } from 'react';
import { Calendar, ChevronRight, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { api, type DailyReport } from '../services/api';

const DailyReports = () => {
  const [reports, setReports] = useState<(DailyReport & { projectName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projects = await api.getProjects();
        const allReports: (DailyReport & { projectName: string })[] = [];
        
        for (const project of projects) {
          try {
            const projectReports = await api.getProjectReports(project.id);
            allReports.push(...projectReports.map(r => ({ ...r, projectName: project.name })));
          } catch (e) {
            console.error(`Failed to fetch reports for project ${project.id}`, e);
          }
        }
        
        setReports(allReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-gray-400">Loading AI-Generated Reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-xl p-8 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Reports</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium shadow-[0_0_10px_rgba(37,99,235,0.3)]">All Reports</button>
          <button className="bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">By Project</button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400 font-medium">
          <Calendar size={16} />
          <span>Real-time Feed</span>
        </div>
      </div>

      <div className="bg-black border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        {reports.length > 0 ? reports.map((report, i) => (
          <div key={i} className="p-6 border-b border-gray-800 last:border-b-0 hover:bg-gray-800 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors">{report.projectName}</h4>
                  <span className="bg-blue-900 bg-opacity-30 text-blue-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-blue-400 border-opacity-20 shadow-sm">AI Generated</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <Calendar size={14} className="text-blue-500" />
                    <span>{new Date(report.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-gray-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
            </div>
            
            <div className="mt-4 bg-gray-900 bg-opacity-50 border border-gray-800 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <MessageSquare size={16} className="text-blue-500 mt-1 shrink-0" />
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {report.content}
                </p>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-12 px-6">
            <FileText size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium italic">No daily reports have been generated yet.</p>
            <p className="text-gray-600 text-xs mt-2 uppercase tracking-widest">Awaiting foreman messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FileText = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14.5 2 14.5 7.5 20 7.5" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export default DailyReports;
