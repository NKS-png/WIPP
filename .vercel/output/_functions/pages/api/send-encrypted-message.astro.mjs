import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    if (!accessToken || !refreshToken) {
      return new Response("Not authenticated", { status: 401 });
    }
    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (!sessionData.session) {
      return new Response("Invalid session", { status: 401 });
    }
    const { conversation_id, content, encrypted_content } = await request.json();
    if (!conversation_id) {
      return new Response("Conversation ID is required", { status: 400 });
    }
    if (!content && !encrypted_content) {
      return new Response("Message content is required", { status: 400 });
    }
    const { data: messageId, error } = await supabase.rpc("create_encrypted_message", {
      p_conversation_id: conversation_id,
      p_content: content || "[Encrypted Message]",
      p_encrypted_content: encrypted_content || null
    });
    if (error) {
      console.error("Error creating encrypted message:", error);
      return new Response("Failed to send message", { status: 500 });
    }
    const { data: message, error: fetchError } = await supabase.from("messages").select("*").eq("id", messageId).single();
    if (fetchError) {
      console.error("Error fetching created message:", fetchError);
      return new Response("Message sent but failed to fetch details", { status: 201 });
    }
    return new Response(JSON.stringify({
      success: true,
      message
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Send encrypted message API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
