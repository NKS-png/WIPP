import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
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

    const { user_id, public_key, encrypted_private_key, key_salt, key_iv } = await request.json();

    // Verify the user is storing their own keys
    if (user_id !== sessionData.session.user.id) {
      return new Response('Unauthorized', { status: 403 });
    }

    // Store the encryption keys
    const { data, error } = await supabase
      .from('user_encryption_keys')
      .upsert({
        user_id: user_id,
        public_key: public_key,
        encrypted_private_key: encrypted_private_key,
        key_salt: key_salt,
        key_iv: key_iv,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error storing encryption keys:', error);
      
      // Check if it's a table not found error
      if (error.message?.includes('relation "user_encryption_keys" does not exist')) {
        return new Response(JSON.stringify({
          error: 'Database not configured for encryption',
          message: 'Please run the encryption database migrations first. See DATABASE_MIGRATION_INSTRUCTIONS.md',
          code: 'TABLE_NOT_FOUND'
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({
        error: 'Failed to store encryption keys',
        message: error.message || 'Unknown database error',
        code: 'DATABASE_ERROR'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Encryption keys stored successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Store keys API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};