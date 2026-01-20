/**
 * Support System TypeScript interfaces and types
 * Defines the structure for the comprehensive artist support ecosystem
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum TicketCategory {
  ACCOUNT_ISSUES = 'account_issues',
  TECHNICAL_SUPPORT = 'technical_support',
  COMMUNITY_GUIDELINES = 'community_guidelines',
  FEATURE_REQUEST = 'feature_request',
  SAFETY_CONCERN = 'safety_concern',
  OTHER = 'other'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency'
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_FOR_USER = 'waiting_for_user',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum DiscussionStatus {
  OPEN = 'open',
  ANSWERED = 'answered',
  CLOSED = 'closed',
  PINNED = 'pinned'
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export enum AnalyticsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

// ============================================================================
// CORE DATA MODELS
// ============================================================================

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface TicketMetadata {
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  sessionId?: string;
  tags?: string[];
  internalNotes?: string;
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  authorId: string;
  authorType: 'user' | 'agent' | 'system';
  content: string;
  attachments: Attachment[];
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  category: TicketCategory;
  priority: Priority;
  status: TicketStatus;
  subject: string;
  description: string;
  attachments: Attachment[];
  assignedAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
  responses: TicketResponse[];
  metadata: TicketMetadata;
  estimatedResponseTime?: number; // in hours
  satisfactionRating?: number; // 1-5 scale
  resolutionTime?: number; // in hours
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: SkillLevel;
  lastUpdated: Date;
  authorId: string;
  viewCount: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  searchKeywords: string[];
  relatedArticles: string[];
  isPublished: boolean;
  featuredOrder?: number;
}

export interface ModerationFlag {
  id: string;
  reporterId: string;
  reason: string;
  description?: string;
  createdAt: Date;
  status: ModerationStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: string;
}

export interface CommunityResponse {
  id: string;
  discussionId: string;
  authorId: string;
  content: string;
  isHelpful: boolean;
  helpfulVotes: number;
  moderationStatus: ModerationStatus;
  moderationFlags: ModerationFlag[];
  createdAt: Date;
  updatedAt: Date;
  parentResponseId?: string; // for nested replies
}

export interface CommunityDiscussion {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: DiscussionStatus;
  responses: CommunityResponse[];
  helpfulResponseIds: string[];
  moderationFlags: ModerationFlag[];
  createdAt: Date;
  lastActivity: Date;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
}

export interface ResourceLibraryItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  url?: string;
  type: 'tutorial' | 'guide' | 'tool' | 'template' | 'video' | 'article';
  skillLevel: SkillLevel;
  category: string;
  tags: string[];
  authorId: string;
  isUserContributed: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  bookmarkCount: number;
  rating: number;
  ratingCount: number;
  isFeatured: boolean;
}

// ============================================================================
// ANALYTICS AND REPORTING
// ============================================================================

export interface CategoryStats {
  category: string;
  count: number;
  averageResolutionTime: number;
  satisfactionScore: number;
}

export interface ContentUsageStats {
  contentId: string;
  contentType: 'article' | 'resource' | 'discussion';
  views: number;
  helpfulVotes: number;
  searchAppearances: number;
}

export interface CommunityStats {
  totalDiscussions: number;
  totalResponses: number;
  averageResponseTime: number;
  helpfulResponseRate: number;
  activeUsers: number;
}

export interface SupportAnalytics {
  id: string;
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  ticketVolume: number;
  averageResponseTime: number;
  resolutionRate: number;
  categoryBreakdown: CategoryStats[];
  userSatisfactionScore: number;
  helpCenterUsage: ContentUsageStats[];
  communityActivity: CommunityStats;
  emergencyTickets: number;
  escalatedTickets: number;
  generatedAt: Date;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateTicketRequest {
  category: TicketCategory;
  subject: string;
  description: string;
  attachments?: File[];
  priority?: Priority;
  metadata?: Partial<TicketMetadata>;
}

export interface CreateTicketResponse {
  ticket: SupportTicket;
  estimatedResponseTime: number;
  confirmationSent: boolean;
}

export interface SearchHelpRequest {
  query: string;
  category?: string;
  skillLevel?: SkillLevel;
  limit?: number;
  offset?: number;
}

export interface SearchHelpResponse {
  articles: HelpArticle[];
  totalCount: number;
  searchTime: number;
  suggestions?: string[];
  relatedTopics?: string[];
}

export interface CreateDiscussionRequest {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface CreateDiscussionResponse {
  discussion: CommunityDiscussion;
  success: boolean;
}

export interface ReportContentRequest {
  contentId: string;
  contentType: 'ticket' | 'discussion' | 'response' | 'article';
  reason: string;
  description?: string;
  isAnonymous?: boolean;
}

export interface ReportContentResponse {
  reportId: string;
  acknowledged: boolean;
  estimatedReviewTime: number;
}

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface TicketService {
  createTicket(userId: string, request: CreateTicketRequest): Promise<CreateTicketResponse>;
  getTicket(ticketId: string, userId: string): Promise<SupportTicket | null>;
  getUserTickets(userId: string, status?: TicketStatus): Promise<SupportTicket[]>;
  updateTicketStatus(ticketId: string, status: TicketStatus, agentId?: string): Promise<boolean>;
  addResponse(ticketId: string, response: Omit<TicketResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<TicketResponse>;
  assignToAgent(ticketId: string, agentId: string): Promise<boolean>;
  rateTicket(ticketId: string, userId: string, rating: number): Promise<boolean>;
}

export interface HelpCenterService {
  searchArticles(request: SearchHelpRequest): Promise<SearchHelpResponse>;
  getArticle(articleId: string): Promise<HelpArticle | null>;
  getCategoryArticles(category: string, skillLevel?: SkillLevel): Promise<HelpArticle[]>;
  getFeaturedArticles(): Promise<HelpArticle[]>;
  trackArticleView(articleId: string, userId?: string): Promise<void>;
  voteHelpful(articleId: string, userId: string, isHelpful: boolean): Promise<boolean>;
  getRelatedArticles(articleId: string): Promise<HelpArticle[]>;
}

export interface CommunityService {
  createDiscussion(userId: string, request: CreateDiscussionRequest): Promise<CreateDiscussionResponse>;
  getDiscussion(discussionId: string): Promise<CommunityDiscussion | null>;
  getDiscussions(category?: string, status?: DiscussionStatus): Promise<CommunityDiscussion[]>;
  addResponse(discussionId: string, userId: string, content: string, parentResponseId?: string): Promise<CommunityResponse>;
  markResponseHelpful(responseId: string, userId: string): Promise<boolean>;
  moderateContent(contentId: string, contentType: string, action: string, moderatorId: string): Promise<boolean>;
}

export interface ModerationService {
  reportContent(userId: string, request: ReportContentRequest): Promise<ReportContentResponse>;
  getReports(status?: ModerationStatus): Promise<ModerationFlag[]>;
  reviewReport(reportId: string, moderatorId: string, action: string, notes?: string): Promise<boolean>;
  escalateReport(reportId: string, reason: string): Promise<boolean>;
  generateModerationReport(period: AnalyticsPeriod): Promise<any>;
}

export interface NotificationService {
  sendTicketConfirmation(ticket: SupportTicket): Promise<boolean>;
  sendTicketUpdate(ticket: SupportTicket, response: TicketResponse): Promise<boolean>;
  sendReportAcknowledgment(report: ModerationFlag): Promise<boolean>;
  sendCommunityGuidelinesUpdate(userId?: string): Promise<boolean>;
}

export interface AnalyticsService {
  generateSupportAnalytics(period: AnalyticsPeriod, startDate: Date, endDate: Date): Promise<SupportAnalytics>;
  trackTicketMetrics(ticket: SupportTicket): Promise<void>;
  trackHelpCenterUsage(articleId: string, searchQuery?: string): Promise<void>;
  trackCommunityActivity(discussionId: string, activityType: string): Promise<void>;
  getInsights(period: AnalyticsPeriod): Promise<any>;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface SupportError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class TicketNotFoundError extends Error {
  constructor(ticketId: string) {
    super(`Ticket not found: ${ticketId}`);
    this.name = 'TicketNotFoundError';
  }
}

export class UnauthorizedAccessError extends Error {
  constructor(resource: string) {
    super(`Unauthorized access to: ${resource}`);
    this.name = 'UnauthorizedAccessError';
  }
}

export class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(`Validation error for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SupportChannel = 'help_center' | 'contact_form' | 'community' | 'emergency';

export interface SupportChannelConfig {
  enabled: boolean;
  displayName: string;
  description: string;
  icon: string;
  priority: number;
}

export interface SupportSystemConfig {
  channels: Record<SupportChannel, SupportChannelConfig>;
  emergencyResponseTime: number; // hours
  standardResponseTime: number; // hours
  maxAttachmentSize: number; // bytes
  allowedAttachmentTypes: string[];
  moderationEnabled: boolean;
  analyticsEnabled: boolean;
}