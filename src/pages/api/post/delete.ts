import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { post_id } = await request.json();

    if (!post_id) {
      return new Response('Post ID is required', { status: 400 });
    }

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

    // Get post to verify ownership and get community info
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id, community_id')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      return new Response('Post not found', { status: 404 });
    }

    // Check if user owns the post
    if (post.user_id !== currentUser.id) {
      return new Response('Forbidden: You can only delete your own posts', { status: 403 });
    }

    // Delete the post (this will cascade delete comments due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', post_id);

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return new Response('Failed to delete post', { status: 500 });
    }

    // Return success with community ID for redirect
    return new Response('Post deleted successfully', { 
      status: 200,
      headers: {
        'community-id': post.community_id || ''
      }
    });

  } catch (error) {
    console.error('Error in delete post API:', error);
    return new Response('Internal server error', { status: 500 });
  }
};