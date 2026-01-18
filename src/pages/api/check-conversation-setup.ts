import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test if we can create a conversation (this will fail if RLS is too restrictive)
    const testConversationId = 'test-' + Date.now();
    
    // Try to insert a test conversation
    const { error: testError } = await supabase
      .from('conversations')
      .insert({
        id: testConversationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    // Clean up the test conversation if it was created
    if (!testError) {
      await supabase.from('conversations').delete().eq('id', testConversationId);
    }

    // Check if encryption tables exist
    const { data: encryptionTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_encryption_keys');

    const hasEncryptionTables = encryptionTables && encryptionTables.length > 0;

    // Check if user has encryption keys
    let hasEncryptionKeys = false;
    if (hasEncryptionTables) {
      const { data: userKeys } = await supabase
        .from('user_encryption_keys')
        .select('id')
        .eq('user_id', sessionData.session.user.id)
        .limit(1);
      
      hasEncryptionKeys = userKeys && userKeys.length > 0;
    }

    return new Response(JSON.stringify({
      canCreateConversations: !testError,
      hasEncryptionTables,
      hasEncryptionKeys,
      error: testError?.message || null,
      recommendation: testError 
        ? 'Run conversation-fix.sql to enable basic messaging, or set up encryption for secure messaging'
        : hasEncryptionTables && !hasEncryptionKeys
        ? 'Set up encryption keys for secure messaging'
        : 'Messaging is ready to use'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Check conversation setup error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};