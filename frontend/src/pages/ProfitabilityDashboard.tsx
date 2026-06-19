import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, BarChart3, Loader2, Clock } from 'lucide-react';
import { api, type Project, type Risk } from '../services/api';

const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <div className="bg-black border border-gray-800 p-6 rounded-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color} bg-opacity-20 text-${color.split('-')[1]}-500`}>
        <Icon size={24} />
      </div>
      <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>{change}</span>
      </div>
    </div>
    <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const ProjectRow = ({ name, status, budget, actual, completion_percentage }: Project) => {
  const overrun = actual && budget && actual > budget;
  const margin = budget && actual ? ((budget - actual) / budget * 100).toFixed(1) : 'N/A';
  const marginNum = parseFloat(margin);
  const marginColor = isNaN(marginNum) ? 'text-gray-500' : marginNum > 15 ? 'text-green-500' : marginNum > 5 ? 'text-yellow-500' : 'text-red-500';

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
      <td className="py-4 px-4 font-medium">{name}</td>
      <td className="py-4 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          status === 'active' ? 'bg-green-500 bg-opacity-20 text-green-500' : 'bg-blue-500 bg-opacity-20 text-blue-500'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>
      <td className="py-4 px-4">{budget ? `$${budget.toLocaleString()}` : '-'}</td>
      <td className={`py-4 px-4 ${overrun ? 'text-red-500' : 'text-gray-300'}`}>
        {actual ? `$${actual.toLocaleString()}` : '-'}
      </td>
      <td className={`py-4 px-4 font-bold ${marginColor}`}>
        {completion_percentage.toFixed(1)}% Done
      </td>
    </tr>
  );
};

const ProfitabilityDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [risks, setRisks] = useState<(Risk & { projectName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectsData = await api.getProjects();
        setProjects(projectsData);

        // Fetch risks for each project
        const allRisks: (Risk & { projectName: string })[] = [];
        for (const project of projectsData) {
          try {
            const projectRisks = await api.getProjectRisks(project.id);
            allRisks.push(...projectRisks.map(r => ({ ...r, projectName: project.name })));
          } catch (e) {
            console.error(`Failed to fetch risks for project ${project.id}`, e);
          }
        }
        setRisks(allRisks.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()));
        
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
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
        <p className="text-gray-400">Connecting to BuildFlow AI Engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-xl p-8 text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Backend Connection Error</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const totalRisks = projects.reduce((acc, p) => acc + p.active_risks_count, 0);
  const avgCompletion = projects.length > 0 
    ? projects.reduce((acc, p) => acc + p.completion_percentage, 0) / projects.length 
    : 0;

  const handleSimulateMessage = async () => {
    try {
      await api.sendMessage(
        "+15551234567",
        "Framing at Oakridge is now 80% complete. Also, the owner requested we move a partition wall in the lobby, which wasn't in the original drawings."
      );
      alert("Message sent! Refreshing data...");
      window.location.reload();
    } catch (err: any) {
      alert("Failed to send message: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Simulation Banner */}
      <div className="bg-blue-600 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-blue-400 font-bold">Field Simulation Mode</p>
          <p className="text-xs text-blue-400 text-opacity-70">Simulate a foreman texting the AI engine to see real-time updates.</p>
        </div>
        <button 
          onClick={handleSimulateMessage}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 transition-all"
        >
          Simulate Foreman Text
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={projects.length} 
          change="Live" 
          trend="up" 
          icon={BarChart3} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Avg. Completion" 
          value={`${avgCompletion.toFixed(1)}%`} 
          change="+2.4%" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Active Schedule Risks" 
          value={totalRisks} 
          change={totalRisks > 0 ? 'Action Needed' : 'All Clear'} 
          trend={totalRisks > 0 ? 'down' : 'up'} 
          icon={AlertTriangle} 
          color="bg-red-500" 
        />
        <StatCard 
          title="Platform Status" 
          value="Connected" 
          change="Stable" 
          trend="up" 
          icon={DollarSign} 
          color="bg-purple-500" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Profitability Table */}
        <div className="lg:col-span-2 bg-black border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-bold">Active Projects</h3>
            <button className="text-blue-500 text-sm font-medium hover:underline">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-900 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Project Name</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Budget</th>
                  <th className="py-3 px-4 font-semibold">Actuals</th>
                  <th className="py-3 px-4 font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => <ProjectRow key={p.id} {...p} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Risks */}
        <div className="bg-black border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-6">Detected Risks</h3>
          <div className="space-y-6">
            {risks.length > 0 ? risks.slice(0, 5).map((risk, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  risk.severity === 'high' ? 'bg-red-500' : risk.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div>
                  <h4 className="font-medium text-sm">{risk.description}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{risk.projectName} • {risk.category}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-400 font-medium">
                    <Clock size={12} className="mr-1" />
                    {new Date(risk.detected_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm italic">No active risks detected by AI.</p>
            )}
          </div>
          {risks.length > 0 && (
            <button className="w-full mt-8 py-2 bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
              View All Risks
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityDashboard;
