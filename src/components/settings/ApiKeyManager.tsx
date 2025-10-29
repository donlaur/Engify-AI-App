'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ApiKey {
  _id: string;
  provider: 'openai' | 'anthropic' | 'google' | 'groq';
  keyName: string;
  isActive: boolean;
  createdAt: Date;
  usageCount: number;
  monthlyUsageLimit?: number;
  monthlyUsageCount: number;
  allowedModels: string[];
  expiresAt?: Date;
}

interface ApiKeyManagerProps {
  userId: string;
}

export function ApiKeyManager({ userId }: ApiKeyManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRotateDialogOpen, setIsRotateDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({
    provider: 'openai' as 'openai' | 'anthropic' | 'google' | 'groq',
    keyName: '',
    apiKey: '',
    allowedModels: '',
    monthlyUsageLimit: '',
  });

  useEffect(() => {
    loadKeys();
  }, [userId]);

  const loadKeys = async () => {
    try {
      const response = await fetch('/api/v2/users/api-keys');
      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.apiKey.trim()) {
      toast.error('API key is required');
      return;
    }

    if (!formData.keyName.trim()) {
      toast.error('Key name is required');
      return;
    }

    try {
      const allowedModels = formData.allowedModels
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      const response = await fetch('/api/v2/users/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: formData.provider,
          keyName: formData.keyName,
          apiKey: formData.apiKey,
          allowedModels,
          monthlyUsageLimit: formData.monthlyUsageLimit
            ? parseInt(formData.monthlyUsageLimit, 10)
            : undefined,
        }),
      });

      if (response.ok) {
        toast.success('API key added successfully');
        setIsDialogOpen(false);
        setFormData({
          provider: 'openai',
          keyName: '',
          apiKey: '',
          allowedModels: '',
          monthlyUsageLimit: '',
        });
        loadKeys();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add API key');
      }
    } catch (error) {
      console.error('Error adding API key:', error);
      toast.error('Failed to add API key');
    }
  };

  const handleRotate = async (newApiKey: string) => {
    if (!selectedKey) return;

    try {
      const response = await fetch(`/api/v2/users/api-keys/${selectedKey._id}/rotate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: newApiKey }),
      });

      if (response.ok) {
        toast.success('API key rotated successfully');
        setIsRotateDialogOpen(false);
        setSelectedKey(null);
        loadKeys();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to rotate API key');
      }
    } catch (error) {
      console.error('Error rotating API key:', error);
      toast.error('Failed to rotate API key');
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/v2/users/api-keys/${keyId}/revoke`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('API key revoked');
        loadKeys();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to revoke API key');
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  const maskKey = (keyId: string) => {
    // Show only last 4 characters
    return `••••••••••••${keyId.slice(-4)}`;
  };

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-500/10 text-green-500';
      case 'anthropic':
        return 'bg-purple-500/10 text-purple-500';
      case 'google':
        return 'bg-blue-500/10 text-blue-500';
      case 'groq':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-muted-foreground">
            Manage your AI provider API keys securely
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icons.plus className="mr-2 h-4 w-4" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add API Key</DialogTitle>
              <DialogDescription>
                Enter your API key for the selected provider. It will be encrypted and stored securely.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="provider">Provider</Label>
                <select
                  id="provider"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value as ApiKey['provider'] })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="groq">Groq</option>
                </select>
              </div>
              <div>
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  value={formData.keyName}
                  onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
                  placeholder="e.g., Production OpenAI Key"
                  required
                />
              </div>
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="sk-..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your key will be encrypted before storage
                </p>
              </div>
              <div>
                <Label htmlFor="allowedModels">Allowed Models (comma-separated)</Label>
                <Input
                  id="allowedModels"
                  value={formData.allowedModels}
                  onChange={(e) => setFormData({ ...formData, allowedModels: e.target.value })}
                  placeholder="gpt-4, gpt-3.5-turbo"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to allow all models for this provider
                </p>
              </div>
              <div>
                <Label htmlFor="monthlyUsageLimit">Monthly Usage Limit (tokens, optional)</Label>
                <Input
                  id="monthlyUsageLimit"
                  type="number"
                  value={formData.monthlyUsageLimit}
                  onChange={(e) => setFormData({ ...formData, monthlyUsageLimit: e.target.value })}
                  placeholder="1000000"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Key</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {keys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icons.key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No API keys configured</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first API key to start using AI features
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {keys.map((key) => (
            <Card key={key._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{key.keyName}</CardTitle>
                      <Badge className={getProviderBadgeColor(key.provider)}>
                        {key.provider}
                      </Badge>
                      {!key.isActive && (
                        <Badge variant="destructive">Revoked</Badge>
                      )}
                    </div>
                    <CardDescription>
                      Key ID: {maskKey(key._id)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedKey(key);
                        setIsRotateDialogOpen(true);
                      }}
                      disabled={!key.isActive}
                    >
                      <Icons.refresh className="mr-2 h-4 w-4" />
                      Rotate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevoke(key._id)}
                      disabled={!key.isActive}
                    >
                      <Icons.delete className="mr-2 h-4 w-4" />
                      Revoke
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Usage Count</p>
                    <p className="font-medium">{key.usageCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monthly Usage</p>
                    <p className="font-medium">
                      {key.monthlyUsageCount.toLocaleString()}
                      {key.monthlyUsageLimit
                        ? ` / ${key.monthlyUsageLimit.toLocaleString()}`
                        : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Models</p>
                    <p className="font-medium">
                      {key.allowedModels.length > 0
                        ? key.allowedModels.length
                        : 'All'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rotate Key Dialog */}
      <Dialog open={isRotateDialogOpen} onOpenChange={setIsRotateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rotate API Key</DialogTitle>
            <DialogDescription>
              Enter a new API key to replace the current one. The old key will be deactivated.
            </DialogDescription>
          </DialogHeader>
          <RotateKeyForm
            keyName={selectedKey?.keyName || ''}
            onRotate={handleRotate}
            onCancel={() => {
              setIsRotateDialogOpen(false);
              setSelectedKey(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RotateKeyForm({
  keyName,
  onRotate,
  onCancel,
}: {
  keyName: string;
  onRotate: (newKey: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [newApiKey, setNewApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey.trim()) {
      toast.error('New API key is required');
      return;
    }

    setLoading(true);
    try {
      await onRotate(newApiKey);
      setNewApiKey('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="newApiKey">New API Key for {keyName}</Label>
        <Input
          id="newApiKey"
          type="password"
          value={newApiKey}
          onChange={(e) => setNewApiKey(e.target.value)}
          placeholder="sk-..."
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Rotating...' : 'Rotate Key'}
        </Button>
      </div>
    </form>
  );
}

