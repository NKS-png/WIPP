export { renderers } from '../../../renderers.mjs';

const POST = async () => {
  return new Response(JSON.stringify({
    error: "Auto encryption disabled for serverless compatibility",
    success: false
  }), {
    status: 501,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
