import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ cookies }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ counts: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: sessionData } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (!sessionData.session) {
      return new Response(JSON.stringify({ counts: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    let data = null;
    let error = null;
    try {
      const result = await supabase.rpc("get_conversation_unread_counts", {
        p_user_id: sessionData.session.user.id
      });
      data = result.data;
      error = result.error;
    } catch (rpcError) {
      console.log("Unread counts function not available (message-read-tracking.sql not run):", rpcError.message);
      return new Response(JSON.stringify({ counts: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (error) {
      console.error("Error getting conversation unread counts:", error);
      return new Response(JSON.stringify({ counts: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const counts = {};
    if (data) {
      data.forEach((item) => {
        counts[item.conversation_id] = item.unread_count;
      });
    }
    return new Response(JSON.stringify({ counts }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Conversation unread counts API error:", error);
    return new Response(JSON.stringify({ counts: {} }), {
      status: 200,
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
