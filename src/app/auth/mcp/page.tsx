'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function MCPAuthPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const callback = searchParams.get('callback');

  useEffect(() => {
    if (status === 'loading') return;

    // If not authenticated, redirect to sign in
    if (!session) {
      signIn(undefined, { callbackUrl: `/auth/mcp?callback=${encodeURIComponent(callback || '')}` });
      return;
    }

    // If authenticated, generate token and redirect
    if (session && callback) {
      handleAuth();
    }
    // handleAuth is stable and doesn't need to be in deps - it only runs once per auth flow
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, callback]);

  async function handleAuth() {
    try {
      // Generate MCP token
      const response = await fetch('/api/auth/mcp-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();

      // Redirect back to MCP server with token
      const redirectUrl = new URL(callback!);
      redirectUrl.searchParams.set('token', data.token);
      redirectUrl.searchParams.set('userId', session!.user!.id);
      redirectUrl.searchParams.set('email', session!.user!.email || '');
      redirectUrl.searchParams.set('name', session!.user!.name || '');
      redirectUrl.searchParams.set('expiresIn', data.expiresIn.toString());

      window.location.href = redirectUrl.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Failed
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authenticating MCP Server
          </h1>
          <p className="text-gray-600 mb-6">
            {status === 'loading' ? 'Loading...' : 'Generating token...'}
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
