import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const { userId } = params;

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

    // Users can only get their own private keys
    if (userId !== sessionData.session.user.id) {
      return new Response('Unauthorized', { status: 403 });
    }

    // Get the encryption keys
    const { data, error } = await supabase
      .from('user_encryption_keys')
      .select('public_key, encrypted_private_key, key_salt, key_iv')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response('No encryption keys found', { status: 404 });
      }
      console.error('Error fetching encryption keys:', error);
      return new Response('Failed to fetch encryption keys', { status: 500 });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get keys API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};