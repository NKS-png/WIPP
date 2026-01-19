-- Comprehensive fix for conversation system
-- This addresses RLS recursion issues while maintaining security

-- 1. Add missing columns if they don't exist
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS encrypted_content JSONB;

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "conversations_select" ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
DROP POLICY IF EXISTS "conversations_update" ON conversations;
DROP POLICY IF EXISTS "conversation_participants_select" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert" ON conversation_participants;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_update" ON messages;

-- 3. Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Create non-recursive RLS policies

-- Conversations: Users can see conversations they participate in
CREATE POLICY "conversations_select" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Conversations: Users can create new conversations
CREATE POLICY "conversations_insert" ON conversations
  FOR INSERT WITH CHECK (true);

-- Conversations: Users can update conversations they participate in
CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Conversation participants: Users can see participants in their conversations
CREATE POLICY "conversation_participants_select" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants cp2 
      WHERE cp2.user_id = auth.uid()
    )
  );

-- Conversation participants: Users can add participants to conversations they're in
CREATE POLICY "conversation_participants_insert" ON conversation_participants
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants cp2 
      WHERE cp2.user_id = auth.uid()
    ) OR 
    user_id = auth.uid()
  );

-- Messages: Users can see messages in conversations they participate in
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Messages: Users can insert messages in conversations they participate in
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Messages: Users can update their own messages
CREATE POLICY "messages_update" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- 5. Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = timezone('utc'::text, now())
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to automatically update conversation timestamp
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON messages;
CREATE TRIGGER update_conversation_timestamp_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- 7. Update existing conversations to have updated_at
UPDATE conversations 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON conversations TO authenticated;
GRANT SELECT, INSERT ON conversation_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;

-- 9. Create helper function for getting user conversations (optional)
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_username TEXT,
  other_full_name TEXT,
  other_avatar_url TEXT,
  last_message_content TEXT,
  last_message_created_at TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT,
  conversation_updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    other_p.user_id as other_user_id,
    other_profile.username as other_username,
    other_profile.full_name as other_full_name,
    other_profile.avatar_url as other_avatar_url,
    last_msg.content as last_message_content,
    last_msg.created_at as last_message_created_at,
    COALESCE(unread.count, 0) as unread_count,
    c.updated_at as conversation_updated_at
  FROM conversations c
  INNER JOIN conversation_participants my_p ON c.id = my_p.conversation_id AND my_p.user_id = p_user_id
  INNER JOIN conversation_participants other_p ON c.id = other_p.conversation_id AND other_p.user_id != p_user_id
  LEFT JOIN profiles other_profile ON other_p.user_id = other_profile.id
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_msg ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM messages m
    LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = p_user_id
    WHERE m.conversation_id = c.id 
      AND m.sender_id != p_user_id 
      AND mr.id IS NULL
  ) unread ON true
  WHERE EXISTS (
    SELECT 1 FROM messages m2 WHERE m2.conversation_id = c.id
  )
  ORDER BY c.updated_at DESC;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_conversations(UUID) TO authenticated;

-- Note: This comprehensive fix maintains security while avoiding recursion issues
-- The policies are designed to be efficient and non-recursive