/**
 * Key Management System for Wipp E2E Encryption
 * Handles secure storage and retrieval of encryption keys
 */

import { WippEncryption } from './encryption.js';

class KeyManager {
  constructor() {
    this.encryption = new WippEncryption();
    this.isUnlocked = false;
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.sessionTimer = null;
  }

  /**
   * Initialize encryption for a new user
   */
  async initializeUserEncryption(userId, userPassword) {
    try {
      // Generate new key pair
      const keys = await this.encryption.generateKeyPair();
      
      // Encrypt private key with user password
      const encryptedPrivateKey = await this.encryption.encryptPrivateKeyWithPassword(
        keys.privateKey, 
        userPassword
      );

      // Store public key in database (unencrypted - it's meant to be public)
      // Store encrypted private key in database
      const keyData = {
        user_id: userId,
        public_key: keys.publicKey,
        encrypted_private_key: encryptedPrivateKey.encryptedPrivateKey,
        key_salt: encryptedPrivateKey.salt,
        key_iv: encryptedPrivateKey.iv,
        created_at: new Date().toISOString()
      };

      // Save to database via API
      const response = await fetch('/api/encryption/store-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keyData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.code === 'TABLE_NOT_FOUND') {
          throw new Error('Database not configured for encryption. Please run the SQL migrations first.');
        }
        
        throw new Error(errorData.message || 'Failed to store encryption keys');
      }

      // Load the private key into memory
      await this.encryption.importPrivateKey(keys.privateKey);
      this.isUnlocked = true;
      this.startSessionTimer();

      return true;
    } catch (error) {
      console.error('Error initializing user encryption:', error);
      throw error;
    }
  }

  /**
   * Unlock user's encryption keys with password
   */
  async unlockKeys(userId, userPassword) {
    try {
      // Fetch encrypted keys from database
      const response = await fetch(`/api/encryption/get-keys/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch encryption keys');
      }

      const keyData = await response.json();
      
      // Decrypt private key with user password
      const encryptedPrivateKeyData = {
        encryptedPrivateKey: keyData.encrypted_private_key,
        salt: keyData.key_salt,
        iv: keyData.key_iv
      };

      const privateKeyBase64 = await this.encryption.decryptPrivateKeyWithPassword(
        encryptedPrivateKeyData,
        userPassword
      );

      // Load private key into memory
      await this.encryption.importPrivateKey(privateKeyBase64);
      this.isUnlocked = true;
      this.startSessionTimer();

      // Cache public key for easy access
      this.userPublicKey = keyData.public_key;

      return true;
    } catch (error) {
      console.error('Error unlocking keys:', error);
      throw new Error('Failed to unlock encryption keys - wrong password?');
    }
  }

  /**
   * Get public key for a specific user
   */
  async getUserPublicKey(userId) {
    try {
      const response = await fetch(`/api/encryption/get-public-key/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user public key');
      }

      const data = await response.json();
      return data.public_key;
    } catch (error) {
      console.error('Error fetching user public key:', error);
      throw error;
    }
  }

  /**
   * Encrypt a message for a specific recipient
   */
  async encryptMessageForUser(message, recipientUserId) {
    if (!this.isUnlocked) {
      throw new Error('Encryption keys are locked. Please unlock first.');
    }

    try {
      // Get recipient's public key
      const recipientPublicKey = await this.getUserPublicKey(recipientUserId);
      
      // Encrypt the message
      return await this.encryption.encryptMessage(message, recipientPublicKey);
    } catch (error) {
      console.error('Error encrypting message for user:', error);
      throw error;
    }
  }

  /**
   * Decrypt a received message
   */
  async decryptMessage(encryptedData) {
    if (!this.isUnlocked) {
      throw new Error('Encryption keys are locked. Please unlock first.');
    }

    try {
      return await this.encryption.decryptMessage(encryptedData);
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw error;
    }
  }

  /**
   * Lock the keys (clear from memory)
   */
  lockKeys() {
    this.encryption.privateKey = null;
    this.isUnlocked = false;
    this.clearSessionTimer();
    
    // Clear any cached data
    this.userPublicKey = null;
    
    console.log('Encryption keys locked');
  }

  /**
   * Start session timer for auto-lock
   */
  startSessionTimer() {
    this.clearSessionTimer();
    this.sessionTimer = setTimeout(() => {
      this.lockKeys();
      this.showSessionExpiredNotification();
    }, this.sessionTimeout);
  }

  /**
   * Clear session timer
   */
  clearSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Extend session (reset timer)
   */
  extendSession() {
    if (this.isUnlocked) {
      this.startSessionTimer();
    }
  }

  /**
   * Show notification when session expires
   */
  showSessionExpiredNotification() {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(
        'Your encryption session has expired. Please unlock your keys to continue messaging.',
        'warning',
        10000
      );
    }
  }

  /**
   * Check if user has encryption keys set up
   */
  async hasEncryptionKeys(userId) {
    try {
      const response = await fetch(`/api/encryption/check-keys/${userId}`);
      const data = await response.json();
      return data.hasKeys;
    } catch (error) {
      console.error('Error checking encryption keys:', error);
      return false;
    }
  }

  /**
   * Generate a secure password for key encryption
   */
  generateSecurePassword() {
    return this.encryption.generateSecurePassword();
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password) {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const issues = [];
    
    if (password.length < minLength) {
      issues.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      issues.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      issues.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      issues.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      issues.push('Password must contain at least one special character');
    }

    return {
      isValid: issues.length === 0,
      issues: issues,
      strength: this.calculatePasswordStrength(password)
    };
  }

  /**
   * Calculate password strength score
   */
  calculatePasswordStrength(password) {
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 2, 20);
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
    
    // Complexity bonus
    if (password.length >= 16) score += 10;
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) score += 15;

    // Return strength level
    if (score >= 70) return 'very-strong';
    if (score >= 50) return 'strong';
    if (score >= 30) return 'medium';
    if (score >= 15) return 'weak';
    return 'very-weak';
  }
}

// Create global instance
const keyManager = new KeyManager();

// Auto-extend session on user activity
let activityTimer;
function resetActivityTimer() {
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    keyManager.extendSession();
  }, 1000);
}

// Listen for user activity
if (typeof window !== 'undefined') {
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetActivityTimer, { passive: true });
  });
}

export { KeyManager, keyManager };