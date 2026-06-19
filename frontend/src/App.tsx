import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProfitabilityDashboard from './pages/ProfitabilityDashboard';
import ProjectTimeline from './pages/ProjectTimeline';
import DailyReports from './pages/DailyReports';
import ChangeOrderAlerts from './pages/ChangeOrderAlerts';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ProfitabilityDashboard />} />
          <Route path="/timeline" element={<ProjectTimeline />} />
          <Route path="/reports" element={<DailyReports />} />
          <Route path="/change-orders" element={<ChangeOrderAlerts />} />
          <Route path="/team" element={<div className="p-8 text-center text-gray-500">Team Status Page - Coming Soon</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
