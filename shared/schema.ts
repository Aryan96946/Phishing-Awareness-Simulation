import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users for the platform
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

// Campaign status enum
export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "scheduled",
  "active",
  "completed",
  "paused",
]);

// Phishing campaigns
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: campaignStatusEnum("status").notNull().default("draft"),
  templateId: integer("template_id").notNull(),
  targetGroupId: integer("target_group_id").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  description: true,
  templateId: true,
  targetGroupId: true,
  startDate: true,
  status: true,
  createdBy: true,
});

// Email templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),
  type: text("type").notNull(),
  landingPage: text("landing_page"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  subject: true,
  body: true,
  fromName: true,
  fromEmail: true,
  type: true,
  landingPage: true,
  createdBy: true,
});

// Target groups
export const targetGroups = pgTable("target_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertTargetGroupSchema = createInsertSchema(targetGroups).pick({
  name: true,
  description: true,
  createdBy: true,
});

// Target users in groups
export const targetUsers = pgTable("target_users", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTargetUserSchema = createInsertSchema(targetUsers).pick({
  groupId: true,
  name: true,
  email: true,
  department: true,
});

// Tracking user interactions with phishing emails
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  userId: integer("user_id").notNull(),
  emailSent: boolean("email_sent").default(false),
  emailOpened: boolean("email_opened").default(false),
  linkClicked: boolean("link_clicked").default(false),
  credentialsEntered: boolean("credentials_entered").default(false),
  trainingCompleted: boolean("training_completed").default(false),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  credentialsEnteredAt: timestamp("credentials_entered_at"),
  trainingCompletedAt: timestamp("training_completed_at"),
  userIp: text("user_ip"),
  userAgent: text("user_agent"),
});

export const insertInteractionSchema = createInsertSchema(interactions).pick({
  campaignId: true,
  userId: true,
  emailSent: true,
  sentAt: true,
  userIp: true,
  userAgent: true,
});

// Captured credentials for analysis
export const capturedCredentials = pgTable("captured_credentials", {
  id: serial("id").primaryKey(),
  interactionId: integer("interaction_id").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  capturedAt: timestamp("captured_at").defaultNow(),
});

export const insertCredentialsSchema = createInsertSchema(capturedCredentials).pick({
  interactionId: true,
  username: true,
  password: true,
});

// Educational resources for post-phishing training
export const educationalResources = pgTable("educational_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  resourceType: text("resource_type").notNull(),
  url: text("url"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertResourceSchema = createInsertSchema(educationalResources).pick({
  title: true,
  content: true,
  resourceType: true,
  url: true,
  createdBy: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type TargetGroup = typeof targetGroups.$inferSelect;
export type InsertTargetGroup = z.infer<typeof insertTargetGroupSchema>;

export type TargetUser = typeof targetUsers.$inferSelect;
export type InsertTargetUser = z.infer<typeof insertTargetUserSchema>;

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;

export type CapturedCredential = typeof capturedCredentials.$inferSelect;
export type InsertCredential = z.infer<typeof insertCredentialsSchema>;

export type EducationalResource = typeof educationalResources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
