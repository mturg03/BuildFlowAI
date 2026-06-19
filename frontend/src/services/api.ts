const API_BASE_URL = '/api';

export interface Project {
  id: string;
  name: string;
  address: string;
  status: string;
  completion_percentage: number;
  foreman_id: string;
  budget: number | null;
  actual: number | null;
  progress: number | null;
  foreman_name: string;
  foreman_phone: string;
  active_risks_count: number;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: string;
  completion_percentage: number;
  due_date: string | null;
}

export interface DailyReport {
  id: string;
  project_id: string;
  date: string;
  content: string;
  created_at: string;
}

export interface ChangeOrder {
  id: string;
  project_id: string;
  title: string;
  description: string;
  estimated_value: number;
  status: string;
  detected_at: string;
  source_message_id: string | null;
}

export interface Risk {
  id: string;
  project_id: string;
  milestone_id: string | null;
  category: string;
  description: string;
  severity: string;
  detected_at: string;
  resolved: boolean;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
  daily_reports: DailyReport[];
  change_orders: ChangeOrder[];
  schedule_risks: Risk[];
}

export const api = {
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async getProjectDetail(id: string): Promise<ProjectDetail> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch project ${id}`);
    return response.json();
  },

  async getProjectReports(id: string): Promise<DailyReport[]> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/reports`);
    if (!response.ok) throw new Error(`Failed to fetch reports for project ${id}`);
    return response.json();
  },

  async getProjectChangeOrders(id: string): Promise<ChangeOrder[]> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/change-orders`);
    if (!response.ok) throw new Error(`Failed to fetch change orders for project ${id}`);
    return response.json();
  },

  async getProjectRisks(id: string): Promise<Risk[]> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/risks`);
    if (!response.ok) throw new Error(`Failed to fetch risks for project ${id}`);
    return response.json();
  },

  async sendMessage(sender: string, content: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, content }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      return response.ok;
    } catch (e) {
      return false;
    }
  }
};
