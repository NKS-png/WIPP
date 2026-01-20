-- Simple conversation setup - run this in Supabase SQL Editor
-- Fixed to work with actual table structure (no title column)

-- Step 1: Create a conversation (without title column)
INSERT INTO conversations (id, created_at, updated_at)
VALUES (
  '12345678-1234-1234-1234-123456789abc',
  now(),
  now()
);

-- Step 2: Add you as a participant (replace with your actual user ID)
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
VALUES (
  '12345678-1234-1234-1234-123456789abc',
  'ffbcba24-482c-4ed7-9ce3-6143b8c84be4',  -- Your user ID from the data you showed
  now()
);

-- Step 3: Add another user as participant (replace with another user's ID)
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
VALUES (
  '12345678-1234-1234-1234-123456789abc',
  '1b391dd7-0be7-4a7a-bcba-28c9e498a393',  -- Another user ID from your data
  now()
);

-- Step 4: Verify it worked
SELECT 
  c.id as conversation_id,
  c.created_at,
  cp.user_id,
  p.username
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
JOIN profiles p ON cp.user_id = p.id
WHERE c.id = '12345678-1234-1234-1234-123456789abc';