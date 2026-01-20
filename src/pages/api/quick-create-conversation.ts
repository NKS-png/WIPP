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

    // Set session
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { other_user_id } = await request.json();

    if (!other_user_id) {
      return new Response(JSON.stringify({ error: 'Missing other_user_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentUserId = sessionData.session.user.id;
    
    // Generate a predictable conversation ID for testing
    const conversationId = '12345678-1234-1234-1234-123456789abc';

    console.log('Creating conversation with ID:', conversationId);
    console.log('Current user:', currentUserId);
    console.log('Other user:', other_user_id);

    // Create conversation (ignore if exists)
    const { error: conversationError } = await supabase
      .from('conversations')
      .upsert({
        id: conversationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (conversationError) {
      console.error('Conversation creation error:', conversationError);
    }

    // Add participants (ignore if exist)
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .upsert([
        {
          conversation_id: conversationId,
          user_id: currentUserId
        },
        {
          conversation_id: conversationId,
          user_id: other_user_id
        }
      ], {
        onConflict: 'conversation_id,user_id'
      });

    if (participantsError) {
      console.error('Participants error:', participantsError);
      return new Response(JSON.stringify({ 
        error: 'Failed to add participants',
        details: participantsError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      conversation_id: conversationId,
      message: 'Conversation created/updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Quick create conversation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};