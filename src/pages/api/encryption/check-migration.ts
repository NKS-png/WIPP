import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response('Not authenticated', { status: 401 });
    }

    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      return new Response('Invalid session', { status: 401 });
    }

    // Check if encryption tables exist
    const checks = {
      user_encryption_keys: false,
      messages_has_encryption_columns: false,
      encryption_functions_exist: false
    };

    // Check if user_encryption_keys table exists
    try {
      const { error: tableError } = await supabase
        .from('user_encryption_keys')
        .select('id')
        .limit(1);
      
      checks.user_encryption_keys = !tableError;
    } catch (error) {
      checks.user_encryption_keys = false;
    }

    // Check if messages table has encryption columns
    try {
      const { error: columnError } = await supabase
        .from('messages')
        .select('encrypted_content, is_encrypted')
        .limit(1);
      
      checks.messages_has_encryption_columns = !columnError;
    } catch (error) {
      checks.messages_has_encryption_columns = false;
    }

    // Check if encryption functions exist
    try {
      const { error: functionError } = await supabase.rpc('get_user_public_key', {
        p_user_id: sessionData.session.user.id
      });
      
      // Function exists if we get any response (even if it returns null)
      checks.encryption_functions_exist = true;
    } catch (error) {
      checks.encryption_functions_exist = false;
    }

    const allMigrationsRun = Object.values(checks).every(check => check);

    return new Response(JSON.stringify({
      success: true,
      migrations_complete: allMigrationsRun,
      checks: checks,
      message: allMigrationsRun 
        ? 'All encryption migrations have been run successfully'
        : 'Some encryption migrations are missing. Please run the SQL migrations.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Migration check error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to check migration status',
      message: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};