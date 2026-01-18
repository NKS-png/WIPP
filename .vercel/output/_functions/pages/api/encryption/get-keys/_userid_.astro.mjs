import { s as supabase } from '../../../../chunks/supabase_DJaqNw0S.mjs';
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ params, cookies }) => {
  try {
    const { userId } = params;
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
    if (userId !== sessionData.session.user.id) {
      return new Response("Unauthorized", { status: 403 });
    }
    const { data, error } = await supabase.from("user_encryption_keys").select("public_key, encrypted_private_key, key_salt, key_iv").eq("user_id", userId).single();
    if (error) {
      if (error.code === "PGRST116") {
        return new Response("No encryption keys found", { status: 404 });
      }
      console.error("Error fetching encryption keys:", error);
      return new Response("Failed to fetch encryption keys", { status: 500 });
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get keys API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
