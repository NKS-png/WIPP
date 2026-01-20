-- Quick test to diagnose participants_profiles relationship issue

-- 1. Check if tables exist and have data
SELECT 'conversations' as table_name, COUNT(*) as count FROM conversations
UNION ALL
SELECT 'conversation_participants' as table_name, COUNT(*) as count FROM conversation_participants
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as count FROM messages;

-- 2. Test the problematic join query
SELECT 
  cp.user_id,
  p.username,
  p.full_name,
  p.avatar_url
FROM conversation_participants cp
LEFT JOIN profiles p ON cp.user_id = p.id
LIMIT 5;

-- 3. Check for orphaned participants (participants without profiles)
SELECT 
  cp.user_id,
  cp.conversation_id,
  CASE WHEN p.id IS NULL THEN 'ORPHANED' ELSE 'OK' END as status
FROM conversation_participants cp
LEFT JOIN profiles p ON cp.user_id = p.id
WHERE p.id IS NULL;

-- 4. Test a simple message insert (replace UUIDs with actual values from your database)
-- SELECT 'Test message insert - replace UUIDs below with real values from your database' as note;
-- INSERT INTO messages (conversation_id, sender_id, content) 
-- VALUES ('your-conversation-id-here', 'your-user-id-here', 'Test message');