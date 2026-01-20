/**
 * Moderation Service
 * Handles content reporting, moderation workflows, and safety enforcement
 */

import { supabase } from '../supabase';
import type {
  ModerationService as IModerationService,
  ModerationFlag,
  ReportContentRequest,
  ReportContentResponse,
  ModerationStatus,
  AnalyticsPeriod
} from '../../types/support';

export class ModerationService implements IModerationService {
  /**
   * Reports content for moderation review
   */
  async reportContent(userId: string, request: ReportContentRequest): Promise<ReportContentResponse> {
    try {
      const reportId = crypto.randomUUID();
      
      // Determine if this is an emergency report
      const isEmergency = this.isEmergencyReport(request.reason);
      
      const reportData = {
        id: reportId,
        reporter_id: request.isAnonymous ? null : userId,
        content_id: request.contentId,
        content_type: request.contentType,
        reason: request.reason,
        description: request.description,
        status: ModerationStatus.PENDING,
        is_anonymous: request.isAnonymous || false
      };

      const { error } = await supabase
        .from('moderation_flags')
        .insert(reportData);

      if (error) {
        throw new Error(`Failed to create report: ${error.message}`);
      }

      // Calculate estimated review time based on report type
      const estimatedReviewTime = this.calculateReviewTime(request.reason, isEmergency);

      // Send acknowledgment notification
      await this.sendReportAcknowledgment(reportId, userId, isEmergency);

      // If emergency, flag for immediate attention
      if (isEmergency) {
        await this.flagForEmergencyReview(reportId);
      }

      return {
        reportId,
        acknowledged: true,
        estimatedReviewTime
      };
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  }

  /**
   * Retrieves moderation reports for review
   */
  async getReports(status?: ModerationStatus): Promise<ModerationFlag[]> {
    try {
      let query = supabase
        .from('moderation_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: reports, error } = await query;

      if (error) {
        throw new Error(`Failed to retrieve reports: ${error.message}`);
      }

      return reports.map(report => this.mapDatabaseReport(report));
    } catch (error) {
      console.error('Error retrieving reports:', error);
      throw error;
    }
  }

  /**
   * Reviews and takes action on a moderation report
   */
  async reviewReport(reportId: string, moderatorId: string, action: string, notes?: string): Promise<boolean> {
    try {
      // Update report status
      const { error: updateError } = await supabase
        .from('moderation_flags')
        .update({
          status: this.getStatusFromAction(action),
          reviewed_by: moderatorId,
          reviewed_at: new Date().toISOString(),
          action_taken: action
        })
        .eq('id', reportId);

      if (updateError) {
        throw new Error(`Failed to update report: ${updateError.message}`);
      }

      // Apply moderation action to the reported content
      await this.applyModerationAction(reportId, action, moderatorId);

      // Log the moderation action for analytics
      await this.logModerationAction(reportId, moderatorId, action, notes);

      return true;
    } catch (error) {
      console.error('Error reviewing report:', error);
      return false;
    }
  }

  /**
   * Escalates a report to higher-level moderation
   */
  async escalateReport(reportId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('moderation_flags')
        .update({
          status: 'escalated' as ModerationStatus,
          action_taken: `Escalated: ${reason}`,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) {
        throw new Error(`Failed to escalate report: ${error.message}`);
      }

      // Notify administrators about escalation
      await this.notifyAdministrators(reportId, reason);

      return true;
    } catch (error) {
      console.error('Error escalating report:', error);
      return false;
    }
  }

  /**
   * Generates moderation activity report
   */
  async generateModerationReport(period: AnalyticsPeriod): Promise<any> {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);

      // Get report statistics
      const { data: reportStats } = await supabase
        .from('moderation_flags')
        .select('status, reason, content_type, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (!reportStats) {
        return this.getEmptyModerationReport(period, startDate, endDate);
      }

      // Calculate metrics
      const totalReports = reportStats.length;
      const reportsByStatus = this.groupByField(reportStats, 'status');
      const reportsByReason = this.groupByField(reportStats, 'reason');
      const reportsByContentType = this.groupByField(reportStats, 'content_type');

      // Calculate average response time
      const resolvedReports = reportStats.filter(r => 
        r.status === 'approved' || r.status === 'rejected'
      );
      const averageResponseTime = this.calculateAverageResponseTime(resolvedReports);

      return {
        period,
        startDate,
        endDate,
        totalReports,
        reportsByStatus,
        reportsByReason,
        reportsByContentType,
        averageResponseTime,
        resolutionRate: resolvedReports.length / totalReports,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating moderation report:', error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Determines if a report is emergency-level
   */
  private isEmergencyReport(reason: string): boolean {
    const emergencyReasons = [
      'harassment',
      'threats',
      'doxxing',
      'self-harm',
      'illegal_content',
      'safety_concern'
    ];
    return emergencyReasons.some(emergency => 
      reason.toLowerCase().includes(emergency)
    );
  }

  /**
   * Calculates estimated review time based on report type
   */
  private calculateReviewTime(reason: string, isEmergency: boolean): number {
    if (isEmergency) {
      return 1; // 1 hour for emergency reports
    }

    // Standard review times based on reason
    const reviewTimes: Record<string, number> = {
      'spam': 4,
      'inappropriate_content': 8,
      'copyright': 24,
      'misinformation': 12,
      'other': 24
    };

    return reviewTimes[reason] || 24; // Default 24 hours
  }

  /**
   * Sends acknowledgment notification for report
   */
  private async sendReportAcknowledgment(reportId: string, userId: string, isEmergency: boolean): Promise<void> {
    try {
      // This would integrate with the notification service
      console.log(`Sending report acknowledgment for ${reportId} to user ${userId}`);
      
      if (isEmergency) {
        console.log('Emergency report flagged for immediate attention');
      }
    } catch (error) {
      console.error('Error sending report acknowledgment:', error);
    }
  }

  /**
   * Flags report for emergency review
   */
  private async flagForEmergencyReview(reportId: string): Promise<void> {
    try {
      // Update report priority and notify emergency response team
      await supabase
        .from('moderation_flags')
        .update({
          status: 'escalated' as ModerationStatus,
          action_taken: 'Flagged for emergency review'
        })
        .eq('id', reportId);

      // Notify emergency response team
      console.log(`Emergency report ${reportId} flagged for immediate review`);
    } catch (error) {
      console.error('Error flagging for emergency review:', error);
    }
  }

  /**
   * Gets moderation status from action
   */
  private getStatusFromAction(action: string): ModerationStatus {
    switch (action.toLowerCase()) {
      case 'approve':
      case 'no_action':
        return ModerationStatus.APPROVED;
      case 'remove':
      case 'hide':
      case 'delete':
        return ModerationStatus.REJECTED;
      case 'escalate':
        return 'escalated' as ModerationStatus;
      default:
        return ModerationStatus.PENDING;
    }
  }

  /**
   * Applies moderation action to reported content
   */
  private async applyModerationAction(reportId: string, action: string, moderatorId: string): Promise<void> {
    try {
      // Get report details
      const { data: report } = await supabase
        .from('moderation_flags')
        .select('content_id, content_type')
        .eq('id', reportId)
        .single();

      if (!report) {
        return;
      }

      // Apply action based on content type
      switch (report.content_type) {
        case 'discussion':
          await this.moderateDiscussion(report.content_id, action);
          break;
        case 'response':
          await this.moderateResponse(report.content_id, action);
          break;
        case 'article':
          await this.moderateArticle(report.content_id, action);
          break;
        case 'ticket':
          await this.moderateTicket(report.content_id, action);
          break;
      }
    } catch (error) {
      console.error('Error applying moderation action:', error);
    }
  }

  /**
   * Moderates a community discussion
   */
  private async moderateDiscussion(discussionId: string, action: string): Promise<void> {
    const updates: any = {};

    switch (action.toLowerCase()) {
      case 'remove':
      case 'hide':
        updates.status = 'closed';
        break;
      case 'lock':
        updates.is_locked = true;
        break;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('community_discussions')
        .update(updates)
        .eq('id', discussionId);
    }
  }

  /**
   * Moderates a community response
   */
  private async moderateResponse(responseId: string, action: string): Promise<void> {
    const updates: any = {};

    switch (action.toLowerCase()) {
      case 'remove':
      case 'hide':
        updates.moderation_status = 'rejected';
        break;
      case 'approve':
        updates.moderation_status = 'approved';
        break;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('community_responses')
        .update(updates)
        .eq('id', responseId);
    }
  }

  /**
   * Moderates a help article
   */
  private async moderateArticle(articleId: string, action: string): Promise<void> {
    const updates: any = {};

    switch (action.toLowerCase()) {
      case 'remove':
      case 'unpublish':
        updates.is_published = false;
        break;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('help_articles')
        .update(updates)
        .eq('id', articleId);
    }
  }

  /**
   * Moderates a support ticket
   */
  private async moderateTicket(ticketId: string, action: string): Promise<void> {
    // Tickets typically aren't moderated in the same way
    // This might involve flagging for admin review or closing
    console.log(`Moderating ticket ${ticketId} with action: ${action}`);
  }

  /**
   * Logs moderation action for analytics
   */
  private async logModerationAction(reportId: string, moderatorId: string, action: string, notes?: string): Promise<void> {
    try {
      // This would typically go to an audit log table
      console.log(`Moderation action logged: ${reportId} - ${action} by ${moderatorId}`);
      if (notes) {
        console.log(`Notes: ${notes}`);
      }
    } catch (error) {
      console.error('Error logging moderation action:', error);
    }
  }

  /**
   * Notifies administrators about escalated reports
   */
  private async notifyAdministrators(reportId: string, reason: string): Promise<void> {
    try {
      // This would integrate with notification service to alert admins
      console.log(`Notifying administrators about escalated report ${reportId}: ${reason}`);
    } catch (error) {
      console.error('Error notifying administrators:', error);
    }
  }

  /**
   * Gets date range for analytics period
   */
  private getPeriodDates(period: AnalyticsPeriod): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case AnalyticsPeriod.DAILY:
        startDate.setDate(endDate.getDate() - 1);
        break;
      case AnalyticsPeriod.WEEKLY:
        startDate.setDate(endDate.getDate() - 7);
        break;
      case AnalyticsPeriod.MONTHLY:
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case AnalyticsPeriod.QUARTERLY:
        startDate.setMonth(endDate.getMonth() - 3);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Groups array by field value
   */
  private groupByField(items: any[], field: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = item[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Calculates average response time for resolved reports
   */
  private calculateAverageResponseTime(resolvedReports: any[]): number {
    if (resolvedReports.length === 0) {
      return 0;
    }

    const totalTime = resolvedReports.reduce((sum, report) => {
      const created = new Date(report.created_at);
      const resolved = new Date(report.reviewed_at || report.created_at);
      return sum + (resolved.getTime() - created.getTime());
    }, 0);

    return Math.round(totalTime / resolvedReports.length / (1000 * 60 * 60)); // Convert to hours
  }

  /**
   * Returns empty moderation report structure
   */
  private getEmptyModerationReport(period: AnalyticsPeriod, startDate: Date, endDate: Date): any {
    return {
      period,
      startDate,
      endDate,
      totalReports: 0,
      reportsByStatus: {},
      reportsByReason: {},
      reportsByContentType: {},
      averageResponseTime: 0,
      resolutionRate: 0,
      generatedAt: new Date()
    };
  }

  /**
   * Maps database report to TypeScript interface
   */
  private mapDatabaseReport(dbReport: any): ModerationFlag {
    return {
      id: dbReport.id,
      reporterId: dbReport.reporter_id,
      reason: dbReport.reason,
      description: dbReport.description,
      createdAt: new Date(dbReport.created_at),
      status: dbReport.status as ModerationStatus,
      reviewedBy: dbReport.reviewed_by,
      reviewedAt: dbReport.reviewed_at ? new Date(dbReport.reviewed_at) : undefined,
      action: dbReport.action_taken
    };
  }
}