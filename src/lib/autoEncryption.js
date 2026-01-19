// Automatic E2E Encryption System
// This module handles automatic key generation and encryption for all users

class AutoEncryption {
  constructor() {
    this.isInitialized = false;
    this.keyPair = null;
    this.userId = null;
  }

  // Initialize encryption for a user automatically
  async initializeForUser(userId) {
    try {
      this.userId = userId;
      
      // Check if user already has keys
      const existingKeys = await this.getUserKeys(userId);
      
      if (existingKeys) {
        // User has keys, try to load them
        await this.loadExistingKeys(existingKeys);
      } else {
        // Generate new keys automatically
        await this.generateAndStoreKeys(userId);
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      return false;
    }
  }

  // Generate new encryption keys automatically
  async generateAndStoreKeys(userId) {
    try {
      // Generate RSA key pair
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Export keys
      const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      // Convert to base64
      const publicKeyB64 = this.arrayBufferToBase64(publicKey);
      const privateKeyB64 = this.arrayBufferToBase64(privateKey);

      // Generate a simple password for key encryption (user-specific)
      const password = await this.generateUserPassword(userId);
      
      // Encrypt the private key
      const encryptedPrivateKey = await this.encryptPrivateKey(privateKeyB64, password);

      // Store keys in database
      await this.storeKeysInDatabase(userId, publicKeyB64, encryptedPrivateKey);

      // Store in memory for current session
      this.keyPair = keyPair;
      
      // Store password in session storage for convenience
      sessionStorage.setItem(`encryption_password_${userId}`, password);

      return true;
    } catch (error) {
      console.error('Failed to generate keys:', error);
      throw error;
    }
  }

  // Generate a user-specific password for key encryption
  async generateUserPassword(userId) {
    // Create a deterministic but secure password based on user ID and browser fingerprint
    const browserFingerprint = await this.getBrowserFingerprint();
    const combined = userId + browserFingerprint + 'wipp_encryption_salt';
    
    // Hash to create password
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    
    return this.arrayBufferToBase64(hashBuffer).substring(0, 32);
  }

  // Get browser fingerprint for password generation
  async getBrowserFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    
    return this.arrayBufferToBase64(hashBuffer).substring(0, 16);
  }

  // Encrypt private key with password
  async encryptPrivateKey(privateKeyB64, password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(privateKeyB64);
    
    // Generate salt and IV
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key from password
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Encrypt the private key
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      derivedKey,
      data
    );
    
    return {
      encrypted: this.arrayBufferToBase64(encrypted),
      salt: this.arrayBufferToBase64(salt),
      iv: this.arrayBufferToBase64(iv)
    };
  }

  // Store keys in database
  async storeKeysInDatabase(userId, publicKey, encryptedPrivateKey) {
    const response = await fetch('/api/encryption/auto-store-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        public_key: publicKey,
        encrypted_private_key: encryptedPrivateKey.encrypted,
        key_salt: encryptedPrivateKey.salt,
        key_iv: encryptedPrivateKey.iv
      })
    });

    if (!response.ok) {
      throw new Error('Failed to store encryption keys');
    }

    return await response.json();
  }

  // Get user's existing keys
  async getUserKeys(userId) {
    try {
      const response = await fetch(`/api/encryption/get-keys/${userId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Load existing keys
  async loadExistingKeys(keyData) {
    try {
      // Try to get password from session storage
      let password = sessionStorage.getItem(`encryption_password_${this.userId}`);
      
      if (!password) {
        // Regenerate password using the same method
        password = await this.generateUserPassword(this.userId);
        sessionStorage.setItem(`encryption_password_${this.userId}`, password);
      }

      // Decrypt private key
      const privateKeyB64 = await this.decryptPrivateKey(keyData, password);
      
      // Import keys
      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        this.base64ToArrayBuffer(keyData.public_key),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
      );

      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        this.base64ToArrayBuffer(privateKeyB64),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
      );

      this.keyPair = { publicKey, privateKey };
      return true;
    } catch (error) {
      console.error('Failed to load existing keys:', error);
      // If we can't load existing keys, generate new ones
      await this.generateAndStoreKeys(this.userId);
      return true;
    }
  }

  // Decrypt private key
  async decryptPrivateKey(keyData, password) {
    const encoder = new TextEncoder();
    
    // Import password
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive key
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.base64ToArrayBuffer(keyData.key_salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: this.base64ToArrayBuffer(keyData.key_iv)
      },
      derivedKey,
      this.base64ToArrayBuffer(keyData.encrypted_private_key)
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Encrypt message for another user
  async encryptMessageForUser(message, recipientUserId) {
    if (!this.isInitialized) {
      throw new Error('Encryption not initialized');
    }

    // Get recipient's public key
    const recipientKeys = await this.getUserKeys(recipientUserId);
    if (!recipientKeys) {
      throw new Error('Recipient does not have encryption keys');
    }

    // Import recipient's public key
    const recipientPublicKey = await window.crypto.subtle.importKey(
      'spki',
      this.base64ToArrayBuffer(recipientKeys.public_key),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );

    // Generate AES key for message
    const aesKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Encrypt message with AES
    const encoder = new TextEncoder();
    const messageData = encoder.encode(message);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedMessage = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      aesKey,
      messageData
    );

    // Export AES key
    const aesKeyData = await window.crypto.subtle.exportKey('raw', aesKey);

    // Encrypt AES key with recipient's public key
    const encryptedAesKey = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      recipientPublicKey,
      aesKeyData
    );

    return {
      encrypted_message: this.arrayBufferToBase64(encryptedMessage),
      encrypted_key: this.arrayBufferToBase64(encryptedAesKey),
      iv: this.arrayBufferToBase64(iv),
      sender_id: this.userId,
      recipient_id: recipientUserId
    };
  }

  // Decrypt message
  async decryptMessage(encryptedData) {
    if (!this.isInitialized || !this.keyPair) {
      throw new Error('Encryption not initialized');
    }

    try {
      // Decrypt AES key with our private key
      const encryptedAesKey = this.base64ToArrayBuffer(encryptedData.encrypted_key);
      const aesKeyData = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        this.keyPair.privateKey,
        encryptedAesKey
      );

      // Import AES key
      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        aesKeyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Decrypt message
      const encryptedMessage = this.base64ToArrayBuffer(encryptedData.encrypted_message);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      
      const decryptedMessage = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        encryptedMessage
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedMessage);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      return '[🔒 Failed to decrypt message]';
    }
  }

  // Utility functions
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Check if encryption is ready
  isReady() {
    return this.isInitialized && this.keyPair !== null;
  }
}

// Create global instance
export const autoEncryption = new AutoEncryption();