import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { comment_id } = await request.json();

    if (!comment_id) {
      return new Response('Comment ID is required', { status: 400 });
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

    // Get comment to verify ownership
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', comment_id)
      .single();

    if (commentError || !comment) {
      return new Response('Comment not found', { status: 404 });
    }

    // Check if user owns the comment
    if (comment.user_id !== currentUser.id) {
      return new Response('Forbidden: You can only delete your own comments', { status: 403 });
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment_id);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return new Response('Failed to delete comment', { status: 500 });
    }

    return new Response('Comment deleted successfully', { status: 200 });

  } catch (error) {
    console.error('Error in delete comment API:', error);
    return new Response('Internal server error', { status: 500 });
  }
};