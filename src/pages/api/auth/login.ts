import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return redirect("/login?error=Email and password are required");
  }

  // Try login first
  let { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // If login fails, try signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    } else {
      // Signup successful, but may need email confirmation
      return redirect("/login?message=Account created! Check email or login.");
    }
  } else {
    // Login successful
    const session = data.session;
    if (session) {
      cookies.set("sb-access-token", session.access_token, {
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      cookies.set("sb-refresh-token", session.refresh_token, {
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    return redirect("/explore");
  }
};