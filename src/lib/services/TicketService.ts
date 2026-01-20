/**
 * Ticket Management Service
 * Handles support ticket lifecycle from creation to resolution
 */

import { supabase } from '../supabase';
import type {
  SupportTicket,
  TicketService as ITicketService,
  CreateTicketRequest,
  CreateTicketResponse,
  TicketResponse,
  TicketStatus,
  Priority,
  TicketCategory
} from '../../types/support';

export class TicketService implements ITicketService {
  /**
   * Creates a new support ticket
   */
  async createTicket(userId: string, request: CreateTicketRequest): Promise<CreateTicketResponse> {
    try {
      // Generate unique ticket ID
      const ticketId = crypto.randomUUID();
      
      // Calculate estimated response time based on priority
      const estimatedResponseTime = this.calculateResponseTime(request.priority || Priority.MEDIUM);
      
      // Prepare ticket data
      const ticketData = {
        id: ticketId,
        user_id: userId,
        category: request.category,
        priority: request.priority || Priority.MEDIUM,
        status: TicketStatus.OPEN,
        subject: request.subject,
        description: request.description,
        estimated_response_time: estimatedResponseTime,
        metadata: request.metadata || {}
      };

      // Insert ticket into database
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert(ticketData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create ticket: ${error.message}`);
      }

      // Handle file attachments if provided
      if (request.attachments && request.attachments.length > 0) {
        await this.handleAttachments(ticketId, request.attachments);
      }

      // Send confirmation email (handled by notification service)
      const confirmationSent = await this.sendTicketConfirmation(ticket);

      return {
        ticket: this.mapDatabaseTicket(ticket),
        estimatedResponseTime,
        confirmationSent
      };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  /**
   * Retrieves a specific ticket by ID
   */
  async getTicket(ticketId: string, userId: string): Promise<SupportTicket | null> {
    try {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          ticket_responses(*),
          ticket_attachments(*)
        `)
        .eq('id', ticketId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Ticket not found
        }
        throw new Error(`Failed to retrieve ticket: ${error.message}`);
      }

      return this.mapDatabaseTicket(ticket);
    } catch (error) {
      console.error('Error retrieving ticket:', error);
      throw error;
    }
  }

  /**
   * Retrieves all tickets for a user
   */
  async getUserTickets(userId: string, status?: TicketStatus): Promise<SupportTicket[]> {
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          ticket_responses(*),
          ticket_attachments(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: tickets, error } = await query;

      if (error) {
        throw new Error(`Failed to retrieve user tickets: ${error.message}`);
      }

      return tickets.map(ticket => this.mapDatabaseTicket(ticket));
    } catch (error) {
      console.error('Error retrieving user tickets:', error);
      throw error;
    }
  }

  /**
   * Updates ticket status
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus, agentId?: string): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (agentId) {
        updateData.assigned_agent_id = agentId;
      }

      // Calculate resolution time if ticket is being resolved
      if (status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED) {
        const { data: ticket } = await supabase
          .from('support_tickets')
          .select('created_at')
          .eq('id', ticketId)
          .single();

        if (ticket) {
          const createdAt = new Date(ticket.created_at);
          const now = new Date();
          const resolutionTime = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)); // hours
          updateData.resolution_time = resolutionTime;
        }
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) {
        throw new Error(`Failed to update ticket status: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return false;
    }
  }

  /**
   * Adds a response to a ticket
   */
  async addResponse(ticketId: string, response: Omit<TicketResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<TicketResponse> {
    try {
      const responseData = {
        id: crypto.randomUUID(),
        ticket_id: ticketId,
        author_id: response.authorId,
        author_type: response.authorType,
        content: response.content,
        is_internal: response.isInternal
      };

      const { data: newResponse, error } = await supabase
        .from('ticket_responses')
        .insert(responseData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add response: ${error.message}`);
      }

      // Handle attachments if provided
      if (response.attachments && response.attachments.length > 0) {
        await this.handleResponseAttachments(newResponse.id, response.attachments);
      }

      // Update ticket status if needed
      if (response.authorType === 'agent') {
        await this.updateTicketStatus(ticketId, TicketStatus.WAITING_FOR_USER);
      }

      return this.mapDatabaseResponse(newResponse);
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    }
  }

  /**
   * Assigns ticket to a support agent
   */
  async assignToAgent(ticketId: string, agentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          assigned_agent_id: agentId,
          status: TicketStatus.IN_PROGRESS,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) {
        throw new Error(`Failed to assign ticket: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      return false;
    }
  }

  /**
   * Allows user to rate their support experience
   */
  async rateTicket(ticketId: string, userId: string, rating: number): Promise<boolean> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const { error } = await supabase
        .from('support_tickets')
        .update({
          satisfaction_rating: rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to rate ticket: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error rating ticket:', error);
      return false;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Calculates estimated response time based on priority
   */
  private calculateResponseTime(priority: Priority): number {
    switch (priority) {
      case Priority.EMERGENCY:
        return 1; // 1 hour
      case Priority.HIGH:
        return 4; // 4 hours
      case Priority.MEDIUM:
        return 24; // 24 hours
      case Priority.LOW:
        return 72; // 72 hours
      default:
        return 24;
    }
  }

  /**
   * Handles file attachments for tickets
   */
  private async handleAttachments(ticketId: string, attachments: File[]): Promise<void> {
    // This would integrate with a file storage service (e.g., Supabase Storage)
    // For now, we'll create placeholder attachment records
    const attachmentPromises = attachments.map(async (file) => {
      const attachmentData = {
        id: crypto.randomUUID(),
        ticket_id: ticketId,
        filename: file.name,
        url: `placeholder-url-for-${file.name}`, // Would be actual storage URL
        mime_type: file.type,
        file_size: file.size
      };

      return supabase
        .from('ticket_attachments')
        .insert(attachmentData);
    });

    await Promise.all(attachmentPromises);
  }

  /**
   * Handles file attachments for responses
   */
  private async handleResponseAttachments(responseId: string, attachments: any[]): Promise<void> {
    const attachmentPromises = attachments.map(async (attachment) => {
      const attachmentData = {
        id: crypto.randomUUID(),
        response_id: responseId,
        filename: attachment.filename,
        url: attachment.url,
        mime_type: attachment.mimeType,
        file_size: attachment.size
      };

      return supabase
        .from('ticket_attachments')
        .insert(attachmentData);
    });

    await Promise.all(attachmentPromises);
  }

  /**
   * Sends ticket confirmation email
   */
  private async sendTicketConfirmation(ticket: any): Promise<boolean> {
    try {
      // This would integrate with an email service
      // For now, we'll simulate the confirmation
      console.log(`Sending confirmation email for ticket ${ticket.id}`);
      return true;
    } catch (error) {
      console.error('Error sending confirmation:', error);
      return false;
    }
  }

  /**
   * Maps database ticket to TypeScript interface
   */
  private mapDatabaseTicket(dbTicket: any): SupportTicket {
    return {
      id: dbTicket.id,
      userId: dbTicket.user_id,
      category: dbTicket.category as TicketCategory,
      priority: dbTicket.priority as Priority,
      status: dbTicket.status as TicketStatus,
      subject: dbTicket.subject,
      description: dbTicket.description,
      attachments: (dbTicket.ticket_attachments || []).map(this.mapDatabaseAttachment),
      assignedAgentId: dbTicket.assigned_agent_id,
      createdAt: new Date(dbTicket.created_at),
      updatedAt: new Date(dbTicket.updated_at),
      responses: (dbTicket.ticket_responses || []).map(this.mapDatabaseResponse),
      metadata: dbTicket.metadata || {},
      estimatedResponseTime: dbTicket.estimated_response_time,
      satisfactionRating: dbTicket.satisfaction_rating,
      resolutionTime: dbTicket.resolution_time
    };
  }

  /**
   * Maps database response to TypeScript interface
   */
  private mapDatabaseResponse(dbResponse: any): TicketResponse {
    return {
      id: dbResponse.id,
      ticketId: dbResponse.ticket_id,
      authorId: dbResponse.author_id,
      authorType: dbResponse.author_type,
      content: dbResponse.content,
      attachments: [], // Would be populated from attachments table
      isInternal: dbResponse.is_internal,
      createdAt: new Date(dbResponse.created_at),
      updatedAt: new Date(dbResponse.updated_at)
    };
  }

  /**
   * Maps database attachment to TypeScript interface
   */
  private mapDatabaseAttachment(dbAttachment: any): any {
    return {
      id: dbAttachment.id,
      filename: dbAttachment.filename,
      url: dbAttachment.url,
      mimeType: dbAttachment.mime_type,
      size: dbAttachment.file_size,
      uploadedAt: new Date(dbAttachment.uploaded_at)
    };
  }
}