# Database Migration Instructions

## IMPORTANT: Run These SQL Migrations

The error "Failed to store encryption keys" means your database hasn't been configured for encryption yet. You need to run the SQL migrations first.

### Quick Check
Visit `/encryption-status` in your app to see which migrations are missing.

### Step 1: Run Basic Encryption Setup
Execute the contents of `encryption-setup.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `encryption-setup.sql`
4. Click "Run"

### Step 2: Run Enhanced Security Schema
Execute the contents of `enhanced-security-schema.sql` in your Supabase SQL editor:

1. In the same SQL Editor
2. Copy and paste the entire contents of `enhanced-security-schema.sql`
3. Click "Run"

## What These Migrations Do

### encryption-setup.sql:
- Creates `user_encryption_keys` table for storing E2E encryption keys
- Adds encryption columns to `messages` table (`encrypted_content`, `is_encrypted`)
- Sets up proper RLS (Row Level Security) policies
- Creates helper functions for secure message creation
- Re-enables RLS on all tables (fixes the security issue)

### enhanced-security-schema.sql:
- Adds advanced security features like device management
- Creates recovery systems for password reset without data loss
- Sets up moderation system for encrypted content
- Adds security event logging
- Creates code integrity tracking

## After Running Migrations

1. **Visit `/encryption-status`** to verify all migrations ran successfully
2. **Existing messages will remain unencrypted** - this is intentional
3. **New messages can be encrypted** if users set up encryption
4. **Core messaging will work without encryption** - encryption is optional
5. **DM access should be restored** - the JavaScript import errors have been fixed

## Testing the Fix

1. Try accessing a DM conversation at `/inbox/[conversation-id]`
2. Check browser console for any remaining JavaScript errors
3. Test sending a basic message (should work without encryption)
4. Test the new message modal in `/inbox`
5. Visit `/encryption-status` to check database configuration

## If Issues Persist

If you still can't access DMs after running the migrations:

1. Check browser console for JavaScript errors
2. Verify the migrations ran successfully by visiting `/encryption-status`
3. Try a hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Clear browser cache and localStorage

## Encryption Setup (Optional)

After the migrations, users can optionally set up encryption:

1. Visit any chat page
2. An encryption setup modal should appear for new users
3. Users can skip encryption and still use basic messaging
4. Encryption can be set up later from the settings page

## Diagnostic Tools

- **`/encryption-status`** - Check if database migrations have been run
- **Browser Console** - Check for JavaScript errors
- **Supabase Dashboard** - Verify tables and functions exist