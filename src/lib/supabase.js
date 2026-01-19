import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export async function openChat(targetUserId) {
  try {
    console.log('Opening chat with user ID:', targetUserId);
    
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      alert('You must be logged in to open a chat.');
      return;
    }

    const currentUserId = session.session.user.id;
    console.log('Current user ID:', currentUserId);

    // Use API endpoint instead of RPC
    const response = await fetch('/api/create-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_user_id: targetUserId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat Error:', errorText);
      alert('Could not open chat: ' + errorText);
      return;
    }

    const { conversation_id } = await response.json();
    console.log('Got conversation ID:', conversation_id);

    // Redirect to the new inbox page
    console.log('Redirecting to conversation:', conversation_id);
    window.location.href = `/inbox/${conversation_id}`;
  } catch (err) {
    console.error('Unexpected error:', err);
    alert(`An unexpected error occurred: ${err}`);
  }
}