import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('Community post API called');
    
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      console.log('No auth tokens found');
      return new Response('Not authenticated', { status: 401 });
    }

    // Set session
    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      console.log('Invalid session');
      return new Response('Invalid session', { status: 401 });
    }

    console.log('User authenticated:', sessionData.session.user.id);

    const formData = await request.formData();
    const community_id = formData.get('community_id') as string;
    const content = formData.get('content') as string;
    const type = formData.get('type') as string;
    const imageFile = formData.get('image') as File;

    console.log('Form data received:', { community_id, content, type, hasImage: !!imageFile });

    if (!community_id || !content || !type) {
      console.log('Missing required fields');
      return new Response('Missing required fields', { status: 400 });
    }

    let imageUrl = null;

    // Handle image upload if present
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, imageFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return new Response('Image upload failed', { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
    }

    if (type === 'portfolio') {
      console.log('Creating portfolio post');
      // Simple portfolio post - NO SPARKS REQUIRED
      const { error } = await supabase.from('posts').insert({
        content,
        image_url: imageUrl,
        community_id,
        user_id: sessionData.session.user.id,
        type: 'portfolio',
        open_to_critique: false
      });

      if (error) {
        console.error('Portfolio post database error:', error);
        return new Response('Failed to create post: ' + error.message, { status: 500 });
      }
      
      console.log('Portfolio post created successfully');
    } else if (type === 'workshop') {
      console.log('Creating workshop post');
      
      // First, ensure user has sparks
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('sparks_balance')
        .eq('id', sessionData.session.user.id)
        .single();
      
      console.log('User sparks balance:', userProfile?.sparks_balance);
      
      if (!userProfile || (userProfile.sparks_balance || 0) < 1) {
        return new Response('Insufficient sparks for workshop posts', { status: 400 });
      }
      
      // Workshop post using RPC
      const work_stage = formData.get('work_stage') as string;
      const intent = formData.get('intent') as string;
      const feedback_goals = JSON.parse(formData.get('feedback_goals') as string || '[]');

      console.log('Workshop data:', { work_stage, intent, feedback_goals });

      if (!intent) {
        return new Response('Intent is required for workshop posts', { status: 400 });
      }

      const { data, error } = await supabase.rpc('post_to_workshop', {
        p_community_id: community_id,
        p_content: content,
        p_work_stage: work_stage,
        p_feedback_goals: feedback_goals,
        p_image_url: imageUrl
      });

      if (error) {
        console.error('Workshop RPC error:', error);
        return new Response('Failed to create workshop post: ' + error.message, { status: 500 });
      }

      if (!data || !data.success) {
        console.error('Workshop RPC failed:', data);
        return new Response(data?.error || 'Failed to create workshop post', { status: 400 });
      }
      
      console.log('Workshop post created successfully');
    }

    return new Response('Success', { status: 200 });

  } catch (error) {
    console.error('API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};