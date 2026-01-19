-- Add read tracking to messages table
-- This will allow us to track which messages have been read by which users

-- Add read_at column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Create a message_reads table to track who has read which messages
-- This is better than a single read_at column because multiple users can read the same message
CREATE TABLE IF NOT EXISTS message_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(message_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id ON message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_read_at ON message_reads(read_at DESC);

-- Function to mark a message as read by a user
CREATE OR REPLACE FUNCTION mark_message_read(p_message_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert or update the read status
  INSERT INTO message_reads (message_id, user_id, read_at)
  VALUES (p_message_id, p_user_id, timezone('utc'::text, now()))
  ON CONFLICT (message_id, user_id) 
  DO UPDATE SET read_at = timezone('utc'::text, now());
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all messages in a conversation as read by a user
CREATE OR REPLACE FUNCTION mark_conversation_read(p_conversation_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  marked_count INTEGER := 0;
  message_record RECORD;
BEGIN
  -- Mark all messages in the conversation as read by this user
  FOR message_record IN 
    SELECT id FROM messages 
    WHERE conversation_id = p_conversation_id 
    AND sender_id != p_user_id  -- Don't mark own messages as "read"
  LOOP
    INSERT INTO message_reads (message_id, user_id, read_at)
    VALUES (message_record.id, p_user_id, timezone('utc'::text, now()))
    ON CONFLICT (message_id, user_id) 
    DO UPDATE SET read_at = timezone('utc'::text, now());
    
    marked_count := marked_count + 1;
  END LOOP;
  
  RETURN marked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER := 0;
BEGIN
  -- Count messages in conversations where user is participant
  -- but exclude messages sent by the user and messages already read
  SELECT COUNT(*) INTO unread_count
  FROM messages m
  JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
  LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = p_user_id
  WHERE cp.user_id = p_user_id
    AND m.sender_id != p_user_id  -- Not sent by this user
    AND mr.id IS NULL  -- Not marked as read
    AND m.created_at >= (timezone('utc'::text, now()) - INTERVAL '7 days'); -- Only last 7 days
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count per conversation for a user
CREATE OR REPLACE FUNCTION get_conversation_unread_counts(p_user_id UUID)
RETURNS TABLE(conversation_id UUID, unread_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.conversation_id,
    COUNT(*) as unread_count
  FROM messages m
  JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
  LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = p_user_id
  WHERE cp.user_id = p_user_id
    AND m.sender_id != p_user_id  -- Not sent by this user
    AND mr.id IS NULL  -- Not marked as read
    AND m.created_at >= (timezone('utc'::text, now()) - INTERVAL '7 days') -- Only last 7 days
  GROUP BY m.conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION mark_message_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_unread_counts(UUID) TO authenticated;

-- Enable RLS on message_reads table
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reads
CREATE POLICY "Users can read their own message reads" ON message_reads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own message reads" ON message_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own message reads" ON message_reads
  FOR UPDATE USING (user_id = auth.uid());

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON message_reads TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;