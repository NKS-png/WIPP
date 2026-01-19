import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ cookies }) => {
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
    const { data: myParticipations } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", sessionData.session.user.id);
    if (!myParticipations || myParticipations.length === 0) {
      return new Response(JSON.stringify({ conversations: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const conversationIds = myParticipations.map((p) => p.conversation_id);
    const { data: conversations } = await supabase.from("conversations").select("*").in("id", conversationIds).order("updated_at", { ascending: false });
    const conversationsWithParticipants = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { count: messageCount } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("conversation_id", conv.id);
        if (!messageCount || messageCount === 0) {
          return null;
        }
        const { data: participants } = await supabase.from("conversation_participants").select(`
            user_id,
            profiles (username, full_name, email)
          `).eq("conversation_id", conv.id).neq("user_id", sessionData.session.user.id);
        const { data: lastMessage } = await supabase.from("messages").select("content, created_at, sender_id").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(1).single();
        return {
          ...conv,
          otherParticipants: participants || [],
          lastMessage,
          messageCount
        };
      })
    );
    const validConversations = conversationsWithParticipants.filter((c) => c !== null);
    return new Response(JSON.stringify({
      conversations: validConversations,
      currentUserId: sessionData.session.user.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("My conversations API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
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
