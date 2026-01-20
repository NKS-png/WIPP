/**
 * Support Service Factory
 * Provides centralized access to all support system services
 */

import { TicketService } from './TicketService';
import { HelpCenterService } from './HelpCenterService';
import { ModerationService } from './ModerationService';
import { NotificationService } from './NotificationService';

import type {
  TicketService as ITicketService,
  HelpCenterService as IHelpCenterService,
  ModerationService as IModerationService,
  NotificationService as INotificationService
} from '../../types/support';

/**
 * Singleton factory for support services
 */
export class SupportServiceFactory {
  private static instance: SupportServiceFactory;
  
  private _ticketService: ITicketService | null = null;
  private _helpCenterService: IHelpCenterService | null = null;
  private _moderationService: IModerationService | null = null;
  private _notificationService: INotificationService | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Gets the singleton instance
   */
  public static getInstance(): SupportServiceFactory {
    if (!SupportServiceFactory.instance) {
      SupportServiceFactory.instance = new SupportServiceFactory();
    }
    return SupportServiceFactory.instance;
  }

  /**
   * Gets the ticket service instance
   */
  public getTicketService(): ITicketService {
    if (!this._ticketService) {
      this._ticketService = new TicketService();
    }
    return this._ticketService;
  }

  /**
   * Gets the help center service instance
   */
  public getHelpCenterService(): IHelpCenterService {
    if (!this._helpCenterService) {
      this._helpCenterService = new HelpCenterService();
    }
    return this._helpCenterService;
  }

  /**
   * Gets the moderation service instance
   */
  public getModerationService(): IModerationService {
    if (!this._moderationService) {
      this._moderationService = new ModerationService();
    }
    return this._moderationService;
  }

  /**
   * Gets the notification service instance
   */
  public getNotificationService(): INotificationService {
    if (!this._notificationService) {
      this._notificationService = new NotificationService();
    }
    return this._notificationService;
  }

  /**
   * Resets all service instances (useful for testing)
   */
  public reset(): void {
    this._ticketService = null;
    this._helpCenterService = null;
    this._moderationService = null;
    this._notificationService = null;
  }
}

// Convenience exports for easy access
export const supportServices = SupportServiceFactory.getInstance();

export const getTicketService = () => supportServices.getTicketService();
export const getHelpCenterService = () => supportServices.getHelpCenterService();
export const getModerationService = () => supportServices.getModerationService();
export const getNotificationService = () => supportServices.getNotificationService();