import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Get current user from session
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

    const { supabase } = await import('../../lib/supabase');
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
    const conversationId = '12345678-1234-1234-1234-123456789abc';
    const results = [];

    // Check if current user is already a participant
    const { data: existingParticipation, error: checkError } = await supabaseAdmin
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      results.push({ query: 'check existing participation', error: checkError.message });
    } else if (existingParticipation) {
      results.push({ query: 'check existing participation', message: 'User already a participant' });
    } else {
      // Add current user as participant
      const { error: addError } = await supabaseAdmin
        .from('conversation_participants')
        .insert({
          conversation_id: conversationId,
          user_id: currentUserId
        });

      if (addError) {
        results.push({ query: 'add current user as participant', error: addError.message });
      } else {
        results.push({ query: 'add current user as participant', success: true });
      }
    }

    // Get current participants
    const { data: allParticipants, error: participantsError } = await supabaseAdmin
      .from('conversation_participants')
      .select(`
        user_id,
        profiles (
          username,
          full_name
        )
      `)
      .eq('conversation_id', conversationId);

    if (participantsError) {
      results.push({ query: 'get all participants', error: participantsError.message });
    } else {
      results.push({ query: 'get all participants', data: allParticipants });
    }

    return new Response(JSON.stringify({ 
      success: true,
      results,
      conversation_id: conversationId,
      current_user_id: currentUserId,
      message: 'Conversation participants fixed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Fix conversation participants error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};