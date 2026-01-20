-- Clean Slate Messaging Setup
-- This will remove all existing messaging data and rebuild from scratch
-- Fixed to work with actual table structure (no joined_at column)

-- Step 1: Clean up all existing messaging data (in correct order to avoid foreign key issues)
DELETE FROM message_reads;
DELETE FROM messages;
DELETE FROM conversation_participants;
DELETE FROM conversations;

-- Step 2: Verify cleanup
SELECT 'conversations' as table_name, COUNT(*) as remaining_count FROM conversations
UNION ALL
SELECT 'conversation_participants' as table_name, COUNT(*) as remaining_count FROM conversation_participants
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as remaining_count FROM messages
UNION ALL
SELECT 'message_reads' as table_name, COUNT(*) as remaining_count FROM message_reads;

-- Step 3: Create a fresh test conversation
INSERT INTO conversations (id, created_at, updated_at)
VALUES (
  '12345678-1234-1234-1234-123456789abc',
  now(),
  now()
);

-- Step 4: Add participants (without joined_at column)
-- User 1: NKS (your user ID)
INSERT INTO conversation_participants (conversation_id, user_id)
VALUES (
  '12345678-1234-1234-1234-123456789abc',
  'ffbcba24-482c-4ed7-9ce3-6143b8c84be4'  -- Your user ID
);

-- User 2: Another user
INSERT INTO conversation_participants (conversation_id, user_id)
VALUES (
  '12345678-1234-1234-1234-123456789abc',
  '1b391dd7-0be7-4a7a-bcba-28c9e498a393'  -- Another user ID
);

-- Step 5: Verify the fresh setup
SELECT 
  'Fresh conversation created' as status,
  c.id as conversation_id,
  c.created_at,
  cp.user_id,
  p.username
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
JOIN profiles p ON cp.user_id = p.id
WHERE c.id = '12345678-1234-1234-1234-123456789abc'
ORDER BY p.username;

-- Step 6: Test message insert (optional - you can run this to test)
-- INSERT INTO messages (conversation_id, sender_id, content, created_at)
-- VALUES (
--   '12345678-1234-1234-1234-123456789abc',
--   'ffbcba24-482c-4ed7-9ce3-6143b8c84be4',  -- Your user ID
--   'Test message after clean slate setup',
--   now()
-- );

-- Final verification
SELECT 
  'conversations' as table_name, COUNT(*) as count FROM conversations
UNION ALL
SELECT 'conversation_participants' as table_name, COUNT(*) as count FROM conversation_participants
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as count FROM messages;