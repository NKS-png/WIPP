// Temporary stub for autoEncryption to fix Vercel deployment
// The full encryption system is disabled until serverless compatibility is resolved

export const autoEncryption = {
  initializeForUser: async (userId) => {
    console.log('Auto encryption disabled for serverless compatibility');
    return false;
  },
  
  isReady: () => false,
  
  encryptMessageForUser: async (message, targetUserId) => {
    throw new Error('Encryption disabled for serverless compatibility');
  },
  
  decryptMessage: async (encryptedData) => {
    throw new Error('Encryption disabled for serverless compatibility');
  }
};