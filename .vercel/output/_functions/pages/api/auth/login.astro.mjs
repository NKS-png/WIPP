import { s as supabase } from '../../../chunks/supabase_DJaqNw0S.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  if (!email || !password) {
    return redirect("/login?error=Email and password are required");
  }
  let { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    } else {
      return redirect("/login?message=Account created! Check email or login.");
    }
  } else {
    const session = data.session;
    if (session) {
      cookies.set("sb-access-token", session.access_token, {
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 60 * 60 * 24 * 7
        // 1 week
      });
      cookies.set("sb-refresh-token", session.refresh_token, {
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 60 * 60 * 24 * 30
        // 30 days
      });
    }
    return redirect("/explore");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
