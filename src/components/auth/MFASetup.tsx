'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export function MFASetup() {
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateSecret = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/mfa/setup', { method: 'POST' });
      const data = await res.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch (error) {
      console.error('Failed to generate MFA secret:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, secret }),
      });
      
      if (res.ok) {
        alert('MFA enabled successfully!');
      } else {
        alert('Invalid token');
      }
    } catch (error) {
      console.error('Failed to verify token:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enable Two-Factor Authentication</h2>
        <p className="text-gray-600 mt-2">Add an extra layer of security to your account</p>
      </div>

      {!qrCode ? (
        <Button onClick={generateSecret} disabled={loading}>
          {loading ? 'Generating...' : 'Enable MFA'}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Scan QR Code</h3>
            <Image src={qrCode} alt="MFA QR Code" width={200} height={200} />
            <p className="text-sm text-gray-600 mt-4">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">Or enter this code manually:</h3>
            <code className="bg-gray-100 px-3 py-2 rounded">{secret}</code>
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Enter verification code:</label>
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="000000"
              maxLength={6}
            />
            <Button onClick={verifyToken} disabled={loading || token.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
