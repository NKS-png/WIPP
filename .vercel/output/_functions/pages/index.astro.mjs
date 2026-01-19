/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_DIkOM8_r.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_Br4iNQNp.mjs';
import { $ as $$ProjectCard } from '../chunks/ProjectCard_B2MfjUnL.mjs';
import { s as supabase } from '../chunks/supabase_CDb81jFl.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const emojis = ["\u{1F600}", "\u{1F603}", "\u{1F604}", "\u{1F601}", "\u{1F606}", "\u{1F605}", "\u{1F602}", "\u{1F923}", "\u{1F60A}", "\u{1F607}", "\u{1F642}", "\u{1F643}", "\u{1F609}", "\u{1F60C}", "\u{1F60D}", "\u{1F970}", "\u{1F618}", "\u{1F617}", "\u{1F619}", "\u{1F61A}", "\u{1F60B}", "\u{1F61B}", "\u{1F61D}", "\u{1F61C}", "\u{1F92A}", "\u{1F928}", "\u{1F9D0}", "\u{1F913}", "\u{1F60E}", "\u{1F929}", "\u{1F973}", "\u{1F60F}", "\u{1F612}", "\u{1F61E}", "\u{1F614}", "\u{1F61F}", "\u{1F615}", "\u{1F641}", "\u2639\uFE0F", "\u{1F623}", "\u{1F616}", "\u{1F62B}", "\u{1F629}", "\u{1F97A}", "\u{1F622}", "\u{1F62D}", "\u{1F624}", "\u{1F620}", "\u{1F621}", "\u{1F92C}", "\u{1F92F}", "\u{1F633}", "\u{1F975}", "\u{1F976}", "\u{1F631}", "\u{1F628}", "\u{1F630}", "\u{1F625}", "\u{1F613}", "\u{1F917}", "\u{1F914}", "\u{1F92D}", "\u{1F92B}", "\u{1F925}", "\u{1F636}", "\u{1F610}", "\u{1F611}", "\u{1F62C}", "\u{1F644}", "\u{1F62F}", "\u{1F626}", "\u{1F627}", "\u{1F62E}", "\u{1F632}", "\u{1F971}", "\u{1F634}", "\u{1F924}", "\u{1F62A}", "\u{1F635}", "\u{1F910}", "\u{1F974}", "\u{1F922}", "\u{1F92E}", "\u{1F927}", "\u{1F637}", "\u{1F912}", "\u{1F915}", "\u{1F911}", "\u{1F920}", "\u{1F608}", "\u{1F47F}", "\u{1F479}", "\u{1F47A}", "\u{1F921}", "\u{1F4A9}", "\u{1F47B}", "\u{1F480}", "\u2620\uFE0F", "\u{1F47D}", "\u{1F47E}", "\u{1F916}", "\u{1F383}", "\u{1F63A}", "\u{1F638}", "\u{1F639}", "\u{1F63B}", "\u{1F63C}", "\u{1F63D}", "\u{1F640}", "\u{1F63F}", "\u{1F63E}"];
  function getEmojiAvatar(username) {
    const hash = username.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const emoji = emojis[hash % emojis.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3f4f6"/><text x="50" y="65" font-size="50" text-anchor="middle">${emoji}</text></svg>`;
    try {
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    } catch (error2) {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
  }
  const { data: projects, error } = await supabase.from("projects").select(`
    *,
    profiles (username, avatar_url, full_name)
  `).order("created_at", { ascending: false }).limit(10);
  const { data: creators } = await supabase.from("profiles").select("id, username, full_name, avatar_url").limit(4);
  const { data: communities } = await supabase.from("communities").select("id, name, image_url, members:community_members(count)").limit(4);
  const categories = [
    "All",
    "Web Design",
    "Mobile Apps",
    "Illustration",
    "AI Art",
    "Branding",
    "3D Motion",
    "Photography"
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Home", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="relative bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800" data-astro-cid-j7pv25f6> <div class="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center animate-fade-in-up" data-astro-cid-j7pv25f6> <h1 class="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-neutral-900 dark:text-white" data-astro-cid-j7pv25f6>
Less <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600" data-astro-cid-j7pv25f6>noise.</span> More art.
</h1> <p class="text-neutral-500 text-base sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4" data-astro-cid-j7pv25f6>
The community-first platform for artists to share work, get real feedback, and grow without algorithms.
</p> <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4" data-astro-cid-j7pv25f6> <a href="/explore" class="btn-primary px-6 sm:px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm sm:text-base" data-astro-cid-j7pv25f6>
Explore Feed
</a> <a href="/communities" class="px-6 sm:px-8 py-3 rounded-full border border-neutral-200 dark:border-neutral-700 font-medium text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm sm:text-base" data-astro-cid-j7pv25f6>
Join a Community
</a> </div> </div> </section> <div class="sticky md:top-24 top-20 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800" data-astro-cid-j7pv25f6> <div class="max-w-7xl mx-auto px-6 py-4" data-astro-cid-j7pv25f6> <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2" data-astro-cid-j7pv25f6> ${categories.map((cat, index) => renderTemplate`<a${addAttribute(`/explore?category=${cat}`, "href")}${addAttribute(`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all transform hover:scale-105 active:scale-95 ${index === 0 ? "bg-neutral-900 dark:bg-white text-white dark:text-black shadow-md" : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"}`, "class")} data-astro-cid-j7pv25f6> ${cat} </a>`)} </div> </div> </div> <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-4 gap-8 sm:gap-12" data-astro-cid-j7pv25f6> <div class="lg:col-span-3 space-y-6 sm:space-y-8 animate-fade-in-up delay-100" data-astro-cid-j7pv25f6> <div class="flex items-center justify-between" data-astro-cid-j7pv25f6> <h2 class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2" data-astro-cid-j7pv25f6> <span class="text-xl sm:text-2xl" data-astro-cid-j7pv25f6>🔥</span> Trending Projects
</h2> <div class="flex gap-2 text-sm font-medium text-neutral-500" data-astro-cid-j7pv25f6> <a href="/explore" class="hover:text-black dark:hover:text-white transition-colors" data-astro-cid-j7pv25f6>View All &rarr;</a> </div> </div> ${projects && projects.length > 0 ? renderTemplate`<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8" data-astro-cid-j7pv25f6> ${projects.map((project) => renderTemplate`${renderComponent($$result2, "ProjectCard", $$ProjectCard, { "project": project, "data-astro-cid-j7pv25f6": true })}`)} </div>` : renderTemplate`<div class="text-center py-16 sm:py-20 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700" data-astro-cid-j7pv25f6> <p class="text-neutral-500 mb-2" data-astro-cid-j7pv25f6>No projects yet. Be the first to post!</p> <a href="/post" class="text-blue-600 font-bold hover:underline mt-2 inline-block text-sm" data-astro-cid-j7pv25f6>Create Project &rarr;</a> </div>`} <div class="text-center pt-6 sm:pt-8 border-t border-neutral-100 dark:border-neutral-800" data-astro-cid-j7pv25f6> <a href="/explore" class="btn-secondary inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm" data-astro-cid-j7pv25f6>
Load more
</a> </div> </div> <aside class="hidden lg:block lg:col-span-1 space-y-8 animate-fade-in-up delay-200" data-astro-cid-j7pv25f6> <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm" data-astro-cid-j7pv25f6> <h3 class="font-bold text-neutral-900 dark:text-white mb-4 text-sm uppercase tracking-wider" data-astro-cid-j7pv25f6>Top Creators</h3> <div class="space-y-4" data-astro-cid-j7pv25f6> ${creators?.map((creator) => renderTemplate`<a${addAttribute(`/profile/${creator.id}`, "href")} class="flex items-center gap-3 group" data-astro-cid-j7pv25f6> <div class="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-100 dark:border-neutral-700" data-astro-cid-j7pv25f6> <img${addAttribute(creator.avatar_url || getEmojiAvatar(creator.username || "user"), "src")} class="w-full h-full object-cover" data-astro-cid-j7pv25f6> </div> <div class="flex-1 min-w-0" data-astro-cid-j7pv25f6> <p class="text-sm font-bold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 transition-colors" data-astro-cid-j7pv25f6> ${creator.full_name || creator.username} </p> <p class="text-xs text-neutral-500 truncate" data-astro-cid-j7pv25f6>@${creator.username}</p> </div> </a>`)} </div> </div> <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm sticky top-32" data-astro-cid-j7pv25f6> <h3 class="font-bold text-neutral-900 dark:text-white mb-4 text-sm uppercase tracking-wider" data-astro-cid-j7pv25f6>Trending Communities</h3> <div class="space-y-4" data-astro-cid-j7pv25f6> ${communities?.map((c) => renderTemplate`<a${addAttribute(`/c/${c.id}`, "href")} class="flex items-center gap-3 group" data-astro-cid-j7pv25f6> <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm" data-astro-cid-j7pv25f6> ${c.image_url ? renderTemplate`<img${addAttribute(c.image_url, "src")} class="w-full h-full object-cover rounded-lg" data-astro-cid-j7pv25f6>` : c.name[0]} </div> <div class="flex-1" data-astro-cid-j7pv25f6> <p class="text-sm font-bold text-neutral-900 dark:text-white group-hover:underline" data-astro-cid-j7pv25f6>${c.name}</p> <p class="text-xs text-neutral-500" data-astro-cid-j7pv25f6>${c.members?.[0]?.count || 0} Members</p> </div> </a>`)} </div> <a href="/communities" class="block mt-4 text-xs font-bold text-blue-600 hover:underline text-center" data-astro-cid-j7pv25f6>
View All Communities &rarr;
</a> </div> </aside> </div> ` })} `;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/index.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
