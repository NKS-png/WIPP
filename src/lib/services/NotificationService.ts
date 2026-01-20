/**
 * Notification Service
 * Handles email notifications and other communication for the support system
 */

import { supabase } from '../supabase';
import type {
  NotificationService as INotificationService,
  SupportTicket,
  TicketResponse,
  ModerationFlag
} from '../../types/support';

export class NotificationService implements INotificationService {
  private readonly emailServiceUrl: string;
  private readonly fromEmail: string;
  private readonly supportEmail: string;

  constructor() {
    // These would typically come from environment variables
    this.emailServiceUrl = import.meta.env.EMAIL_SERVICE_URL || 'https://api.emailservice.com';
    this.fromEmail = import.meta.env.SUPPORT_FROM_EMAIL || 'support@wipp.com';
    this.supportEmail = import.meta.env.SUPPORT_EMAIL || 'support@wipp.com';
  }

  /**
   * Sends ticket confirmation email to user
   */
  async sendTicketConfirmation(ticket: SupportTicket): Promise<boolean> {
    try {
      // Get user email from profile
      const userEmail = await this.getUserEmail(ticket.userId);
      if (!userEmail) {
        console.error('User email not found for ticket confirmation');
        return false;
      }

      const emailData = {
        to: userEmail,
        from: this.fromEmail,
        subject: `Support Ticket Created - #${ticket.id.slice(-8)}`,
        template: 'ticket-confirmation',
        data: {
          ticketId: ticket.id,
          ticketNumber: ticket.id.slice(-8),
          subject: ticket.subject,
          category: this.formatCategory(ticket.category),
          priority: this.formatPriority(ticket.priority),
          estimatedResponseTime: ticket.estimatedResponseTime,
          supportEmail: this.supportEmail,
          ticketUrl: `${import.meta.env.PUBLIC_SITE_URL}/support/tickets/${ticket.id}`
        }
      };

      const success = await this.sendEmail(emailData);
      
      if (success) {
        await this.logNotification(ticket.userId, 'ticket_confirmation', ticket.id);
      }

      return success;
    } catch (error) {
      console.error('Error sending ticket confirmation:', error);
      return false;
    }
  }

  /**
   * Sends ticket update notification when agent responds
   */
  async sendTicketUpdate(ticket: SupportTicket, response: TicketResponse): Promise<boolean> {
    try {
      // Only send notifications for agent responses, not user responses
      if (response.authorType === 'user') {
        return true;
      }

      const userEmail = await this.getUserEmail(ticket.userId);
      if (!userEmail) {
        console.error('User email not found for ticket update');
        return false;
      }

      // Get agent name
      const agentName = await this.getAgentName(response.authorId);

      const emailData = {
        to: userEmail,
        from: this.fromEmail,
        subject: `Support Ticket Update - #${ticket.id.slice(-8)}`,
        template: 'ticket-update',
        data: {
          ticketId: ticket.id,
          ticketNumber: ticket.id.slice(-8),
          subject: ticket.subject,
          agentName: agentName || 'Support Team',
          responseContent: this.truncateContent(response.content, 200),
          status: this.formatStatus(ticket.status),
          ticketUrl: `${import.meta.env.PUBLIC_SITE_URL}/support/tickets/${ticket.id}`,
          supportEmail: this.supportEmail
        }
      };

      const success = await this.sendEmail(emailData);
      
      if (success) {
        await this.logNotification(ticket.userId, 'ticket_update', ticket.id);
      }

      return success;
    } catch (error) {
      console.error('Error sending ticket update:', error);
      return false;
    }
  }

  /**
   * Sends report acknowledgment to user
   */
  async sendReportAcknowledgment(report: ModerationFlag): Promise<boolean> {
    try {
      // Don't send emails for anonymous reports
      if (!report.reporterId) {
        return true;
      }

      const userEmail = await this.getUserEmail(report.reporterId);
      if (!userEmail) {
        console.error('User email not found for report acknowledgment');
        return false;
      }

      const emailData = {
        to: userEmail,
        from: this.fromEmail,
        subject: 'Report Received - We\'re Looking Into It',
        template: 'report-acknowledgment',
        data: {
          reportId: report.id,
          reason: this.formatReportReason(report.reason),
          estimatedReviewTime: this.calculateReviewTime(report.reason),
          supportEmail: this.supportEmail,
          communityGuidelinesUrl: `${import.meta.env.PUBLIC_SITE_URL}/community-guidelines`
        }
      };

      const success = await this.sendEmail(emailData);
      
      if (success) {
        await this.logNotification(report.reporterId, 'report_acknowledgment', report.id);
      }

      return success;
    } catch (error) {
      console.error('Error sending report acknowledgment:', error);
      return false;
    }
  }

  /**
   * Sends community guidelines update notification
   */
  async sendCommunityGuidelinesUpdate(userId?: string): Promise<boolean> {
    try {
      let recipients: string[] = [];

      if (userId) {
        // Send to specific user
        const userEmail = await this.getUserEmail(userId);
        if (userEmail) {
          recipients = [userEmail];
        }
      } else {
        // Send to all users (would typically be done in batches)
        recipients = await this.getAllUserEmails();
      }

      if (recipients.length === 0) {
        return false;
      }

      const emailPromises = recipients.map(email => {
        const emailData = {
          to: email,
          from: this.fromEmail,
          subject: 'Community Guidelines Updated',
          template: 'guidelines-update',
          data: {
            guidelinesUrl: `${import.meta.env.PUBLIC_SITE_URL}/community-guidelines`,
            supportUrl: `${import.meta.env.PUBLIC_SITE_URL}/support`,
            supportEmail: this.supportEmail
          }
        };

        return this.sendEmail(emailData);
      });

      const results = await Promise.allSettled(emailPromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;

      // Log bulk notification
      await this.logBulkNotification('guidelines_update', recipients.length, successCount);

      return successCount > 0;
    } catch (error) {
      console.error('Error sending guidelines update:', error);
      return false;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Sends email using configured email service
   */
  private async sendEmail(emailData: any): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with an email service
      // like SendGrid, Mailgun, AWS SES, etc.
      
      // For now, we'll simulate email sending and log the attempt
      console.log('Sending email:', {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template
      });

      // Simulate API call to email service
      const response = await fetch(this.emailServiceUrl + '/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.EMAIL_API_KEY}`
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        console.error('Email service error:', response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      // If email service is not available, log but don't fail the operation
      console.error('Email service unavailable:', error);
      
      // In development, we might want to log the email content
      if (import.meta.env.DEV) {
        console.log('Email content (dev mode):', emailData);
      }
      
      return false;
    }
  }

  /**
   * Gets user email from profile
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return null;
      }

      return profile.email;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }

  /**
   * Gets agent name from profile
   */
  private async getAgentName(agentId: string): Promise<string | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', agentId)
        .single();

      if (error || !profile) {
        return null;
      }

      return profile.full_name || profile.username || 'Support Agent';
    } catch (error) {
      console.error('Error getting agent name:', error);
      return null;
    }
  }

  /**
   * Gets all user emails for bulk notifications
   */
  private async getAllUserEmails(): Promise<string[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('email')
        .not('email', 'is', null);

      if (error || !profiles) {
        return [];
      }

      return profiles.map(profile => profile.email).filter(Boolean);
    } catch (error) {
      console.error('Error getting all user emails:', error);
      return [];
    }
  }

  /**
   * Logs notification for analytics
   */
  private async logNotification(userId: string, type: string, relatedId: string): Promise<void> {
    try {
      // This would typically go to a notifications log table
      console.log(`Notification logged: ${type} sent to ${userId} for ${relatedId}`);
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Logs bulk notification for analytics
   */
  private async logBulkNotification(type: string, totalRecipients: number, successCount: number): Promise<void> {
    try {
      console.log(`Bulk notification logged: ${type} sent to ${successCount}/${totalRecipients} recipients`);
    } catch (error) {
      console.error('Error logging bulk notification:', error);
    }
  }

  /**
   * Formats ticket category for display
   */
  private formatCategory(category: string): string {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Formats ticket priority for display
   */
  private formatPriority(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  /**
   * Formats ticket status for display
   */
  private formatStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Formats report reason for display
   */
  private formatReportReason(reason: string): string {
    return reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Calculates estimated review time for reports
   */
  private calculateReviewTime(reason: string): string {
    const emergencyReasons = ['harassment', 'threats', 'safety_concern'];
    
    if (emergencyReasons.some(emergency => reason.toLowerCase().includes(emergency))) {
      return '1 hour';
    }

    const reviewTimes: Record<string, string> = {
      'spam': '4 hours',
      'inappropriate_content': '8 hours',
      'copyright': '24 hours',
      'misinformation': '12 hours'
    };

    return reviewTimes[reason] || '24 hours';
  }

  /**
   * Truncates content for email previews
   */
  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }

    return content.substring(0, maxLength).trim() + '...';
  }
}