// Web Crypto API Zero-Knowledge AES-GCM Encrypted Backup & Sync
// Safe, offline, zero external dependencies

export async function encryptData(plainText, password) {
  const enc = new TextEncoder();
  const rawData = enc.encode(plainText);
  
  // 1. Generate salt for key derivation
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  // 2. Derive key from password using PBKDF2
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
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

  // 3. Generate IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // 4. Encrypt
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    rawData
  );

  // 5. Pack [salt (16 bytes) + iv (12 bytes) + ciphertext] as JSON payload
  const payload = {
    version: 1,
    salt: Array.from(salt),
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext))
  };

  return JSON.stringify(payload);
}

export async function decryptData(payloadJsonString, password) {
  const enc = new TextEncoder();
  const payload = JSON.parse(payloadJsonString);

  if (!payload.salt || !payload.iv || !payload.data) {
    throw new Error('Invalid encrypted backup file format.');
  }

  const salt = new Uint8Array(payload.salt);
  const iv = new Uint8Array(payload.iv);
  const ciphertext = new Uint8Array(payload.data);

  // 1. Derive key
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // 2. Decrypt
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    ciphertext
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
