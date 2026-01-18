import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ count: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      return new Response(JSON.stringify({ count: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use the new function to get accurate unread count
    const { data, error } = await supabase.rpc('get_unread_count', {
      p_user_id: sessionData.session.user.id
    });

    if (error) {
      console.error('Error getting unread count:', error);
      return new Response(JSON.stringify({ count: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ count: data || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unread count API error:', error);
    return new Response(JSON.stringify({ count: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};