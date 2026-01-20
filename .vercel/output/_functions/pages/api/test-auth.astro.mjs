import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ cookies }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({
        authenticated: false,
        message: "No auth cookies found",
        cookies: {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({
        authenticated: false,
        message: "Invalid session",
        error: sessionError?.message,
        sessionData: !!sessionData.session
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const user = sessionData.session.user;
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    return new Response(JSON.stringify({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile,
      profileError: profileError?.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      authenticated: false,
      error: "Internal server error",
      details: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
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
