import { s as supabase } from '../../chunks/supabase_DJaqNw0S.mjs';
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
    const { conversation_id } = await request.json();
    if (!conversation_id) {
      return new Response("Missing conversation_id", { status: 400 });
    }
    const currentUserId = sessionData.session.user.id;
    const { data: participants } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conversation_id);
    console.log("Current participants:", participants);
    const isParticipant = participants?.some((p) => p.user_id === currentUserId);
    if (!isParticipant) {
      console.log("Adding current user to conversation");
      const { error } = await supabase.from("conversation_participants").insert({
        conversation_id,
        user_id: currentUserId
      });
      if (error) {
        console.error("Error adding participant:", error);
        return new Response("Failed to repair conversation", { status: 500 });
      }
    }
    const { data: updatedParticipants } = await supabase.from("conversation_participants").select(`
        user_id,
        profiles (username, full_name, email)
      `).eq("conversation_id", conversation_id);
    return new Response(JSON.stringify({
      success: true,
      conversation_id,
      participants: updatedParticipants,
      wasRepaired: !isParticipant
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Auto-repair API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
