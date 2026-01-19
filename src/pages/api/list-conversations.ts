import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ cookies }) => {
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

    // Get all conversations
    const { data: allConversations, error: allConvError } = await supabase
      .from('conversations')
      .select('*')
      .limit(10);

    // Get all participants
    const { data: allParticipants, error: allPartError } = await supabase
      .from('conversation_participants')
      .select('*')
      .limit(20);

    // Get user's participations
    const { data: userParticipations, error: userPartError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    return new Response(JSON.stringify({
      authenticated: true,
      user_id: currentUserId,
      all_conversations: {
        success: !allConvError,
        error: allConvError?.message,
        count: allConversations?.length || 0,
        data: allConversations
      },
      all_participants: {
        success: !allPartError,
        error: allPartError?.message,
        count: allParticipants?.length || 0,
        data: allParticipants
      },
      user_participations: {
        success: !userPartError,
        error: userPartError?.message,
        count: userParticipations?.length || 0,
        data: userParticipations
      }
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      authenticated: false
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};