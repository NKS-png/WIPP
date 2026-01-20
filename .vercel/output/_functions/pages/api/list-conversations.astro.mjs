import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ cookies }) => {
  try {
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
    const { data: allConversations, error: allConvError } = await supabase.from("conversations").select("*").limit(10);
    const { data: allParticipants, error: allPartError } = await supabase.from("conversation_participants").select("*").limit(20);
    const { data: userParticipations, error: userPartError } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", currentUserId);
    return new Response(JSON.stringify({
      authenticated: true,
      user_id: currentUserId,
      all_conversations: {
        success: !allConvError,
        error: allConvError?.message,
        count: allConversations?.length || 0,
        data: allConversations
      },
      all_participants: {
        success: !allPartError,
        error: allPartError?.message,
        count: allParticipants?.length || 0,
        data: allParticipants
      },
      user_participations: {
        success: !userPartError,
        error: userPartError?.message,
        count: userParticipations?.length || 0,
        data: userParticipations
      }
    }, null, 2), {
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
