import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const conversationId = url.searchParams.get('id');
    
    if (!conversationId) {
      return new Response(JSON.stringify({
        error: 'Missing conversation ID'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current user from session
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    let currentUserId = null;
    if (accessToken && refreshToken) {
      const { supabase } = await import('../../lib/supabase');
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (!sessionError && sessionData.session) {
        currentUserId = sessionData.session.user.id;
      }
    }

    // Check if conversation exists
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    // Get all participants
    const { data: participants, error: partError } = await supabaseAdmin
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId);

    // Get messages count
    const { count: messageCount, error: msgCountError } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);

    // Check if current user is participant
    const isCurrentUserParticipant = currentUserId && participants?.some(p => p.user_id === currentUserId);

    return new Response(JSON.stringify({
      conversation_id: conversationId,
      current_user_id: currentUserId,
      authenticated: !!currentUserId,
      conversation: {
        exists: !convError,
        error: convError?.message,
        data: conversation
      },
      participants: {
        success: !partError,
        error: partError?.message,
        count: participants?.length || 0,
        data: participants,
        current_user_is_participant: isCurrentUserParticipant
      },
      messages: {
        success: !msgCountError,
        error: msgCountError?.message,
        count: messageCount || 0
      },
      access_issues: {
        conversation_missing: !!convError,
        participant_error: !!partError,
        message_error: !!msgCountError,
        user_not_participant: !isCurrentUserParticipant,
        not_authenticated: !currentUserId
      }
    }, null, 2), {
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