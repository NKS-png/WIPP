import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
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

    const { user_id, public_key, encrypted_private_key, key_salt, key_iv } = await request.json();

    // Verify the user_id matches the authenticated user
    if (user_id !== sessionData.session.user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user already has keys
    const { data: existingKeys } = await supabase
      .from('user_encryption_keys')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (existingKeys) {
      // Update existing keys
      const { error: updateError } = await supabase
        .from('user_encryption_keys')
        .update({
          public_key,
          encrypted_private_key,
          key_salt,
          key_iv,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);

      if (updateError) {
        console.error('Error updating encryption keys:', updateError);
        return new Response(JSON.stringify({ 
          error: 'Failed to update encryption keys',
          details: updateError.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Insert new keys
      const { error: insertError } = await supabase
        .from('user_encryption_keys')
        .insert({
          user_id,
          public_key,
          encrypted_private_key,
          key_salt,
          key_iv,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error storing encryption keys:', insertError);
        
        // Check if it's a table not found error
        if (insertError.code === '42P01') {
          return new Response(JSON.stringify({
            error: 'Database not configured for encryption',
            code: 'TABLE_NOT_FOUND',
            message: 'Please run the encryption setup SQL migrations first. Check /encryption-status for instructions.'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify({ 
          error: 'Failed to store encryption keys',
          details: insertError.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Encryption keys stored successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in auto-store-keys:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};