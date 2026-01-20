-- ============================================================================
-- ARTIST SUPPORT SYSTEM DATABASE SCHEMA
-- ============================================================================
-- This schema creates all necessary tables for the comprehensive artist support system
-- including tickets, help articles, community discussions, moderation, and analytics

-- ============================================================================
-- SUPPORT TICKETS SYSTEM
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
    estimated_response_time INTEGER, -- in hours
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    resolution_time INTEGER, -- in hours
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

-- Ticket attachments
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    response_id UUID REFERENCES public.ticket_responses(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT ticket_or_response_attachment CHECK (
        (ticket_id IS NOT NULL AND response_id IS NULL) OR 
        (ticket_id IS NULL AND response_id IS NOT NULL)
    )
);

-- ============================================================================
-- HELP CENTER SYSTEM
-- ============================================================================

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

-- Help article votes (to track who voted)
CREATE TABLE IF NOT EXISTS public.help_article_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.help_articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, user_id)
);

-- Help article views (for analytics)
CREATE TABLE IF NOT EXISTS public.help_article_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.help_articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    search_query TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COMMUNITY SUPPORT SYSTEM
-- ============================================================================

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

-- Community response votes (helpful marking)
CREATE TABLE IF NOT EXISTS public.community_response_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    response_id UUID NOT NULL REFERENCES public.community_responses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(response_id, user_id)
);

-- ============================================================================
-- RESOURCE LIBRARY SYSTEM
-- ============================================================================

-- Resource library items
CREATE TABLE IF NOT EXISTS public.resource_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    url TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN (
        'tutorial', 'guide', 'tool', 'template', 'video', 'article'
    )),
    skill_level VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (skill_level IN (
        'beginner', 'intermediate', 'advanced'
    )),
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_user_contributed BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource bookmarks
CREATE TABLE IF NOT EXISTS public.resource_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID NOT NULL REFERENCES public.resource_library(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

-- Resource ratings
CREATE TABLE IF NOT EXISTS public.resource_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID NOT NULL REFERENCES public.resource_library(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

-- ============================================================================
-- MODERATION SYSTEM
-- ============================================================================

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

-- ============================================================================
-- ANALYTICS SYSTEM
-- ============================================================================

-- Support analytics snapshots
CREATE TABLE IF NOT EXISTS public.support_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    ticket_volume INTEGER DEFAULT 0,
    average_response_time DECIMAL(10,2) DEFAULT 0,
    resolution_rate DECIMAL(5,2) DEFAULT 0,
    user_satisfaction_score DECIMAL(3,2) DEFAULT 0,
    emergency_tickets INTEGER DEFAULT 0,
    escalated_tickets INTEGER DEFAULT 0,
    category_breakdown JSONB DEFAULT '{}',
    help_center_usage JSONB DEFAULT '{}',
    community_activity JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Support tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON public.support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_agent ON public.support_tickets(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at);

-- Ticket responses indexes
CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket_id ON public.ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_author_id ON public.ticket_responses(author_id);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_created_at ON public.ticket_responses(created_at);

-- Help articles indexes
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON public.help_articles(category);
CREATE INDEX IF NOT EXISTS idx_help_articles_difficulty ON public.help_articles(difficulty);
CREATE INDEX IF NOT EXISTS idx_help_articles_published ON public.help_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_help_articles_featured ON public.help_articles(featured_order) WHERE featured_order IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_help_articles_tags ON public.help_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_help_articles_keywords ON public.help_articles USING GIN(search_keywords);

-- Community discussions indexes
CREATE INDEX IF NOT EXISTS idx_community_discussions_author ON public.community_discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_community_discussions_category ON public.community_discussions(category);
CREATE INDEX IF NOT EXISTS idx_community_discussions_status ON public.community_discussions(status);
CREATE INDEX IF NOT EXISTS idx_community_discussions_last_activity ON public.community_discussions(last_activity);
CREATE INDEX IF NOT EXISTS idx_community_discussions_tags ON public.community_discussions USING GIN(tags);

-- Community responses indexes
CREATE INDEX IF NOT EXISTS idx_community_responses_discussion ON public.community_responses(discussion_id);
CREATE INDEX IF NOT EXISTS idx_community_responses_author ON public.community_responses(author_id);
CREATE INDEX IF NOT EXISTS idx_community_responses_parent ON public.community_responses(parent_response_id);
CREATE INDEX IF NOT EXISTS idx_community_responses_helpful ON public.community_responses(is_helpful);

-- Resource library indexes
CREATE INDEX IF NOT EXISTS idx_resource_library_category ON public.resource_library(category);
CREATE INDEX IF NOT EXISTS idx_resource_library_type ON public.resource_library(type);
CREATE INDEX IF NOT EXISTS idx_resource_library_skill_level ON public.resource_library(skill_level);
CREATE INDEX IF NOT EXISTS idx_resource_library_featured ON public.resource_library(is_featured);
CREATE INDEX IF NOT EXISTS idx_resource_library_tags ON public.resource_library USING GIN(tags);

-- Moderation flags indexes
CREATE INDEX IF NOT EXISTS idx_moderation_flags_content ON public.moderation_flags(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_flags_status ON public.moderation_flags(status);
CREATE INDEX IF NOT EXISTS idx_moderation_flags_reporter ON public.moderation_flags(reporter_id);
CREATE INDEX IF NOT EXISTS idx_moderation_flags_created_at ON public.moderation_flags(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_article_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_response_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_analytics ENABLE ROW LEVEL SECURITY;

-- Support tickets policies
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON public.support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- Agents can view and update all tickets (implement agent role check in application)
CREATE POLICY "Support agents can manage all tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'support_agent')
        )
    );

-- Ticket responses policies
CREATE POLICY "Users can view responses to their tickets" ON public.ticket_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE id = ticket_id AND user_id = auth.uid()
        )
        OR auth.uid() = author_id
    );

CREATE POLICY "Users can create responses to their tickets" ON public.ticket_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE id = ticket_id AND user_id = auth.uid()
        )
        OR auth.uid() = author_id
    );

-- Help articles policies (public read access)
CREATE POLICY "Anyone can view published help articles" ON public.help_articles
    FOR SELECT USING (is_published = true);

CREATE POLICY "Authors can manage their articles" ON public.help_articles
    FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all articles" ON public.help_articles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Community discussions policies (public read access)
CREATE POLICY "Anyone can view community discussions" ON public.community_discussions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create discussions" ON public.community_discussions
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their discussions" ON public.community_discussions
    FOR UPDATE USING (auth.uid() = author_id);

-- Community responses policies
CREATE POLICY "Anyone can view approved community responses" ON public.community_responses
    FOR SELECT USING (moderation_status = 'approved');

CREATE POLICY "Authenticated users can create responses" ON public.community_responses
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their responses" ON public.community_responses
    FOR UPDATE USING (auth.uid() = author_id);

-- Resource library policies (public read access)
CREATE POLICY "Anyone can view approved resources" ON public.resource_library
    FOR SELECT USING (approved_at IS NOT NULL OR NOT is_user_contributed);

CREATE POLICY "Authors can manage their resources" ON public.resource_library
    FOR ALL USING (auth.uid() = author_id);

-- Moderation flags policies
CREATE POLICY "Users can view their own reports" ON public.moderation_flags
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON public.moderation_flags
    FOR INSERT WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);

CREATE POLICY "Moderators can manage all reports" ON public.moderation_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'moderator' OR role = 'support_agent')
        )
    );

-- Analytics policies (admin only)
CREATE POLICY "Admins can view analytics" ON public.support_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_support_tickets_updated_at 
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_responses_updated_at 
    BEFORE UPDATE ON public.ticket_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_articles_updated_at 
    BEFORE UPDATE ON public.help_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_responses_updated_at 
    BEFORE UPDATE ON public.community_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_library_updated_at 
    BEFORE UPDATE ON public.resource_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update last_activity for discussions when responses are added
CREATE OR REPLACE FUNCTION update_discussion_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.community_discussions 
    SET last_activity = NOW() 
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_discussion_activity 
    AFTER INSERT ON public.community_responses
    FOR EACH ROW EXECUTE FUNCTION update_discussion_last_activity();

-- Update helpful votes count
CREATE OR REPLACE FUNCTION update_helpful_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_responses 
        SET helpful_votes = helpful_votes + 1 
        WHERE id = NEW.response_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_responses 
        SET helpful_votes = helpful_votes - 1 
        WHERE id = OLD.response_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_response_helpful_votes 
    AFTER INSERT OR DELETE ON public.community_response_votes
    FOR EACH ROW EXECUTE FUNCTION update_helpful_votes_count();

-- Update article helpful votes
CREATE OR REPLACE FUNCTION update_article_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_helpful THEN
            UPDATE public.help_articles 
            SET helpful_votes = helpful_votes + 1 
            WHERE id = NEW.article_id;
        ELSE
            UPDATE public.help_articles 
            SET unhelpful_votes = unhelpful_votes + 1 
            WHERE id = NEW.article_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.is_helpful THEN
            UPDATE public.help_articles 
            SET helpful_votes = helpful_votes - 1 
            WHERE id = OLD.article_id;
        ELSE
            UPDATE public.help_articles 
            SET unhelpful_votes = unhelpful_votes - 1 
            WHERE id = OLD.article_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle vote changes
        IF OLD.is_helpful AND NOT NEW.is_helpful THEN
            UPDATE public.help_articles 
            SET helpful_votes = helpful_votes - 1, unhelpful_votes = unhelpful_votes + 1 
            WHERE id = NEW.article_id;
        ELSIF NOT OLD.is_helpful AND NEW.is_helpful THEN
            UPDATE public.help_articles 
            SET helpful_votes = helpful_votes + 1, unhelpful_votes = unhelpful_votes - 1 
            WHERE id = NEW.article_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_article_votes 
    AFTER INSERT OR UPDATE OR DELETE ON public.help_article_votes
    FOR EACH ROW EXECUTE FUNCTION update_article_votes_count();

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Insert default help article categories
INSERT INTO public.help_articles (
    title, content, category, difficulty, author_id, is_published, featured_order
) VALUES 
(
    'Getting Started with WIPP',
    'Welcome to WIPP! This guide will help you get started with sharing your creative work and connecting with other artists.',
    'Getting Started',
    'beginner',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    true,
    1
),
(
    'Community Guidelines',
    'Learn about our community guidelines and how to create a supportive environment for all artists.',
    'Community',
    'beginner',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    true,
    2
),
(
    'Privacy and Safety',
    'Understanding your privacy settings and safety features on WIPP.',
    'Account & Privacy',
    'beginner',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    true,
    3
)
ON CONFLICT DO NOTHING;

-- Create default resource library categories
INSERT INTO public.resource_library (
    title, description, type, category, skill_level, author_id, is_featured
) VALUES 
(
    'Digital Art Basics',
    'Essential techniques and tools for digital artists starting their journey.',
    'guide',
    'Digital Art',
    'beginner',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    true
),
(
    'Giving Constructive Feedback',
    'Learn how to provide helpful, constructive feedback that supports other artists.',
    'tutorial',
    'Community',
    'intermediate',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    true
)
ON CONFLICT DO NOTHING;