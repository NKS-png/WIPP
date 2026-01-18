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

    // Set session
    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      return new Response('Invalid session', { status: 401 });
    }

    const { community_id, name, description, image_url, banner_url } = await request.json();

    if (!community_id) {
      return new Response('Missing community_id', { status: 400 });
    }

    // Update community (only if user is admin)
    const { error } = await supabase
      .from('communities')
      .update({ 
        name, 
        description, 
        image_url, 
        banner_url 
      })
      .eq('id', community_id)
      .eq('admin_id', sessionData.session.user.id); // Only admin can update

    if (error) {
      console.error('Database error:', error);
      return new Response('Failed to update community', { status: 500 });
    }

    return new Response('Success', { status: 200 });

  } catch (error) {
    console.error('API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};