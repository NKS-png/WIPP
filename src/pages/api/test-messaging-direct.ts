import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const POST: APIRoute = async () => {
  try {
    const conversationId = '12345678-1234-1234-1234-123456789abc';
    const senderId = 'ffbcba24-482c-4ed7-9ce3-6143b8c84be4'; // Your user ID
    const testMessage = 'Direct test message - bypassing auth';

    console.log('Testing direct message insert:', {
      conversation_id: conversationId,
      sender_id: senderId,
      content: testMessage
    });

    // Direct insert using admin client (bypasses RLS)
    const { data: messageResult, error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: testMessage,
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

    // Try to update conversation timestamp
    const { error: updateError } = await supabaseAdmin
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (updateError) {
      console.warn('Failed to update conversation timestamp:', updateError);
    }

    // Verify the message was inserted
    const { data: allMessages, error: fetchError } = await supabaseAdmin
      .from('messages')
      .select('id, content, created_at, sender_id')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    return new Response(JSON.stringify({ 
      success: true, 
      message: messageResult,
      all_messages: allMessages || [],
      message_count: allMessages?.length || 0,
      conversation_updated: !updateError
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Direct messaging test error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};