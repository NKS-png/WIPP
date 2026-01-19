import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url, cookies }) => {
  try {
    const conversationId = url.searchParams.get("id");
    if (!conversationId) {
      return new Response("Missing conversation ID", { status: 400 });
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
    const { data: conversation } = await supabase.from("conversations").select("*").eq("id", conversationId).single();
    const { data: allParticipants } = await supabase.from("conversation_participants").select("*").eq("conversation_id", conversationId);
    const { data: participantsWithProfiles } = await supabase.from("conversation_participants").select(`
        user_id,
        profiles (
          id,
          username, 
          full_name, 
          avatar_url
        )
      `).eq("conversation_id", conversationId);
    const otherParticipant = allParticipants?.find((p) => p.user_id !== sessionData.session.user.id);
    let otherUserProfile = null;
    if (otherParticipant) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", otherParticipant.user_id).single();
      otherUserProfile = profile;
    }
    return new Response(JSON.stringify({
      conversationId,
      currentUserId: sessionData.session.user.id,
      conversation,
      allParticipants,
      participantsWithProfiles,
      otherParticipant,
      otherUserProfile,
      participantCount: allParticipants?.length || 0
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Debug API error:", error);
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
