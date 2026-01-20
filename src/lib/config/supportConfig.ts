/**
 * Support System Configuration
 * Centralized configuration for the artist support system
 */

import type { SupportSystemConfig, SupportChannel } from '../../types/support';

/**
 * Default support system configuration
 */
export const defaultSupportConfig: SupportSystemConfig = {
  channels: {
    help_center: {
      enabled: true,
      displayName: 'Help Center',
      description: 'Search our comprehensive knowledge base for answers to common questions',
      icon: 'book-open',
      priority: 1
    },
    contact_form: {
      enabled: true,
      displayName: 'Contact Support',
      description: 'Submit a support ticket for personalized assistance',
      icon: 'mail',
      priority: 2
    },
    community: {
      enabled: true,
      displayName: 'Community Support',
      description: 'Get help from other artists and share your knowledge',
      icon: 'users',
      priority: 3
    },
    emergency: {
      enabled: true,
      displayName: 'Emergency Support',
      description: 'Immediate assistance for safety concerns and urgent issues',
      icon: 'alert-triangle',
      priority: 4
    }
  },
  emergencyResponseTime: 1, // 1 hour
  standardResponseTime: 24, // 24 hours
  maxAttachmentSize: 10 * 1024 * 1024, // 10MB
  allowedAttachmentTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/zip'
  ],
  moderationEnabled: true,
  analyticsEnabled: true
};

/**
 * Gets support configuration with environment overrides
 */
export function getSupportConfig(): SupportSystemConfig {
  const config = { ...defaultSupportConfig };

  // Apply environment-specific overrides
  if (import.meta.env.DISABLE_COMMUNITY_SUPPORT === 'true') {
    config.channels.community.enabled = false;
  }

  if (import.meta.env.DISABLE_EMERGENCY_SUPPORT === 'true') {
    config.channels.emergency.enabled = false;
  }

  if (import.meta.env.EMERGENCY_RESPONSE_TIME) {
    config.emergencyResponseTime = parseInt(import.meta.env.EMERGENCY_RESPONSE_TIME);
  }

  if (import.meta.env.STANDARD_RESPONSE_TIME) {
    config.standardResponseTime = parseInt(import.meta.env.STANDARD_RESPONSE_TIME);
  }

  if (import.meta.env.MAX_ATTACHMENT_SIZE) {
    config.maxAttachmentSize = parseInt(import.meta.env.MAX_ATTACHMENT_SIZE);
  }

  if (import.meta.env.DISABLE_MODERATION === 'true') {
    config.moderationEnabled = false;
  }

  if (import.meta.env.DISABLE_ANALYTICS === 'true') {
    config.analyticsEnabled = false;
  }

  return config;
}

/**
 * Gets enabled support channels
 */
export function getEnabledChannels(): Array<{ key: SupportChannel; config: any }> {
  const config = getSupportConfig();
  
  return Object.entries(config.channels)
    .filter(([_, channelConfig]) => channelConfig.enabled)
    .map(([key, channelConfig]) => ({ key: key as SupportChannel, config: channelConfig }))
    .sort((a, b) => a.config.priority - b.config.priority);
}

/**
 * Validates file attachment against configuration
 */
export function validateAttachment(file: File): { valid: boolean; error?: string } {
  const config = getSupportConfig();

  // Check file size
  if (file.size > config.maxAttachmentSize) {
    const maxSizeMB = Math.round(config.maxAttachmentSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }

  // Check file type
  if (!config.allowedAttachmentTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  return { valid: true };
}

/**
 * Gets response time expectations for different priorities
 */
export function getResponseTimeExpectations() {
  const config = getSupportConfig();
  
  return {
    emergency: config.emergencyResponseTime,
    high: Math.ceil(config.standardResponseTime / 3), // ~8 hours for high priority
    medium: config.standardResponseTime,
    low: config.standardResponseTime * 2 // 48 hours for low priority
  };
}

/**
 * Support system feature flags
 */
export const supportFeatures = {
  ticketSystem: true,
  helpCenter: true,
  communitySupport: true,
  moderation: true,
  analytics: true,
  fileAttachments: true,
  emailNotifications: true,
  emergencySupport: true,
  
  // Experimental features (can be toggled via environment)
  aiAssistance: import.meta.env.ENABLE_AI_ASSISTANCE === 'true',
  realTimeChat: import.meta.env.ENABLE_REALTIME_CHAT === 'true',
  videoSupport: import.meta.env.ENABLE_VIDEO_SUPPORT === 'true'
};

/**
 * Default categories for different content types
 */
export const defaultCategories = {
  helpArticles: [
    'Getting Started',
    'Account & Profile',
    'Posting & Sharing',
    'Community Guidelines',
    'Privacy & Safety',
    'Technical Issues',
    'Mobile App',
    'Billing & Subscriptions'
  ],
  
  ticketCategories: [
    'Account Issues',
    'Technical Support',
    'Community Guidelines',
    'Feature Request',
    'Safety Concern',
    'Other'
  ],
  
  communityDiscussions: [
    'General Help',
    'Technical Questions',
    'Feature Requests',
    'Community Guidelines',
    'Tips & Tricks',
    'Feedback'
  ],
  
  resourceLibrary: [
    'Digital Art',
    'Traditional Art',
    'Photography',
    'Design',
    'Community',
    'Business',
    'Tools & Software'
  ]
};

/**
 * Moderation settings
 */
export const moderationConfig = {
  autoModerationEnabled: import.meta.env.ENABLE_AUTO_MODERATION === 'true',
  requireApprovalForNewUsers: import.meta.env.REQUIRE_NEW_USER_APPROVAL === 'true',
  flagThreshold: parseInt(import.meta.env.MODERATION_FLAG_THRESHOLD || '3'),
  emergencyKeywords: [
    'harassment',
    'threat',
    'suicide',
    'self-harm',
    'doxxing',
    'illegal',
    'abuse'
  ],
  spamDetection: {
    enabled: true,
    maxLinksPerPost: 3,
    maxDuplicateContent: 2,
    suspiciousPatterns: [
      /(.)\1{10,}/, // Repeated characters
      /https?:\/\/[^\s]+/gi, // Multiple URLs
    ]
  }
};

/**
 * Analytics configuration
 */
export const analyticsConfig = {
  trackUserInteractions: true,
  trackSearchQueries: true,
  trackResponseTimes: true,
  trackSatisfactionRatings: true,
  retentionPeriod: 365, // days
  anonymizeUserData: import.meta.env.ANONYMIZE_ANALYTICS === 'true'
};