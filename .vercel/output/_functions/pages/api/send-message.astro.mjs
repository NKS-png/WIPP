import { s as supabase } from '../../chunks/supabase_DJaqNw0S.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    console.log("Send message API called");
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    if (!accessToken || !refreshToken) {
      console.log("No auth tokens found");
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
      console.log("Invalid session");
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("User authenticated:", sessionData.session.user.id);
    const { conversation_id, content } = await request.json();
    console.log("Message data:", { conversation_id, content });
    if (!conversation_id || !content) {
      console.log("Missing required fields");
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: conversation, error: convError } = await supabase.from("conversations").select("id").eq("id", conversation_id).single();
    console.log("Conversation check:", { conversation, convError });
    if (!conversation) {
      console.log("Conversation not found");
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: participant, error: participantError } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conversation_id).eq("user_id", sessionData.session.user.id).single();
    console.log("Participant check:", { participant, participantError });
    if (!participant) {
      console.log("User not participant in conversation");
      return new Response(JSON.stringify({ error: "Not authorized for this conversation" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("User is participant, inserting message");
    const { data, error } = await supabase.from("messages").insert({
      conversation_id,
      sender_id: sessionData.session.user.id,
      content: content.trim()
    }).select();
    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Failed to send message: " + error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Message inserted successfully");
    await supabase.from("conversations").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", conversation_id);
    return new Response(JSON.stringify({
      success: true,
      message: data[0],
      // Return the first message object
      data
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error: " + error.message }), {
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
