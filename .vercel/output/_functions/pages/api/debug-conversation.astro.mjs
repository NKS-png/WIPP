import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url, cookies }) => {
  try {
    const conversationId = url.searchParams.get("id");
    if (!conversationId) {
      return new Response(JSON.stringify({
        error: "Missing conversation ID",
        usage: "Add ?id=conversation-id to the URL"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({
        error: "Not authenticated",
        authenticated: false
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (!sessionData.session) {
      return new Response(JSON.stringify({
        error: "Invalid session",
        authenticated: false
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const currentUserId = sessionData.session.user.id;
    const results = {
      authenticated: true,
      user_id: currentUserId,
      conversation_id: conversationId,
      tests: {}
    };
    try {
      const { data: conversation, error: convError } = await supabase.from("conversations").select("*").eq("id", conversationId).single();
      if (convError) {
        results.tests.conversation_exists = { success: false, error: convError.message };
      } else {
        results.tests.conversation_exists = {
          success: true,
          data: conversation
        };
      }
    } catch (error) {
      results.tests.conversation_exists = { success: false, error: error.message };
    }
    try {
      const { data: allParticipants, error: participantsError } = await supabase.from("conversation_participants").select("user_id, profiles(username, full_name, avatar_url)").eq("conversation_id", conversationId);
      if (participantsError) {
        results.tests.participants_query = { success: false, error: participantsError.message };
      } else {
        results.tests.participants_query = {
          success: true,
          count: allParticipants?.length || 0,
          data: allParticipants
        };
      }
    } catch (error) {
      results.tests.participants_query = { success: false, error: error.message };
    }
    try {
      const { data: simpleParticipants, error: simpleError } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conversationId);
      if (simpleError) {
        results.tests.simple_participants = { success: false, error: simpleError.message };
      } else {
        results.tests.simple_participants = {
          success: true,
          count: simpleParticipants?.length || 0,
          data: simpleParticipants
        };
      }
    } catch (error) {
      results.tests.simple_participants = { success: false, error: error.message };
    }
    try {
      const { data: userParticipation, error: userError } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conversationId).eq("user_id", currentUserId).single();
      if (userError) {
        results.tests.user_participation = { success: false, error: userError.message };
      } else {
        results.tests.user_participation = {
          success: true,
          is_participant: !!userParticipation
        };
      }
    } catch (error) {
      results.tests.user_participation = { success: false, error: error.message };
    }
    try {
      const { data: messages, error: messagesError } = await supabase.from("messages").select("id, content, created_at, sender_id").eq("conversation_id", conversationId).limit(5);
      if (messagesError) {
        results.tests.messages_query = { success: false, error: messagesError.message };
      } else {
        results.tests.messages_query = {
          success: true,
          count: messages?.length || 0,
          data: messages
        };
      }
    } catch (error) {
      results.tests.messages_query = { success: false, error: error.message };
    }
    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message,
      authenticated: false
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
