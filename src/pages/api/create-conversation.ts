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

    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!sessionData.session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const requestBody = await request.json();
    const { target_user_id, initial_message, encrypted_content } = requestBody;

    if (!target_user_id) {
      return new Response(JSON.stringify({ error: 'Missing target_user_id' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentUserId = sessionData.session.user.id;

    if (currentUserId === target_user_id) {
      return new Response(JSON.stringify({ error: 'Cannot create conversation with yourself' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if conversation already exists
    const { data: existingParticipants, error: participantsQueryError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .or(`user_id.eq.${currentUserId},user_id.eq.${target_user_id}`);

    if (participantsQueryError) {
      console.error('Error querying conversation participants:', participantsQueryError);
      return new Response(JSON.stringify({ 
        error: 'Database error: Failed to check existing conversations',
        details: participantsQueryError.message,
        code: 'PARTICIPANTS_QUERY_ERROR'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find shared conversation
    let sharedConversationId = null;
    if (existingParticipants && existingParticipants.length > 0) {
      const conversationCounts: Record<string, number> = {};
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
      // If there's an initial message, send it to the existing conversation
      if (initial_message && initial_message.trim()) {
        const messageData: any = {
          conversation_id: sharedConversationId,
          sender_id: currentUserId,
          content: initial_message.trim()
        };

        // Add encryption data if present
        if (encrypted_content) {
          messageData.is_encrypted = true;
          messageData.encrypted_content = encrypted_content;
        }

        const { error: messageError } = await supabase
          .from('messages')
          .insert(messageData);

        if (messageError) {
          console.error('Error sending initial message:', messageError);
          // Don't fail the whole request if message fails
        }

        // Update conversation timestamp
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sharedConversationId);
      }

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
      return new Response(JSON.stringify({ 
        error: 'Database error: Failed to create conversation',
        details: conversationError.message,
        code: 'CONVERSATION_CREATE_ERROR'
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
        { conversation_id: newConversation.id, user_id: target_user_id }
      ]);

    if (participantsError) {
      console.error('Error adding conversation participants:', participantsError);
      // Clean up the conversation if participants failed
      await supabase.from('conversations').delete().eq('id', newConversation.id);
      return new Response(JSON.stringify({ 
        error: 'Database error: Failed to add conversation participants',
        details: participantsError.message,
        code: 'PARTICIPANTS_INSERT_ERROR'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send initial message if provided
    if (initial_message && initial_message.trim()) {
      const messageData: any = {
        conversation_id: newConversation.id,
        sender_id: currentUserId,
        content: initial_message.trim()
      };

      // Add encryption data if present
      if (encrypted_content) {
        messageData.is_encrypted = true;
        messageData.encrypted_content = encrypted_content;
      }

      const { error: messageError } = await supabase
        .from('messages')
        .insert(messageData);

      if (messageError) {
        console.error('Error sending initial message:', messageError);
        // Don't fail the whole request if message fails
      }

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', newConversation.id);
    }

    return new Response(JSON.stringify({ 
      conversation_id: newConversation.id
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