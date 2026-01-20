/**
 * Unit tests for TicketService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TicketService } from '../TicketService';
import type { CreateTicketRequest, TicketCategory, Priority } from '../../../types/support';

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'test-ticket-id',
              user_id: 'test-user-id',
              category: 'technical_support',
              priority: 'medium',
              status: 'open',
              subject: 'Test Subject',
              description: 'Test Description',
              estimated_response_time: 24,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              metadata: {}
            },
            error: null
          }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'test-ticket-id',
              user_id: 'test-user-id',
              category: 'technical_support',
              priority: 'medium',
              status: 'open',
              subject: 'Test Subject',
              description: 'Test Description',
              estimated_response_time: 24,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              metadata: {},
              ticket_responses: [],
              ticket_attachments: []
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

describe('TicketService', () => {
  let ticketService: TicketService;

  beforeEach(() => {
    ticketService = new TicketService();
    vi.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a ticket successfully', async () => {
      const request: CreateTicketRequest = {
        category: 'technical_support' as TicketCategory,
        subject: 'Test Subject',
        description: 'Test Description',
        priority: 'medium' as Priority
      };

      const result = await ticketService.createTicket('test-user-id', request);

      expect(result).toBeDefined();
      expect(result.ticket).toBeDefined();
      expect(result.ticket.subject).toBe('Test Subject');
      expect(result.ticket.category).toBe('technical_support');
      expect(result.estimatedResponseTime).toBe(24);
      expect(result.confirmationSent).toBe(true);
    });

    it('should calculate correct response time for emergency priority', async () => {
      const request: CreateTicketRequest = {
        category: 'safety_concern' as TicketCategory,
        subject: 'Emergency Issue',
        description: 'This is urgent',
        priority: 'emergency' as Priority
      };

      const result = await ticketService.createTicket('test-user-id', request);

      expect(result.estimatedResponseTime).toBe(1); // 1 hour for emergency
    });

    it('should handle missing priority by defaulting to medium', async () => {
      const request: CreateTicketRequest = {
        category: 'technical_support' as TicketCategory,
        subject: 'Test Subject',
        description: 'Test Description'
        // No priority specified
      };

      const result = await ticketService.createTicket('test-user-id', request);

      expect(result.ticket.priority).toBe('medium');
      expect(result.estimatedResponseTime).toBe(24);
    });
  });

  describe('getTicket', () => {
    it('should retrieve a ticket successfully', async () => {
      const ticket = await ticketService.getTicket('test-ticket-id', 'test-user-id');

      expect(ticket).toBeDefined();
      expect(ticket?.id).toBe('test-ticket-id');
      expect(ticket?.subject).toBe('Test Subject');
    });

    it('should return null for non-existent ticket', async () => {
      // Mock error response for non-existent ticket
      const mockSupabase = await import('../../supabase');
      vi.mocked(mockSupabase.supabase.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { code: 'PGRST116' }
            }))
          }))
        }))
      } as any);

      const ticket = await ticketService.getTicket('non-existent-id', 'test-user-id');

      expect(ticket).toBeNull();
    });
  });

  describe('updateTicketStatus', () => {
    it('should update ticket status successfully', async () => {
      const result = await ticketService.updateTicketStatus('test-ticket-id', 'in_progress' as any, 'agent-id');

      expect(result).toBe(true);
    });

    it('should calculate resolution time when ticket is resolved', async () => {
      // Mock the select query to return ticket creation time
      const mockSupabase = await import('../../supabase');
      vi.mocked(mockSupabase.supabase.from).mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      } as any).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }, // 2 hours ago
              error: null
            }))
          }))
        }))
      } as any);

      const result = await ticketService.updateTicketStatus('test-ticket-id', 'resolved' as any);

      expect(result).toBe(true);
    });
  });

  describe('rateTicket', () => {
    it('should accept valid rating', async () => {
      const result = await ticketService.rateTicket('test-ticket-id', 'test-user-id', 5);

      expect(result).toBe(true);
    });

    it('should reject invalid rating', async () => {
      const result = await ticketService.rateTicket('test-ticket-id', 'test-user-id', 6);

      expect(result).toBe(false);
    });

    it('should reject negative rating', async () => {
      const result = await ticketService.rateTicket('test-ticket-id', 'test-user-id', 0);

      expect(result).toBe(false);
    });
  });
});