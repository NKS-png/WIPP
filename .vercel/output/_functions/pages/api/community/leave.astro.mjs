import { s as supabase } from '../../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../../renderers.mjs';

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
    const { community_id } = await request.json();
    if (!community_id) {
      return new Response("Missing community_id", { status: 400 });
    }
    const { error } = await supabase.from("community_members").delete().match({
      community_id,
      user_id: sessionData.session.user.id
    });
    if (error) {
      console.error("Database error:", error);
      return new Response("Failed to leave community", { status: 500 });
    }
    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
