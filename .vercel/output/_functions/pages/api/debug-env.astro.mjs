export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const envVars = {
      PUBLIC_SUPABASE_URL: "https://vgdmfnigbbdjvbtphnxh.supabase.co",
      PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_qNW9fKrKANJgEAL5KkhgLw_MKm7KvUv" ? "[PRESENT]" : "[MISSING]",
      NODE_ENV: process.env.NODE_ENV || process.env.NODE_ENV,
      VERCEL: undefined                       || process.env.VERCEL,
      VERCEL_ENV: undefined                           || process.env.VERCEL_ENV
    };
    return new Response(JSON.stringify({
      status: "ok",
      environment: envVars,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: "error",
      error: error.message,
      stack: error.stack,
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
