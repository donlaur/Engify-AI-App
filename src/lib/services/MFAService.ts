/**
 * Multi-Factor Authentication Service
 * Supports TOTP (Time-based One-Time Password)
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class MFAService {
  /**
   * Generate MFA secret and QR code for user
   */
  async generateSecret(userId: string, email: string) {
    const secret = speakeasy.generateSecret({
      name: `Engify.ai (${email})`,
      issuer: 'Engify.ai',
      length: 32,
    });
    
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpauthUrl: secret.otpauth_url!,
    };
  }
  
  /**
   * Verify TOTP token
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after (60 seconds)
    });
  }
  
  /**
   * Generate backup codes for account recovery
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = speakeasy.generateSecret({ length: 10 }).base32.substring(0, 8);
      codes.push(code);
    }
    
    return codes;
  }
  
  /**
   * Verify backup code
   */
  verifyBackupCode(storedCodes: string[], providedCode: string): boolean {
    return storedCodes.includes(providedCode.toUpperCase());
  }
}
