import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ 
        error: 'Not authenticated',
        canCreateConversations: false,
        hasEncryptionTables: false,
        hasEncryptionKeys: false,
        recommendation: 'Please log in to check messaging setup'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      return new Response(JSON.stringify({ 
        error: 'Invalid session',
        canCreateConversations: false,
        hasEncryptionTables: false,
        hasEncryptionKeys: false,
        recommendation: 'Please log in again'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test basic conversation table access (safer than creating test data)
    let canCreateConversations = false;
    let testError = null;
    
    try {
      // Just try to read from conversations table to test access
      const { error: accessError } = await supabase
        .from('conversations')
        .select('id')
        .limit(1);
      
      canCreateConversations = !accessError;
      testError = accessError;
    } catch (error) {
      canCreateConversations = false;
      testError = error;
    }

    // Check if encryption tables exist - use a safer approach
    let hasEncryptionTables = false;
    try {
      const { data: testEncryptionTable } = await supabase
        .from('user_encryption_keys')
        .select('id')
        .limit(1);
      hasEncryptionTables = true; // If query succeeds, table exists
    } catch (encryptionError) {
      hasEncryptionTables = false; // Table doesn't exist or no access
    }

    // Check if user has encryption keys
    let hasEncryptionKeys = false;
    if (hasEncryptionTables) {
      try {
        const { data: userKeys } = await supabase
          .from('user_encryption_keys')
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .limit(1);
        
        hasEncryptionKeys = userKeys && userKeys.length > 0;
      } catch (keyError) {
        hasEncryptionKeys = false;
      }
    }

    return new Response(JSON.stringify({
      canCreateConversations,
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
      details: error.message,
      canCreateConversations: false,
      hasEncryptionTables: false,
      hasEncryptionKeys: false,
      recommendation: 'There was an error checking your setup. Please try again or contact support.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};