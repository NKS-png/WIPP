/* empty css                                 */
import { e as createComponent, f as createAstro, r as renderTemplate, k as renderComponent, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_Bc4ROJMT.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CXZjk4io.mjs';
import { s as supabase } from '../chunks/supabase_DJaqNw0S.mjs';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Explore = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Explore;
  const emojis = ["\u{1F600}", "\u{1F603}", "\u{1F604}", "\u{1F601}", "\u{1F606}", "\u{1F605}", "\u{1F602}", "\u{1F923}", "\u{1F60A}", "\u{1F607}", "\u{1F642}", "\u{1F643}", "\u{1F609}", "\u{1F60C}", "\u{1F60D}", "\u{1F970}", "\u{1F618}", "\u{1F617}", "\u{1F619}", "\u{1F61A}", "\u{1F60B}", "\u{1F61B}", "\u{1F61D}", "\u{1F61C}", "\u{1F92A}", "\u{1F928}", "\u{1F9D0}", "\u{1F913}", "\u{1F60E}", "\u{1F929}", "\u{1F973}", "\u{1F60F}", "\u{1F612}", "\u{1F61E}", "\u{1F614}", "\u{1F61F}", "\u{1F615}", "\u{1F641}", "\u2639\uFE0F", "\u{1F623}", "\u{1F616}", "\u{1F62B}", "\u{1F629}", "\u{1F97A}", "\u{1F622}", "\u{1F62D}", "\u{1F624}", "\u{1F620}", "\u{1F621}", "\u{1F92C}", "\u{1F92F}", "\u{1F633}", "\u{1F975}", "\u{1F976}", "\u{1F631}", "\u{1F628}", "\u{1F630}", "\u{1F625}", "\u{1F613}", "\u{1F917}", "\u{1F914}", "\u{1F92D}", "\u{1F92B}", "\u{1F925}", "\u{1F636}", "\u{1F610}", "\u{1F611}", "\u{1F62C}", "\u{1F644}", "\u{1F62F}", "\u{1F626}", "\u{1F627}", "\u{1F62E}", "\u{1F632}", "\u{1F971}", "\u{1F634}", "\u{1F924}", "\u{1F62A}", "\u{1F635}", "\u{1F910}", "\u{1F974}", "\u{1F922}", "\u{1F92E}", "\u{1F927}", "\u{1F637}", "\u{1F912}", "\u{1F915}", "\u{1F911}", "\u{1F920}", "\u{1F608}", "\u{1F47F}", "\u{1F479}", "\u{1F47A}", "\u{1F921}", "\u{1F4A9}", "\u{1F47B}", "\u{1F480}", "\u2620\uFE0F", "\u{1F47D}", "\u{1F47E}", "\u{1F916}", "\u{1F383}", "\u{1F63A}", "\u{1F638}", "\u{1F639}", "\u{1F63B}", "\u{1F63C}", "\u{1F63D}", "\u{1F640}", "\u{1F63F}", "\u{1F63E}"];
  function getEmojiAvatar(username) {
    const hash = username.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const emoji = emojis[hash % emojis.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3f4f6"/><text x="50" y="65" font-size="50" text-anchor="middle">${emoji}</text></svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
  }
  const category = Astro2.url.searchParams.get("category");
  const query = Astro2.url.searchParams.get("q");
  let supabaseQuery = supabase.from("projects").select("id, title, description, image_url, category, created_at, user_id, profiles(username, full_name, avatar_url)").order("created_at", { ascending: false });
  if (category && category !== "All") {
    supabaseQuery = supabaseQuery.eq("category", category);
  }
  if (query) {
    supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
  }
  const { data: projects, error } = await supabaseQuery.select("id, title, description, image_url, images, category, created_at, user_id, profiles(username, full_name, avatar_url)");
  if (error) console.error("Explore Fetch Error:", error);
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
  return renderTemplate(_a || (_a = __template(["", ` <script>
  // --- SOUND ANIMATION LOGIC ---
  // A subtle "pop" sound for UI feedback
  const hoverSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
  hoverSound.volume = 0.2; // Keep it subtle

  window.playHoverSound = () => {
    // Clone node allows playing rapidly without waiting for previous to finish
    const sound = hoverSound.cloneNode();
    sound.volume = 0.1;
    sound.play().catch(() => {
        // Ignore auto-play errors (user hasn't interacted yet)
    });
  };
<\/script> `])), renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Explore", "data-astro-cid-jsy7jxlt": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="sticky top-24 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 transition-all mt-6" data-astro-cid-jsy7jxlt> <div class="max-w-7xl mx-auto px-6 py-4" data-astro-cid-jsy7jxlt> <div class="flex flex-col gap-4 mb-6" data-astro-cid-jsy7jxlt> <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2" data-astro-cid-jsy7jxlt>
Explore <span class="text-neutral-400 font-normal text-lg md:text-xl" data-astro-cid-jsy7jxlt>/ ${category || "All Work"}</span> </h1> <form action="/explore" method="get" class="relative group w-full" data-astro-cid-jsy7jxlt> <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-astro-cid-jsy7jxlt> <svg class="h-4 w-4 text-neutral-400 group-focus-within:text-neutral-900 dark:group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-jsy7jxlt> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-astro-cid-jsy7jxlt></path> </svg> </div> <input type="text" name="q"${addAttribute(query || "", "value")} placeholder="Search projects..." class="block w-full pl-10 pr-3 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" data-astro-cid-jsy7jxlt> ${category && renderTemplate`<input type="hidden" name="category"${addAttribute(category, "value")} data-astro-cid-jsy7jxlt>`} </form> </div> <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2" data-astro-cid-jsy7jxlt> ${categories.map((cat) => {
    const isActive = cat === "All" && !category || cat === category;
    return renderTemplate`<a${addAttribute(`/explore?category=${cat === "All" ? "" : cat}`, "href")}${addAttribute(`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all transform hover:scale-105 active:scale-95 ${isActive ? "bg-neutral-900 dark:bg-white text-white dark:text-black shadow-md" : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"}`, "class")} data-astro-cid-jsy7jxlt> ${cat} </a>`;
  })} </div> </div> </div> <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-screen" data-astro-cid-jsy7jxlt> ${projects && projects.length > 0 ? renderTemplate`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-astro-cid-jsy7jxlt> ${projects.map((project, index) => renderTemplate`<a${addAttribute(`/project/${project.id}`, "href")} class="project-card group relative block bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2"${addAttribute(`animation-delay: ${index * 50}ms`, "style")} onmouseenter="playHoverSound()" data-astro-cid-jsy7jxlt> <div class="aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative" data-astro-cid-jsy7jxlt> ${project.image_url ? renderTemplate`<img${addAttribute(project.image_url, "src")}${addAttribute(project.title, "alt")} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" data-astro-cid-jsy7jxlt>` : renderTemplate`<div class="w-full h-full flex items-center justify-center text-neutral-300" data-astro-cid-jsy7jxlt> <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-jsy7jxlt><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" data-astro-cid-jsy7jxlt></path></svg> </div>`}  ${project.images && project.images.length > 1 && renderTemplate`<div class="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1" data-astro-cid-jsy7jxlt> <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-jsy7jxlt> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" data-astro-cid-jsy7jxlt></path> </svg> ${project.images.length} </div>`} <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-astro-cid-jsy7jxlt></div> </div> <div class="p-4" data-astro-cid-jsy7jxlt> <div class="flex items-center justify-between mb-2" data-astro-cid-jsy7jxlt> <div class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide" data-astro-cid-jsy7jxlt> ${project.category || "General"} </div> <div class="text-xs text-neutral-400" data-astro-cid-jsy7jxlt> ${new Date(project.created_at).toLocaleDateString()} </div> </div> <h3 class="text-base font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2" data-astro-cid-jsy7jxlt> ${project.title} </h3> <p class="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3" data-astro-cid-jsy7jxlt> ${project.description} </p> <div class="flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800" data-astro-cid-jsy7jxlt> <div class="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0" data-astro-cid-jsy7jxlt> <img${addAttribute(project.profiles?.avatar_url || getEmojiAvatar(project.profiles?.username || "user"), "src")} class="w-full h-full object-cover" data-astro-cid-jsy7jxlt> </div> <span class="text-xs font-medium text-neutral-600 dark:text-neutral-300 truncate" data-astro-cid-jsy7jxlt> ${project.profiles?.full_name || "Anonymous"} </span> </div> </div> </a>`)} </div>` : (
    /* Empty State */
    renderTemplate`<div class="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up" data-astro-cid-jsy7jxlt> <div class="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6" data-astro-cid-jsy7jxlt> <svg class="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-jsy7jxlt><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-astro-cid-jsy7jxlt></path></svg> </div> <h2 class="text-xl font-bold text-neutral-900 dark:text-white mb-2" data-astro-cid-jsy7jxlt>No projects found</h2> <p class="text-neutral-500 max-w-md mx-auto mb-6 text-sm" data-astro-cid-jsy7jxlt>
We couldn't find anything matching your search. Try a different category or term.
</p> <a href="/explore" class="btn-secondary px-6 py-2 rounded-full text-sm" data-astro-cid-jsy7jxlt>Clear Filters</a> </div>`
  )} </div> ` }));
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/explore.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/explore.astro";
const $$url = "/explore";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Explore,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
