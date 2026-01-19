import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    console.log("=== DEBUG SEND MESSAGE API ===");
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    console.log("Auth tokens present:", { accessToken: !!accessToken, refreshToken: !!refreshToken });
    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    console.log("Session result:", {
      hasSession: !!sessionData.session,
      userId: sessionData.session?.user?.id,
      sessionError
    });
    if (!sessionData.session) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const requestBody = await request.json();
    console.log("Request body:", requestBody);
    const { conversation_id, content } = requestBody;
    if (!conversation_id || !content) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("=== TEST 1: Check conversation exists ===");
    const { data: conversation, error: convError } = await supabase.from("conversations").select("id").eq("id", conversation_id).single();
    console.log("Conversation check:", { conversation, convError });
    if (convError || !conversation) {
      return new Response(JSON.stringify({
        error: "Conversation not found",
        debug: { convError, conversation }
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("=== TEST 2: Check user participation ===");
    const { data: participant, error: participantError } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conversation_id).eq("user_id", sessionData.session.user.id).single();
    console.log("Participant check:", { participant, participantError });
    if (participantError || !participant) {
      return new Response(JSON.stringify({
        error: "Not authorized for this conversation",
        debug: { participantError, participant }
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("=== TEST 3: Insert message ===");
    const messageData = {
      conversation_id,
      sender_id: sessionData.session.user.id,
      content: content.trim(),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log("Message data to insert:", messageData);
    const { data, error } = await supabase.from("messages").insert(messageData).select();
    console.log("Insert result:", { data, error });
    if (error) {
      return new Response(JSON.stringify({
        error: "Database insert failed",
        debug: {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!data || data.length === 0) {
      return new Response(JSON.stringify({
        error: "No data returned from insert",
        debug: { data }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("=== TEST 4: Update conversation timestamp ===");
    const { error: updateError } = await supabase.from("conversations").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", conversation_id);
    console.log("Update result:", { updateError });
    console.log("=== SUCCESS ===");
    return new Response(JSON.stringify({
      success: true,
      message: data[0],
      debug: {
        messageId: data[0].id,
        conversationId: conversation_id,
        senderId: sessionData.session.user.id
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("=== API ERROR ===", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      debug: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
