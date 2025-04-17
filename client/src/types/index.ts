// User types
export interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  createdAt: string;
}

// Campaign types
export interface Campaign {
  id: number;
  name: string;
  description?: string;
  status: string;
  templateId: number;
  targetGroupId: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  createdBy: number;
  template?: {
    id: number;
    name: string;
  };
  targetGroup?: {
    id: number;
    name: string;
    userCount?: number;
  };
  progress?: number;
  statistics?: {
    emailsSent: number;
    emailsOpened: number;
    linksClicked: number;
    credentialsEntered: number;
    trainingCompleted: number;
  };
}

// Template types
export interface Template {
  id: number;
  name: string;
  subject: string;
  body: string;
  fromName: string;
  fromEmail: string;
  type: string;
  landingPage?: string;
  createdAt: string;
  createdBy: number;
}

// Target group types
export interface TargetGroup {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  createdBy: number;
  userCount?: number;
}

// Target user types
export interface TargetUser {
  id: number;
  groupId: number;
  name: string;
  email: string;
  department?: string;
  createdAt: string;
}

// Interaction types
export interface Interaction {
  id: number;
  campaignId: number;
  userId: number;
  emailSent: boolean;
  emailOpened: boolean;
  linkClicked: boolean;
  credentialsEntered: boolean;
  trainingCompleted: boolean;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  credentialsEnteredAt: string | null;
  trainingCompletedAt: string | null;
  userIp?: string;
  userAgent?: string;
}

// Credential types
export interface CapturedCredential {
  id: number;
  interactionId: number;
  username: string;
  password: string;
  capturedAt: string;
}

// Educational resource types
export interface EducationalResource {
  id: number;
  title: string;
  content: string;
  resourceType: string;
  url?: string;
  createdAt: string;
  createdBy: number;
}

// Dashboard statistics
export interface DashboardStats {
  activeCampaignCount: number;
  templateCount: number;
  phishingSuccessRate: number;
  awarenessTrainingRate: number;
  mostEffectiveTemplates: TemplateSuccessRate[];
  recentActivities: RecentActivity[];
}

export interface TemplateSuccessRate {
  templateId: number;
  name: string;
  successRate: number;
}

export interface RecentActivity {
  type: 'credentials_captured' | 'campaign_created' | 'link_clicked';
  timestamp: string;
  data: {
    campaign?: string;
    template?: string;
    user?: string;
    capturedAt?: string;
    createdAt?: string;
    clickedAt?: string;
  };
}
