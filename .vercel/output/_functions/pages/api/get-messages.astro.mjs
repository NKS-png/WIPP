import { s as supabase } from '../../chunks/supabase_DJaqNw0S.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url, cookies }) => {
  try {
    const conversationId = url.searchParams.get("conversation_id");
    const after = url.searchParams.get("after");
    if (!conversationId) {
      return new Response("Missing conversation_id", { status: 400 });
    }
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
    let query = supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    if (after) {
      const afterDate = new Date(parseInt(after));
      query = query.gt("created_at", afterDate.toISOString());
    }
    const { data: messages, error } = await query;
    if (error) {
      console.error("Error fetching messages:", error);
      return new Response("Failed to fetch messages", { status: 500 });
    }
    return new Response(JSON.stringify({ messages: messages || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get messages API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
