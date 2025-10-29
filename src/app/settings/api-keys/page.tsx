'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ApiKeyManager } from '@/components/settings/ApiKeyManager';
import { ApiKeyUsageDashboard } from '@/components/settings/ApiKeyUsageDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/lib/icons';
import { useSession } from 'next-auth/react';

function ApiKeysPageClient() {
  // Safely get session with fallback
  let session: ReturnType<typeof useSession>['data'] = null;
  let status: ReturnType<typeof useSession>['status'] = 'loading';
  
  try {
    const sessionResult = useSession();
    session = sessionResult.data;
    status = sessionResult.status;
  } catch (error) {
    // useSession failed (likely no SessionProvider) - will handle gracefully
    console.warn('useSession failed, continuing without session:', error);
  }
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Icons.spinner className="h-6 w-6 animate-spin" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!session?.user?.id) {
    return (
      <MainLayout>
        <div className="container py-8">
          <p>Please sign in to manage API keys.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">API Key Management</h1>
          <p className="text-muted-foreground">
            Securely manage your AI provider API keys and monitor usage
          </p>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="usage">Usage Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="keys">
            <ApiKeyManager userId={session.user.id} />
          </TabsContent>

          <TabsContent value="usage">
            <ApiKeyUsageDashboard userId={session.user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default ApiKeysPageClient;

