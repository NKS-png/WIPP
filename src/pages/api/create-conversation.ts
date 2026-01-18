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

    const { target_user_id } = await request.json();

    if (!target_user_id) {
      return new Response('Missing target_user_id', { status: 400 });
    }

    const currentUserId = sessionData.session.user.id;

    if (currentUserId === target_user_id) {
      return new Response('Cannot create conversation with yourself', { status: 400 });
    }

    // Check if conversation already exists - simplified query
    const { data: existingParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .or(`user_id.eq.${currentUserId},user_id.eq.${target_user_id}`);

    console.log('Existing participants:', existingParticipants);

    // Find shared conversation
    let sharedConversationId = null;
    if (existingParticipants && existingParticipants.length > 0) {
      const conversationCounts = {};
      existingParticipants.forEach(p => {
        conversationCounts[p.conversation_id] = (conversationCounts[p.conversation_id] || 0) + 1;
      });
      
      // Find conversation with both users
      for (const [convId, count] of Object.entries(conversationCounts)) {
        if (count === 2) {
          sharedConversationId = convId;
          break;
        }
      }
    }

    if (sharedConversationId) {
      console.log('Found existing conversation:', sharedConversationId);
      return new Response(JSON.stringify({ 
        conversation_id: sharedConversationId 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
      console.error('Error creating conversation:', conversationError);
      return new Response('Failed to create conversation', { status: 500 });
    }

    console.log('Created new conversation:', newConversation.id);

    // Add participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConversation.id, user_id: currentUserId },
        { conversation_id: newConversation.id, user_id: target_user_id }
      ]);

    if (participantsError) {
      console.error('Error adding participants:', participantsError);
      // Clean up the conversation if participants failed
      await supabase.from('conversations').delete().eq('id', newConversation.id);
      return new Response('Failed to add conversation participants', { status: 500 });
    }

    console.log('Added participants to conversation');

    // Verify both participants were added
    const { data: verifyParticipants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', newConversation.id);

    console.log('Verified participants:', verifyParticipants);

    if (!verifyParticipants || verifyParticipants.length !== 2) {
      console.error('Participant verification failed');
      // Clean up the conversation if participants failed
      await supabase.from('conversations').delete().eq('id', newConversation.id);
      return new Response('Failed to verify conversation participants', { status: 500 });
    }

    return new Response(JSON.stringify({ 
      conversation_id: newConversation.id,
      participants: verifyParticipants.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create conversation API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};