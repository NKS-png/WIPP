/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_CvuIRyz4.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_SShpJa9a.mjs';
import { s as supabase } from '../chunks/supabase_CDb81jFl.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
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
  let myParticipations = null;
  let conversationDetails = [];
  try {
    const { data, error } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", currentUser.id);
    if (error) {
      console.error("Error getting participations:", error.message);
    } else {
      myParticipations = data;
      console.log("My participations:", myParticipations);
    }
  } catch (error) {
    console.error("Database error getting participations:", error.message);
  }
  if (myParticipations && myParticipations.length > 0) {
    const conversationIds = myParticipations.map((p) => p.conversation_id);
    try {
      const { data: conversations, error: conversationsError } = await supabase.from("conversations").select("*").in("id", conversationIds).order("updated_at", { ascending: false });
      if (conversationsError) {
        console.error("Error getting conversations:", conversationsError.message);
      } else {
        console.log("Conversations:", conversations);
        let unreadCounts = null;
        try {
          const { data, error } = await supabase.rpc("get_conversation_unread_counts", {
            p_user_id: currentUser.id
          });
          if (error) {
            console.log("Unread counts RPC error:", error.message);
            unreadCounts = [];
          } else {
            unreadCounts = data;
            console.log("Unread counts:", unreadCounts);
          }
        } catch (error) {
          console.log("Unread counts function not available (message-read-tracking.sql not run):", error.message);
          unreadCounts = [];
        }
        const unreadMap = /* @__PURE__ */ new Map();
        if (unreadCounts) {
          unreadCounts.forEach((item) => {
            unreadMap.set(item.conversation_id, item.unread_count);
          });
        }
        const conversationPromises = (conversations || []).map(async (conv) => {
          try {
            const { count: messageCount, error: messageCountError } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("conversation_id", conv.id);
            if (messageCountError) {
              console.error("Error getting message count for conversation", conv.id, ":", messageCountError.message);
              return null;
            }
            if (!messageCount || messageCount === 0) {
              return null;
            }
            const { data: otherParticipants, error: participantsError } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conv.id).neq("user_id", currentUser.id);
            if (participantsError) {
              console.error("Error getting participants for conversation", conv.id, ":", participantsError.message);
              return null;
            }
            let partner = null;
            if (otherParticipants && otherParticipants.length > 0) {
              try {
                const { data: partnerProfile, error: profileError } = await supabase.from("profiles").select("id, username, full_name, avatar_url").eq("id", otherParticipants[0].user_id).single();
                if (profileError) {
                  console.error("Error getting partner profile:", profileError.message);
                  partner = {
                    id: otherParticipants[0].user_id,
                    username: "Unknown User",
                    full_name: "Unknown User",
                    avatar_url: null
                  };
                } else {
                  partner = partnerProfile;
                }
              } catch (profileError) {
                console.error("Error getting partner profile:", profileError.message);
                partner = {
                  id: otherParticipants[0].user_id,
                  username: "Unknown User",
                  full_name: "Unknown User",
                  avatar_url: null
                };
              }
            }
            let lastMessage = null;
            try {
              const { data, error: lastMessageError } = await supabase.from("messages").select("*").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(1).single();
              if (lastMessageError) {
                console.error("Error getting last message for conversation", conv.id, ":", lastMessageError.message);
              } else {
                lastMessage = data;
              }
            } catch (lastMessageError) {
              console.error("Error getting last message:", lastMessageError.message);
            }
            const unreadCount = unreadMap.get(conv.id) || 0;
            return {
              id: conv.id,
              partner,
              lastMessage,
              unreadCount: parseInt(unreadCount),
              updatedAt: conv.updated_at || conv.created_at,
              messageCount
            };
          } catch (error) {
            console.error("Error processing conversation", conv.id, ":", error.message);
            return null;
          }
        });
        conversationDetails = await Promise.all(conversationPromises);
        conversationDetails = conversationDetails.filter((c) => c !== null && c.partner);
      }
    } catch (error) {
      console.error("Error processing conversations:", error.message);
    }
  }
  const sortedConversations = conversationDetails.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  console.log("Final conversations (with messages only):", sortedConversations);
  const hasDatabaseIssues = myParticipations === null;
  sortedConversations.length > 0;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Inbox", "data-astro-cid-573snepc": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-neutral-50 dark:bg-black" data-astro-cid-573snepc> <div class="max-w-5xl mx-auto px-4 py-8" data-astro-cid-573snepc> <!-- Header --> <div class="mb-8" data-astro-cid-573snepc> <h1 class="text-4xl font-black text-neutral-900 dark:text-white mb-2" data-astro-cid-573snepc>
Messages
</h1> <p class="text-neutral-500 dark:text-neutral-400" data-astro-cid-573snepc> ${sortedConversations.length} conversation${sortedConversations.length !== 1 ? "s" : ""} </p> ${hasDatabaseIssues && renderTemplate`<div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl" data-astro-cid-573snepc> <div class="flex items-center gap-2 mb-2" data-astro-cid-573snepc> <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-573snepc> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" data-astro-cid-573snepc></path> </svg> <span class="font-semibold text-yellow-800 dark:text-yellow-200" data-astro-cid-573snepc>Database Setup Required</span> </div> <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-3" data-astro-cid-573snepc>
Your database needs to be configured for messaging. Please run the required SQL migrations.
</p> <div class="flex gap-2" data-astro-cid-573snepc> <a href="/system-status" class="inline-block px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors" data-astro-cid-573snepc>
Check System Status
</a> <a href="/inbox-debug" class="inline-block px-3 py-1.5 bg-neutral-600 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors" data-astro-cid-573snepc>
Debug Info
</a> </div> </div>`} </div> <!-- Search & Filter Bar --> <div class="mb-6 flex items-center gap-4" data-astro-cid-573snepc> <div class="flex-1 relative" data-astro-cid-573snepc> <input type="text" id="search-input" placeholder="Search conversations..." class="w-full px-5 py-3 pl-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white placeholder-neutral-400" data-astro-cid-573snepc> <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-573snepc> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-astro-cid-573snepc></path> </svg> </div> <button onclick="window.location.reload()" class="px-5 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-2xl font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition flex items-center gap-2" data-astro-cid-573snepc> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-573snepc> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" data-astro-cid-573snepc></path> </svg> <span class="hidden md:inline" data-astro-cid-573snepc>Refresh</span> </button> <button id="new-message-btn" class="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition flex items-center gap-2" data-astro-cid-573snepc> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-573snepc> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" data-astro-cid-573snepc></path> </svg> <span class="hidden md:inline" data-astro-cid-573snepc>New Message</span> </button> </div> <!-- Conversations List --> <div class="space-y-3" id="conversations-list" data-astro-cid-573snepc> ${sortedConversations.length > 0 ? sortedConversations.map((conv) => {
    const partner = conv.partner;
    const displayName = partner?.full_name || partner?.username || "Unknown User";
    const displayAvatar = partner?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
    const lastMsg = conv.lastMessage;
    const isUnread = conv.unreadCount > 0;
    const isSentByMe = lastMsg?.sender_id === currentUser.id;
    return renderTemplate`<a${addAttribute(`/inbox/${conv.id}`, "href")} class="block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-purple-500 dark:hover:border-purple-400 transition-all hover:shadow-lg conversation-item"${addAttribute(conv.id, "data-conversation-id")} data-astro-cid-573snepc> <div class="flex items-center gap-4" data-astro-cid-573snepc> <!-- Avatar --> <div class="relative flex-shrink-0" data-astro-cid-573snepc> <img${addAttribute(displayAvatar, "src")}${addAttribute(displayName, "alt")} class="w-14 h-14 rounded-full object-cover border-2 border-neutral-100 dark:border-neutral-800" data-astro-cid-573snepc> ${isUnread && renderTemplate`<div class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-white dark:border-neutral-900 rounded-full flex items-center justify-center notification-dot" data-astro-cid-573snepc> <span class="text-white text-xs font-bold" data-astro-cid-573snepc>${conv.unreadCount > 99 ? "99+" : conv.unreadCount}</span> </div>`} </div> <!-- Content --> <div class="flex-1 min-w-0" data-astro-cid-573snepc> <div class="flex items-center justify-between mb-1" data-astro-cid-573snepc> <h3${addAttribute(`font-bold text-neutral-900 dark:text-white truncate ${isUnread ? "text-lg" : "text-base"}`, "class")} data-astro-cid-573snepc> ${displayName} </h3> ${lastMsg && renderTemplate`<span class="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0 ml-2" data-astro-cid-573snepc> ${new Date(lastMsg.created_at).toLocaleDateString() === (/* @__PURE__ */ new Date()).toLocaleDateString() ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : new Date(lastMsg.created_at).toLocaleDateString([], { month: "short", day: "numeric" })} </span>`} </div> ${lastMsg ? renderTemplate`<p${addAttribute(`text-sm truncate ${isUnread ? "text-neutral-900 dark:text-white font-semibold" : "text-neutral-500 dark:text-neutral-400"}`, "class")} data-astro-cid-573snepc> ${isSentByMe && renderTemplate`<span class="text-neutral-400 mr-1" data-astro-cid-573snepc>You:</span>`} ${lastMsg.content} </p>` : renderTemplate`<p class="text-sm text-neutral-400 italic" data-astro-cid-573snepc>No messages yet</p>`} </div> <!-- Arrow Icon --> <svg class="w-5 h-5 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-573snepc> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-573snepc></path> </svg> </div> </a>`;
  }) : renderTemplate`<!-- Empty State -->
          <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-16 text-center" data-astro-cid-573snepc> <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6" data-astro-cid-573snepc> <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-573snepc> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" data-astro-cid-573snepc></path> </svg> </div> <h3 class="text-2xl font-bold text-neutral-900 dark:text-white mb-3" data-astro-cid-573snepc> ${hasDatabaseIssues ? "Database Setup Required" : "No messages yet"} </h3> <p class="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto" data-astro-cid-573snepc> ${hasDatabaseIssues ? "Your messaging database needs to be configured. Please run the required SQL migrations to enable messaging." : `Start a conversation by visiting a user's profile and clicking "Message"`} </p> ${hasDatabaseIssues ? renderTemplate`<div class="space-x-2" data-astro-cid-573snepc> <a href="/system-status" class="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg transition" data-astro-cid-573snepc>
Check System Status
</a> <a href="/inbox-debug" class="inline-block px-6 py-3 bg-gradient-to-r from-neutral-600 to-neutral-700 text-white rounded-full font-semibold hover:shadow-lg transition" data-astro-cid-573snepc>
Debug Info
</a> </div>` : renderTemplate`<a href="/explore" class="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition" data-astro-cid-573snepc>
Explore Wipp
</a>`} </div>`} </div> </div> </div>  <div id="new-message-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" data-astro-cid-573snepc> <div class="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-up" data-astro-cid-573snepc> <div class="flex items-center justify-between mb-6" data-astro-cid-573snepc> <h2 class="text-xl font-bold text-neutral-900 dark:text-white" data-astro-cid-573snepc>New Message</h2> <button id="close-modal-btn" class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" data-astro-cid-573snepc> <svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-573snepc> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-astro-cid-573snepc></path> </svg> </button> </div> <!-- User Search --> <div class="mb-4" data-astro-cid-573snepc> <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2" data-astro-cid-573snepc>Send to:</label> <div class="relative" data-astro-cid-573snepc> <input type="text" id="user-search-input" placeholder="Search users..." class="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" autocomplete="off" data-astro-cid-573snepc> <!-- Search Results --> <div id="user-search-results" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-60 overflow-y-auto hidden z-10" data-astro-cid-573snepc> <div id="user-search-loading" class="hidden p-4 text-center text-neutral-500" data-astro-cid-573snepc> <div class="animate-spin w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full mx-auto mb-2" data-astro-cid-573snepc></div>
Searching...
</div> <div id="user-search-empty" class="hidden p-4 text-center text-neutral-500 text-sm" data-astro-cid-573snepc>
No users found
</div> <div id="user-search-list" class="py-2" data-astro-cid-573snepc> <!-- Search results will be inserted here --> </div> </div> </div> </div> <!-- Selected User --> <div id="selected-user" class="hidden mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl" data-astro-cid-573snepc> <div class="flex items-center gap-3" data-astro-cid-573snepc> <img id="selected-user-avatar" class="w-10 h-10 rounded-full object-cover" data-astro-cid-573snepc> <div class="flex-1" data-astro-cid-573snepc> <div id="selected-user-name" class="font-medium text-neutral-900 dark:text-white" data-astro-cid-573snepc></div> <div id="selected-user-username" class="text-sm text-neutral-500" data-astro-cid-573snepc></div> </div> <button id="remove-selected-user" class="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" data-astro-cid-573snepc> <svg class="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-573snepc> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-astro-cid-573snepc></path> </svg> </button> </div> </div> <!-- Message Input --> <div class="mb-6" data-astro-cid-573snepc> <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2" data-astro-cid-573snepc>Message:</label> <textarea id="message-input" rows="4" placeholder="Type your message..." class="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" required data-astro-cid-573snepc></textarea> </div> <!-- Actions --> <div class="flex gap-3" data-astro-cid-573snepc> <button id="cancel-message-btn" class="flex-1 px-4 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors" data-astro-cid-573snepc>
Cancel
</button> <button id="send-message-btn" class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" data-astro-cid-573snepc>
Send Message
</button> </div> </div> </div> ` })} ${renderScript($$result, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/inbox/index.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/inbox/index.astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/inbox/index.astro";
const $$url = "/inbox";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
