import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get current user
    const authHeader = request.headers.get('cookie');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Extract tokens from cookies
    const cookies = authHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const accessToken = cookies['sb-access-token'];
    const refreshToken = cookies['sb-refresh-token'];

    if (!accessToken || !refreshToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Set session
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const currentUser = sessionData.session.user;

    // Get the request body
    const body = await request.json();
    const { community_id } = body;

    if (!community_id) {
      return new Response('Community ID is required', { status: 400 });
    }

    // Create a test post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content: `Test post created at ${new Date().toLocaleString()}`,
        user_id: currentUser.id,
        community_id: community_id,
        type: 'portfolio'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating test post:', error);
      return new Response(`Failed to create test post: ${error.message}`, { status: 500 });
    }

    return new Response(JSON.stringify({
      success: true,
      post: post,
      message: 'Test post created successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in create test post API:', error);
    return new Response('Internal server error', { status: 500 });
  }
};