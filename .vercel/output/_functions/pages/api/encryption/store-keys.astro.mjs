import { s as supabase } from '../../../chunks/supabase_DJaqNw0S.mjs';
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
    const { user_id, public_key, encrypted_private_key, key_salt, key_iv } = await request.json();
    if (user_id !== sessionData.session.user.id) {
      return new Response("Unauthorized", { status: 403 });
    }
    const { data, error } = await supabase.from("user_encryption_keys").upsert({
      user_id,
      public_key,
      encrypted_private_key,
      key_salt,
      key_iv,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, {
      onConflict: "user_id"
    });
    if (error) {
      console.error("Error storing encryption keys:", error);
      if (error.message?.includes('relation "user_encryption_keys" does not exist')) {
        return new Response(JSON.stringify({
          error: "Database not configured for encryption",
          message: "Please run the encryption database migrations first. See DATABASE_MIGRATION_INSTRUCTIONS.md",
          code: "TABLE_NOT_FOUND"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        error: "Failed to store encryption keys",
        message: error.message || "Unknown database error",
        code: "DATABASE_ERROR"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Encryption keys stored successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Store keys API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
