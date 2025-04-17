import { queryClient, apiRequest } from '@/lib/queryClient';

// Auth
export const loginUser = async (username: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return response.json();
};

// Campaigns
export const fetchCampaigns = async () => {
  return queryClient.fetchQuery({ queryKey: ['/api/campaigns'] });
};

export const fetchCampaign = async (id: number) => {
  return queryClient.fetchQuery({ queryKey: [`/api/campaigns/${id}`] });
};

export const createCampaign = async (campaignData: any) => {
  return apiRequest('POST', '/api/campaigns', campaignData);
};

export const updateCampaign = async (id: number, campaignData: any) => {
  return apiRequest('PUT', `/api/campaigns/${id}`, campaignData);
};

export const deleteCampaign = async (id: number) => {
  return apiRequest('DELETE', `/api/campaigns/${id}`);
};

// Templates
export const fetchTemplates = async () => {
  return queryClient.fetchQuery({ queryKey: ['/api/templates'] });
};

export const fetchTemplate = async (id: number) => {
  return queryClient.fetchQuery({ queryKey: [`/api/templates/${id}`] });
};

export const createTemplate = async (templateData: any) => {
  return apiRequest('POST', '/api/templates', templateData);
};

export const updateTemplate = async (id: number, templateData: any) => {
  return apiRequest('PUT', `/api/templates/${id}`, templateData);
};

export const deleteTemplate = async (id: number) => {
  return apiRequest('DELETE', `/api/templates/${id}`);
};

// Target Groups
export const fetchTargetGroups = async () => {
  return queryClient.fetchQuery({ queryKey: ['/api/target-groups'] });
};

export const fetchTargetGroup = async (id: number) => {
  return queryClient.fetchQuery({ queryKey: [`/api/target-groups/${id}`] });
};

export const fetchTargetGroupUsers = async (groupId: number) => {
  return queryClient.fetchQuery({ queryKey: [`/api/target-groups/${groupId}/users`] });
};

export const createTargetGroup = async (groupData: any) => {
  return apiRequest('POST', '/api/target-groups', groupData);
};

export const updateTargetGroup = async (id: number, groupData: any) => {
  return apiRequest('PUT', `/api/target-groups/${id}`, groupData);
};

export const deleteTargetGroup = async (id: number) => {
  return apiRequest('DELETE', `/api/target-groups/${id}`);
};

// Target Users
export const createTargetUser = async (userData: any) => {
  return apiRequest('POST', '/api/target-users', userData);
};

export const updateTargetUser = async (id: number, userData: any) => {
  return apiRequest('PUT', `/api/target-users/${id}`, userData);
};

export const deleteTargetUser = async (id: number) => {
  return apiRequest('DELETE', `/api/target-users/${id}`);
};

// Statistics
export const fetchDashboardStats = async () => {
  return queryClient.fetchQuery({ queryKey: ['/api/stats/dashboard'] });
};

export const fetchCampaignPerformance = async () => {
  return queryClient.fetchQuery({ queryKey: ['/api/stats/campaign-performance'] });
};

export const fetchRecentActivities = async (limit?: number) => {
  const queryString = limit ? `?limit=${limit}` : '';
  return queryClient.fetchQuery({ queryKey: [`/api/stats/recent-activities${queryString}`] });
};

export const fetchTemplateSuccessRates = async () => {
  return queryClient.fetchQuery({ queryKey: ['/api/templates/stats/success-rates'] });
};
