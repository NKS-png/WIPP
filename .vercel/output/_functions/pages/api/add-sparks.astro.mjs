import { s as supabase } from '../../chunks/supabase_DJaqNw0S.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ cookies }) => {
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
    const { error } = await supabase.from("profiles").update({ sparks_balance: 10 }).eq("id", sessionData.session.user.id);
    if (error) {
      console.error("Error adding sparks:", error);
      return new Response("Failed to add sparks", { status: 500 });
    }
    return new Response("Sparks added successfully", { status: 200 });
  } catch (error) {
    console.error("Add sparks API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
