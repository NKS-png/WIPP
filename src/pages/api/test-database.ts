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

    const userId = sessionData.session.user.id;
    const results: any = {
      authenticated: true,
      user_id: userId,
      tests: {}
    };

    // Test 1: Check profiles table
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('id', userId)
        .single();

      results.tests.profile_access = {
        success: !error,
        error: error?.message,
        data: profile
      };
    } catch (e: any) {
      results.tests.profile_access = { success: false, error: e.message };
    }

    // Test 2: Check conversations table
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, created_at')
        .limit(5);

      results.tests.conversations_access = {
        success: !error,
        error: error?.message,
        count: conversations?.length || 0
      };
    } catch (e: any) {
      results.tests.conversations_access = { success: false, error: e.message };
    }

    // Test 3: Check conversation_participants table
    try {
      const { data: participants, error } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .eq('user_id', userId)
        .limit(5);

      results.tests.participants_access = {
        success: !error,
        error: error?.message,
        count: participants?.length || 0
      };
    } catch (e: any) {
      results.tests.participants_access = { success: false, error: e.message };
    }

    // Test 4: Check messages table
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, content, created_at')
        .eq('sender_id', userId)
        .limit(5);

      results.tests.messages_access = {
        success: !error,
        error: error?.message,
        count: messages?.length || 0
      };
    } catch (e: any) {
      results.tests.messages_access = { success: false, error: e.message };
    }

    // Test 5: Test join query (the problematic one)
    try {
      const { data: joinData, error } = await supabase
        .from('conversation_participants')
        .select('user_id, profiles(username, full_name)')
        .eq('user_id', userId)
        .limit(1);

      results.tests.join_query = {
        success: !error,
        error: error?.message,
        data: joinData
      };
    } catch (e: any) {
      results.tests.join_query = { success: false, error: e.message };
    }

    // Test 6: Test functions
    try {
      const { data: unreadCount, error } = await supabase
        .rpc('get_unread_count', { p_user_id: userId });

      results.tests.unread_count_function = {
        success: !error,
        error: error?.message,
        data: unreadCount
      };
    } catch (e: any) {
      results.tests.unread_count_function = { success: false, error: e.message };
    }

    try {
      const { data: conversationCounts, error } = await supabase
        .rpc('get_conversation_unread_counts', { p_user_id: userId });

      results.tests.conversation_unread_counts_function = {
        success: !error,
        error: error?.message,
        data: conversationCounts
      };
    } catch (e: any) {
      results.tests.conversation_unread_counts_function = { success: false, error: e.message };
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