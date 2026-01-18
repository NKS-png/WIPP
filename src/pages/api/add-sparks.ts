import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ cookies }) => {
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

    // Add sparks to user (for testing)
    const { error } = await supabase
      .from('profiles')
      .update({ sparks_balance: 10 }) // Give 10 sparks for testing
      .eq('id', sessionData.session.user.id);

    if (error) {
      console.error('Error adding sparks:', error);
      return new Response('Failed to add sparks', { status: 500 });
    }

    return new Response('Sparks added successfully', { status: 200 });

  } catch (error) {
    console.error('Add sparks API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};