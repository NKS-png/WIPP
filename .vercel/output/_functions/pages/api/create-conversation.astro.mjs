import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (!sessionData.session) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const requestBody = await request.json();
    const { target_user_id } = requestBody;
    if (!target_user_id) {
      return new Response(JSON.stringify({ error: "Missing target_user_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const currentUserId = sessionData.session.user.id;
    if (currentUserId === target_user_id) {
      return new Response(JSON.stringify({ error: "Cannot create conversation with yourself" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: existingParticipants } = await supabase.from("conversation_participants").select("conversation_id, user_id").or(`user_id.eq.${currentUserId},user_id.eq.${target_user_id}`);
    let sharedConversationId = null;
    if (existingParticipants && existingParticipants.length > 0) {
      const conversationCounts = {};
      existingParticipants.forEach((p) => {
        conversationCounts[p.conversation_id] = (conversationCounts[p.conversation_id] || 0) + 1;
      });
      for (const [convId, count] of Object.entries(conversationCounts)) {
        if (count === 2) {
          sharedConversationId = convId;
          break;
        }
      }
    }
    if (sharedConversationId) {
      return new Response(JSON.stringify({
        conversation_id: sharedConversationId
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: newConversation, error: conversationError } = await supabase.from("conversations").insert({
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (conversationError) {
      return new Response(JSON.stringify({
        error: "Failed to create conversation",
        details: conversationError.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { error: participantsError } = await supabase.from("conversation_participants").insert([
      { conversation_id: newConversation.id, user_id: currentUserId },
      { conversation_id: newConversation.id, user_id: target_user_id }
    ]);
    if (participantsError) {
      await supabase.from("conversations").delete().eq("id", newConversation.id);
      return new Response(JSON.stringify({
        error: "Failed to add conversation participants",
        details: participantsError.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      conversation_id: newConversation.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
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
