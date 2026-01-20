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

    const { post_id, content } = await request.json();

    if (!post_id || !content?.trim()) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Verify the post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .single();

    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    // Insert comment
    const { error } = await supabase
      .from('post_comments')
      .insert({
        post_id,
        content: content.trim(),
        user_id: sessionData.session.user.id
      });

    if (error) {
      console.error('Comment insert error:', error);
      return new Response('Failed to create comment: ' + error.message, { status: 500 });
    }

    return new Response('Success', { status: 200 });

  } catch (error) {
    console.error('API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};