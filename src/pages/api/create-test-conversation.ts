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

    const { other_user_id } = await request.json();

    if (!other_user_id) {
      return new Response(JSON.stringify({ error: 'Missing other_user_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentUserId = sessionData.session.user.id;

    // Check if conversation already exists between these users
    const { data: existingConversation } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (existingConversation && existingConversation.length > 0) {
      // Check if the other user is also in any of these conversations
      for (const participation of existingConversation) {
        const { data: otherUserParticipation } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('conversation_id', participation.conversation_id)
          .eq('user_id', other_user_id);

        if (otherUserParticipation && otherUserParticipation.length > 0) {
          return new Response(JSON.stringify({ 
            success: true,
            conversation_id: participation.conversation_id,
            message: 'Conversation already exists'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // Create new conversation
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        title: 'New Conversation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
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

    // Add both users as participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        {
          conversation_id: newConversation.id,
          user_id: currentUserId,
          joined_at: new Date().toISOString()
        },
        {
          conversation_id: newConversation.id,
          user_id: other_user_id,
          joined_at: new Date().toISOString()
        }
      ]);

    if (participantsError) {
      return new Response(JSON.stringify({ 
        error: 'Failed to add participants',
        details: participantsError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      conversation_id: newConversation.id,
      message: 'Conversation created successfully'
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