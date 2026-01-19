export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const supabaseUrl = "https://vgdmfnigbbdjvbtphnxh.supabase.co";
    const supabaseKey = "sb_publishable_qNW9fKrKANJgEAL5KkhgLw_MKm7KvUv";
    if (!supabaseUrl || !supabaseKey) ;
    const { createClient } = await import('../../chunks/index_C1jgwVY-.mjs');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from("profiles").select("id").limit(1);
    return new Response(JSON.stringify({
      status: "ok",
      hasData: !!data,
      error: error?.message || null,
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
