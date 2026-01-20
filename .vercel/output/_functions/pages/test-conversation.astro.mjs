/* empty css                                 */
import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CvuIRyz4.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_SShpJa9a.mjs';
export { renderers } from '../renderers.mjs';

const $$TestConversation = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Test Conversation Access" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto py-8"> <h1 class="text-3xl font-bold mb-8">Test Conversation Access</h1> <div class="space-y-6"> <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"> <h2 class="text-xl font-bold mb-4">Test Conversation Debug</h2> <div class="space-y-4"> <div> <label class="block text-sm font-medium mb-2">Conversation ID:</label> <input type="text" id="conversation-id" placeholder="Enter conversation ID to test" class="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"> </div> <button id="test-conversation" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
Test Conversation Access
</button> </div> <div id="test-results" class="mt-6 hidden"> <h3 class="text-lg font-semibold mb-3">Test Results:</h3> <pre id="results-content" class="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-sm overflow-auto max-h-96"></pre> </div> </div> <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"> <h2 class="text-xl font-bold mb-4">Test Authentication</h2> <button id="test-auth" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
Test Authentication Status
</button> <div id="auth-results" class="mt-4 hidden"> <pre id="auth-content" class="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-sm overflow-auto max-h-96"></pre> </div> </div> <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"> <h2 class="text-xl font-bold mb-4">Test Inbox Data</h2> <button id="test-inbox" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
Test Inbox Data Access
</button> <div id="inbox-results" class="mt-4 hidden"> <pre id="inbox-content" class="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-sm overflow-auto max-h-96"></pre> </div> </div> </div> </div> ` })} ${renderScript($$result, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/test-conversation.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/test-conversation.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/test-conversation.astro";
const $$url = "/test-conversation";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TestConversation,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
