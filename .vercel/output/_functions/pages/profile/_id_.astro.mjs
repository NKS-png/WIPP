/* empty css                                    */
import { e as createComponent, f as createAstro, m as maybeRenderHead, h as addAttribute, l as renderScript, r as renderTemplate, k as renderComponent, q as Fragment } from '../../chunks/astro/server_DIkOM8_r.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_Br4iNQNp.mjs';
import { $ as $$ProjectCard } from '../../chunks/ProjectCard_B2MfjUnL.mjs';
import 'clsx';
import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro$1 = createAstro();
const $$MessageButton = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$MessageButton;
  const { userId, username, variant = "primary", size = "md" } = Astro2.props;
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg"
  };
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800"
  };
  return renderTemplate`${maybeRenderHead()}<button${addAttribute(`message-btn-${userId}`, "id")}${addAttribute(userId, "data-user-id")}${addAttribute(username, "data-username")}${addAttribute(`inline-flex items-center gap-2 font-semibold rounded-full transition-colors duration-200 ${sizeClasses[size]} ${variantClasses[variant]}`, "class")}> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path> </svg>
Message
</button> ${renderScript($$result, "/Users/nikhilsingh/Documents/websites/wipp/src/components/MessageButton.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/components/MessageButton.astro", void 0);

const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  Astro2.response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  Astro2.response.headers.set("Pragma", "no-cache");
  Astro2.response.headers.set("Expires", "0");
  const { id } = Astro2.params;
  const { data: sessionData } = await supabase.auth.getSession();
  const currentUser = sessionData?.session?.user;
  const isOwner = currentUser?.id === id;
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (profileError || !profile) return Astro2.redirect("/404");
  const { data: projects } = await supabase.from("projects").select("*").eq("user_id", id).order("created_at", { ascending: false });
  const { data: services } = await supabase.from("services").select("*").eq("user_id", id);
  const { data: userPosts } = await supabase.from("posts").select(`*, communities (name)`).eq("user_id", id).order("created_at", { ascending: false });
  const displayName = profile.full_name || profile.username || "Unknown";
  const initial = displayName.charAt(0).toUpperCase();
  console.log("Profile ID:", id);
  console.log("Current User:", currentUser);
  console.log("isOwner:", isOwner);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": displayName }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="relative bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800"> <div class="relative group h-64 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden"> ${profile.banner_url ? renderTemplate`<img${addAttribute(profile.banner_url, "src")} class="w-full h-full object-cover" alt="Profile Banner">` : renderTemplate`<div class="w-full h-full bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900"></div>`} ${isOwner && renderTemplate`<a href="/settings" class="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
📷 Edit Cover
</a>`} </div> <div class="max-w-7xl mx-auto px-6"> <div class="flex flex-col md:flex-row items-start gap-6 -mt-16 pb-8"> <div class="relative group"> <div class="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-950 bg-white dark:bg-neutral-900 overflow-hidden flex items-center justify-center text-4xl font-bold shadow-sm"> ${profile.avatar_url ? renderTemplate`<img${addAttribute(profile.avatar_url, "src")} class="w-full h-full object-cover" alt="Profile">` : renderTemplate`<span class="text-neutral-400">${initial}</span>`} </div>  ${isOwner && renderTemplate`<a href="/settings" class="border border-neutral-300 dark:border-neutral-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
Edit Profile
</a>`} </div> <div class="flex-1 pt-16 md:pt-0 mt-2"> <div class="flex justify-between items-start"> <div> <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">${displayName}</h1> <p class="text-neutral-500">@${profile.username || "user"}</p> <p class="mt-2 text-neutral-600 dark:text-neutral-400 max-w-lg">${profile.bio || "No bio yet."}</p> </div> <div class="flex gap-3"> ${isOwner ? renderTemplate`<a href="/settings" class="px-4 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-900 dark:text-white">
Edit Profile
</a>` : currentUser ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <button class="px-6 py-2 text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full hover:opacity-90 transition-opacity">
Follow
</button> ${renderComponent($$result3, "MessageButton", $$MessageButton, { "userId": id, "username": profile.username || "user", "variant": "secondary", "size": "sm" })} ` })}` : null} </div> </div> </div> </div> ${!isOwner && currentUser && renderTemplate`<div class="flex justify-center mb-6"> ${renderComponent($$result2, "MessageButton", $$MessageButton, { "userId": id, "username": profile.username || "user", "variant": "primary", "size": "lg" })} </div>`} <div class="flex gap-8 border-b border-neutral-200 dark:border-neutral-800 text-sm font-medium"> <button class="tab-btn active-tab pb-4 border-b-2 border-black dark:border-white text-black dark:text-white" data-target="tab-portfolio">
Portfolio <span class="ml-1 text-neutral-400 text-xs">${projects?.length || 0}</span> </button> <button class="tab-btn pb-4 border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors" data-target="tab-services">
Services
</button> <button class="tab-btn pb-4 border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors" data-target="tab-posts">
Posts <span class="ml-1 text-neutral-400 text-xs">${userPosts?.length || 0}</span> </button> </div> </div> </div> <div class="max-w-7xl mx-auto px-6 py-12 min-h-[500px]"> <div id="tab-portfolio" class="tab-content"> ${projects && projects.length > 0 ? renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> ${projects.map((p) => renderTemplate`${renderComponent($$result2, "ProjectCard", $$ProjectCard, { "project": p })}`)} </div>` : renderTemplate`<div class="text-center py-20 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700"> <p class="text-neutral-500">No projects uploaded yet.</p> </div>`} </div> <div id="tab-services" class="tab-content hidden"> <div class="text-center py-20"> <div class="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">💼</div> <h3 class="text-lg font-bold mb-1 text-neutral-900 dark:text-white">Services</h3> <p class="text-neutral-500 mb-6">This user hasn't listed any services yet.</p> ${isOwner && renderTemplate`<button id="add-service-btn" class="btn-primary text-sm px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full">Add a Service</button>`} </div> </div> <div id="tab-posts" class="tab-content hidden"> ${userPosts && userPosts.length > 0 ? renderTemplate`<div class="space-y-6"> ${userPosts.map((post) => renderTemplate`<div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm"> <div class="flex items-center gap-3 mb-3"> <a${addAttribute(`/profile/${post.user_id}`, "href")} class="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden"> <img${addAttribute(profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username || "user"}`, "src")} class="w-full h-full object-cover"> </a> <div> <a${addAttribute(`/profile/${post.user_id}`, "href")} class="font-bold text-neutral-900 dark:text-white hover:underline block leading-tight">${displayName}</a> <span class="text-xs text-neutral-500">${new Date(post.created_at).toLocaleDateString()}</span> ${post.communities && renderTemplate`<span class="text-xs text-neutral-500 ml-2">in c/${post.communities.name}</span>`} </div> </div> <p class="text-neutral-800 dark:text-neutral-200 text-lg leading-relaxed whitespace-pre-wrap">${post.content}</p> ${post.images && post.images.length > 0 ? renderTemplate`<div class="mt-4 relative"> ${post.images.length === 1 ? renderTemplate`<img${addAttribute(post.images[0], "src")} class="w-full h-auto rounded-lg">` : renderTemplate`<div class="image-slider"${addAttribute(JSON.stringify(post.images), "data-images")}> <div class="slider-container overflow-hidden rounded-lg"> <div class="slider-track flex transition-transform duration-300 ease-in-out"> ${post.images.map((img, index) => renderTemplate`<img${addAttribute(img, "src")} class="w-full h-auto flex-shrink-0">`)} </div> </div> <button class="slider-prev absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> </button> <button class="slider-next absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg> </button> <div class="slider-dots flex justify-center gap-2 mt-4"> ${post.images.map((_, index) => renderTemplate`<button${addAttribute(`w-2 h-2 rounded-full transition-colors ${index === 0 ? "bg-black dark:bg-white" : "bg-neutral-300 dark:bg-neutral-600"}`, "class")}${addAttribute(index, "data-slide")}></button>`)} </div> </div>`} </div>` : post.image_url ? renderTemplate`<img${addAttribute(post.image_url, "src")} class="w-full h-auto rounded-lg mt-4">` : null} </div>`)} </div>` : renderTemplate`<div class="text-center py-20"> <div class="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📝</div> <h3 class="text-lg font-bold mb-1 text-neutral-900 dark:text-white">No Posts Yet</h3> <p class="text-neutral-500">This user hasn't posted anything yet.</p> </div>`} </div> </div> <div id="service-modal" class="fixed inset-0 bg-black/60 hidden flex items-center justify-center z-50 px-4 backdrop-blur-sm"> <div class="bg-white dark:bg-neutral-900 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up"> <h2 class="text-xl font-bold mb-4">Create Service</h2> <form id="service-form" class="space-y-4"> <div> <label class="block text-xs font-bold uppercase text-neutral-500 mb-1">Title</label> <input type="text" id="svc-title" class="input-field w-full" placeholder="e.g. Logo Design" required> </div> <div> <label class="block text-xs font-bold uppercase text-neutral-500 mb-1">Price ($)</label> <input type="number" id="svc-price" class="input-field w-full" placeholder="50" required> </div> <div> <label class="block text-xs font-bold uppercase text-neutral-500 mb-1">Description</label> <textarea id="svc-desc" rows="3" class="input-field w-full" placeholder="What will you deliver?" required></textarea> </div> <div class="flex gap-3 pt-2"> <button type="button" id="close-svc-modal" class="flex-1 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 font-bold">Cancel</button> <button type="submit" class="flex-1 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-bold">Create</button> </div> </form> </div> </div> ` })} ${renderScript($$result, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/profile/[id].astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/profile/[id].astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/profile/[id].astro";
const $$url = "/profile/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
