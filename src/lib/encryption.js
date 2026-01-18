/**
 * End-to-End Encryption Library for Wipp Messaging
 * Uses Web Crypto API for secure client-side encryption
 */

class WippEncryption {
  constructor() {
    this.keyPair = null;
    this.publicKey = null;
    this.privateKey = null;
  }

  /**
   * Generate a new key pair for the user
   */
  async generateKeyPair() {
    try {
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true, // extractable
        ["encrypt", "decrypt"]
      );

      this.publicKey = this.keyPair.publicKey;
      this.privateKey = this.keyPair.privateKey;

      return {
        publicKey: await this.exportPublicKey(),
        privateKey: await this.exportPrivateKey()
      };
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw new Error('Failed to generate encryption keys');
    }
  }

  /**
   * Export public key to base64 string
   */
  async exportPublicKey() {
    if (!this.publicKey) throw new Error('No public key available');
    
    const exported = await window.crypto.subtle.exportKey('spki', this.publicKey);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Export private key to base64 string (encrypted with user password)
   */
  async exportPrivateKey() {
    if (!this.privateKey) throw new Error('No private key available');
    
    const exported = await window.crypto.subtle.exportKey('pkcs8', this.privateKey);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Import public key from base64 string
   */
  async importPublicKey(publicKeyBase64) {
    try {
      const keyData = this.base64ToArrayBuffer(publicKeyBase64);
      return await window.crypto.subtle.importKey(
        'spki',
        keyData,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        false,
        ['encrypt']
      );
    } catch (error) {
      console.error('Error importing public key:', error);
      throw new Error('Failed to import public key');
    }
  }

  /**
   * Import private key from base64 string
   */
  async importPrivateKey(privateKeyBase64) {
    try {
      const keyData = this.base64ToArrayBuffer(privateKeyBase64);
      this.privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        keyData,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        false,
        ['decrypt']
      );
      return this.privateKey;
    } catch (error) {
      console.error('Error importing private key:', error);
      throw new Error('Failed to import private key');
    }
  }

  /**
   * Encrypt a message using recipient's public key
   */
  async encryptMessage(message, recipientPublicKeyBase64) {
    try {
      // For large messages, we use hybrid encryption:
      // 1. Generate a random AES key
      // 2. Encrypt the message with AES
      // 3. Encrypt the AES key with RSA
      
      // Generate AES key
      const aesKey = await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );

      // Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Encrypt message with AES
      const messageBuffer = new TextEncoder().encode(message);
      const encryptedMessage = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        aesKey,
        messageBuffer
      );

      // Export AES key
      const exportedAESKey = await window.crypto.subtle.exportKey('raw', aesKey);

      // Import recipient's public key
      const recipientPublicKey = await this.importPublicKey(recipientPublicKeyBase64);

      // Encrypt AES key with recipient's RSA public key
      const encryptedAESKey = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
        },
        recipientPublicKey,
        exportedAESKey
      );

      // Return encrypted data
      return {
        encryptedMessage: this.arrayBufferToBase64(encryptedMessage),
        encryptedKey: this.arrayBufferToBase64(encryptedAESKey),
        iv: this.arrayBufferToBase64(iv),
        algorithm: 'AES-GCM-RSA-OAEP'
      };
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt a message using user's private key
   */
  async decryptMessage(encryptedData) {
    try {
      if (!this.privateKey) {
        throw new Error('Private key not loaded');
      }

      const { encryptedMessage, encryptedKey, iv, algorithm } = encryptedData;

      if (algorithm !== 'AES-GCM-RSA-OAEP') {
        throw new Error('Unsupported encryption algorithm');
      }

      // Decrypt AES key with RSA private key
      const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedKey);
      const decryptedAESKey = await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        this.privateKey,
        encryptedKeyBuffer
      );

      // Import AES key
      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        decryptedAESKey,
        {
          name: "AES-GCM",
        },
        false,
        ['decrypt']
      );

      // Decrypt message with AES key
      const encryptedMessageBuffer = this.base64ToArrayBuffer(encryptedMessage);
      const ivBuffer = this.base64ToArrayBuffer(iv);

      const decryptedMessageBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivBuffer,
        },
        aesKey,
        encryptedMessageBuffer
      );

      // Convert back to string
      return new TextDecoder().decode(decryptedMessageBuffer);
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * Generate a secure password-based key for local storage encryption
   */
  async deriveKeyFromPassword(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt private key with password for secure storage
   */
  async encryptPrivateKeyWithPassword(privateKeyBase64, password) {
    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const key = await this.deriveKeyFromPassword(password, salt);
      
      const privateKeyBuffer = new TextEncoder().encode(privateKeyBase64);
      const encryptedPrivateKey = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        privateKeyBuffer
      );

      return {
        encryptedPrivateKey: this.arrayBufferToBase64(encryptedPrivateKey),
        salt: this.arrayBufferToBase64(salt),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      console.error('Error encrypting private key:', error);
      throw new Error('Failed to encrypt private key');
    }
  }

  /**
   * Decrypt private key with password
   */
  async decryptPrivateKeyWithPassword(encryptedData, password) {
    try {
      const { encryptedPrivateKey, salt, iv } = encryptedData;
      
      const saltBuffer = this.base64ToArrayBuffer(salt);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedPrivateKey);
      
      const key = await this.deriveKeyFromPassword(password, saltBuffer);
      
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBuffer
        },
        key,
        encryptedBuffer
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Error decrypting private key:', error);
      throw new Error('Failed to decrypt private key - wrong password?');
    }
  }

  /**
   * Utility: Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Utility: Convert Base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate a secure random password for key encryption
   */
  generateSecurePassword(length = 32) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    return password;
  }
}

// Export for use in other modules
export { WippEncryption };