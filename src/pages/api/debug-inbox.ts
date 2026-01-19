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
    const results: any = {
      authenticated: true,
      user_id: currentUserId,
      tests: {}
    };

    // Test 1: Get my participations
    try {
      const { data: myParticipations, error: participationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      if (participationsError) {
        results.tests.participations = { success: false, error: participationsError.message };
      } else {
        results.tests.participations = { 
          success: true, 
          count: myParticipations?.length || 0,
          data: myParticipations 
        };
      }
    } catch (error: any) {
      results.tests.participations = { success: false, error: error.message };
    }

    // Test 2: Get conversations
    try {
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .limit(5);

      if (conversationsError) {
        results.tests.conversations = { success: false, error: conversationsError.message };
      } else {
        results.tests.conversations = { 
          success: true, 
          count: conversations?.length || 0,
          data: conversations 
        };
      }
    } catch (error: any) {
      results.tests.conversations = { success: false, error: error.message };
    }

    // Test 3: Get messages
    try {
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(5);

      if (messagesError) {
        results.tests.messages = { success: false, error: messagesError.message };
      } else {
        results.tests.messages = { 
          success: true, 
          count: messages?.length || 0,
          data: messages 
        };
      }
    } catch (error: any) {
      results.tests.messages = { success: false, error: error.message };
    }

    // Test 4: Complex query like inbox uses
    try {
      const { data: myParticipations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      if (myParticipations && myParticipations.length > 0) {
        const conversationIds = myParticipations.map(p => p.conversation_id);
        
        const { data: conversations, error: complexError } = await supabase
          .from('conversations')
          .select('*')
          .in('id', conversationIds)
          .order('updated_at', { ascending: false });

        if (complexError) {
          results.tests.complex_query = { success: false, error: complexError.message };
        } else {
          results.tests.complex_query = { 
            success: true, 
            count: conversations?.length || 0,
            data: conversations 
          };
        }
      } else {
        results.tests.complex_query = { success: true, message: 'No participations found' };
      }
    } catch (error: any) {
      results.tests.complex_query = { success: false, error: error.message };
    }

    // Test 5: Profile join query
    try {
      const { data: profileJoin, error: profileError } = await supabase
        .from('conversation_participants')
        .select('user_id, profiles(username, full_name, avatar_url)')
        .eq('user_id', currentUserId)
        .limit(1);

      if (profileError) {
        results.tests.profile_join = { success: false, error: profileError.message };
      } else {
        results.tests.profile_join = { 
          success: true, 
          count: profileJoin?.length || 0,
          data: profileJoin 
        };
      }
    } catch (error: any) {
      results.tests.profile_join = { success: false, error: error.message };
    }

    return new Response(JSON.stringify(results, null, 2), {
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