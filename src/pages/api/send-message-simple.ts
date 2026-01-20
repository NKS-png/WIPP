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

    const { conversation_id, content } = await request.json();

    if (!conversation_id || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = sessionData.session.user.id;
    const messageContent = content.trim();

    console.log('Attempting to send message:', {
      conversation_id,
      sender_id: userId,
      content: messageContent
    });

    // Direct insert without validation checks (for testing)
    const { data: messageResult, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id: userId,
        content: messageContent,
        created_at: new Date().toISOString()
      })
      .select('id, content, created_at, sender_id')
      .single();

    if (insertError) {
      console.error('Message insert error:', insertError);
      return new Response(JSON.stringify({ 
        error: 'Failed to send message', 
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Message sent successfully:', messageResult);

    // Try to update conversation timestamp (non-critical)
    try {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);
    } catch (updateError) {
      console.warn('Failed to update conversation timestamp:', updateError);
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