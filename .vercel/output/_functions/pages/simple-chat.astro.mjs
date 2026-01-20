/* empty css                                 */
import { e as createComponent, f as createAstro, r as renderTemplate, x as defineScriptVars, k as renderComponent, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_CvuIRyz4.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_SShpJa9a.mjs';
import { s as supabase } from '../chunks/supabase_CDb81jFl.mjs';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$SimpleChat = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SimpleChat;
  const conversationId = Astro2.url.searchParams.get("id");
  if (!conversationId) {
    return Astro2.redirect("/inbox");
  }
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
  const { data: conversation } = await supabase.from("conversations").select("*").eq("id", conversationId).single();
  if (!conversation) {
    return Astro2.redirect("/inbox");
  }
  const { data: messages } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", "\n  // Simple message sending without dynamic imports\n  const form = document.getElementById('simple-message-form');\n  const input = document.getElementById('simple-message-input');\n  \n  if (form && input) {\n    form.addEventListener('submit', async (e) => {\n      e.preventDefault();\n      const content = input.value.trim();\n      if (!content) return;\n      \n      try {\n        const response = await fetch('/api/send-message', {\n          method: 'POST',\n          headers: {\n            'Content-Type': 'application/json',\n          },\n          body: JSON.stringify({\n            conversation_id: conversationId,\n            content: content\n          })\n        });\n        \n        if (response.ok) {\n          // Reload page to show new message\n          window.location.reload();\n        } else {\n          const errorData = await response.json();\n          alert('Failed to send message: ' + (errorData.error || 'Unknown error'));\n        }\n      } catch (error) {\n        alert('Failed to send message: ' + error.message);\n      }\n    });\n  }\n})();<\/script> "])), renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Simple Chat" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto py-8"> <div class="mb-4"> <a href="/inbox" class="text-blue-600 hover:text-blue-800">← Back to Inbox</a> </div> <h1 class="text-3xl font-bold mb-8">Simple Chat Test</h1> <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 mb-6"> <h2 class="text-xl font-bold mb-4">Conversation: ${conversationId}</h2> <div class="space-y-4 mb-6 max-h-96 overflow-y-auto"> ${messages && messages.length > 0 ? messages.map((msg) => renderTemplate`<div${addAttribute(`p-3 rounded-lg ${msg.sender_id === currentUser.id ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"}`, "class")}> <div class="text-sm text-gray-600 mb-1"> ${msg.sender_id === currentUser.id ? "You" : "Other User"} - ${new Date(msg.created_at).toLocaleString()} </div> <div>${msg.content}</div> </div>`) : renderTemplate`<div class="text-gray-500 text-center py-8">No messages yet</div>`} </div> <form id="simple-message-form" class="flex gap-2"> <input type="text" id="simple-message-input" placeholder="Type a message..." class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required> <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
Send
</button> </form> </div> </div> ` }), defineScriptVars({ conversationId, currentUserId: currentUser?.id }));
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/simple-chat.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/simple-chat.astro";
const $$url = "/simple-chat";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SimpleChat,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
