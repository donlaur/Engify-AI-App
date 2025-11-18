/**
 * MCP Token Display Component
 *
 * Shows MCP access token with copy functionality
 * Displays "show once" security warning
 * Provides setup instructions for MCP CLI
 */

'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface MCPTokenDisplayProps {
  onClose?: () => void;
}

export function MCPTokenDisplay({ onClose }: MCPTokenDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<{
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    jti?: string;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateToken = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/mcp/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenName: 'MCP CLI Token',
          scopes: ['memory.read', 'memory.write', 'prompts.execute'],
          expiresInDays: 30,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate token');
      }

      setToken(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast({
        title: 'Token Generation Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = async () => {
    if (!token?.access_token) return;

    try {
      await navigator.clipboard.writeText(token.access_token);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'MCP token copied to clipboard',
      });

      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy token to clipboard',
        variant: 'destructive',
      });
    }
  };

  const copyConfigExample = async () => {
    const config = `{
  "mcpServers": {
    "engify-bug-reporter": {
      "command": "npx",
      "args": ["@engify/mcp-server"],
      "env": {
        "ENGIFY_ACCESS_TOKEN": "${token?.access_token || 'YOUR_TOKEN_HERE'}",
        "ENGIFY_SERVER_URL": "https://engify.ai/api/mcp"
      }
    }
  }
}`;

    try {
      await navigator.clipboard.writeText(config);
      toast({
        title: 'Copied!',
        description: 'Configuration copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy configuration',
        variant: 'destructive',
      });
    }
  };

  // Auto-generate token on mount
  useEffect(() => {
    generateToken();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>MCP Access Token</CardTitle>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close"
            >
              <Icons.close className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Use this token to authenticate your MCP CLI and servers
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Security Warning */}
        <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-950">
          <Icons.alertTriangle className="h-4 w-4" />
          <AlertTitle>Save This Token Now!</AlertTitle>
          <AlertDescription>
            For security reasons, you won&apos;t be able to see this token again.
            Store it securely (e.g., password manager). Never commit it to version
            control.
          </AlertDescription>
        </Alert>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Icons.spinner className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <Icons.alertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Token Display */}
        {token && !isLoading && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Access Token
              </label>
              <div className="relative">
                <div className="rounded-md border bg-gray-900 p-4 font-mono text-sm text-green-400 overflow-x-auto">
                  {token.access_token}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToken}
                  className="absolute right-2 top-2"
                >
                  {copied ? (
                    <>
                      <Icons.check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Icons.copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Token Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Expires In</p>
                <p className="font-medium">
                  {token.expires_in ? `${token.expires_in / 3600} hour(s)` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Scopes</p>
                <p className="font-medium">{token.scope || 'N/A'}</p>
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="font-medium flex items-center gap-2">
                <Icons.terminal className="h-4 w-4" />
                Setup Instructions
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    1. Save token to file:
                  </p>
                  <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-3 font-mono text-xs">
                    echo &apos;{JSON.stringify({ access_token: token.access_token })}&apos; &gt; ~/.engify-mcp-auth.json
                    <br />
                    chmod 600 ~/.engify-mcp-auth.json
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    2. Configure Claude Desktop (macOS):
                  </p>
                  <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-3 font-mono text-xs relative">
                    <pre className="whitespace-pre-wrap">
{`{
  "mcpServers": {
    "engify": {
      "command": "npx",
      "args": ["@engify/mcp-server"],
      "env": {
        "ENGIFY_TOKEN": "${token.access_token?.substring(0, 20) || ''}..."
      }
    }
  }
}`}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyConfigExample}
                      className="absolute right-2 top-2"
                    >
                      <Icons.copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Save to: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    3. Restart Claude Desktop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The Engify MCP server will now be available in Claude Desktop
                  </p>
                </div>
              </div>
            </div>

            {/* Refresh Token (Optional) */}
            {token.refresh_token && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <Icons.info className="h-4 w-4" />
                <AlertTitle>Refresh Token</AlertTitle>
                <AlertDescription className="font-mono text-xs">
                  {token.refresh_token}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={generateToken}
            disabled={isLoading}
            className="flex-1"
          >
            <Icons.refresh className="mr-2 h-4 w-4" />
            Generate New Token
          </Button>
          {onClose && (
            <Button variant="default" onClick={onClose} className="flex-1">
              Done
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
