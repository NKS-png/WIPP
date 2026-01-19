import { createClient } from '../../../../chunks/index_C1jgwVY-.mjs';
export { renderers } from '../../../../renderers.mjs';

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
    const supabase = createClient(
      "https://vgdmfnigbbdjvbtphnxh.supabase.co",
      "sb_publishable_qNW9fKrKANJgEAL5KkhgLw_MKm7KvUv",
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );
    const { data: { session } } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (!session) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const currentUserId = session.user.id;
    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "Target user ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: existingConversations } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", currentUserId);
    if (existingConversations) {
      for (const conv of existingConversations) {
        const { data: otherParticipant } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conv.conversation_id).eq("user_id", targetUserId).single();
        if (otherParticipant) {
          return new Response(
            JSON.stringify({
              conversationId: conv.conversation_id,
              exists: true
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }
          );
        }
      }
    }
    const { data: newConversation, error: convError } = await supabase.from("conversations").insert({}).select().single();
    if (convError || !newConversation) {
      console.error("Error creating conversation:", convError);
      return new Response(
        JSON.stringify({ error: "Failed to create conversation" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { error: participantsError } = await supabase.from("conversation_participants").insert([
      { conversation_id: newConversation.id, user_id: currentUserId },
      { conversation_id: newConversation.id, user_id: targetUserId }
    ]);
    if (participantsError) {
      console.error("Error adding participants:", participantsError);
      return new Response(
        JSON.stringify({ error: "Failed to add participants" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        conversationId: newConversation.id,
        exists: false
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
