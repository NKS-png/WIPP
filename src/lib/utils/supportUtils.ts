/**
 * Support System Utility Functions
 * Common utilities and helpers for the support system
 */

import type { 
  TicketCategory, 
  Priority, 
  TicketStatus, 
  SupportTicket,
  HelpArticle,
  ModerationFlag 
} from '../../types/support';

/**
 * Generates a unique identifier for support system entities
 */
export function generateSupportId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  const id = `${timestamp}${randomPart}`;
  
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Generates a human-readable ticket number
 */
export function generateTicketNumber(ticketId: string): string {
  // Use last 8 characters of UUID for readability
  return ticketId.slice(-8).toUpperCase();
}

/**
 * Formats ticket category for display
 */
export function formatTicketCategory(category: TicketCategory): string {
  const categoryMap: Record<TicketCategory, string> = {
    [TicketCategory.ACCOUNT_ISSUES]: 'Account Issues',
    [TicketCategory.TECHNICAL_SUPPORT]: 'Technical Support',
    [TicketCategory.COMMUNITY_GUIDELINES]: 'Community Guidelines',
    [TicketCategory.FEATURE_REQUEST]: 'Feature Request',
    [TicketCategory.SAFETY_CONCERN]: 'Safety Concern',
    [TicketCategory.OTHER]: 'Other'
  };
  
  return categoryMap[category] || category;
}

/**
 * Formats priority for display
 */
export function formatPriority(priority: Priority): string {
  const priorityMap: Record<Priority, string> = {
    [Priority.LOW]: 'Low',
    [Priority.MEDIUM]: 'Medium',
    [Priority.HIGH]: 'High',
    [Priority.EMERGENCY]: 'Emergency'
  };
  
  return priorityMap[priority] || priority;
}

/**
 * Formats ticket status for display
 */
export function formatTicketStatus(status: TicketStatus): string {
  const statusMap: Record<TicketStatus, string> = {
    [TicketStatus.OPEN]: 'Open',
    [TicketStatus.IN_PROGRESS]: 'In Progress',
    [TicketStatus.WAITING_FOR_USER]: 'Waiting for Response',
    [TicketStatus.RESOLVED]: 'Resolved',
    [TicketStatus.CLOSED]: 'Closed'
  };
  
  return statusMap[status] || status;
}

/**
 * Gets priority color for UI display
 */
export function getPriorityColor(priority: Priority): string {
  const colorMap: Record<Priority, string> = {
    [Priority.LOW]: 'text-green-600 bg-green-50',
    [Priority.MEDIUM]: 'text-yellow-600 bg-yellow-50',
    [Priority.HIGH]: 'text-orange-600 bg-orange-50',
    [Priority.EMERGENCY]: 'text-red-600 bg-red-50'
  };
  
  return colorMap[priority] || 'text-gray-600 bg-gray-50';
}

/**
 * Gets status color for UI display
 */
export function getStatusColor(status: TicketStatus): string {
  const colorMap: Record<TicketStatus, string> = {
    [TicketStatus.OPEN]: 'text-blue-600 bg-blue-50',
    [TicketStatus.IN_PROGRESS]: 'text-purple-600 bg-purple-50',
    [TicketStatus.WAITING_FOR_USER]: 'text-yellow-600 bg-yellow-50',
    [TicketStatus.RESOLVED]: 'text-green-600 bg-green-50',
    [TicketStatus.CLOSED]: 'text-gray-600 bg-gray-50'
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-50';
}

/**
 * Calculates time elapsed since creation
 */
export function getTimeElapsed(createdAt: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${Math.max(1, diffMinutes)} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
}

/**
 * Formats response time expectation
 */
export function formatResponseTime(hours: number): string {
  if (hours < 1) {
    return 'Within 1 hour';
  } else if (hours < 24) {
    return `Within ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(hours / 24);
    return `Within ${days} day${days > 1 ? 's' : ''}`;
  }
}

/**
 * Validates email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Truncates text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Extracts keywords from text for search indexing
 */
export function extractKeywords(text: string): string[] {
  // Remove common stop words and extract meaningful terms
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
    .slice(0, 20); // Limit to 20 keywords
}

/**
 * Calculates reading time for help articles
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Determines if a ticket is overdue based on priority and creation time
 */
export function isTicketOverdue(ticket: SupportTicket): boolean {
  if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
    return false;
  }
  
  const now = new Date();
  const createdAt = new Date(ticket.createdAt);
  const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  const expectedResponseTime = ticket.estimatedResponseTime || 24;
  return hoursElapsed > expectedResponseTime;
}

/**
 * Generates search suggestions based on partial input
 */
export function generateSearchSuggestions(input: string, articles: HelpArticle[]): string[] {
  if (input.length < 2) {
    return [];
  }
  
  const inputLower = input.toLowerCase();
  const suggestions = new Set<string>();
  
  articles.forEach(article => {
    // Check title words
    article.title.toLowerCase().split(' ').forEach(word => {
      if (word.startsWith(inputLower) && word !== inputLower) {
        suggestions.add(word);
      }
    });
    
    // Check tags
    article.tags.forEach(tag => {
      if (tag.toLowerCase().startsWith(inputLower) && tag.toLowerCase() !== inputLower) {
        suggestions.add(tag);
      }
    });
    
    // Check keywords
    article.searchKeywords.forEach(keyword => {
      if (keyword.toLowerCase().startsWith(inputLower) && keyword.toLowerCase() !== inputLower) {
        suggestions.add(keyword);
      }
    });
  });
  
  return Array.from(suggestions).slice(0, 5);
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates file type against allowed types
 */
export function isAllowedFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Generates a slug from text for URLs
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Checks if user has permission to perform action
 */
export function hasPermission(userRole: string, action: string): boolean {
  const permissions: Record<string, string[]> = {
    admin: ['*'], // Admin can do everything
    support_agent: [
      'view_all_tickets',
      'update_tickets',
      'respond_to_tickets',
      'moderate_content',
      'view_reports'
    ],
    moderator: [
      'moderate_content',
      'view_reports',
      'review_reports'
    ],
    user: [
      'create_tickets',
      'view_own_tickets',
      'create_discussions',
      'respond_to_discussions',
      'report_content'
    ]
  };
  
  const userPermissions = permissions[userRole] || permissions.user;
  return userPermissions.includes('*') || userPermissions.includes(action);
}

/**
 * Formats date for display in different contexts
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (format === 'relative') {
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString();
}

/**
 * Debounces function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}