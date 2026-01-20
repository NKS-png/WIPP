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
    const results = [];

    // Step 1: Clean up all existing messaging data (in correct order to avoid foreign key issues)
    
    // Delete message_reads
    const { error: messageReadsError } = await supabaseAdmin
      .from('message_reads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (messageReadsError) {
      results.push({ query: 'delete message_reads', error: messageReadsError.message });
    } else {
      results.push({ query: 'delete message_reads', success: true });
    }

    // Delete messages
    const { error: messagesError } = await supabaseAdmin
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (messagesError) {
      results.push({ query: 'delete messages', error: messagesError.message });
    } else {
      results.push({ query: 'delete messages', success: true });
    }

    // Delete conversation_participants
    const { error: deleteParticipantsError } = await supabaseAdmin
      .from('conversation_participants')
      .delete()
      .neq('conversation_id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteParticipantsError) {
      results.push({ query: 'delete conversation_participants', error: deleteParticipantsError.message });
    } else {
      results.push({ query: 'delete conversation_participants', success: true });
    }

    // Delete conversations
    const { error: conversationsError } = await supabaseAdmin
      .from('conversations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (conversationsError) {
      results.push({ query: 'delete conversations', error: conversationsError.message });
    } else {
      results.push({ query: 'delete conversations', success: true });
    }

    // Step 2: Verify cleanup
    const { data: conversationsCount } = await supabaseAdmin
      .from('conversations')
      .select('id', { count: 'exact', head: true });
    
    const { data: participantsCount } = await supabaseAdmin
      .from('conversation_participants')
      .select('conversation_id', { count: 'exact', head: true });
    
    const { data: messagesCount } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact', head: true });

    results.push({ 
      query: 'verify cleanup', 
      data: {
        conversations: conversationsCount || 0,
        participants: participantsCount || 0,
        messages: messagesCount || 0
      }
    });

    // Step 3: Create a fresh test conversation
    const conversationId = '12345678-1234-1234-1234-123456789abc';
    
    const { error: convError } = await supabaseAdmin
      .from('conversations')
      .insert({
        id: conversationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (convError) {
      results.push({ query: 'create conversation', error: convError.message });
    } else {
      results.push({ query: 'create conversation', success: true });
    }

    // Step 4: Add participants (without joined_at column)
    const participants = [
      {
        conversation_id: conversationId,
        user_id: currentUserId  // Current logged-in user
      },
      {
        conversation_id: conversationId,
        user_id: '1b391dd7-0be7-4a7a-bcba-20c9e498a393'  // Another user ID (ritesh)
      }
    ];

    const { error: participantsError } = await supabaseAdmin
      .from('conversation_participants')
      .insert(participants);

    if (participantsError) {
      results.push({ query: 'add participants', error: participantsError.message });
    } else {
      results.push({ query: 'add participants', success: true });
    }

    // Step 5: Verify the fresh setup (simplified to avoid schema cache issues)
    const { data: conversationData, error: convCheckError } = await supabaseAdmin
      .from('conversations')
      .select('id, created_at')
      .eq('id', conversationId)
      .single();

    const { data: participantsData, error: participantsCheckError } = await supabaseAdmin
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId);

    if (convCheckError || participantsCheckError) {
      results.push({ 
        query: 'verify setup', 
        error: convCheckError?.message || participantsCheckError?.message 
      });
    } else {
      results.push({ 
        query: 'verify setup', 
        data: {
          conversation: conversationData,
          participants: participantsData,
          participant_count: participantsData?.length || 0
        }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      results,
      conversation_id: conversationId,
      current_user_id: currentUserId,
      message: 'Clean slate messaging setup completed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Clean slate setup error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};