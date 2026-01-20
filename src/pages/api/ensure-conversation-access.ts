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

    // Step 1: Check if user is already in any conversations
    const { data: existingParticipations, error: participationError } = await supabaseAdmin
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (participationError) {
      results.push({ step: 'check existing participations', error: participationError.message });
    } else {
      results.push({ 
        step: 'check existing participations', 
        success: true, 
        count: existingParticipations?.length || 0,
        conversations: existingParticipations?.map(p => p.conversation_id) || []
      });
    }

    // Step 2: If user has no conversations, add them to existing ones with messages
    if (!existingParticipations || existingParticipations.length === 0) {
      // Find conversations with messages that have only 1 participant (incomplete conversations)
      const { data: incompleteConversations, error: incompleteError } = await supabaseAdmin
        .from('conversation_participants')
        .select('conversation_id')
        .then(async ({ data, error }) => {
          if (error) return { data: null, error };
          
          // Group by conversation_id and count participants
          const conversationCounts = {};
          data?.forEach(p => {
            conversationCounts[p.conversation_id] = (conversationCounts[p.conversation_id] || 0) + 1;
          });
          
          // Find conversations with only 1 participant
          const incompleteConvIds = Object.keys(conversationCounts).filter(id => conversationCounts[id] === 1);
          
          if (incompleteConvIds.length === 0) return { data: [], error: null };
          
          // Check which of these have messages
          const conversationsWithMessages = [];
          for (const convId of incompleteConvIds) {
            const { count } = await supabaseAdmin
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', convId);
            
            if (count && count > 0) {
              conversationsWithMessages.push(convId);
            }
          }
          
          return { data: conversationsWithMessages, error: null };
        });

      if (incompleteError) {
        results.push({ step: 'find incomplete conversations', error: incompleteError.message });
      } else if (incompleteConversations && incompleteConversations.length > 0) {
        // Add user to the first incomplete conversation
        const targetConversation = incompleteConversations[0];
        
        const { error: addError } = await supabaseAdmin
          .from('conversation_participants')
          .insert({
            conversation_id: targetConversation,
            user_id: currentUserId
          });

        if (addError) {
          results.push({ step: 'add to incomplete conversation', error: addError.message });
        } else {
          results.push({ 
            step: 'add to incomplete conversation', 
            success: true, 
            conversation_id: targetConversation 
          });
        }
      } else {
        // No incomplete conversations, create a new one with another user
        const { data: otherUsers, error: usersError } = await supabaseAdmin
          .from('profiles')
          .select('id, username, full_name')
          .neq('id', currentUserId)
          .limit(1);

        if (usersError || !otherUsers || otherUsers.length === 0) {
          results.push({ step: 'find other users', error: usersError?.message || 'No other users found' });
        } else {
          const otherUserId = otherUsers[0].id;
          const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2)}`;

          // Create new conversation
          const { error: createError } = await supabaseAdmin
            .from('conversations')
            .insert({
              id: newConversationId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createError) {
            results.push({ step: 'create new conversation', error: createError.message });
          } else {
            // Add both users as participants
            const { error: participantsError } = await supabaseAdmin
              .from('conversation_participants')
              .insert([
                { conversation_id: newConversationId, user_id: currentUserId },
                { conversation_id: newConversationId, user_id: otherUserId }
              ]);

            if (participantsError) {
              results.push({ step: 'add participants to new conversation', error: participantsError.message });
            } else {
              // Add a welcome message
              const { error: messageError } = await supabaseAdmin
                .from('messages')
                .insert({
                  conversation_id: newConversationId,
                  sender_id: currentUserId,
                  content: 'Hello! This conversation was created automatically.',
                  created_at: new Date().toISOString()
                });

              results.push({ 
                step: 'create new conversation', 
                success: true, 
                conversation_id: newConversationId,
                other_user: otherUsers[0],
                message_added: !messageError
              });
            }
          }
        }
      }
    }

    // Step 3: Get final conversation list for user
    const { data: finalParticipations, error: finalError } = await supabaseAdmin
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (finalError) {
      results.push({ step: 'get final conversations', error: finalError.message });
    } else {
      const conversationIds = finalParticipations?.map(p => p.conversation_id) || [];
      
      // Get conversation details
      const conversationDetails = await Promise.all(
        conversationIds.map(async (convId) => {
          const { count: messageCount } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convId);

          return { id: convId, message_count: messageCount || 0 };
        })
      );

      const conversationsWithMessages = conversationDetails.filter(c => c.message_count > 0);
      
      results.push({ 
        step: 'get final conversations', 
        success: true,
        total_conversations: conversationIds.length,
        conversations_with_messages: conversationsWithMessages.length,
        recommended_conversation: conversationsWithMessages[0]?.id || null
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      current_user_id: currentUserId,
      results,
      message: 'Conversation access ensured'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Ensure conversation access error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};