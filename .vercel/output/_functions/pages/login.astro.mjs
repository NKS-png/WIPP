/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DIkOM8_r.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Br4iNQNp.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const url = new URL(Astro2.request.url);
  const error = url.searchParams.get("error");
  const message = url.searchParams.get("message");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Login", "data-astro-cid-sgpqyurt": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-md mx-auto py-12 sm:py-20 px-4 sm:px-0" data-astro-cid-sgpqyurt> <h1 class="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center animate-fade-in-up" data-astro-cid-sgpqyurt>Welcome Back</h1> <form action="/api/auth/login" method="post" class="space-y-4 sm:space-y-5" id="loginForm" data-astro-cid-sgpqyurt> <div class="group" data-astro-cid-sgpqyurt> <label class="block text-xs font-bold uppercase text-neutral-500 mb-2 transition-colors group-focus-within:text-neutral-900 dark:group-focus-within:text-white" data-astro-cid-sgpqyurt>Email</label> <input type="email" name="email" class="input-field w-full transition-all duration-200 focus:scale-[1.01] text-base" required placeholder="name@example.com" data-astro-cid-sgpqyurt> </div> <div class="group" data-astro-cid-sgpqyurt> <label class="block text-xs font-bold uppercase text-neutral-500 mb-2 transition-colors group-focus-within:text-neutral-900 dark:group-focus-within:text-white" data-astro-cid-sgpqyurt>Password</label> <input type="password" name="password" class="input-field w-full transition-all duration-200 focus:scale-[1.01] text-base" required placeholder="••••••••" data-astro-cid-sgpqyurt> </div> <div class="pt-4" data-astro-cid-sgpqyurt> <button type="submit" id="submitBtn" class="btn-primary w-full relative overflow-hidden transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 h-12 text-base" data-astro-cid-sgpqyurt> <span id="btnText" class="font-medium" data-astro-cid-sgpqyurt>Sign In / Sign Up</span> <svg id="btnSpinner" class="hidden animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-astro-cid-sgpqyurt> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-astro-cid-sgpqyurt></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-astro-cid-sgpqyurt></path> </svg> </button> </div> ${error && renderTemplate`<div class="animate-shake text-sm text-center text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 py-2 rounded-lg border border-red-100 dark:border-red-900" data-astro-cid-sgpqyurt> ${error} </div>`} ${message && renderTemplate`<div class="animate-fade-in text-sm text-center text-neutral-500 mt-4 bg-neutral-50 dark:bg-neutral-800 py-2 rounded-lg" data-astro-cid-sgpqyurt> ${message} </div>`} </form> </div> ` })} ${renderScript($$result, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/login.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/login.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
