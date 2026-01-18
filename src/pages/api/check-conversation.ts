import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const conversationId = url.searchParams.get('id');
    
    if (!conversationId) {
      return new Response('Missing conversation ID', { status: 400 });
    }

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

    // Check conversation exists
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    // Check all participants
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select(`
        user_id,
        profiles (username, full_name, email)
      `)
      .eq('conversation_id', conversationId);

    // Check messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Check if current user is participant
    const isParticipant = participants?.some(p => p.user_id === sessionData.session.user.id);

    return new Response(JSON.stringify({
      conversationId,
      currentUserId: sessionData.session.user.id,
      conversation,
      participants: participants || [],
      participantCount: participants?.length || 0,
      isParticipant,
      recentMessages: messages || [],
      messageCount: messages?.length || 0
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Check conversation API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};