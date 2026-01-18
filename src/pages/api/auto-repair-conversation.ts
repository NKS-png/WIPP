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

    const { conversation_id } = await request.json();

    if (!conversation_id) {
      return new Response('Missing conversation_id', { status: 400 });
    }

    const currentUserId = sessionData.session.user.id;

    // Check current participants
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversation_id);

    console.log('Current participants:', participants);

    // Check if current user is participant
    const isParticipant = participants?.some(p => p.user_id === currentUserId);

    if (!isParticipant) {
      console.log('Adding current user to conversation');
      
      // Add current user as participant
      const { error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id,
          user_id: currentUserId
        });

      if (error) {
        console.error('Error adding participant:', error);
        return new Response('Failed to repair conversation', { status: 500 });
      }
    }

    // Get updated participants
    const { data: updatedParticipants } = await supabase
      .from('conversation_participants')
      .select(`
        user_id,
        profiles (username, full_name, email)
      `)
      .eq('conversation_id', conversation_id);

    return new Response(JSON.stringify({
      success: true,
      conversation_id,
      participants: updatedParticipants,
      wasRepaired: !isParticipant
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Auto-repair API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};