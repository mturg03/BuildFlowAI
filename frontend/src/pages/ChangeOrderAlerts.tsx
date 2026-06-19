import { useEffect, useState } from 'react';
import { AlertCircle, Plus, Loader2, DollarSign } from 'lucide-react';
import { api, type ChangeOrder } from '../services/api';

const ChangeOrderAlerts = () => {
  const [alerts, setAlerts] = useState<(ChangeOrder & { projectName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projects = await api.getProjects();
        const allAlerts: (ChangeOrder & { projectName: string })[] = [];
        
        for (const project of projects) {
          try {
            const projectAlerts = await api.getProjectChangeOrders(project.id);
            allAlerts.push(...projectAlerts.map(a => ({ ...a, projectName: project.name })));
          } catch (e) {
            console.error(`Failed to fetch alerts for project ${project.id}`, e);
          }
        }
        
        setAlerts(allAlerts.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()));
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load change order alerts');
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
        <p className="text-gray-400">Scanning for Potential Change Orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-xl p-8 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Analysis Error</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-xl p-6 flex items-center space-x-6 shadow-lg shadow-yellow-500/5">
        <div className="bg-yellow-500 p-3 rounded-xl text-black shadow-lg shadow-yellow-500/20">
          <AlertCircle size={24} />
        </div>
        <div>
          <p className="text-yellow-500 font-bold text-lg">AI Change Order Detection</p>
          <p className="text-sm text-yellow-500 text-opacity-80">
            {alerts.length > 0 
              ? `BuildFlow AI has detected ${alerts.length} potential out-of-scope requests in project communications.` 
              : 'AI is actively monitoring communications. No new potential change orders detected.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {alerts.length > 0 ? alerts.map((alert) => (
          <div key={alert.id} className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-xl hover:border-gray-700 transition-all duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-2xl text-white">{alert.title}</h3>
                    <span className="bg-gray-800 text-gray-400 text-[10px] uppercase font-bold px-2 py-1 rounded border border-gray-700">
                      ID: {alert.id}
                    </span>
                  </div>
                  <p className="text-blue-500 font-bold text-sm tracking-wide uppercase">{alert.projectName}</p>
                </div>
                <div className="text-right bg-green-900 bg-opacity-20 p-3 rounded-xl border border-green-500 border-opacity-20">
                  <p className="text-xs text-green-500 uppercase tracking-widest font-black mb-1">Est. Recovery</p>
                  <div className="flex items-center justify-end space-x-1">
                    <DollarSign size={20} className="text-green-500" />
                    <p className="text-2xl font-black text-white">{alert.estimated_value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-gray-900 border border-gray-800 p-6 rounded-xl relative">
                <div className="absolute -top-3 left-4 bg-gray-800 px-3 py-1 rounded text-[10px] font-black uppercase text-blue-400 tracking-tighter border border-gray-700">
                  AI Insight Source
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic font-medium">
                  "{alert.description}"
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                  <span>Detection Date: {new Date(alert.detected_at).toLocaleDateString()}</span>
                  <span className="text-blue-500">{alert.status}</span>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button className="px-6 py-2.5 border border-gray-800 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
                  Dismiss
                </button>
                <button className="px-6 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-500 transition-all flex items-center space-x-3 shadow-lg shadow-blue-600/20">
                  <span>Generate Contract Amendment</span>
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-black border border-gray-800 rounded-2xl border-dashed">
            <DollarSign size={48} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-500 font-bold italic text-lg">No undocumented work detected.</p>
            <p className="text-gray-600 text-sm mt-2 font-medium">Change order monitoring is active.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeOrderAlerts;
