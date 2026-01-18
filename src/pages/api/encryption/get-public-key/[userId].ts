import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params, cookies }) => {
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

    const { userId } = params;

    // Fetch the user's public key (public keys can be accessed by anyone authenticated)
    const { data: keyData, error } = await supabase
      .from('user_encryption_keys')
      .select('public_key')
      .eq('user_id', userId)
      .single();

    if (error || !keyData) {
      return new Response('Public key not found', { status: 404 });
    }

    return new Response(JSON.stringify({ public_key: keyData.public_key }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get public key API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};