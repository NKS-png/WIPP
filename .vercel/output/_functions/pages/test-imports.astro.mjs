/* empty css                                 */
import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CvuIRyz4.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_SShpJa9a.mjs';
export { renderers } from '../renderers.mjs';

const $$TestImports = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Test Imports" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto py-8"> <h1 class="text-3xl font-bold mb-8">Test Dynamic Imports</h1> <div class="space-y-6"> <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"> <h2 class="text-xl font-bold mb-4">Test Supabase Import</h2> <button id="test-supabase-import" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
Test Supabase Import
</button> <div id="supabase-results" class="mt-4 hidden"> <pre id="supabase-content" class="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-sm overflow-auto max-h-96"></pre> </div> </div> <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"> <h2 class="text-xl font-bold mb-4">Test Auto Encryption Import</h2> <button id="test-encryption-import" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
Test Auto Encryption Import
</button> <div id="encryption-results" class="mt-4 hidden"> <pre id="encryption-content" class="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-sm overflow-auto max-h-96"></pre> </div> </div> </div> </div> ` })} ${renderScript($$result, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/test-imports.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/test-imports.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/test-imports.astro";
const $$url = "/test-imports";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestImports,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
