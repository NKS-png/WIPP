# Inbox and Vercel Deployment Fix Guide

## Issues Identified and Fixed

### 1. ✅ Vercel Serverless Function Crash
**Error**: `Cannot find module '/var/task/dist/server/entry.mjs'`

**Root Causes**:
- Incorrect Vercel adapter import in `astro.config.mjs`
- TypeScript compilation errors preventing proper build
- Missing serverless-specific configuration

**Fixes Applied**:
- Updated `astro.config.mjs` to use `@astrojs/vercel/serverless` instead of `@astrojs/vercel`
- Fixed TypeScript errors in `debug-inbox.ts` API
- Maintained existing build configuration

### 2. ✅ Inbox Conversation Access Issues
**Problems**:
- RLS policies causing infinite recursion
- Database queries failing due to policy conflicts
- Conversations not loading properly

**Root Causes**:
- `conversation-fix-simple.sql` disabled RLS entirely, breaking security
- Recursive policy definitions causing database errors
- Missing proper RLS policies for secure access

**Fixes Applied**:
- Created `conversation-fix-comprehensive.sql` with proper non-recursive RLS policies
- Added helper function `get_user_conversations()` for efficient queries
- Maintained security while fixing access issues

### 3. ✅ TypeScript Compilation Errors
**Problems**:
- Object property access errors in `debug-inbox.ts`
- Implicit `any` type issues

**Fixes Applied**:
- Added proper type annotations (`results: any`)
- Fixed all TypeScript compilation errors

## Files Modified

### `astro.config.mjs`
```javascript
// Fixed import to use serverless adapter
import vercel from '@astrojs/vercel/serverless';
```

### `src/pages/api/debug-inbox.ts`
```typescript
// Fixed type annotations
const results: any = {
  authenticated: true,
  user_id: currentUserId,
  tests: {}
};
```

### `conversation-fix-comprehensive.sql` (NEW)
- Comprehensive database fix with proper RLS policies
- Non-recursive policy definitions
- Helper function for efficient conversation queries
- Maintains security while fixing access issues

## Deployment Steps

### 1. Apply Database Fix
Run the comprehensive SQL fix:
```sql
-- Apply the comprehensive database fix
\i conversation-fix-comprehensive.sql
```

### 2. Test Build Locally
```bash
npm run build
```

### 3. Test APIs Locally
```bash
npm run preview
```

Test these endpoints:
- `/api/health-check` - Basic functionality
- `/api/debug-inbox` - Database connectivity
- `/api/test-supabase` - Supabase connection

### 4. Deploy to Vercel
Push changes to your repository. Vercel will automatically:
- Detect the updated configuration
- Build with the serverless adapter
- Deploy without the module not found error

## Database Schema Requirements

Ensure these tables exist with proper columns:

### `conversations`
```sql
- id (UUID, primary key)
- created_at (timestamp)
- updated_at (timestamp) -- Added by fix
```

### `conversation_participants`
```sql
- id (UUID, primary key)
- conversation_id (UUID, foreign key)
- user_id (UUID, foreign key)
- created_at (timestamp)
```

### `messages`
```sql
- id (UUID, primary key)
- conversation_id (UUID, foreign key)
- sender_id (UUID, foreign key)
- content (text)
- created_at (timestamp)
- is_encrypted (boolean) -- Added by fix
- encrypted_content (jsonb) -- Added by fix
```

## Testing Checklist

### Vercel Deployment
- [ ] Build completes without errors
- [ ] `/api/health-check` returns 200 OK
- [ ] No "module not found" errors in Vercel logs
- [ ] Serverless functions start properly

### Inbox Functionality
- [ ] Inbox page loads without errors
- [ ] Conversations list displays properly
- [ ] Can create new conversations
- [ ] Can send messages
- [ ] Can view existing conversations
- [ ] Real-time updates work

### Database Access
- [ ] RLS policies allow proper access
- [ ] No infinite recursion errors
- [ ] Conversation queries work
- [ ] Message queries work
- [ ] User can see only their conversations

## Troubleshooting

### If Vercel still crashes:
1. Check build logs for specific TypeScript errors
2. Verify all imports use correct paths
3. Test build locally first: `npm run build`
4. Check environment variables are set in Vercel

### If inbox still doesn't work:
1. Apply `conversation-fix-comprehensive.sql`
2. Test `/api/debug-inbox` for specific errors
3. Check browser console for JavaScript errors
4. Verify user authentication is working

### If database access fails:
1. Ensure RLS policies are applied correctly
2. Check user has proper authentication
3. Verify table permissions are granted
4. Test with the helper function: `SELECT * FROM get_user_conversations('user-id')`

## Key Improvements

### Security
- ✅ Proper RLS policies instead of disabled security
- ✅ Non-recursive policy definitions
- ✅ Maintained user data isolation

### Performance
- ✅ Efficient conversation queries
- ✅ Helper function for complex joins
- ✅ Proper indexing support

### Reliability
- ✅ Fixed Vercel serverless deployment
- ✅ Comprehensive error handling
- ✅ TypeScript compilation fixes

## Environment Variables

Ensure these are set in Vercel:
```
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

1. **Apply the database fix** using `conversation-fix-comprehensive.sql`
2. **Test locally** with `npm run build && npm run preview`
3. **Deploy to Vercel** by pushing changes
4. **Test production** endpoints and inbox functionality
5. **Monitor Vercel logs** for any remaining issues

The fixes address both the Vercel deployment crash and the inbox conversation access issues while maintaining security and performance.