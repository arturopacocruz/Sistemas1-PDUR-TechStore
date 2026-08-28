import crypto from 'crypto';

// Clave maestra de cifrado derivada (AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'techstore_secret_key_bolivia_2026_asfi_sec!'; // 32 bytes
const HMAC_SECRET = process.env.HMAC_SECRET || 'techstore_hmac_secret_asfi_audit_key_bolivia!';
const ALGORITHM = 'aes-256-cbc';
const KEY_BUFFER = crypto.scryptSync(ENCRYPTION_KEY, 'salt_techstore_bo', 32);

export class CryptoUtil {
  /**
   * Cifra campos sensibles (PII) en reposo (AES-256-CBC)
   */
  static encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Formato: iv:encryptedData
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Descifra campos sensibles previamente encriptados
   */
  static decrypt(cipherText: string): string {
    if (!cipherText || !cipherText.includes(':')) return cipherText;
    try {
      const [ivHex, encryptedData] = cipherText.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, iv);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return cipherText; // Fallback si ya estaba en texto claro
    }
  }

  /**
   * Genera Sello Criptográfico (SHA-256 HMAC) para no repudio de contratos y logs (Ley 164 / ASFI)
   */
  static generateIntegrityHash(payload: object | string): string {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(data)
      .digest('hex');
  }

  /**
   * Enmascara números telefónicos para visualización segura / logs (Privacidad por diseño)
   */
  static maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    return `${phone.slice(0, 2)}****${phone.slice(-2)}`;
  }

  /**
   * Enmascara direcciones físicas para logs de auditoría
   */
  static maskAddress(address: string): string {
    if (!address || address.length < 8) return 'Dirección protegida';
    return `${address.slice(0, 6)}... (Oculto por Ley N° 164)`;
  }
}
