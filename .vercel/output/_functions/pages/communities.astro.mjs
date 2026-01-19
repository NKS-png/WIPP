/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_DIkOM8_r.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Br4iNQNp.mjs';
import { s as supabase } from '../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: communities } = await supabase.from("communities").select(`
    *,
    members:community_members(count)
  `).order("created_at", { ascending: false });
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Communities" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-6 py-12"> <div class="flex justify-between items-center mb-8"> <div> <h1 class="text-4xl font-bold text-neutral-900 dark:text-white">Communities</h1> <p class="text-neutral-500">Find your tribe or start your own.</p> </div> <a href="/communities/create" class="btn-primary px-6 py-2 rounded-full">
+ Create Community
</a> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${communities?.map((c) => renderTemplate`<a${addAttribute(`/c/${c.id}`, "href")} class="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 block"> <div class="flex items-center gap-4 mb-4"> <div class="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-xl font-bold"> ${c.image_url ? renderTemplate`<img${addAttribute(c.image_url, "src")} class="w-full h-full rounded-full object-cover">` : c.name[0]} </div> <div> <h3 class="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">${c.name}</h3> <p class="text-xs text-neutral-500">${c.members?.[0]?.count || 0} members</p> </div> </div> <p class="text-sm text-neutral-500 line-clamp-2">${c.description}</p> </a>`)} </div> </div> ` })}`;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/communities/index.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/communities/index.astro";
const $$url = "/communities";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
