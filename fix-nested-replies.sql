-- Fix for existing post_comments table to add nested reply support
-- Run this if you get "column parent_id does not exist" error

-- First, check if post_comments table exists and add parent_id column if missing
DO $$ 
BEGIN
    -- Add parent_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_comments' 
                   AND column_name = 'parent_id') THEN
        ALTER TABLE public.post_comments 
        ADD COLUMN parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_id);
        
        RAISE NOTICE 'Added parent_id column to post_comments table';
    ELSE
        RAISE NOTICE 'parent_id column already exists in post_comments table';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_comments' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.post_comments 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Added updated_at column to post_comments table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in post_comments table';
    END IF;
END $$;

-- Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.project_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON public.project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON public.project_likes(user_id);

-- Enable Row Level Security
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all post comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can create their own post comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update their own post comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete their own post comments" ON public.post_comments;

DROP POLICY IF EXISTS "Users can view all post likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can create their own post likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can delete their own post likes" ON public.post_likes;

DROP POLICY IF EXISTS "Users can view all project likes" ON public.project_likes;
DROP POLICY IF EXISTS "Users can create their own project likes" ON public.project_likes;
DROP POLICY IF EXISTS "Users can delete their own project likes" ON public.project_likes;

-- Create RLS Policies for post_comments
CREATE POLICY "Users can view all post comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create their own post comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own post comments" ON public.post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own post comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for post_likes
CREATE POLICY "Users can view all post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own post likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own post likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for project_likes
CREATE POLICY "Users can view all project likes" ON public.project_likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own project likes" ON public.project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own project likes" ON public.project_likes FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger for post_comments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_post_comments_updated_at ON public.post_comments;
CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database migration completed successfully!';
    RAISE NOTICE '✅ Nested replies are now supported';
    RAISE NOTICE '✅ Post and project likes are enabled';
    RAISE NOTICE '✅ All RLS policies are in place';
END $$;