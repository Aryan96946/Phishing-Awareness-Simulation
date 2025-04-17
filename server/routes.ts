import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { 
  insertUserSchema, 
  insertCampaignSchema, 
  insertTemplateSchema, 
  insertTargetGroupSchema, 
  insertTargetUserSchema, 
  insertCredentialsSchema 
} from "@shared/schema";
import { ZodError } from "zod";

// JWT secret key - In production, this would be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "phishguard-secret-key";

// Configure nodemailer transporter
// For development, we use ethereal/mailtrap fake SMTP service
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "ethereal.user@ethereal.email",
    pass: process.env.SMTP_PASS || "ethereal_pass"
  }
});

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    
    // Set the user on the request object
    (req as any).user = user;
    next();
  });
};

// Helper to handle validation errors
const handleZodError = (error: ZodError, res: Response) => {
  const formattedErrors = error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
  
  return res.status(400).json({
    message: "Validation error",
    errors: formattedErrors
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // ==================== AUTH ROUTES ====================
  
  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // In production, use proper password hashing
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "8h" }
      );
      
      return res.status(200).json({
        message: "Authentication successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ==================== CAMPAIGN ROUTES ====================
  
  // Get all campaigns
  app.get("/api/campaigns", authenticateToken, async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaigns();
      
      // Enhance campaigns with target group and template info
      const enhancedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
        const targetGroup = await storage.getTargetGroup(campaign.targetGroupId);
        const template = await storage.getTemplate(campaign.templateId);
        const stats = await storage.getCampaignStatistics(campaign.id);
        
        const targetUsers = await storage.getTargetUsers(campaign.targetGroupId);
        
        return {
          ...campaign,
          targetGroup: targetGroup ? {
            id: targetGroup.id,
            name: targetGroup.name,
            userCount: targetUsers.length
          } : null,
          template: template ? {
            id: template.id,
            name: template.name
          } : null,
          statistics: stats,
          progress: stats.emailsSent > 0 
            ? Math.round((stats.emailsOpened / stats.emailsSent) * 100) 
            : 0
        };
      }));
      
      return res.status(200).json(enhancedCampaigns);
    } catch (error) {
      console.error("Get campaigns error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get campaign by ID
  app.get("/api/campaigns/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const targetGroup = await storage.getTargetGroup(campaign.targetGroupId);
      const template = await storage.getTemplate(campaign.templateId);
      const stats = await storage.getCampaignStatistics(campaign.id);
      const targetUsers = await storage.getTargetUsers(campaign.targetGroupId);
      
      const enhancedCampaign = {
        ...campaign,
        targetGroup: targetGroup ? {
          id: targetGroup.id,
          name: targetGroup.name,
          description: targetGroup.description,
          userCount: targetUsers.length
        } : null,
        template: template ? {
          id: template.id,
          name: template.name,
          subject: template.subject
        } : null,
        statistics: stats,
        progress: stats.emailsSent > 0 
          ? Math.round((stats.emailsOpened / stats.emailsSent) * 100) 
          : 0,
        targetUsers: targetUsers
      };
      
      return res.status(200).json(enhancedCampaign);
    } catch (error) {
      console.error("Get campaign error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create campaign
  app.post("/api/campaigns", authenticateToken, async (req: Request, res: Response) => {
    try {
      const campaignData = req.body;
      
      // Add the user ID from the token
      campaignData.createdBy = (req as any).user.id;
      
      // Validate campaign data
      const validatedData = insertCampaignSchema.parse(campaignData);
      
      const campaign = await storage.createCampaign(validatedData);
      
      return res.status(201).json(campaign);
    } catch (error) {
      console.error("Create campaign error:", error);
      
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update campaign
  app.put("/api/campaigns/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const updatedCampaign = await storage.updateCampaign(campaignId, req.body);
      
      return res.status(200).json(updatedCampaign);
    } catch (error) {
      console.error("Update campaign error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete campaign
  app.delete("/api/campaigns/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const result = await storage.deleteCampaign(campaignId);
      
      if (result) {
        return res.status(200).json({ message: "Campaign deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete campaign" });
      }
    } catch (error) {
      console.error("Delete campaign error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ==================== TEMPLATE ROUTES ====================
  
  // Get all templates
  app.get("/api/templates", authenticateToken, async (req: Request, res: Response) => {
    try {
      const templates = await storage.getTemplates();
      return res.status(200).json(templates);
    } catch (error) {
      console.error("Get templates error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get template by ID
  app.get("/api/templates/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const templateId = parseInt(req.params.id);
      
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const template = await storage.getTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      return res.status(200).json(template);
    } catch (error) {
      console.error("Get template error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create template
  app.post("/api/templates", authenticateToken, async (req: Request, res: Response) => {
    try {
      const templateData = req.body;
      
      // Add the user ID from the token
      templateData.createdBy = (req as any).user.id;
      
      // Validate template data
      const validatedData = insertTemplateSchema.parse(templateData);
      
      const template = await storage.createTemplate(validatedData);
      
      return res.status(201).json(template);
    } catch (error) {
      console.error("Create template error:", error);
      
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update template
  app.put("/api/templates/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const templateId = parseInt(req.params.id);
      
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const template = await storage.getTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      const updatedTemplate = await storage.updateTemplate(templateId, req.body);
      
      return res.status(200).json(updatedTemplate);
    } catch (error) {
      console.error("Update template error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete template
  app.delete("/api/templates/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const templateId = parseInt(req.params.id);
      
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const template = await storage.getTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      const result = await storage.deleteTemplate(templateId);
      
      if (result) {
        return res.status(200).json({ message: "Template deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete template" });
      }
    } catch (error) {
      console.error("Delete template error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get template success rates
  app.get("/api/templates/stats/success-rates", authenticateToken, async (req: Request, res: Response) => {
    try {
      const successRates = await storage.getTemplateSuccessRates();
      return res.status(200).json(successRates);
    } catch (error) {
      console.error("Get template success rates error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ==================== TARGET GROUP ROUTES ====================
  
  // Get all target groups
  app.get("/api/target-groups", authenticateToken, async (req: Request, res: Response) => {
    try {
      const targetGroups = await storage.getTargetGroups();
      
      // Enhance with user counts
      const enhancedGroups = await Promise.all(targetGroups.map(async group => {
        const users = await storage.getTargetUsers(group.id);
        return {
          ...group,
          userCount: users.length
        };
      }));
      
      return res.status(200).json(enhancedGroups);
    } catch (error) {
      console.error("Get target groups error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get target group by ID
  app.get("/api/target-groups/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      
      if (isNaN(groupId)) {
        return res.status(400).json({ message: "Invalid target group ID" });
      }
      
      const group = await storage.getTargetGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Target group not found" });
      }
      
      // Get users in this group
      const users = await storage.getTargetUsers(groupId);
      
      const enhancedGroup = {
        ...group,
        users,
        userCount: users.length
      };
      
      return res.status(200).json(enhancedGroup);
    } catch (error) {
      console.error("Get target group error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create target group
  app.post("/api/target-groups", authenticateToken, async (req: Request, res: Response) => {
    try {
      const groupData = req.body;
      
      // Add the user ID from the token
      groupData.createdBy = (req as any).user.id;
      
      // Validate group data
      const validatedData = insertTargetGroupSchema.parse(groupData);
      
      const group = await storage.createTargetGroup(validatedData);
      
      return res.status(201).json(group);
    } catch (error) {
      console.error("Create target group error:", error);
      
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update target group
  app.put("/api/target-groups/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      
      if (isNaN(groupId)) {
        return res.status(400).json({ message: "Invalid target group ID" });
      }
      
      const group = await storage.getTargetGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Target group not found" });
      }
      
      const updatedGroup = await storage.updateTargetGroup(groupId, req.body);
      
      return res.status(200).json(updatedGroup);
    } catch (error) {
      console.error("Update target group error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete target group
  app.delete("/api/target-groups/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      
      if (isNaN(groupId)) {
        return res.status(400).json({ message: "Invalid target group ID" });
      }
      
      const group = await storage.getTargetGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Target group not found" });
      }
      
      const result = await storage.deleteTargetGroup(groupId);
      
      if (result) {
        return res.status(200).json({ message: "Target group deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete target group" });
      }
    } catch (error) {
      console.error("Delete target group error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ==================== TARGET USER ROUTES ====================
  
  // Get all target users in a group
  app.get("/api/target-groups/:groupId/users", authenticateToken, async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      
      if (isNaN(groupId)) {
        return res.status(400).json({ message: "Invalid target group ID" });
      }
      
      const group = await storage.getTargetGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Target group not found" });
      }
      
      const users = await storage.getTargetUsers(groupId);
      
      return res.status(200).json(users);
    } catch (error) {
      console.error("Get target users error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create target user
  app.post("/api/target-users", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      
      // Validate user data
      const validatedData = insertTargetUserSchema.parse(userData);
      
      const user = await storage.createTargetUser(validatedData);
      
      return res.status(201).json(user);
    } catch (error) {
      console.error("Create target user error:", error);
      
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update target user
  app.put("/api/target-users/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid target user ID" });
      }
      
      const user = await storage.getTargetUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Target user not found" });
      }
      
      const updatedUser = await storage.updateTargetUser(userId, req.body);
      
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Update target user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete target user
  app.delete("/api/target-users/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid target user ID" });
      }
      
      const user = await storage.getTargetUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Target user not found" });
      }
      
      const result = await storage.deleteTargetUser(userId);
      
      if (result) {
        return res.status(200).json({ message: "Target user deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete target user" });
      }
    } catch (error) {
      console.error("Delete target user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ==================== ANALYTICS ROUTES ====================
  
  // Get dashboard statistics
  app.get("/api/stats/dashboard", authenticateToken, async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaigns();
      const templates = await storage.getTemplates();
      const targetGroups = await storage.getTargetGroups();
      
      // Calculate active campaigns
      const activeCampaigns = campaigns.filter(c => c.status === "active");
      
      // Calculate average phishing success rate
      let totalInteractions = 0;
      let totalSuccesses = 0;
      
      for (const campaign of campaigns) {
        const stats = await storage.getCampaignStatistics(campaign.id);
        totalInteractions += stats.emailsSent;
        totalSuccesses += stats.credentialsEntered;
      }
      
      const phishingSuccessRate = totalInteractions > 0 
        ? parseFloat(((totalSuccesses / totalInteractions) * 100).toFixed(1)) 
        : 0;
      
      // Get template success rates
      const templateSuccessRates = await storage.getTemplateSuccessRates();
      
      // Get recent activities
      const recentActivities = await storage.getRecentActivities(10);
      
      return res.status(200).json({
        activeCampaignCount: activeCampaigns.length,
        templateCount: templates.length,
        phishingSuccessRate,
        awarenessTrainingRate: 78, // placeholder rate
        mostEffectiveTemplates: templateSuccessRates,
        recentActivities
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get campaign performance
  app.get("/api/stats/campaign-performance", authenticateToken, async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaigns();
      
      let totalSent = 0;
      let totalOpened = 0;
      let totalClicked = 0;
      let totalCredentialsEntered = 0;
      
      for (const campaign of campaigns) {
        const stats = await storage.getCampaignStatistics(campaign.id);
        totalSent += stats.emailsSent;
        totalOpened += stats.emailsOpened;
        totalClicked += stats.linksClicked;
        totalCredentialsEntered += stats.credentialsEntered;
      }
      
      const emailOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const linkClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
      const credentialsEnteredRate = totalSent > 0 ? (totalCredentialsEntered / totalSent) * 100 : 0;
      
      return res.status(200).json({
        emailsSent: totalSent,
        emailsOpened: totalOpened,
        linksClicked: totalClicked,
        credentialsEntered: totalCredentialsEntered,
        emailOpenRate: parseFloat(emailOpenRate.toFixed(1)),
        linkClickRate: parseFloat(linkClickRate.toFixed(1)),
        credentialsEnteredRate: parseFloat(credentialsEnteredRate.toFixed(1))
      });
    } catch (error) {
      console.error("Get campaign performance error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get recent activities
  app.get("/api/stats/recent-activities", authenticateToken, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivities(limit);
      
      return res.status(200).json(activities);
    } catch (error) {
      console.error("Get recent activities error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ==================== PHISHING SIMULATION ROUTES ====================
  
  // Track email open
  app.get("/api/track/:interactionId", async (req: Request, res: Response) => {
    try {
      const interactionId = parseInt(req.params.interactionId);
      
      if (isNaN(interactionId)) {
        return res.status(400).end();
      }
      
      const interaction = await storage.getInteraction(interactionId);
      
      if (interaction) {
        await storage.updateInteraction(interactionId, {
          emailOpened: true,
          openedAt: new Date()
        });
      }
      
      // Return a 1x1 transparent GIF
      const transparentGif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
      res.writeHead(200, {
        "Content-Type": "image/gif",
        "Content-Length": transparentGif.length
      });
      res.end(transparentGif);
    } catch (error) {
      console.error("Track email open error:", error);
      res.status(500).end();
    }
  });
  
  // Phishing link click
  app.get("/api/phish/:interactionId", async (req: Request, res: Response) => {
    try {
      const interactionId = parseInt(req.params.interactionId);
      
      if (isNaN(interactionId)) {
        return res.status(404).send("Page not found");
      }
      
      const interaction = await storage.getInteraction(interactionId);
      
      if (!interaction) {
        return res.status(404).send("Page not found");
      }
      
      // Record the click
      await storage.updateInteraction(interactionId, {
        linkClicked: true,
        clickedAt: new Date()
      });
      
      // Get the campaign and template
      const campaign = await storage.getCampaign(interaction.campaignId);
      
      if (!campaign) {
        return res.status(404).send("Page not found");
      }
      
      const template = await storage.getTemplate(campaign.templateId);
      
      if (!template || !template.landingPage) {
        return res.status(404).send("Page not found");
      }
      
      // Replace capture URL template
      const captureUrl = `/api/capture/${interactionId}`;
      const landingPage = template.landingPage.replace("{{captureUrl}}", captureUrl);
      
      res.send(landingPage);
    } catch (error) {
      console.error("Phishing link click error:", error);
      res.status(500).send("An error occurred");
    }
  });
  
  // Capture credentials
  app.post("/api/capture/:interactionId", async (req: Request, res: Response) => {
    try {
      const interactionId = parseInt(req.params.interactionId);
      
      if (isNaN(interactionId)) {
        return res.redirect("/education");
      }
      
      const interaction = await storage.getInteraction(interactionId);
      
      if (!interaction) {
        return res.redirect("/education");
      }
      
      // Record the credential submission
      await storage.updateInteraction(interactionId, {
        credentialsEntered: true,
        credentialsEnteredAt: new Date()
      });
      
      // Capture the credentials
      const { username, password } = req.body;
      
      await storage.captureCredentials({
        interactionId,
        username,
        password
      });
      
      // Redirect to education page
      res.redirect("/education");
    } catch (error) {
      console.error("Capture credentials error:", error);
      res.redirect("/education");
    }
  });
  
  // Education page after phishing simulation
  app.get("/education", (req: Request, res: Response) => {
    const educationPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Phishing Awareness Education</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; }
          .alert { background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .tips { background-color: #e2f0fb; padding: 15px; border-radius: 5px; }
          .tip { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>Phishing Awareness Training</h1>
        
        <div class="alert">
          <strong>Important:</strong> You have just interacted with a simulated phishing email sent by your organization's security team for awareness training purposes.
        </div>
        
        <p>This was a simulated phishing test to help raise awareness about the dangers of phishing attacks. No personal data was compromised.</p>
        
        <h2>How to Identify Phishing Attempts</h2>
        
        <div class="tips">
          <div class="tip"><strong>Check the sender:</strong> Verify the email address is from a legitimate domain.</div>
          <div class="tip"><strong>Hover before clicking:</strong> Hover over links to see the actual URL before clicking.</div>
          <div class="tip"><strong>Be wary of urgency:</strong> Phishing often creates a false sense of urgency.</div>
          <div class="tip"><strong>Check for grammar/spelling:</strong> Poor grammar and spelling are common in phishing attempts.</div>
          <div class="tip"><strong>Never share credentials:</strong> Legitimate services won't ask for your password via email.</div>
          <div class="tip"><strong>When in doubt, verify:</strong> Contact the supposed sender through official channels if you're unsure.</div>
        </div>
        
        <p>Thank you for participating in this security awareness exercise. Remember, staying vigilant is our best defense against phishing attacks.</p>
      </body>
      </html>
    `;
    
    res.send(educationPage);
  });

  // Simple test route to verify rendering
  app.get("/test-page", (req: Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple Test Page</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 80%;
          }
          h1 {
            color: #3b82f6;
            margin-bottom: 1rem;
          }
          p {
            color: #4b5563;
            margin-bottom: 1.5rem;
          }
          button {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          }
          button:hover {
            background-color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Static Test Page</h1>
          <p>This is a simple HTML page to test if basic rendering works in the browser.</p>
          <button onclick="alert('Button clicked!')">Test Button</button>
        </div>

        <script>
          console.log('Test page loaded successfully');
          document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM fully loaded');
          });
        </script>
      </body>
      </html>
    `);
  });

  return httpServer;
}
