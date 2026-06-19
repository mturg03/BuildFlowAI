import { useEffect, useState } from 'react';
import { api, type ProjectDetail, type Task } from '../services/api';
import { Loader2, AlertCircle } from 'lucide-react';

const ProjectTimeline = () => {
  const [projects, setProjects] = useState<ProjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectsListData = await api.getProjects();
        const details = await Promise.all(
          projectsListData.map(p => api.getProjectDetail(p.id))
        );
        setProjects(details);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load timeline data');
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
        <p className="text-gray-400">Loading Project Timelines...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-xl p-8 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Timelines</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-black border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Real-time Project Progress</h3>
        <p className="text-gray-400">Live updates from foreman messages and engine analysis.</p>
        
        <div className="mt-8 space-y-12">
          {projects.length > 0 ? projects.map((project) => (
            <div key={project.id} className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-xl">{project.name}</h4>
                  <p className="text-sm text-gray-500">{project.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-500">{project.completion_percentage.toFixed(1)}%</span>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Overall Completion</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                  style={{ width: `${project.completion_percentage}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {project.tasks.map((task: Task) => (
                  <div key={task.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-400 font-medium">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </span>
                      <span className={`font-bold uppercase ${
                        task.status === 'completed' ? 'text-green-500' : 
                        task.status === 'in-progress' ? 'text-blue-500' : 'text-gray-500'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-bold mb-3">{task.name}</p>
                    <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`} 
                        style={{ width: `${task.completion_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-right mt-1 text-gray-500 font-bold">{task.completion_percentage}%</p>
                  </div>
                ))}
                {project.tasks.length === 0 && (
                  <p className="text-gray-500 text-sm italic col-span-full">No specific tasks defined for this project.</p>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No active projects found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
