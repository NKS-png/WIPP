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
    const results = {
      authenticated: true,
      user_id: currentUserId,
      tables: {},
      errors: []
    };
    try {
      const { data: conversationsTest, error: conversationsError } = await supabase.from("conversations").select("id").limit(1);
      if (conversationsError) {
        results.tables.conversations = { exists: false, error: conversationsError.message };
        results.errors.push(`Conversations table: ${conversationsError.message}`);
      } else {
        results.tables.conversations = { exists: true, count: conversationsTest?.length || 0 };
      }
    } catch (error) {
      results.tables.conversations = { exists: false, error: error.message };
      results.errors.push(`Conversations table: ${error.message}`);
    }
    try {
      const { data: participantsTest, error: participantsError } = await supabase.from("conversation_participants").select("conversation_id").limit(1);
      if (participantsError) {
        results.tables.conversation_participants = { exists: false, error: participantsError.message };
        results.errors.push(`Conversation participants table: ${participantsError.message}`);
      } else {
        results.tables.conversation_participants = { exists: true, count: participantsTest?.length || 0 };
      }
    } catch (error) {
      results.tables.conversation_participants = { exists: false, error: error.message };
      results.errors.push(`Conversation participants table: ${error.message}`);
    }
    try {
      const { data: messagesTest, error: messagesError } = await supabase.from("messages").select("id").limit(1);
      if (messagesError) {
        results.tables.messages = { exists: false, error: messagesError.message };
        results.errors.push(`Messages table: ${messagesError.message}`);
      } else {
        results.tables.messages = { exists: true, count: messagesTest?.length || 0 };
      }
    } catch (error) {
      results.tables.messages = { exists: false, error: error.message };
      results.errors.push(`Messages table: ${error.message}`);
    }
    try {
      const { data: profilesTest, error: profilesError } = await supabase.from("profiles").select("id").eq("id", currentUserId).single();
      if (profilesError) {
        results.tables.profiles = { exists: false, error: profilesError.message };
        results.errors.push(`Profiles table: ${profilesError.message}`);
      } else {
        results.tables.profiles = { exists: true, user_profile_exists: !!profilesTest };
      }
    } catch (error) {
      results.tables.profiles = { exists: false, error: error.message };
      results.errors.push(`Profiles table: ${error.message}`);
    }
    try {
      const { data: testConversation, error: testError } = await supabase.from("conversations").insert({
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select().single();
      if (testError) {
        results.conversation_creation_test = { success: false, error: testError.message };
        results.errors.push(`Conversation creation test: ${testError.message}`);
      } else {
        await supabase.from("conversations").delete().eq("id", testConversation.id);
        results.conversation_creation_test = { success: true };
      }
    } catch (error) {
      results.conversation_creation_test = { success: false, error: error.message };
      results.errors.push(`Conversation creation test: ${error.message}`);
    }
    return new Response(JSON.stringify(results, null, 2), {
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
