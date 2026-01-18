/* empty css                                    */
import { e as createComponent, f as createAstro, m as maybeRenderHead, h as addAttribute, p as renderScript, r as renderTemplate } from '../../chunks/astro/server_Bc4ROJMT.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                            */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Messagebutton = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Messagebutton;
  const { userId, username, size = "md", variant = "secondary" } = Astro2.props;
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg"
  };
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg",
    secondary: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800"
  };
  return renderTemplate`${maybeRenderHead()}<button${addAttribute(userId, "data-message-user-id")}${addAttribute(username, "data-username")}${addAttribute(`message-btn ${sizeClasses[size]} ${variantClasses[variant]} rounded-full font-semibold transition-all flex items-center gap-2`, "class")} data-astro-cid-p6pulzm5> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-p6pulzm5> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" data-astro-cid-p6pulzm5></path> </svg> <span data-astro-cid-p6pulzm5>Message</span> </button> ${renderScript($$result, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/inbox/messagebutton.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/inbox/messagebutton.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/inbox/messagebutton.astro";
const $$url = "/inbox/messagebutton";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Messagebutton,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
