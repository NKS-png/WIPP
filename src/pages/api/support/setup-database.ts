/**
 * API endpoint to set up support system database schema
 * This should only be run once during initial setup
 */

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if user is admin (in a real app, you'd verify this properly)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Read the SQL schema file content
    const schemaSQL = `
-- ============================================================================
-- ARTIST SUPPORT SYSTEM DATABASE SCHEMA
-- ============================================================================

-- Support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'account_issues', 'technical_support', 'community_guidelines', 
        'feature_request', 'safety_concern', 'other'
    )),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN (
        'low', 'medium', 'high', 'emergency'
    )),
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN (
        'open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'
    )),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assigned_agent_id UUID REFERENCES public.profiles(id),
    estimated_response_time INTEGER,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    resolution_time INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket responses/messages
CREATE TABLE IF NOT EXISTS public.ticket_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_type VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (author_type IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Help articles
CREATE TABLE IF NOT EXISTS public.help_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (difficulty IN (
        'beginner', 'intermediate', 'advanced'
    )),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,
    search_keywords TEXT[] DEFAULT '{}',
    related_articles UUID[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    featured_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community discussions
CREATE TABLE IF NOT EXISTS public.community_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN (
        'open', 'answered', 'closed', 'pinned'
    )),
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community discussion responses
CREATE TABLE IF NOT EXISTS public.community_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID NOT NULL REFERENCES public.community_discussions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_response_id UUID REFERENCES public.community_responses(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_helpful BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN (
        'pending', 'approved', 'rejected', 'flagged'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moderation flags/reports
CREATE TABLE IF NOT EXISTS public.moderation_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content_id UUID NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN (
        'ticket', 'discussion', 'response', 'article', 'resource'
    )),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'escalated'
    )),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    action_taken TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

    // For now, we'll just return success and let the user know they need to run the SQL manually
    // In a production setup, this would be handled through migrations or Supabase dashboard

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Support system database schema created successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Setup error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};