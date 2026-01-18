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
    const { conversation_id, target_user_id } = await request.json();
    if (!conversation_id || !target_user_id) {
      return new Response("Missing required fields", { status: 400 });
    }
    const { data: existingParticipants } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conversation_id);
    console.log("Existing participants:", existingParticipants);
    const currentUserId = sessionData.session.user.id;
    const participantIds = existingParticipants?.map((p) => p.user_id) || [];
    const missingParticipants = [];
    if (!participantIds.includes(currentUserId)) {
      missingParticipants.push({ conversation_id, user_id: currentUserId });
    }
    if (!participantIds.includes(target_user_id)) {
      missingParticipants.push({ conversation_id, user_id: target_user_id });
    }
    if (missingParticipants.length > 0) {
      console.log("Adding missing participants:", missingParticipants);
      const { error } = await supabase.from("conversation_participants").insert(missingParticipants);
      if (error) {
        console.error("Error adding participants:", error);
        return new Response("Failed to repair conversation", { status: 500 });
      }
    }
    const { data: profiles } = await supabase.from("profiles").select("id, username, full_name").in("id", [currentUserId, target_user_id]);
    console.log("User profiles:", profiles);
    return new Response(JSON.stringify({
      success: true,
      participants: missingParticipants.length,
      profiles: profiles?.length || 0
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Repair API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
