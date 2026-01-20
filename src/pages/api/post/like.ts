import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

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
    const { post_id } = await request.json();

    if (!post_id) {
      return new Response('Post ID is required', { status: 400 });
    }

    // Check if user already liked this post
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', currentUser.id)
      .single();

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post_id)
        .eq('user_id', currentUser.id);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        return new Response('Failed to remove like', { status: 500 });
      }

      // Get updated like count
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post_id);

      return new Response(JSON.stringify({ 
        liked: false, 
        likeCount: count || 0 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({
          post_id: post_id,
          user_id: currentUser.id
        });

      if (insertError) {
        console.error('Error adding like:', insertError);
        return new Response('Failed to add like', { status: 500 });
      }

      // Get updated like count
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post_id);

      return new Response(JSON.stringify({ 
        liked: true, 
        likeCount: count || 0 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in like post API:', error);
    return new Response('Internal server error', { status: 500 });
  }
};