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
        authenticated: false 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({ 
        error: 'Invalid session',
        authenticated: false 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentUserId = sessionData.session.user.id;

    // Get profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, email')
      .eq('id', currentUserId)
      .single();

    return new Response(JSON.stringify({
      authenticated: true,
      user_id: currentUserId,
      email: sessionData.session.user.email,
      profile: profile || null,
      profile_error: profileError?.message || null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      authenticated: false
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};