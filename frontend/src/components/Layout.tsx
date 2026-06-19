import { useEffect, useState, type FC, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  FileText, 
  AlertCircle, 
  Users,
  Menu,
  X
} from 'lucide-react';
import { api } from '../services/api';

interface SidebarItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}

const SidebarItem = ({ to, icon, label, active }: SidebarItemProps) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await api.checkHealth();
      setIsBackendConnected(connected);
    };
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const navigation = [
    { name: 'Profitability', href: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Project Timeline', href: '/timeline', icon: <Clock size={20} /> },
    { name: 'Daily Reports', href: '/reports', icon: <FileText size={20} /> },
    { name: 'Change Orders', href: '/change-orders', icon: <AlertCircle size={20} /> },
    { name: 'Team Status', href: '/team', icon: <Users size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-black p-4 border-r border-gray-800">
        <div className="mb-8 px-4 py-2">
          <h1 className="text-2xl font-bold text-blue-500">BuildFlow AI</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Contractor Dashboard</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <SidebarItem
              key={item.name}
              to={item.href}
              icon={item.icon}
              label={item.name}
              active={location.pathname === item.href}
            />
          ))}
        </nav>
        
        <div className="mt-auto p-4 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              JD
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Project Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-4 md:px-8">
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 flex justify-center md:justify-start">
            <h2 className="text-lg font-semibold truncate">
              {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
              <div className={`w-2 h-2 rounded-full ${
                isBackendConnected === null ? 'bg-gray-600 animate-pulse' : 
                isBackendConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {isBackendConnected === null ? '' : isBackendConnected ? 'Engine Online' : 'Engine Offline'}
              </span>
            </div>
            <div className="hidden sm:block text-right mr-2">
              <p className="text-xs text-gray-500 uppercase font-black tracking-tighter">System Status</p>
              <p className="text-[10px] font-medium text-blue-500">v1.0.4-stable</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-900">
          {children}
        </main>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="relative flex flex-col w-64 max-w-xs bg-black p-4 h-full border-r border-gray-800">
            <div className="flex items-center justify-between mb-8 px-4">
              <h1 className="text-xl font-bold text-blue-500">BuildFlow AI</h1>
              <button className="text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => (
                <div key={item.name} onClick={() => setIsMobileMenuOpen(false)}>
                  <SidebarItem
                    to={item.href}
                    icon={item.icon}
                    label={item.name}
                    active={location.pathname === item.href}
                  />
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Layout;
