import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set session
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { conversation_id, content, encrypted_content } = await request.json();

    if (!conversation_id || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = sessionData.session.user.id;
    const messageContent = content.trim();

    // Simplified approach: Try to insert message directly
    // The database constraints will handle validation
    const messageData: any = {
      conversation_id,
      sender_id: userId,
      content: messageContent,
      is_encrypted: !!encrypted_content,
      created_at: new Date().toISOString()
    };

    // Add encryption data if present
    if (encrypted_content) {
      messageData.encrypted_content = encrypted_content;
    }

    // Insert message with error handling
    const { data: messageResult, error: insertError } = await supabase
      .from('messages')
      .insert(messageData)
      .select('id, content, created_at, sender_id')
      .single();

    if (insertError) {
      console.error('Message insert error:', insertError);
      
      // Check if it's a foreign key constraint error (conversation doesn't exist or user not participant)
      if (insertError.code === '23503') {
        // Try to check what specifically failed
        const { data: conversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('id', conversation_id)
          .single();

        if (!conversation) {
          return new Response(JSON.stringify({ error: 'Conversation not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const { data: participant } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversation_id)
          .eq('user_id', userId)
          .single();

        if (!participant) {
          return new Response(JSON.stringify({ error: 'Not authorized for this conversation' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to send message', 
        details: insertError.message,
        code: insertError.code 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Try to update conversation timestamp (non-critical)
    try {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);
    } catch (updateError) {
      console.warn('Failed to update conversation timestamp:', updateError);
      // Don't fail the request for this
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: messageResult
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Send message API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};