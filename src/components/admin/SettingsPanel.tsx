'use client';

import { useState, useEffect } from 'react';

interface FeatureFlag {
  name: string;
  value: boolean;
  description: string;
}

interface ProviderKey {
  name: string;
  configured: boolean;
  masked: string;
}

export function SettingsPanel() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [providerKeys, setProviderKeys] = useState<ProviderKey[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await res.json();
        if (data.success) {
          setFeatureFlags(data.data.featureFlags || []);
          setProviderKeys(data.data.providerKeys || []);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        // Fallback to empty arrays on error
        setFeatureFlags([]);
        setProviderKeys([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Settings</h3>

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">Feature Flags</h4>
        <div className="space-y-3">
          {featureFlags.map((flag) => (
            <div
              key={flag.name}
              className="flex items-start justify-between rounded-md border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{flag.name}</div>
                <div className="mt-1 text-xs text-slate-600">
                  {flag.description}
                </div>
              </div>
              <div className="ml-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    flag.value
                      ? 'bg-green-100 text-green-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {flag.value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Feature flags are configured via environment variables. Contact system
          administrator to change.
        </p>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">Provider API Keys Status</h4>
        <div className="space-y-3">
          {providerKeys.map((provider) => (
            <div
              key={provider.name}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{provider.name}</div>
              </div>
              <div className="ml-4 flex items-center gap-3">
                <span className="font-mono text-xs text-slate-600">
                  {provider.masked}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    provider.configured
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {provider.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          API keys are masked for security. Configure via environment variables.
        </p>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">System Information</h4>
        {loading ? (
          <div className="py-4 text-center text-sm text-slate-500">
            Loading...
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Environment:</span>
              <span className="font-medium">
                {process.env.NODE_ENV === 'production'
                  ? 'Production'
                  : 'Development'}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
