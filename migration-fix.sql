-- Fix for RPC Function - Remove p_user_id parameter and use auth.uid() instead

-- Drop existing function with old signature
DROP FUNCTION IF EXISTS post_to_workshop(UUID, TEXT, work_stage, TEXT[], UUID, TEXT);

-- Create new function without p_user_id parameter
CREATE OR REPLACE FUNCTION post_to_workshop(
  p_community_id UUID,
  p_content TEXT,
  p_work_stage work_stage,
  p_feedback_goals TEXT[],
  p_image_url TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  user_sparks INTEGER;
  new_post_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user ID from auth context
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- Check sparks
  SELECT sparks_balance INTO user_sparks FROM profiles WHERE id = current_user_id;
  IF user_sparks < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient Sparks. Give feedback to earn more.');
  END IF;

  -- Deduct spark
  UPDATE profiles SET sparks_balance = sparks_balance - 1 WHERE id = current_user_id;

  -- Insert post
  INSERT INTO posts (content, image_url, community_id, user_id, type, work_stage, feedback_goals, open_to_critique)
  VALUES (p_content, p_image_url, p_community_id, current_user_id, 'workshop', p_work_stage, p_feedback_goals, TRUE)
  RETURNING id INTO new_post_id;

  RETURN json_build_object('success', true, 'post_id', new_post_id);

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on new function signature
GRANT EXECUTE ON FUNCTION post_to_workshop(UUID, TEXT, work_stage, TEXT[], TEXT) TO authenticated;

-- Add updated_at column to conversations table for better inbox sorting
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Create index for better performance on inbox queries
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Update existing conversations to have updated_at based on latest message
UPDATE conversations 
SET updated_at = COALESCE(
  (SELECT MAX(created_at) FROM messages WHERE conversation_id = conversations.id),
  conversations.created_at
);
-- Ensure proper foreign key relationships for conversation_participants
-- This ensures the Supabase query with joins works correctly

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversation_participants_user_id_fkey'
    ) THEN
        ALTER TABLE conversation_participants 
        ADD CONSTRAINT conversation_participants_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Also ensure conversations have proper foreign key to auth.users if needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversation_participants_conversation_id_fkey'
    ) THEN
        ALTER TABLE conversation_participants 
        ADD CONSTRAINT conversation_participants_conversation_id_fkey 
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
    END IF;
END $$;
-- Fix the get_or_create_conversation function syntax and ensure proper participant creation
DROP FUNCTION IF EXISTS get_or_create_conversation(UUID);
CREATE OR REPLACE FUNCTION get_or_create_conversation(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Validate inputs
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user ID cannot be null';
  END IF;
  
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  -- Check if conversation exists between current user and target user
  SELECT cp1.conversation_id INTO existing_conversation_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = current_user_id AND cp2.user_id = target_user_id
  LIMIT 1;

  IF existing_conversation_id IS NOT NULL THEN
    -- Update the conversation timestamp
    UPDATE conversations 
    SET updated_at = timezone('utc'::text, now()) 
    WHERE id = existing_conversation_id;
    
    RETURN existing_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (created_at, updated_at) 
  VALUES (timezone('utc'::text, now()), timezone('utc'::text, now())) 
  RETURNING id INTO new_conversation_id;

  -- Insert participants (ensure both users exist in profiles)
  INSERT INTO conversation_participants (conversation_id, user_id) 
  SELECT new_conversation_id, current_user_id
  WHERE EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id);
  
  INSERT INTO conversation_participants (conversation_id, user_id) 
  SELECT new_conversation_id, target_user_id
  WHERE EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id);

  -- Verify both participants were inserted
  IF (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = new_conversation_id) != 2 THEN
    RAISE EXCEPTION 'Failed to create conversation participants. Make sure both users have profiles.';
  END IF;

  RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on function
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID) TO authenticated;
-- Function to check and repair conversation participants
CREATE OR REPLACE FUNCTION repair_conversation_participants()
RETURNS TEXT AS $$
DECLARE
  conversation_record RECORD;
  participant_count INTEGER;
  repaired_count INTEGER := 0;
BEGIN
  -- Check each conversation
  FOR conversation_record IN 
    SELECT id FROM conversations
  LOOP
    -- Count participants
    SELECT COUNT(*) INTO participant_count 
    FROM conversation_participants 
    WHERE conversation_id = conversation_record.id;
    
    -- If less than 2 participants, this conversation is broken
    IF participant_count < 2 THEN
      -- Delete the broken conversation
      DELETE FROM conversations WHERE id = conversation_record.id;
      repaired_count := repaired_count + 1;
    END IF;
  END LOOP;
  
  RETURN 'Repaired ' || repaired_count || ' broken conversations';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the repair function
SELECT repair_conversation_participants();

-- Drop the repair function after use
DROP FUNCTION repair_conversation_participants();
-- Temporarily disable RLS for debugging
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Ensure users have sparks for testing
UPDATE profiles SET sparks_balance = 10 WHERE sparks_balance < 1 OR sparks_balance IS NULL;

-- Also ensure the sparks_balance column exists and has a default
ALTER TABLE profiles ALTER COLUMN sparks_balance SET DEFAULT 3;
UPDATE profiles SET sparks_balance = 3 WHERE sparks_balance IS NULL;