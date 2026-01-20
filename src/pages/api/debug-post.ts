import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const postId = url.searchParams.get('id');
  
  if (!postId) {
    return new Response('Post ID required', { status: 400 });
  }

  try {
    // Check if post exists
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (id, username, full_name, avatar_url),
        communities (id, name, image_url)
      `)
      .eq('id', postId)
      .maybeSingle();

    return new Response(JSON.stringify({
      postId,
      found: !!post,
      error: error?.message,
      post: post ? {
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        user_id: post.user_id,
        community_id: post.community_id,
        author: post.profiles,
        community: post.communities
      } : null
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      postId
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};