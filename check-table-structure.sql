-- Check the actual structure of your tables
-- Run this first to see what columns exist

-- Check conversations table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversations' 
ORDER BY ordinal_position;

-- Check conversation_participants table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
ORDER BY ordinal_position;

-- Check messages table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;