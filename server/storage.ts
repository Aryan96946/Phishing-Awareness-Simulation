import { 
  users, 
  campaigns, 
  templates, 
  targetGroups, 
  targetUsers, 
  interactions, 
  capturedCredentials,
  educationalResources,
  type User, 
  type InsertUser, 
  type Campaign, 
  type InsertCampaign,
  type Template, 
  type InsertTemplate,
  type TargetGroup, 
  type InsertTargetGroup,
  type TargetUser, 
  type InsertTargetUser,
  type Interaction, 
  type InsertInteraction,
  type CapturedCredential, 
  type InsertCredential,
  type EducationalResource, 
  type InsertResource
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Campaign management
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // Template management
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<Template>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;
  
  // Target group management
  getTargetGroups(): Promise<TargetGroup[]>;
  getTargetGroup(id: number): Promise<TargetGroup | undefined>;
  createTargetGroup(group: InsertTargetGroup): Promise<TargetGroup>;
  updateTargetGroup(id: number, group: Partial<TargetGroup>): Promise<TargetGroup | undefined>;
  deleteTargetGroup(id: number): Promise<boolean>;
  
  // Target user management
  getTargetUsers(groupId: number): Promise<TargetUser[]>;
  getTargetUser(id: number): Promise<TargetUser | undefined>;
  createTargetUser(user: InsertTargetUser): Promise<TargetUser>;
  updateTargetUser(id: number, user: Partial<TargetUser>): Promise<TargetUser | undefined>;
  deleteTargetUser(id: number): Promise<boolean>;
  
  // Interaction tracking
  getInteractions(campaignId: number): Promise<Interaction[]>;
  getInteraction(id: number): Promise<Interaction | undefined>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  updateInteraction(id: number, interaction: Partial<Interaction>): Promise<Interaction | undefined>;
  
  // Credential capture
  captureCredentials(credentials: InsertCredential): Promise<CapturedCredential>;
  getCredentials(interactionId: number): Promise<CapturedCredential | undefined>;
  
  // Educational resources
  getResources(): Promise<EducationalResource[]>;
  getResource(id: number): Promise<EducationalResource | undefined>;
  createResource(resource: InsertResource): Promise<EducationalResource>;
  updateResource(id: number, resource: Partial<EducationalResource>): Promise<EducationalResource | undefined>;
  deleteResource(id: number): Promise<boolean>;

  // Analytics & Reporting
  getCampaignStatistics(campaignId: number): Promise<{
    emailsSent: number;
    emailsOpened: number;
    linksClicked: number;
    credentialsEntered: number;
    trainingCompleted: number;
  }>;
  getTemplateSuccessRates(): Promise<{ templateId: number; name: string; successRate: number }[]>;
  getRecentActivities(limit?: number): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private templates: Map<number, Template>;
  private targetGroups: Map<number, TargetGroup>;
  private targetUsers: Map<number, TargetUser>;
  private interactions: Map<number, Interaction>;
  private capturedCredentials: Map<number, CapturedCredential>;
  private educationalResources: Map<number, EducationalResource>;
  
  private currentIds: {
    users: number;
    campaigns: number;
    templates: number;
    targetGroups: number;
    targetUsers: number;
    interactions: number;
    capturedCredentials: number;
    educationalResources: number;
  };

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.templates = new Map();
    this.targetGroups = new Map();
    this.targetUsers = new Map();
    this.interactions = new Map();
    this.capturedCredentials = new Map();
    this.educationalResources = new Map();
    
    this.currentIds = {
      users: 1,
      campaigns: 1,
      templates: 1,
      targetGroups: 1,
      targetUsers: 1,
      interactions: 1,
      capturedCredentials: 1,
      educationalResources: 1
    };

    // Add sample admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      fullName: "Admin User",
      role: "admin"
    });

    // Add initial templates
    this.createTemplate({
      name: "Security Alert",
      subject: "Security Alert: Immediate Action Required",
      body: "<p>Dear {{name}},</p><p>Our security team has detected suspicious activity on your account. Please verify your credentials immediately by clicking the link below:</p><p><a href='{{phishingUrl}}'>Verify Account Security</a></p><p>This link will expire in 24 hours.</p><p>Security Team</p>",
      fromName: "IT Security Team",
      fromEmail: "security@company.com",
      type: "security",
      landingPage: "<h1>Account Verification</h1><form method='post' action='{{captureUrl}}'><input name='username' placeholder='Username'><input type='password' name='password' placeholder='Password'><button type='submit'>Verify</button></form>",
      createdBy: 1
    });

    this.createTemplate({
      name: "Accounting Alert",
      subject: "Urgent: Invoice Review Required",
      body: "<p>Dear {{name}},</p><p>The accounting department requires your immediate review of an outstanding invoice. Please login to verify the payment details:</p><p><a href='{{phishingUrl}}'>Review Invoice</a></p><p>Finance Department</p>",
      fromName: "Finance Department",
      fromEmail: "finance@company.com",
      type: "finance",
      landingPage: "<h1>Finance Portal</h1><form method='post' action='{{captureUrl}}'><input name='username' placeholder='Username'><input type='password' name='password' placeholder='Password'><button type='submit'>Login</button></form>",
      createdBy: 1
    });

    this.createTemplate({
      name: "IT Security Notice",
      subject: "Password Reset Required",
      body: "<p>Dear {{name}},</p><p>As part of our regular security maintenance, we require all users to reset their passwords. Please click the link below to reset your password:</p><p><a href='{{phishingUrl}}'>Reset Password</a></p><p>IT Department</p>",
      fromName: "IT Department",
      fromEmail: "it@company.com",
      type: "it",
      landingPage: "<h1>Password Reset</h1><form method='post' action='{{captureUrl}}'><input name='username' placeholder='Current Username'><input type='password' name='password' placeholder='Current Password'><input type='password' name='new_password' placeholder='New Password'><button type='submit'>Reset Password</button></form>",
      createdBy: 1
    });

    // Add initial target groups
    this.createTargetGroup({
      name: "All Staff",
      description: "All employees in the organization",
      createdBy: 1
    });

    this.createTargetGroup({
      name: "Finance Department",
      description: "Financial team members",
      createdBy: 1
    });

    this.createTargetGroup({
      name: "Executive Team",
      description: "Company executives and leadership",
      createdBy: 1
    });

    this.createTargetGroup({
      name: "IT Department",
      description: "Information Technology team members",
      createdBy: 1
    });

    // Add sample campaigns
    this.createCampaign({
      name: "Password Reset Alert",
      description: "Campaign targeting the Finance Department with password reset emails",
      templateId: 3,
      targetGroupId: 2,
      status: "active",
      startDate: new Date("2023-05-01"),
      createdBy: 1
    });

    this.createCampaign({
      name: "Urgent Invoice Review",
      description: "Campaign targeting executives with urgent invoice emails",
      templateId: 2,
      targetGroupId: 3,
      status: "active",
      startDate: new Date("2023-05-10"),
      createdBy: 1
    });

    this.createCampaign({
      name: "Security Alert: Action Required",
      description: "Campaign targeting all staff with security alert emails",
      templateId: 1,
      targetGroupId: 1,
      status: "active",
      startDate: new Date("2023-05-12"),
      createdBy: 1
    });

    // Add sample target users
    // Finance Department Users
    this.createTargetUser({
      groupId: 2,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      department: "Finance"
    });

    this.createTargetUser({
      groupId: 2,
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      department: "Finance"
    });

    // Executive Team Users
    this.createTargetUser({
      groupId: 3,
      name: "Sarah Williams",
      email: "sarah.williams@company.com",
      department: "Executive"
    });

    this.createTargetUser({
      groupId: 3,
      name: "Robert Chen",
      email: "robert.chen@company.com",
      department: "Executive"
    });

    // Add sample interactions
    this.createInteraction({
      campaignId: 3,
      userId: 1,
      emailSent: true,
      sentAt: new Date("2023-05-15T09:00:00"),
      userIp: "192.168.1.1",
      userAgent: "Mozilla/5.0"
    });

    this.updateInteraction(1, {
      emailOpened: true,
      openedAt: new Date("2023-05-15T09:05:00"),
      linkClicked: true,
      clickedAt: new Date("2023-05-15T09:08:00"),
      credentialsEntered: true,
      credentialsEnteredAt: new Date("2023-05-15T09:10:00")
    });

    // Add sample captured credentials
    this.captureCredentials({
      interactionId: 1,
      username: "john.doe@company.com",
      password: "securePassword123"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentIds.campaigns++;
    const now = new Date();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      createdAt: now,
      endDate: null
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, campaignUpdate: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign = { ...campaign, ...campaignUpdate };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentIds.templates++;
    const now = new Date();
    const template: Template = { ...insertTemplate, id, createdAt: now };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: number, templateUpdate: Partial<Template>): Promise<Template | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;

    const updatedTemplate = { ...template, ...templateUpdate };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }

  async getTargetGroups(): Promise<TargetGroup[]> {
    return Array.from(this.targetGroups.values());
  }

  async getTargetGroup(id: number): Promise<TargetGroup | undefined> {
    return this.targetGroups.get(id);
  }

  async createTargetGroup(insertGroup: InsertTargetGroup): Promise<TargetGroup> {
    const id = this.currentIds.targetGroups++;
    const now = new Date();
    const group: TargetGroup = { ...insertGroup, id, createdAt: now };
    this.targetGroups.set(id, group);
    return group;
  }

  async updateTargetGroup(id: number, groupUpdate: Partial<TargetGroup>): Promise<TargetGroup | undefined> {
    const group = this.targetGroups.get(id);
    if (!group) return undefined;

    const updatedGroup = { ...group, ...groupUpdate };
    this.targetGroups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteTargetGroup(id: number): Promise<boolean> {
    return this.targetGroups.delete(id);
  }

  async getTargetUsers(groupId: number): Promise<TargetUser[]> {
    return Array.from(this.targetUsers.values()).filter(user => user.groupId === groupId);
  }

  async getTargetUser(id: number): Promise<TargetUser | undefined> {
    return this.targetUsers.get(id);
  }

  async createTargetUser(insertUser: InsertTargetUser): Promise<TargetUser> {
    const id = this.currentIds.targetUsers++;
    const now = new Date();
    const user: TargetUser = { ...insertUser, id, createdAt: now };
    this.targetUsers.set(id, user);
    return user;
  }

  async updateTargetUser(id: number, userUpdate: Partial<TargetUser>): Promise<TargetUser | undefined> {
    const user = this.targetUsers.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userUpdate };
    this.targetUsers.set(id, updatedUser);
    return updatedUser;
  }

  async deleteTargetUser(id: number): Promise<boolean> {
    return this.targetUsers.delete(id);
  }

  async getInteractions(campaignId: number): Promise<Interaction[]> {
    return Array.from(this.interactions.values()).filter(
      interaction => interaction.campaignId === campaignId
    );
  }

  async getInteraction(id: number): Promise<Interaction | undefined> {
    return this.interactions.get(id);
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const id = this.currentIds.interactions++;
    const interaction: Interaction = {
      ...insertInteraction,
      id,
      emailOpened: false,
      linkClicked: false,
      credentialsEntered: false,
      trainingCompleted: false,
      openedAt: null,
      clickedAt: null,
      credentialsEnteredAt: null,
      trainingCompletedAt: null
    };
    this.interactions.set(id, interaction);
    return interaction;
  }

  async updateInteraction(id: number, interactionUpdate: Partial<Interaction>): Promise<Interaction | undefined> {
    const interaction = this.interactions.get(id);
    if (!interaction) return undefined;

    const updatedInteraction = { ...interaction, ...interactionUpdate };
    this.interactions.set(id, updatedInteraction);
    return updatedInteraction;
  }

  async captureCredentials(insertCredentials: InsertCredential): Promise<CapturedCredential> {
    const id = this.currentIds.capturedCredentials++;
    const now = new Date();
    const credentials: CapturedCredential = { ...insertCredentials, id, capturedAt: now };
    this.capturedCredentials.set(id, credentials);
    return credentials;
  }

  async getCredentials(interactionId: number): Promise<CapturedCredential | undefined> {
    return Array.from(this.capturedCredentials.values()).find(
      creds => creds.interactionId === interactionId
    );
  }

  async getResources(): Promise<EducationalResource[]> {
    return Array.from(this.educationalResources.values());
  }

  async getResource(id: number): Promise<EducationalResource | undefined> {
    return this.educationalResources.get(id);
  }

  async createResource(insertResource: InsertResource): Promise<EducationalResource> {
    const id = this.currentIds.educationalResources++;
    const now = new Date();
    const resource: EducationalResource = { ...insertResource, id, createdAt: now };
    this.educationalResources.set(id, resource);
    return resource;
  }

  async updateResource(id: number, resourceUpdate: Partial<EducationalResource>): Promise<EducationalResource | undefined> {
    const resource = this.educationalResources.get(id);
    if (!resource) return undefined;

    const updatedResource = { ...resource, ...resourceUpdate };
    this.educationalResources.set(id, updatedResource);
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    return this.educationalResources.delete(id);
  }

  async getCampaignStatistics(campaignId: number): Promise<{ 
    emailsSent: number; 
    emailsOpened: number; 
    linksClicked: number; 
    credentialsEntered: number; 
    trainingCompleted: number; 
  }> {
    const interactions = await this.getInteractions(campaignId);
    
    return {
      emailsSent: interactions.filter(i => i.emailSent).length,
      emailsOpened: interactions.filter(i => i.emailOpened).length,
      linksClicked: interactions.filter(i => i.linkClicked).length,
      credentialsEntered: interactions.filter(i => i.credentialsEntered).length,
      trainingCompleted: interactions.filter(i => i.trainingCompleted).length
    };
  }

  async getTemplateSuccessRates(): Promise<{ templateId: number; name: string; successRate: number }[]> {
    const templates = await this.getTemplates();
    const campaigns = await this.getCampaigns();
    
    const results = [];
    
    for (const template of templates) {
      const templateCampaigns = campaigns.filter(c => c.templateId === template.id);
      let totalUsers = 0;
      let totalCredentialsEntered = 0;
      
      for (const campaign of templateCampaigns) {
        const interactions = await this.getInteractions(campaign.id);
        totalUsers += interactions.length;
        totalCredentialsEntered += interactions.filter(i => i.credentialsEntered).length;
      }
      
      const successRate = totalUsers > 0 ? (totalCredentialsEntered / totalUsers) * 100 : 0;
      
      results.push({
        templateId: template.id,
        name: template.name,
        successRate: parseFloat(successRate.toFixed(1))
      });
    }
    
    // Sort by success rate descending
    return results.sort((a, b) => b.successRate - a.successRate);
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    const activities = [];
    
    // Process credential captures
    for (const credential of Array.from(this.capturedCredentials.values())) {
      const interaction = await this.getInteraction(credential.interactionId);
      if (interaction) {
        const campaign = await this.getCampaign(interaction.campaignId);
        const targetUser = await this.getTargetUser(interaction.userId);
        
        if (campaign && targetUser) {
          const template = await this.getTemplate(campaign.templateId);
          activities.push({
            type: 'credentials_captured',
            timestamp: credential.capturedAt,
            data: {
              campaign: campaign.name,
              template: template?.name,
              user: targetUser.email,
              capturedAt: credential.capturedAt
            }
          });
        }
      }
    }
    
    // Process campaign creations
    for (const campaign of Array.from(this.campaigns.values())) {
      activities.push({
        type: 'campaign_created',
        timestamp: campaign.createdAt,
        data: {
          campaign: campaign.name,
          createdAt: campaign.createdAt
        }
      });
    }
    
    // Process link clicks
    for (const interaction of Array.from(this.interactions.values())) {
      if (interaction.linkClicked && interaction.clickedAt) {
        const campaign = await this.getCampaign(interaction.campaignId);
        const targetUser = await this.getTargetUser(interaction.userId);
        
        if (campaign && targetUser) {
          activities.push({
            type: 'link_clicked',
            timestamp: interaction.clickedAt,
            data: {
              campaign: campaign.name,
              user: targetUser.email,
              clickedAt: interaction.clickedAt
            }
          });
        }
      }
    }
    
    // Sort by timestamp descending and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
