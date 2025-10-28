'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SMSVerification() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/mfa/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      
      if (res.ok) {
        setCodeSent(true);
      } else {
        alert('Failed to send code');
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">SMS Verification</h3>
        <p className="text-sm text-gray-600">Verify your phone number</p>
      </div>

      {!codeSent ? (
        <div className="space-y-2">
          <label className="block font-medium">Phone Number:</label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
          />
          <Button onClick={sendCode} disabled={loading || !phoneNumber}>
            {loading ? 'Sending...' : 'Send Code'}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block font-medium">Enter verification code:</label>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
          />
          <Button disabled={code.length !== 6}>
            Verify
          </Button>
        </div>
      )}
    </div>
  );
}
