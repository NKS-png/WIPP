-- Migration Script for Two-Mode System and Spark Economy

-- 1. Update profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sparks_balance INTEGER DEFAULT 3;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;

-- 2. Create enums
DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('portfolio', 'workshop');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE work_stage AS ENUM ('idea', 'draft', 'rough', 'polish', 'final');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Update posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS type post_type;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS work_stage work_stage;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS feedback_goals TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS open_to_critique BOOLEAN DEFAULT FALSE;

-- 4. Create critiques table
CREATE TABLE IF NOT EXISTS critiques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_helpful BOOLEAN DEFAULT FALSE
);

-- 5. Enable RLS for critiques
ALTER TABLE critiques ENABLE ROW LEVEL SECURITY;

-- 6. Policies for critiques
DROP POLICY IF EXISTS "Public critiques" ON critiques;
DROP POLICY IF EXISTS "Users insert critiques" ON critiques;
DROP POLICY IF EXISTS "Users update critiques" ON critiques;
CREATE POLICY "Public critiques" ON critiques FOR SELECT USING (true);
CREATE POLICY "Users insert critiques" ON critiques FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update critiques" ON critiques FOR UPDATE USING (auth.uid() = user_id);

-- 7. RPC Function for posting to workshop
DROP FUNCTION IF EXISTS post_to_workshop(UUID, TEXT, work_stage, TEXT[], UUID, TEXT);
CREATE OR REPLACE FUNCTION post_to_workshop(
  p_community_id UUID,
  p_content TEXT,
  p_work_stage work_stage,
  p_feedback_goals TEXT[],
  p_user_id UUID,
  p_image_url TEXT DEFAULT NULL
) RETURNS JSON AS $$$
DECLARE
  user_sparks INTEGER;
  new_post_id UUID;
BEGIN
  -- Check sparks
  SELECT sparks_balance INTO user_sparks FROM profiles WHERE id = p_user_id;
  IF user_sparks < 1 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient Sparks. Give feedback to earn more.');
  END IF;

  -- Deduct spark
  UPDATE profiles SET sparks_balance = sparks_balance - 1 WHERE id = p_user_id;

  -- Insert post
  INSERT INTO posts (content, image_url, community_id, user_id, type, work_stage, feedback_goals, open_to_critique)
  VALUES (p_content, p_image_url, p_community_id, p_user_id, 'workshop', p_work_stage, p_feedback_goals, TRUE)
  RETURNING id INTO new_post_id;

  RETURN json_build_object('success', true, 'post_id', new_post_id);

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Update posts policies to handle types (assuming existing policy, but ensure)
-- The existing policy checks membership, which is fine for both types.
-- For portfolio, open_to_critique is FALSE, for workshop TRUE, but since it's set in insert, ok.

-- 9. Grant execute on function
GRANT EXECUTE ON FUNCTION post_to_workshop(UUID, TEXT, work_stage, TEXT[], UUID, TEXT) TO authenticated;

-- 10. Create messaging tables
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

-- 11. Disable RLS for messaging tables for debugging
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 12. Policies for messaging
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversation_participants_select" ON conversation_participants;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conversations.id AND user_id = auth.uid()
  )
);

CREATE POLICY "conversation_participants_select" ON conversation_participants FOR SELECT USING (true);

CREATE POLICY "messages_select" ON messages FOR SELECT USING (true);

CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

-- 13. Function to get or create conversation
DROP FUNCTION IF EXISTS get_or_create_conversation(UUID);
DROP FUNCTION IF EXISTS get_or_create_conversation(UUID, UUID);
CREATE OR REPLACE FUNCTION get_or_create_conversation(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
BEGIN
  -- Check if conversation exists between auth.uid() and target_user_id
  SELECT cp1.conversation_id INTO existing_conversation_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = auth.uid() AND cp2.user_id = target_user_id
  LIMIT 1;

  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations DEFAULT VALUES RETURNING id INTO new_conversation_id;

  -- Insert participants
  INSERT INTO conversation_participants (conversation_id, user_id) VALUES
  (new_conversation_id, auth.uid()),
  (new_conversation_id, target_user_id);

  RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Grant execute on function
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID) TO authenticated;

-- 15. Function to get inbox
CREATE OR REPLACE FUNCTION get_my_inbox()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'conversation_id', sub.id,
      'partner', sub.partner,
      'last_message', sub.last_message
    ) ORDER BY sub.last_message_time DESC NULLS LAST
  ) INTO result
  FROM (
    SELECT
      c.id,
      json_build_object(
        'id', p.id,
        'name', COALESCE(p.full_name, p.username, 'Unknown'),
        'avatar_url', p.avatar_url
      ) as partner,
      (
        SELECT json_build_object(
          'content', m.content,
          'created_at', m.created_at,
          'is_read', m.is_read,
          'sender_id', m.sender_id
        )
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) as last_message,
      COALESCE((
        SELECT m.created_at
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ), '1900-01-01'::timestamp) as last_message_time
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = auth.uid()
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != auth.uid()
    JOIN profiles p ON cp2.user_id = p.id
  ) sub;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Grant execute on function
GRANT EXECUTE ON FUNCTION get_my_inbox() TO authenticated;

-- 17. Add support for multiple images in posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;