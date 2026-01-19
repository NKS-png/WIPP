import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ 
        error: 'Not authenticated',
        authenticated: false 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      return new Response(JSON.stringify({ 
        error: 'Invalid session',
        authenticated: false 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentUserId = sessionData.session.user.id;

    // Get another user to create conversation with
    const { data: otherUsers } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .neq('id', currentUserId)
      .limit(1);

    if (!otherUsers || otherUsers.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No other users found to create conversation with'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const otherUserId = otherUsers[0].id;

    // Create new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (conversationError) {
      return new Response(JSON.stringify({ 
        error: 'Failed to create conversation',
        details: conversationError.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConversation.id, user_id: currentUserId },
        { conversation_id: newConversation.id, user_id: otherUserId }
      ]);

    if (participantsError) {
      // Clean up the conversation if participants failed
      await supabase.from('conversations').delete().eq('id', newConversation.id);
      return new Response(JSON.stringify({ 
        error: 'Failed to add conversation participants',
        details: participantsError.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add a test message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: newConversation.id,
        sender_id: currentUserId,
        content: 'Test message - conversation created successfully!'
      });

    if (messageError) {
      console.log('Failed to add test message:', messageError.message);
      // Don't fail the whole request if message fails
    }

    return new Response(JSON.stringify({
      success: true,
      conversation_id: newConversation.id,
      participants: [
        { user_id: currentUserId, role: 'current_user' },
        { user_id: otherUserId, role: 'other_user', profile: otherUsers[0] }
      ],
      message: 'Test conversation created successfully',
      conversation_url: `/inbox/${newConversation.id}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};