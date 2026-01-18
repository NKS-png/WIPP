import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
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

    const { conversation_id, content, encrypted_content } = await request.json();

    if (!conversation_id) {
      return new Response('Conversation ID is required', { status: 400 });
    }

    if (!content && !encrypted_content) {
      return new Response('Message content is required', { status: 400 });
    }

    // Use the secure function to create the message
    const { data: messageId, error } = await supabase.rpc('create_encrypted_message', {
      p_conversation_id: conversation_id,
      p_content: content || '[Encrypted Message]',
      p_encrypted_content: encrypted_content || null
    });

    if (error) {
      console.error('Error creating encrypted message:', error);
      return new Response('Failed to send message', { status: 500 });
    }

    // Fetch the created message for response
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError) {
      console.error('Error fetching created message:', fetchError);
      return new Response('Message sent but failed to fetch details', { status: 201 });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: message 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Send encrypted message API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};