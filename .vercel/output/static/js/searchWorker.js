/**
 * Web Worker for building search indexes
 * Prevents UI blocking during message indexing
 */

self.onmessage = async function(e) {
  const { type, messages, privateKey } = e.data;
  
  try {
    switch (type) {
      case 'buildIndex':
        const index = await buildSearchIndex(messages, privateKey);
        self.postMessage({
          type: 'indexComplete',
          index: Array.from(index.entries())
        });
        break;
        
      default:
        throw new Error('Unknown operation type');
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error.message
    });
  }
};

async function buildSearchIndex(messages, privateKey) {
  const index = new Map();
  
  for (const message of messages) {
    try {
      let content = message.content;
      
      // Decrypt if encrypted
      if (message.is_encrypted && message.encrypted_content) {
        content = await decryptMessage(message.encrypted_content, privateKey);
      }
      
      // Create searchable index entry
      index.set(message.id, {
        conversationId: message.conversation_id,
        content: content,
        timestamp: message.created_at,
        keywords: extractKeywords(content)
      });
      
      // Report progress
      if (index.size % 100 === 0) {
        self.postMessage({
          type: 'progress',
          processed: index.size,
          total: messages.length
        });
      }
      
    } catch (error) {
      console.error('Error indexing message:', message.id, error);
      // Continue with other messages
    }
  }
  
  return index;
}

function extractKeywords(content) {
  // Simple keyword extraction
  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 20); // Limit keywords per message
}

async function decryptMessage(encryptedData, privateKey) {
  // Placeholder - would implement actual decryption
  return "Decrypted content";
}