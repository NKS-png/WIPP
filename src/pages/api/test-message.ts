import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('Test message API called');
    
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

    // Test 1: Check if we can read from messages table
    console.log('Test 1: Reading messages...');
    const { data: existingMessages, error: readError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .limit(1);

    console.log('Read test:', { existingMessages, readError });

    // Test 2: Try to insert a test message
    console.log('Test 2: Inserting test message...');
    const testMessage = {
      conversation_id,
      sender_id: sessionData.session.user.id,
      content: 'Test message from API',
      created_at: new Date().toISOString()
    };

    console.log('Inserting:', testMessage);

    const { data: insertResult, error: insertError } = await supabase
      .from('messages')
      .insert(testMessage)
      .select();

    console.log('Insert test:', { insertResult, insertError });

    // Test 3: Check table structure
    console.log('Test 3: Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('messages')
      .select('*')
      .limit(0);

    console.log('Table structure test:', { tableError });

    return new Response(JSON.stringify({
      success: true,
      tests: {
        read: { data: existingMessages, error: readError },
        insert: { data: insertResult, error: insertError },
        table: { error: tableError }
      },
      user: sessionData.session.user.id,
      conversation_id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};