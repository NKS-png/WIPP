/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DIkOM8_r.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Br4iNQNp.mjs';
import { s as supabase } from '../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$EncryptionStatus = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$EncryptionStatus;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  const refreshToken = Astro2.cookies.get("sb-refresh-token")?.value;
  let currentUser = null;
  if (accessToken && refreshToken) {
    const { data } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    currentUser = data.session?.user;
  }
  if (!currentUser) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Encryption Status" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-neutral-50 dark:bg-black py-8"> <div class="max-w-4xl mx-auto px-4"> <!-- Header --> <div class="mb-8"> <h1 class="text-4xl font-black text-neutral-900 dark:text-white mb-2">
Encryption Status
</h1> <p class="text-neutral-500 dark:text-neutral-400">
Check if your database is properly configured for end-to-end encryption
</p> </div> <!-- Status Container --> <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"> <!-- Loading State --> <div id="loading-state" class="text-center py-8"> <div class="animate-spin w-8 h-8 border-4 border-neutral-200 border-t-blue-500 rounded-full mx-auto mb-4"></div> <p class="text-neutral-600 dark:text-neutral-400">Checking encryption status...</p> </div> <!-- Results --> <div id="results-container" class="hidden space-y-6"> <!-- Overall Status --> <div id="overall-status" class="p-4 rounded-xl border"> <div class="flex items-center gap-3"> <div id="status-icon" class="w-8 h-8 rounded-full flex items-center justify-center"> <!-- Icon will be inserted by JavaScript --> </div> <div> <h3 id="status-title" class="font-bold text-lg"></h3> <p id="status-message" class="text-sm"></p> </div> </div> </div> <!-- Detailed Checks --> <div class="space-y-4"> <h4 class="font-semibold text-neutral-900 dark:text-white">Migration Status:</h4> <div id="check-user-encryption-keys" class="flex items-center gap-3 p-3 rounded-lg border"> <div class="check-icon w-6 h-6 rounded-full flex items-center justify-center"></div> <div> <div class="font-medium">User Encryption Keys Table</div> <div class="text-sm text-neutral-600 dark:text-neutral-400">Required for storing user encryption keys</div> </div> </div> <div id="check-messages-encryption" class="flex items-center gap-3 p-3 rounded-lg border"> <div class="check-icon w-6 h-6 rounded-full flex items-center justify-center"></div> <div> <div class="font-medium">Messages Encryption Columns</div> <div class="text-sm text-neutral-600 dark:text-neutral-400">Required for storing encrypted message content</div> </div> </div> <div id="check-encryption-functions" class="flex items-center gap-3 p-3 rounded-lg border"> <div class="check-icon w-6 h-6 rounded-full flex items-center justify-center"></div> <div> <div class="font-medium">Encryption Functions</div> <div class="text-sm text-neutral-600 dark:text-neutral-400">Required for secure key operations</div> </div> </div> <div id="check-conversation-setup" class="flex items-center gap-3 p-3 rounded-lg border"> <div class="check-icon w-6 h-6 rounded-full flex items-center justify-center"></div> <div> <div class="font-medium">Conversation Creation</div> <div class="text-sm text-neutral-600 dark:text-neutral-400">Required for messaging functionality</div> </div> </div> </div> <!-- Instructions --> <div id="instructions" class="hidden bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"> <div class="flex items-start gap-3"> <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <div class="text-sm"> <p class="font-medium text-amber-900 dark:text-amber-100 mb-2">Database Migration Required</p> <p class="text-amber-700 dark:text-amber-300 mb-3">
To enable encryption, you need to run the SQL migrations in your Supabase database:
</p> <ol class="list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-300"> <li>Go to your Supabase dashboard</li> <li>Navigate to SQL Editor</li> <li>Run the contents of <code class="bg-amber-200 dark:bg-amber-800 px-1 rounded">encryption-setup.sql</code></li> <li>Run the contents of <code class="bg-amber-200 dark:bg-amber-800 px-1 rounded">enhanced-security-schema.sql</code></li> <li>If messaging doesn't work, run <code class="bg-amber-200 dark:bg-amber-800 px-1 rounded">conversation-fix.sql</code></li> </ol> <p class="text-amber-700 dark:text-amber-300 mt-3">
See <code class="bg-amber-200 dark:bg-amber-800 px-1 rounded">DATABASE_MIGRATION_INSTRUCTIONS.md</code> for detailed instructions.
</p> </div> </div> </div> <!-- Success Message --> <div id="success-message" class="hidden bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"> <div class="flex items-start gap-3"> <svg class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg> <div class="text-sm"> <p class="font-medium text-green-900 dark:text-green-100 mb-1">Encryption Ready!</p> <p class="text-green-700 dark:text-green-300">
Your database is properly configured for end-to-end encryption. You can now set up encryption in your chat settings.
</p> </div> </div> </div> <!-- Actions --> <div class="flex gap-3 pt-4"> <button id="refresh-btn" class="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors">
Refresh Status
</button> <a href="/inbox" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
Back to Messages
</a> </div> </div> <!-- Error State --> <div id="error-state" class="hidden text-center py-8"> <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4"> <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <h3 class="font-bold text-neutral-900 dark:text-white mb-2">Error Checking Status</h3> <p id="error-message" class="text-neutral-600 dark:text-neutral-400 mb-4"></p> <button id="retry-btn" class="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
Try Again
</button> </div> </div> </div> </div> ` })} ${renderScript($$result, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/encryption-status.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/encryption-status.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/encryption-status.astro";
const $$url = "/encryption-status";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$EncryptionStatus,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
