import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request, cookies }) => {
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

    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({ users: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Search users by username, full_name, or email
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, email')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Search error:', error);
      return new Response('Search failed', { status: 500 });
    }

    // Format results
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.full_name || user.username || user.email?.split('@')[0] || 'Unknown User',
      avatar: user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username || 'user'}`,
      email: user.email
    }));

    return new Response(JSON.stringify({ users: formattedUsers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};