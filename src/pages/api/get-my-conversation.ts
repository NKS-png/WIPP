import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Get session from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ 
        error: 'Not authenticated' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({ 
        error: 'Invalid session' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentUserId = sessionData.session.user.id;

    // Get conversations where current user is a participant
    const { data: myParticipations, error: participationError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (participationError) {
      return new Response(JSON.stringify({ 
        error: 'Failed to get participations',
        details: participationError.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!myParticipations || myParticipations.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No conversations found',
        current_user_id: currentUserId,
        participations: []
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const conversationIds = myParticipations.map(p => p.conversation_id);

    // Get conversation details with message counts
    const conversationDetails = await Promise.all(
      conversationIds.map(async (convId) => {
        // Get conversation info
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', convId)
          .single();

        // Get message count
        const { count: messageCount, error: msgCountError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', convId);

        // Get other participants
        const { data: otherParticipants, error: partError } = await supabase
          .from('conversation_participants')
          .select(`
            user_id,
            profiles (
              username,
              full_name
            )
          `)
          .eq('conversation_id', convId)
          .neq('user_id', currentUserId);

        return {
          id: convId,
          conversation: conversation,
          message_count: messageCount || 0,
          other_participants: otherParticipants || [],
          errors: {
            conversation: convError?.message,
            message_count: msgCountError?.message,
            participants: partError?.message
          }
        };
      })
    );

    // Sort by most recent and with messages
    const validConversations = conversationDetails
      .filter(c => c.message_count > 0)
      .sort((a, b) => new Date(b.conversation?.updated_at || 0).getTime() - new Date(a.conversation?.updated_at || 0).getTime());

    return new Response(JSON.stringify({ 
      success: true,
      current_user_id: currentUserId,
      total_participations: myParticipations.length,
      conversations_with_messages: validConversations.length,
      conversations: validConversations,
      recommended_conversation: validConversations[0]?.id || null
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