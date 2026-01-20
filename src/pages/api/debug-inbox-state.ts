import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const GET: APIRoute = async () => {
  try {
    // Get all conversations
    const { data: conversations, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });

    // Get all participants
    const { data: participants, error: partError } = await supabaseAdmin
      .from('conversation_participants')
      .select('*');

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, full_name, email')
      .limit(10);

    // Get all messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return new Response(JSON.stringify({
      conversations: {
        success: !convError,
        error: convError?.message,
        count: conversations?.length || 0,
        data: conversations
      },
      participants: {
        success: !partError,
        error: partError?.message,
        count: participants?.length || 0,
        data: participants
      },
      profiles: {
        success: !profilesError,
        error: profilesError?.message,
        count: profiles?.length || 0,
        data: profiles
      },
      messages: {
        success: !messagesError,
        error: messagesError?.message,
        count: messages?.length || 0,
        data: messages
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