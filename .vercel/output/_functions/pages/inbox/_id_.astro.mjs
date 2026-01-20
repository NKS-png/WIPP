/* empty css                                    */
import { e as createComponent, f as createAstro, r as renderTemplate, x as defineScriptVars, k as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_CvuIRyz4.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_SShpJa9a.mjs';
import { s as supabase } from '../../chunks/supabase_CDb81jFl.mjs';
/* empty css                                   */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  Astro2.response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  Astro2.response.headers.set("Pragma", "no-cache");
  Astro2.response.headers.set("Expires", "0");
  const { id: conversationId } = Astro2.params;
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
  let allParticipants = null;
  let isCurrentUserParticipant = false;
  let hasParticipantError = false;
  try {
    const { data: participantsWithProfiles, error: joinError } = await supabase.from("conversation_participants").select("user_id, profiles(username, full_name, avatar_url)").eq("conversation_id", conversationId);
    if (joinError) {
      console.log("Join query failed, using fallback approach:", joinError.message);
      try {
        const { data: participants, error: participantsError } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conversationId);
        if (participantsError) {
          console.error("Error getting participants:", participantsError.message);
          hasParticipantError = true;
        } else if (participants) {
          const participantPromises = participants.map(async (p) => {
            try {
              const { data: profile, error: profileError } = await supabase.from("profiles").select("username, full_name, avatar_url").eq("id", p.user_id).single();
              if (profileError) {
                console.error("Error getting profile for user", p.user_id, ":", profileError.message);
                return {
                  user_id: p.user_id,
                  profiles: {
                    username: "Unknown User",
                    full_name: "Unknown User",
                    avatar_url: null
                  }
                };
              }
              return {
                user_id: p.user_id,
                profiles: profile
              };
            } catch (error) {
              console.error("Error processing participant:", error.message);
              return {
                user_id: p.user_id,
                profiles: {
                  username: "Unknown User",
                  full_name: "Unknown User",
                  avatar_url: null
                }
              };
            }
          });
          allParticipants = await Promise.all(participantPromises);
        }
      } catch (error) {
        console.error("Error in fallback participant query:", error.message);
        hasParticipantError = true;
      }
    } else {
      allParticipants = participantsWithProfiles;
    }
  } catch (error) {
    console.error("Error getting participants:", error);
    hasParticipantError = true;
  }
  if (allParticipants && !hasParticipantError) {
    isCurrentUserParticipant = allParticipants.some((p) => p.user_id === currentUser.id);
  }
  if (hasParticipantError || !isCurrentUserParticipant && !hasParticipantError) {
    if (hasParticipantError) {
      console.log("Database error - showing error page instead of redirecting");
    } else {
      console.log("User not participant. User ID:", currentUser.id, "Participants:", allParticipants?.map((p) => p.user_id));
    }
  }
  const otherParticipant = allParticipants?.find((p) => p.user_id !== currentUser.id);
  let displayName = "Unknown User";
  let displayAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=Unknown";
  if (otherParticipant?.profiles) {
    displayName = otherParticipant.profiles.full_name || otherParticipant.profiles.username || "Unknown User";
    displayAvatar = otherParticipant.profiles.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
  }
  let messages = [];
  let hasMessageError = false;
  try {
    const { data, error } = await supabase.from("messages").select(`
      *,
      sender:profiles!messages_sender_id_fkey(username, full_name, avatar_url)
    `).eq("conversation_id", conversationId).order("created_at", { ascending: true });
    if (error) {
      console.error("Error getting messages:", error.message);
      hasMessageError = true;
      try {
        const { data: simpleMessages, error: simpleError } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
        if (simpleError) {
          console.error("Error getting simple messages:", simpleError.message);
        } else {
          messages = simpleMessages || [];
        }
      } catch (fallbackError) {
        console.error("Fallback message query failed:", fallbackError.message);
      }
    } else {
      messages = data || [];
    }
  } catch (error) {
    console.error("Error getting messages:", error.message);
    hasMessageError = true;
  }
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", `
  // Import modules
  let supabase = null;
  let autoEncryption = null;
  
  // Initialize modules
  async function initializeModules() {
    try {
      const supabaseModule = await import('../../lib/supabase.js');
      supabase = supabaseModule.supabase;
    } catch (error) {
      console.error('Failed to load supabase:', error);
      return false;
    }
    
    try {
      const autoEncryptionModule = await import('../../lib/autoEncryption.js');
      autoEncryption = autoEncryptionModule.autoEncryption;
    } catch (error) {
      console.log('Auto encryption not available:', error.message);
    }
    
    return true;
  }

  // Initialize modules and start the app
  initializeModules().then((success) => {
    if (!success) {
      console.error('Failed to initialize required modules');
      // Still try to initialize basic functionality without encryption
      initializeChatBasic();
      return;
    }
    
    // Initialize the chat interface (encryption disabled for serverless compatibility)
    initializeChatBasic();
  });

  // Basic chat functionality without encryption
  function initializeChatBasic() {
    console.log('Initializing basic chat functionality...');
    
    const container = document.getElementById('messages-container');
    const form = document.getElementById('message-form');
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    // Scroll to bottom function
    function scrollToBottom(smooth = false) {
      if (container) {
        if (smooth) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        } else {
          container.scrollTop = container.scrollHeight;
        }
      }
    }

    // Initial scroll to bottom
    setTimeout(() => scrollToBottom(), 100);

    // Basic message sending without encryption
    if (form && input) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = input.value.trim();
        if (!content) return;

        // Disable input while sending
        sendBtn.disabled = true;
        input.disabled = true;
        input.value = '';

        try {
          const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversation_id: conversationId,
              content: content
            })
          });

          let responseData;
          try {
            responseData = await response.json();
          } catch (jsonError) {
            // If response is not JSON, get text instead
            const responseText = await response.text();
            console.error('Non-JSON response:', responseText);
            throw new Error(\`Server returned non-JSON response: \${responseText.substring(0, 100)}...\`);
          }

          if (!response.ok) {
            throw new Error(responseData.error || 'Failed to send message');
          }

          // Reload page to show new message
          window.location.reload();
          
        } catch (err) {
          console.error('Error sending message:', err);
          alert('Failed to send message: ' + err.message);
          input.value = content; // Restore message on error
        } finally {
          // Re-enable input
          sendBtn.disabled = false;
          input.disabled = false;
          input.focus();
        }
      });
    }

    // Auto-focus input
    if (input) {
      input.focus();
    }
  }

  function initializeChat() {
    const container = document.getElementById('messages-container');
    const form = document.getElementById('message-form');
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    // Initialize automatic encryption for current user
    async function initializeAutoEncryption() {
      if (autoEncryption && currentUserId) {
        try {
          console.log('Initializing automatic encryption for user:', currentUserId);
          const success = await autoEncryption.initializeForUser(currentUserId);
          if (success) {
            console.log('Automatic encryption initialized successfully');
          } else {
            console.log('Failed to initialize automatic encryption');
          }
        } catch (error) {
          console.error('Error initializing automatic encryption:', error);
        }
      }
    }

    // Initialize encryption on page load
    initializeAutoEncryption();

    // Scroll to bottom function
    function scrollToBottom(smooth = false) {
      if (container) {
        if (smooth) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        } else {
          container.scrollTop = container.scrollHeight;
        }
      }
    }

    // Initial scroll to bottom
    setTimeout(() => scrollToBottom(), 100);

    // Decrypt existing encrypted messages on page load
    async function decryptExistingMessages() {
      try {
        if (!autoEncryption || !autoEncryption.isReady()) return;

        const encryptedMessages = container.querySelectorAll('[data-encrypted="true"]');
        
        for (const messageEl of encryptedMessages) {
          try {
            const encryptedData = messageEl.getAttribute('data-message-content');
            if (encryptedData) {
              const parsedData = JSON.parse(encryptedData);
              const decryptedContent = await autoEncryption.decryptMessage(parsedData);
              messageEl.textContent = decryptedContent;
              messageEl.removeAttribute('data-encrypted');
              messageEl.removeAttribute('data-message-content');
            }
          } catch (error) {
            console.error('Error decrypting existing message:', error);
            messageEl.textContent = '[\u{1F512} Failed to decrypt message]';
          }
        }
      } catch (error) {
        console.log('Encryption not available for existing messages:', error.message);
      }
    }

    // Try to decrypt messages after a short delay (to allow auto encryption to initialize)
    setTimeout(decryptExistingMessages, 2000);

    // Decrypt message if encrypted
    async function decryptMessageContent(message) {
      if (!message.is_encrypted || !message.encrypted_content) {
        return message.content;
      }

      try {
        if (!autoEncryption || !autoEncryption.isReady()) {
          return '[\u{1F512} Encrypted message - initializing encryption...]';
        }

        const decryptedContent = await autoEncryption.decryptMessage(message.encrypted_content);
        return decryptedContent;
      } catch (error) {
        console.error('Error decrypting message:', error);
        return '[\u{1F512} Failed to decrypt message]';
      }
    }

  // Create message element
  async function createMessageElement(text, isMe, timestamp = 'Just now', messageId = null, senderAvatar = null, isEncrypted = false) {
    const div = document.createElement('div');
    div.className = 'flex w-full ' + (isMe ? 'justify-end' : 'justify-start') + ' animate-fade-in-up';
    if (messageId) {
      div.setAttribute('data-message-id', messageId);
    }
    
    const avatarHtml = !isMe && senderAvatar ? 
      \`<img src="\${senderAvatar}" alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 flex-shrink-0 mt-1" />\` : '';
    
    // Add encryption indicator
    const encryptionIndicator = isEncrypted ? 
      '<div class="flex items-center gap-1 mb-1 opacity-60"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg><span class="text-xs">Encrypted</span></div>' : '';
    
    div.innerHTML = 
      '<div class="flex max-w-[85%] md:max-w-[70%] gap-2 ' + (isMe ? 'flex-row-reverse' : 'flex-row') + '">' +
        avatarHtml +
        '<div class="group relative px-4 md:px-5 py-2.5 md:py-3 shadow-sm text-sm md:text-base leading-relaxed break-words ' +
          (isMe 
            ? 'bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl rounded-tr-md' 
            : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-2xl rounded-tl-md'
          ) + '">' +
          encryptionIndicator +
          '<p class="whitespace-pre-wrap">' + escapeHtml(text) + '</p>' +
          '<span class="text-[10px] absolute -bottom-5 min-w-max opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-neutral-400 dark:text-neutral-500 ' + (isMe ? 'right-0' : 'left-0') + '">' +
            timestamp +
          '</span>' +
        '</div>' +
      '</div>';
    return div;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Optimistic UI message sending
  if (form && input) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = input.value.trim();
      if (!content) return;

      // Disable input while sending
      sendBtn.disabled = true;
      input.disabled = true;
      
      // Clear input immediately
      input.value = '';

      // Check if encryption is available and enabled
      let shouldEncrypt = false;
      let otherParticipantId = null;
      
      try {
        if (autoEncryption && autoEncryption.isReady()) {
          // Get other participant's user ID for encryption
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId)
            .neq('user_id', currentUserId);
          
          if (participants && participants.length > 0) {
            otherParticipantId = participants[0].user_id;
            shouldEncrypt = true;
          }
        }
      } catch (e) {
        console.log('Encryption not available:', e.message);
      }
      
      let requestBody = {
        conversation_id: conversationId,
        content: content
      };

      if (shouldEncrypt && otherParticipantId) {
        try {
          // Encrypt the message
          const encryptedData = await autoEncryption.encryptMessageForUser(content, otherParticipantId);
          
          requestBody = {
            conversation_id: conversationId,
            content: content, // Keep original content for fallback
            encrypted_content: encryptedData
          };
        } catch (encryptError) {
          console.error('Encryption failed, sending unencrypted:', encryptError);
          // Fall back to unencrypted if encryption fails
        }
      }

      // OPTIMISTIC UI: Add message immediately
      const optimisticMsg = await createMessageElement(content, true, 'Sending...', null, null, shouldEncrypt);
      optimisticMsg.classList.add('optimistic-message');
      container.appendChild(optimisticMsg);
      scrollToBottom(true);

      try {
        console.log('Sending message to API...');
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          // If response is not JSON, get text instead
          const responseText = await response.text();
          throw new Error(\`Server error: \${responseText}\`);
        }

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to send message');
        }

        // Update optimistic message with real data
        optimisticMsg.classList.remove('optimistic-message');
        optimisticMsg.setAttribute('data-message-id', responseData.message?.id || 'temp-id');
        const timestampSpan = optimisticMsg.querySelector('span');
        if (timestampSpan) {
          timestampSpan.textContent = 'Just now';
        }
        
        console.log('Message sent successfully');
        
      } catch (err) {
        console.error('Error sending message:', err);
        // Remove optimistic message on error
        optimisticMsg.remove();
        alert('Failed to send message: ' + err.message);
        input.value = content; // Restore message on error
      } finally {
        // Re-enable input
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
      }
    });
  }

  // Auto-focus input
  if (input) {
    input.focus();
  }

  // Mark messages as read when conversation is opened
  async function markConversationAsRead() {
    try {
      const response = await fetch('/api/mark-messages-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId
        })
      });

      if (response.ok) {
        console.log('Messages marked as read');
        
        // Update navbar unread count
        if (window.updateNavbarUnreadCount) {
          window.updateNavbarUnreadCount();
        }
      }
    } catch (error) {
      console.log('Error marking messages as read:', error);
    }
  }

  // Mark as read when page loads
  markConversationAsRead();

  // Mark as read when user becomes active (returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      markConversationAsRead();
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    setTimeout(() => scrollToBottom(), 100);
  });

  // Notification sound function
  function playNotificationSound() {
    try {
      // Create a subtle notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  // Real-time subscription for immediate updates
  supabase
    .channel(\`conversation_\${conversationId}\`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: \`conversation_id=eq.\${conversationId}\`
    }, async (payload) => {
      console.log('Real-time message received:', payload);
      
      const newMessage = payload.new;
      
      // Only add if it's from another user and not already displayed
      if (newMessage.sender_id !== currentUserId) {
        const existingMsg = container.querySelector(\`[data-message-id="\${newMessage.id}"]\`);
        if (!existingMsg) {
          // Fetch sender profile for avatar
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('avatar_url, username')
            .eq('id', newMessage.sender_id)
            .single();
          
          const senderAvatar = senderProfile?.avatar_url || \`https://api.dicebear.com/7.x/initials/svg?seed=\${senderProfile?.username || 'user'}\`;
          
          // Decrypt message content if encrypted
          const displayContent = await decryptMessageContent(newMessage);
          
          const msgEl = await createMessageElement(
            displayContent,
            false,
            new Date(newMessage.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            newMessage.id,
            senderAvatar,
            newMessage.is_encrypted || false
          );
          container.appendChild(msgEl);
          scrollToBottom(true);
          playNotificationSound();
        }
      }
    })
    .subscribe();
  } // End of initializeChat function
})();<\/script> `], ["", " <script>(function(){", `
  // Import modules
  let supabase = null;
  let autoEncryption = null;
  
  // Initialize modules
  async function initializeModules() {
    try {
      const supabaseModule = await import('../../lib/supabase.js');
      supabase = supabaseModule.supabase;
    } catch (error) {
      console.error('Failed to load supabase:', error);
      return false;
    }
    
    try {
      const autoEncryptionModule = await import('../../lib/autoEncryption.js');
      autoEncryption = autoEncryptionModule.autoEncryption;
    } catch (error) {
      console.log('Auto encryption not available:', error.message);
    }
    
    return true;
  }

  // Initialize modules and start the app
  initializeModules().then((success) => {
    if (!success) {
      console.error('Failed to initialize required modules');
      // Still try to initialize basic functionality without encryption
      initializeChatBasic();
      return;
    }
    
    // Initialize the chat interface (encryption disabled for serverless compatibility)
    initializeChatBasic();
  });

  // Basic chat functionality without encryption
  function initializeChatBasic() {
    console.log('Initializing basic chat functionality...');
    
    const container = document.getElementById('messages-container');
    const form = document.getElementById('message-form');
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    // Scroll to bottom function
    function scrollToBottom(smooth = false) {
      if (container) {
        if (smooth) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        } else {
          container.scrollTop = container.scrollHeight;
        }
      }
    }

    // Initial scroll to bottom
    setTimeout(() => scrollToBottom(), 100);

    // Basic message sending without encryption
    if (form && input) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = input.value.trim();
        if (!content) return;

        // Disable input while sending
        sendBtn.disabled = true;
        input.disabled = true;
        input.value = '';

        try {
          const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversation_id: conversationId,
              content: content
            })
          });

          let responseData;
          try {
            responseData = await response.json();
          } catch (jsonError) {
            // If response is not JSON, get text instead
            const responseText = await response.text();
            console.error('Non-JSON response:', responseText);
            throw new Error(\\\`Server returned non-JSON response: \\\${responseText.substring(0, 100)}...\\\`);
          }

          if (!response.ok) {
            throw new Error(responseData.error || 'Failed to send message');
          }

          // Reload page to show new message
          window.location.reload();
          
        } catch (err) {
          console.error('Error sending message:', err);
          alert('Failed to send message: ' + err.message);
          input.value = content; // Restore message on error
        } finally {
          // Re-enable input
          sendBtn.disabled = false;
          input.disabled = false;
          input.focus();
        }
      });
    }

    // Auto-focus input
    if (input) {
      input.focus();
    }
  }

  function initializeChat() {
    const container = document.getElementById('messages-container');
    const form = document.getElementById('message-form');
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    // Initialize automatic encryption for current user
    async function initializeAutoEncryption() {
      if (autoEncryption && currentUserId) {
        try {
          console.log('Initializing automatic encryption for user:', currentUserId);
          const success = await autoEncryption.initializeForUser(currentUserId);
          if (success) {
            console.log('Automatic encryption initialized successfully');
          } else {
            console.log('Failed to initialize automatic encryption');
          }
        } catch (error) {
          console.error('Error initializing automatic encryption:', error);
        }
      }
    }

    // Initialize encryption on page load
    initializeAutoEncryption();

    // Scroll to bottom function
    function scrollToBottom(smooth = false) {
      if (container) {
        if (smooth) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        } else {
          container.scrollTop = container.scrollHeight;
        }
      }
    }

    // Initial scroll to bottom
    setTimeout(() => scrollToBottom(), 100);

    // Decrypt existing encrypted messages on page load
    async function decryptExistingMessages() {
      try {
        if (!autoEncryption || !autoEncryption.isReady()) return;

        const encryptedMessages = container.querySelectorAll('[data-encrypted="true"]');
        
        for (const messageEl of encryptedMessages) {
          try {
            const encryptedData = messageEl.getAttribute('data-message-content');
            if (encryptedData) {
              const parsedData = JSON.parse(encryptedData);
              const decryptedContent = await autoEncryption.decryptMessage(parsedData);
              messageEl.textContent = decryptedContent;
              messageEl.removeAttribute('data-encrypted');
              messageEl.removeAttribute('data-message-content');
            }
          } catch (error) {
            console.error('Error decrypting existing message:', error);
            messageEl.textContent = '[\u{1F512} Failed to decrypt message]';
          }
        }
      } catch (error) {
        console.log('Encryption not available for existing messages:', error.message);
      }
    }

    // Try to decrypt messages after a short delay (to allow auto encryption to initialize)
    setTimeout(decryptExistingMessages, 2000);

    // Decrypt message if encrypted
    async function decryptMessageContent(message) {
      if (!message.is_encrypted || !message.encrypted_content) {
        return message.content;
      }

      try {
        if (!autoEncryption || !autoEncryption.isReady()) {
          return '[\u{1F512} Encrypted message - initializing encryption...]';
        }

        const decryptedContent = await autoEncryption.decryptMessage(message.encrypted_content);
        return decryptedContent;
      } catch (error) {
        console.error('Error decrypting message:', error);
        return '[\u{1F512} Failed to decrypt message]';
      }
    }

  // Create message element
  async function createMessageElement(text, isMe, timestamp = 'Just now', messageId = null, senderAvatar = null, isEncrypted = false) {
    const div = document.createElement('div');
    div.className = 'flex w-full ' + (isMe ? 'justify-end' : 'justify-start') + ' animate-fade-in-up';
    if (messageId) {
      div.setAttribute('data-message-id', messageId);
    }
    
    const avatarHtml = !isMe && senderAvatar ? 
      \\\`<img src="\\\${senderAvatar}" alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 flex-shrink-0 mt-1" />\\\` : '';
    
    // Add encryption indicator
    const encryptionIndicator = isEncrypted ? 
      '<div class="flex items-center gap-1 mb-1 opacity-60"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg><span class="text-xs">Encrypted</span></div>' : '';
    
    div.innerHTML = 
      '<div class="flex max-w-[85%] md:max-w-[70%] gap-2 ' + (isMe ? 'flex-row-reverse' : 'flex-row') + '">' +
        avatarHtml +
        '<div class="group relative px-4 md:px-5 py-2.5 md:py-3 shadow-sm text-sm md:text-base leading-relaxed break-words ' +
          (isMe 
            ? 'bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl rounded-tr-md' 
            : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-2xl rounded-tl-md'
          ) + '">' +
          encryptionIndicator +
          '<p class="whitespace-pre-wrap">' + escapeHtml(text) + '</p>' +
          '<span class="text-[10px] absolute -bottom-5 min-w-max opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-neutral-400 dark:text-neutral-500 ' + (isMe ? 'right-0' : 'left-0') + '">' +
            timestamp +
          '</span>' +
        '</div>' +
      '</div>';
    return div;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Optimistic UI message sending
  if (form && input) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = input.value.trim();
      if (!content) return;

      // Disable input while sending
      sendBtn.disabled = true;
      input.disabled = true;
      
      // Clear input immediately
      input.value = '';

      // Check if encryption is available and enabled
      let shouldEncrypt = false;
      let otherParticipantId = null;
      
      try {
        if (autoEncryption && autoEncryption.isReady()) {
          // Get other participant's user ID for encryption
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId)
            .neq('user_id', currentUserId);
          
          if (participants && participants.length > 0) {
            otherParticipantId = participants[0].user_id;
            shouldEncrypt = true;
          }
        }
      } catch (e) {
        console.log('Encryption not available:', e.message);
      }
      
      let requestBody = {
        conversation_id: conversationId,
        content: content
      };

      if (shouldEncrypt && otherParticipantId) {
        try {
          // Encrypt the message
          const encryptedData = await autoEncryption.encryptMessageForUser(content, otherParticipantId);
          
          requestBody = {
            conversation_id: conversationId,
            content: content, // Keep original content for fallback
            encrypted_content: encryptedData
          };
        } catch (encryptError) {
          console.error('Encryption failed, sending unencrypted:', encryptError);
          // Fall back to unencrypted if encryption fails
        }
      }

      // OPTIMISTIC UI: Add message immediately
      const optimisticMsg = await createMessageElement(content, true, 'Sending...', null, null, shouldEncrypt);
      optimisticMsg.classList.add('optimistic-message');
      container.appendChild(optimisticMsg);
      scrollToBottom(true);

      try {
        console.log('Sending message to API...');
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          // If response is not JSON, get text instead
          const responseText = await response.text();
          throw new Error(\\\`Server error: \\\${responseText}\\\`);
        }

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to send message');
        }

        // Update optimistic message with real data
        optimisticMsg.classList.remove('optimistic-message');
        optimisticMsg.setAttribute('data-message-id', responseData.message?.id || 'temp-id');
        const timestampSpan = optimisticMsg.querySelector('span');
        if (timestampSpan) {
          timestampSpan.textContent = 'Just now';
        }
        
        console.log('Message sent successfully');
        
      } catch (err) {
        console.error('Error sending message:', err);
        // Remove optimistic message on error
        optimisticMsg.remove();
        alert('Failed to send message: ' + err.message);
        input.value = content; // Restore message on error
      } finally {
        // Re-enable input
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
      }
    });
  }

  // Auto-focus input
  if (input) {
    input.focus();
  }

  // Mark messages as read when conversation is opened
  async function markConversationAsRead() {
    try {
      const response = await fetch('/api/mark-messages-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId
        })
      });

      if (response.ok) {
        console.log('Messages marked as read');
        
        // Update navbar unread count
        if (window.updateNavbarUnreadCount) {
          window.updateNavbarUnreadCount();
        }
      }
    } catch (error) {
      console.log('Error marking messages as read:', error);
    }
  }

  // Mark as read when page loads
  markConversationAsRead();

  // Mark as read when user becomes active (returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      markConversationAsRead();
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    setTimeout(() => scrollToBottom(), 100);
  });

  // Notification sound function
  function playNotificationSound() {
    try {
      // Create a subtle notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  // Real-time subscription for immediate updates
  supabase
    .channel(\\\`conversation_\\\${conversationId}\\\`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: \\\`conversation_id=eq.\\\${conversationId}\\\`
    }, async (payload) => {
      console.log('Real-time message received:', payload);
      
      const newMessage = payload.new;
      
      // Only add if it's from another user and not already displayed
      if (newMessage.sender_id !== currentUserId) {
        const existingMsg = container.querySelector(\\\`[data-message-id="\\\${newMessage.id}"]\\\`);
        if (!existingMsg) {
          // Fetch sender profile for avatar
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('avatar_url, username')
            .eq('id', newMessage.sender_id)
            .single();
          
          const senderAvatar = senderProfile?.avatar_url || \\\`https://api.dicebear.com/7.x/initials/svg?seed=\\\${senderProfile?.username || 'user'}\\\`;
          
          // Decrypt message content if encrypted
          const displayContent = await decryptMessageContent(newMessage);
          
          const msgEl = await createMessageElement(
            displayContent,
            false,
            new Date(newMessage.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            newMessage.id,
            senderAvatar,
            newMessage.is_encrypted || false
          );
          container.appendChild(msgEl);
          scrollToBottom(true);
          playNotificationSound();
        }
      }
    })
    .subscribe();
  } // End of initializeChat function
})();<\/script> `])), renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `Chat with ${displayName}`, "data-astro-cid-5n66qajd": true }, { "default": async ($$result2) => renderTemplate`${hasParticipantError || hasMessageError || !isCurrentUserParticipant && !hasParticipantError ? renderTemplate`<!-- Error State -->
    ${maybeRenderHead()}<div class="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center px-4" data-astro-cid-5n66qajd> <div class="max-w-md w-full text-center" data-astro-cid-5n66qajd> <div class="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6" data-astro-cid-5n66qajd> <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-5n66qajd> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" data-astro-cid-5n66qajd></path> </svg> </div> <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-3" data-astro-cid-5n66qajd> ${hasParticipantError || hasMessageError ? "Database Error" : "Access Denied"} </h1> <p class="text-neutral-600 dark:text-neutral-400 mb-6" data-astro-cid-5n66qajd> ${hasParticipantError || hasMessageError ? "There was an error accessing the conversation database. Please check your database configuration." : "You don't have access to this conversation or it doesn't exist."} </p> <div class="space-y-3" data-astro-cid-5n66qajd> <a href="/inbox" class="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all" data-astro-cid-5n66qajd>
Back to Inbox
</a> ${(hasParticipantError || hasMessageError) && renderTemplate`<div class="space-y-2" data-astro-cid-5n66qajd> <a href="/system-status" class="block w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors" data-astro-cid-5n66qajd>
Check System Status
</a> <a href="/inbox-debug" class="block w-full px-4 py-3 bg-neutral-600 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors" data-astro-cid-5n66qajd>
Debug Information
</a> </div>`} </div> </div> </div>` : renderTemplate`<div class="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-white dark:bg-neutral-900 relative" data-astro-cid-5n66qajd> <!-- Header --> <div class="sticky top-0 z-20 px-4 md:px-6 py-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-sm" data-astro-cid-5n66qajd> <div class="flex items-center gap-3 md:gap-4" data-astro-cid-5n66qajd> <!-- Back Button (Mobile) --> <a href="/inbox" class="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors md:hidden" data-astro-cid-5n66qajd> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-5n66qajd> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" data-astro-cid-5n66qajd></path> </svg> </a> <!-- User Avatar --> <div class="relative" data-astro-cid-5n66qajd> <img${addAttribute(displayAvatar, "src")}${addAttribute(displayName, "alt")} class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-700 shadow-sm" data-astro-cid-5n66qajd> <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full" data-astro-cid-5n66qajd></div> </div> <!-- User Info --> <div data-astro-cid-5n66qajd> <h1 class="text-base md:text-lg font-bold text-neutral-900 dark:text-white leading-tight" data-astro-cid-5n66qajd> ${displayName} </h1> <p class="text-xs text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1" data-astro-cid-5n66qajd> <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" data-astro-cid-5n66qajd></span>
Online now
</p> </div> </div> <!-- Options Menu --> <button class="p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" data-astro-cid-5n66qajd> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-5n66qajd> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" data-astro-cid-5n66qajd></path> </svg> </button> </div> <!-- Messages Container --> <div id="messages-container" class="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4 scroll-smooth bg-neutral-50 dark:bg-black" data-astro-cid-5n66qajd> <!-- Date Divider --> <div class="flex justify-center" data-astro-cid-5n66qajd> <span class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-900 px-3 py-1 rounded-full shadow-sm" data-astro-cid-5n66qajd>
Today
</span> </div> <!-- Messages --> ${messages && messages.map((msg) => {
    const isMe = msg.sender_id === currentUser.id;
    const senderAvatar = msg.sender?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender?.username || "user"}`;
    const displayContent = msg.is_encrypted ? "[\u{1F512} Encrypted message - unlock your keys to read]" : msg.content;
    const isEncrypted = msg.is_encrypted || false;
    return renderTemplate`<div${addAttribute(`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`, "class")}${addAttribute(msg.id, "data-message-id")} data-astro-cid-5n66qajd> <div${addAttribute(`flex max-w-[85%] md:max-w-[70%] gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`, "class")} data-astro-cid-5n66qajd> ${!isMe && renderTemplate`<img${addAttribute(senderAvatar, "src")} alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 flex-shrink-0 mt-1" data-astro-cid-5n66qajd>`} <!-- Message Bubble --> <div${addAttribute(`group relative px-4 md:px-5 py-2.5 md:py-3 shadow-sm text-sm md:text-base leading-relaxed break-words
                  ${isMe ? "bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl rounded-tr-md" : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-2xl rounded-tl-md"}`, "class")} data-astro-cid-5n66qajd> ${isEncrypted && renderTemplate`<div class="flex items-center gap-1 mb-1 opacity-60" data-astro-cid-5n66qajd> <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-5n66qajd> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" data-astro-cid-5n66qajd></path> </svg> <span class="text-xs" data-astro-cid-5n66qajd>Encrypted</span> </div>`} <p class="whitespace-pre-wrap"${addAttribute(isEncrypted, "data-encrypted")}${addAttribute(msg.encrypted_content ? JSON.stringify(msg.encrypted_content) : "", "data-message-content")} data-astro-cid-5n66qajd>${displayContent}</p> <!-- Timestamp (shows on hover) --> <span${addAttribute(`text-[10px] absolute -bottom-5 min-w-max opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-neutral-400 dark:text-neutral-500 ${isMe ? "right-0" : "left-0"}`, "class")} data-astro-cid-5n66qajd> ${new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} </span> </div> </div> </div>`;
  })} <!-- Scroll anchor --> <div id="scroll-anchor" data-astro-cid-5n66qajd></div> </div> <!-- Message Input --> <div class="sticky bottom-0 p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shadow-lg" data-astro-cid-5n66qajd> <form id="message-form" class="max-w-4xl mx-auto relative flex items-center gap-2 md:gap-3" data-astro-cid-5n66qajd> <!-- Image Upload Button --> <button type="button" class="p-2.5 md:p-3 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors" title="Attach image" data-astro-cid-5n66qajd> <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-5n66qajd> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" data-astro-cid-5n66qajd></path> </svg> </button> <!-- Text Input --> <input type="text" id="message-input" placeholder="Type a message..." autocomplete="off" class="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 border-none rounded-full py-3 md:py-3.5 px-5 md:px-6 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all shadow-inner text-sm md:text-base" required data-astro-cid-5n66qajd> <!-- Send Button --> <button type="submit" id="send-btn" class="p-2.5 md:p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" data-astro-cid-5n66qajd> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-5n66qajd> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" data-astro-cid-5n66qajd></path> </svg> </button> </form> </div> </div>`}` }), defineScriptVars({ conversationId, currentUserId: currentUser?.id }));
}, "/Users/nikhilsingh/Documents/websites/wipp/src/pages/inbox/[id].astro", void 0);

const $$file = "/Users/nikhilsingh/Documents/websites/wipp/src/pages/inbox/[id].astro";
const $$url = "/inbox/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
