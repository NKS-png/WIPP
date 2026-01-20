-- Create a test conversation for messaging
-- Replace the user IDs below with actual IDs from your profiles table

-- Step 1: Create a test conversation
INSERT INTO conversations (id, title, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Test Conversation',
  timezone('utc'::text, now()),
  timezone('utc'::text, now())
);

-- Step 2: Get the conversation ID we just created (run this to see the ID)
SELECT id, title, created_at FROM conversations ORDER BY created_at DESC LIMIT 1;

-- Step 3: Add participants to the conversation
-- IMPORTANT: Replace these UUIDs with actual user IDs from your profiles table
-- User 1: NKS (your user ID)
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
SELECT 
  (SELECT id FROM conversations ORDER BY created_at DESC LIMIT 1),
  'ffbcba24-482c-4ed7-9ce3-6143b8c84be4', -- Replace with your actual user ID
  timezone('utc'::text, now());

-- User 2: Another user (pick one from your profiles)
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
SELECT 
  (SELECT id FROM conversations ORDER BY created_at DESC LIMIT 1),
  '1b391dd7-0be7-4a7a-bcba-28c9e498a393', -- Replace with another user's ID
  timezone('utc'::text, now());

-- Step 4: Verify the setup
SELECT 
  c.id as conversation_id,
  c.title,
  cp.user_id,
  p.username,
  p.full_name
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
JOIN profiles p ON cp.user_id = p.id
ORDER BY c.created_at DESC, p.username;