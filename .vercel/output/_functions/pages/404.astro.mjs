/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bc4ROJMT.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CXZjk4io.mjs';
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "404 - Page Not Found" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="text-center py-20"> <h1 class="text-6xl font-bold text-neutral-900 mb-4">404</h1> <h2 class="text-2xl font-semibold text-neutral-700 mb-8">Page Not Found</h2> <p class="text-neutral-500 mb-8">The page you're looking for doesn't exist.</p> <a href="/" class="bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors">
Go Home
</a> </div> ` })}`;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/404.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
