/* empty css                                    */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_DIkOM8_r.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_Br4iNQNp.mjs';
import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Create = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Create;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  const refreshToken = Astro2.cookies.get("sb-refresh-token")?.value;
  let session = null;
  if (accessToken && refreshToken) {
    const { data } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    session = data.session;
  }
  if (!session) {
    return Astro2.redirect("/login");
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Create Community", "data-astro-cid-byxpqqur": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[80vh] flex items-center justify-center px-6 py-12" data-astro-cid-byxpqqur> <div class="w-full max-w-2xl" data-astro-cid-byxpqqur> <div class="text-center mb-10" data-astro-cid-byxpqqur> <h1 class="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-3" data-astro-cid-byxpqqur>
Create a Community
</h1> <p class="text-neutral-500 dark:text-neutral-400 text-lg" data-astro-cid-byxpqqur>
Build a space for like-minded artists to gather and share.
</p> </div> <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 md:p-10 shadow-xl" data-astro-cid-byxpqqur> <form id="create-community-form" class="space-y-6" data-astro-cid-byxpqqur> <!-- Community Name --> <div data-astro-cid-byxpqqur> <label class="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2" data-astro-cid-byxpqqur>
Community Name
</label> <input type="text" id="name" class="w-full px-5 py-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all font-medium placeholder-neutral-400" placeholder="e.g. Digital Artists Hub" maxlength="50" required data-astro-cid-byxpqqur> <p class="text-xs text-neutral-400 mt-1 ml-1" data-astro-cid-byxpqqur>Choose a unique, descriptive name</p> </div> <!-- Description --> <div data-astro-cid-byxpqqur> <label class="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2" data-astro-cid-byxpqqur>
Description
</label> <textarea id="description" class="w-full px-5 py-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all font-medium placeholder-neutral-400 resize-none" rows="5" placeholder="What is this community about? What kind of content and discussions should members expect?" maxlength="500" required data-astro-cid-byxpqqur></textarea> <p class="text-xs text-neutral-400 mt-1 ml-1" data-astro-cid-byxpqqur>Tell people what makes this community special</p> </div> <!-- Community Icon Upload --> <div data-astro-cid-byxpqqur> <label class="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2" data-astro-cid-byxpqqur>
Community Icon (Optional)
</label> <div id="icon-dropzone" class="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-all cursor-pointer bg-neutral-50 dark:bg-neutral-800" data-astro-cid-byxpqqur> <input type="file" id="icon-input" accept="image/*" class="hidden" data-astro-cid-byxpqqur> <div id="icon-placeholder" class="space-y-2" data-astro-cid-byxpqqur> <div class="text-4xl" data-astro-cid-byxpqqur>📷</div> <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-300" data-astro-cid-byxpqqur>
Drop an icon image here
</p> <p class="text-xs text-neutral-400" data-astro-cid-byxpqqur>
or click to browse (Square, max 2MB)
</p> </div> <div id="icon-preview" class="hidden" data-astro-cid-byxpqqur> <img class="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white dark:border-neutral-800 shadow-lg" data-astro-cid-byxpqqur> <p class="text-xs text-neutral-500 mt-2" data-astro-cid-byxpqqur>Click to change</p> </div> </div> </div> <!-- Banner Upload --> <div data-astro-cid-byxpqqur> <label class="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2" data-astro-cid-byxpqqur>
Banner Image (Optional)
</label> <div id="banner-dropzone" class="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-all cursor-pointer bg-neutral-50 dark:bg-neutral-800" data-astro-cid-byxpqqur> <input type="file" id="banner-input" accept="image/*" class="hidden" data-astro-cid-byxpqqur> <div id="banner-placeholder" class="space-y-2" data-astro-cid-byxpqqur> <div class="text-4xl" data-astro-cid-byxpqqur>🖼️</div> <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-300" data-astro-cid-byxpqqur>
Drop a banner image here
</p> <p class="text-xs text-neutral-400" data-astro-cid-byxpqqur>
or click to browse (Wide format, max 5MB)
</p> </div> <div id="banner-preview" class="hidden" data-astro-cid-byxpqqur> <img class="w-full h-32 rounded-lg mx-auto object-cover shadow-lg" data-astro-cid-byxpqqur> <p class="text-xs text-neutral-500 mt-2" data-astro-cid-byxpqqur>Click to change</p> </div> </div> </div> <!-- Error Message --> <div id="error-msg" class="hidden text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800" data-astro-cid-byxpqqur></div> <!-- Progress Bar --> <div id="upload-progress" class="hidden" data-astro-cid-byxpqqur> <div class="bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden" data-astro-cid-byxpqqur> <div id="progress-bar" class="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-300" style="width: 0%" data-astro-cid-byxpqqur></div> </div> <p id="progress-text" class="text-xs text-neutral-500 text-center mt-2" data-astro-cid-byxpqqur>Uploading images...</p> </div> <!-- Submit Button --> <div class="pt-2" data-astro-cid-byxpqqur> <button type="submit" id="submit-btn" class="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2" data-astro-cid-byxpqqur> <span data-astro-cid-byxpqqur>🚀</span> <span data-astro-cid-byxpqqur>Create Community</span> </button> </div> </form> </div> <div class="text-center mt-8" data-astro-cid-byxpqqur> <a href="/communities" class="text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors" data-astro-cid-byxpqqur>
← Back to Communities
</a> </div> </div> </div> ` })} ${renderScript($$result, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/communities/create.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/communities/create.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/communities/create.astro";
const $$url = "/communities/create";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Create,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
