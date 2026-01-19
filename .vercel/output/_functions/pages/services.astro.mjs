/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DIkOM8_r.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Br4iNQNp.mjs';
import { s as supabase } from '../chunks/supabase_CDb81jFl.mjs';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const $$Services = createComponent(async ($$result, $$props, $$slots) => {
  const { data: services, error } = await supabase.from("services").select(`
    *,
    profiles (username, full_name, avatar_url)
  `).order("created_at", { ascending: false });
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Explore Services", "data-astro-cid-ucd2ps2b": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="relative bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800" data-astro-cid-ucd2ps2b> <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center animate-fade-in-up" data-astro-cid-ucd2ps2b> <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4" data-astro-cid-ucd2ps2b>
Find the perfect <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" data-astro-cid-ucd2ps2b>creative service</span>.
</h1> <p class="text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto mb-6 sm:mb-8" data-astro-cid-ucd2ps2b>
Connect with talented creators offering design, development, writing, and more.
</p> <div class="max-w-md mx-auto relative group" data-astro-cid-ucd2ps2b> <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" data-astro-cid-ucd2ps2b> <svg class="h-5 w-5 text-neutral-400 group-focus-within:text-neutral-900 dark:group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ucd2ps2b> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-astro-cid-ucd2ps2b></path> </svg> </div> <input type="text" placeholder="Search services (e.g. Logo Design)..." class="block w-full pl-11 pr-4 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:bg-white dark:focus:bg-neutral-900 transition-all shadow-sm text-sm sm:text-base" data-astro-cid-ucd2ps2b> </div> </div> </div> <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12" data-astro-cid-ucd2ps2b>  <div class="flex flex-col items-center justify-center py-20 sm:py-24 text-center animate-fade-in-up" data-astro-cid-ucd2ps2b> <div class="w-16 sm:w-20 h-16 sm:h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 sm:mb-6" data-astro-cid-ucd2ps2b> <svg class="w-6 sm:w-8 h-6 sm:h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ucd2ps2b><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-ucd2ps2b></path></svg> </div> <h3 class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2" data-astro-cid-ucd2ps2b>Services Coming Soon</h3> <p class="text-neutral-500 max-w-md mb-6 sm:mb-8 text-sm sm:text-base" data-astro-cid-ucd2ps2b>
We're working on bringing you a marketplace for creative services based on community feedback. Stay tuned!
</p> </div> </div> ` })} `;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/services.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/services.astro";
const $$url = "/services";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Services,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
