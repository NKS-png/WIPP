import { s as supabase } from '../../../../chunks/supabase_DJaqNw0S.mjs';
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ params, cookies }) => {
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
    const { userId } = params;
    const { data: keyData, error } = await supabase.from("user_encryption_keys").select("id").eq("user_id", userId).single();
    const hasKeys = !error && keyData !== null;
    return new Response(JSON.stringify({ hasKeys }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Check keys API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
