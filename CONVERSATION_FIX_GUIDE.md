# Conversation System Fix Guide

## Problem
Users are getting "Failed to send message: Failed to create conversation" error when trying to send messages in the inbox.

## Root Cause
The messaging tables are missing required columns and have incorrect RLS policies that prevent conversation creation.

## Solution Steps

### 1. Run the Database Migration

Copy and paste the contents of `conversation-fix.sql` into your Supabase SQL editor and execute it. This will:

- Add missing `updated_at` column to conversations table
- Add encryption support columns to messages table
- Fix RLS policies for all messaging tables
- Add proper permissions
- Create automatic timestamp update trigger

### 2. Verify Database Setup

Visit `/conversation-debug` on your site to test:
- Database connection
- Table existence and permissions
- Conversation creation functionality

### 3. Test the Fix

1. Go to `/inbox`
2. Click "New Message"
3. Search for a user
4. Type a message and send
5. Should redirect to the conversation successfully

## Common Issues and Solutions

### Issue: "relation does not exist" errors
**Solution**: Run the original `migration.sql` first, then `conversation-fix.sql`

### Issue: "permission denied" errors
**Solution**: Check that RLS policies are properly set up by running `conversation-fix.sql`

### Issue: "column does not exist" errors
**Solution**: The `updated_at` column is missing. Run `conversation-fix.sql` to add it.

### Issue: Still getting creation errors
**Solution**: 
1. Check the browser console for detailed error messages
2. Use `/conversation-debug` to see specific database errors
3. Verify that both users exist in the profiles table

## Files Modified

- `src/pages/api/create-conversation.ts` - Added better error handling
- `src/pages/inbox/index.astro` - Added detailed error logging
- `conversation-fix.sql` - Database migration to fix tables
- `src/pages/api/test-conversation-setup.ts` - Diagnostic API
- `src/pages/conversation-debug.astro` - Debug interface

## Testing

After applying the fix:

1. **Basic Test**: Send a message to yourself (should show "Cannot create conversation with yourself")
2. **Normal Test**: Send a message to another user
3. **Existing Conversation Test**: Send another message to the same user (should reuse conversation)
4. **Encryption Test**: Messages should be automatically encrypted if auto-encryption is working

## Verification Commands

Run these in Supabase SQL editor to verify the fix:

```sql
-- Check if conversations table has updated_at column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversations';

-- Check if messages table has encryption columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('is_encrypted', 'encrypted_content');

-- Test conversation creation (replace with real user IDs)
SELECT * FROM conversations LIMIT 5;
SELECT * FROM conversation_participants LIMIT 5;
SELECT * FROM messages LIMIT 5;
```

## Rollback

If you need to rollback the changes:

```sql
-- Remove added columns (optional)
ALTER TABLE conversations DROP COLUMN IF EXISTS updated_at;
ALTER TABLE messages DROP COLUMN IF EXISTS is_encrypted;
ALTER TABLE messages DROP COLUMN IF EXISTS encrypted_content;

-- Disable RLS (not recommended for production)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```