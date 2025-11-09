'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { toast } from 'sonner';

export function MCPAuthModal() {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Check for MCP referral on mount
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref === 'mcp-auth') {
      setIsOpen(true);
      // Clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const generateToken = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/mcp-auth/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();
      setToken(data.token);
      
      // Auto-copy to clipboard
      await navigator.clipboard.writeText(data.token);
      toast.success('MCP token copied to clipboard!');
      
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error('Failed to generate MCP token');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToken = async () => {
    if (!token) return;
    
    try {
      await navigator.clipboard.writeText(token);
      toast.success('Token copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy token');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setToken('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.server className="h-5 w-5" />
            MCP Server Authentication
          </DialogTitle>
          <DialogDescription>
            Generate a token to authenticate your local Engify MCP server
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What is this?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The Engify MCP server allows AI assistants (like Cursor) to access your bug reports 
                and provide context-aware debugging help.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Generate a token below</li>
                  <li>Return to your terminal and paste the token</li>
                  <li>Your MCP server will be authenticated</li>
                  <li>AI assistants can now access your bug reports</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Token Generation */}
          {!token ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate MCP Token</CardTitle>
                <CardDescription>
                  Tokens expire after 7 days for your convenience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateToken}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Generating Token...
                    </>
                  ) : (
                    <>
                      <Icons.key className="mr-2 h-4 w-4" />
                      Generate MCP Token
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Token Generated!</CardTitle>
                <CardDescription>
                  Copy this token and paste it in your terminal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Token Display */}
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-xs break-all font-mono">
                    {token}
                  </code>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={copyToken} variant="outline" className="flex-1">
                    <Icons.copy className="mr-2 h-4 w-4" />
                    Copy Token
                  </Button>
                  <Button onClick={generateToken} variant="outline" className="flex-1">
                    <Icons.refresh className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>

                {/* IDE Configuration */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Configure Your IDE:</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Choose your IDE and follow the instructions below:
                  </p>
                  
                  {/* IDE Tabs */}
                  <div className="space-y-3">
                    {/* Windsurf */}
                    <details className="bg-white p-3 rounded border">
                      <summary className="font-medium cursor-pointer flex items-center gap-2">
                        <Icons.code className="h-4 w-4" />
                        Windsurf
                      </summary>
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Option 1: AI-Assisted (Recommended)</strong>
                        </p>
                        <div className="bg-gray-100 p-2 rounded">
                          <p className="text-xs font-mono mb-2">Copy this prompt and paste it in Windsurf Cascade:</p>
                          <textarea 
                            readOnly
                            className="w-full h-24 text-xs font-mono p-2 border rounded"
                            value={`Please update my MCP configuration file at ~/.codeium/windsurf/mcp_config.json to add the Engify server. Add this server configuration:

"engify": {
  "command": "pnpm",
  "args": ["start"],
  "cwd": "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}".replace('http://localhost:3000', '/Users/donlaur/dev/Engify-AI-App') + "/mcp-server",
  "disabled": false
}

Add it to the existing mcpServers object, keeping the existing servers.`}
                            onClick={(e) => e.currentTarget.select()}
                          />
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const prompt = `Please update my MCP configuration file at ~/.codeium/windsurf/mcp_config.json to add the Engify server. Add this server configuration:

"engify": {
  "command": "pnpm",
  "args": ["start"],
  "cwd": "/Users/donlaur/dev/Engify-AI-App/mcp-server",
  "disabled": false
}

Add it to the existing mcpServers object, keeping the existing servers.`;
                            navigator.clipboard.writeText(prompt);
                            toast.success('Prompt copied to clipboard!');
                          }}
                        >
                          <Icons.copy className="mr-2 h-3 w-3" />
                          Copy Prompt
                        </Button>
                        
                        <p className="text-sm text-gray-600 mt-3">
                          <strong>Option 2: Manual Configuration</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                          Edit <code className="bg-gray-200 px-1 rounded">~/.codeium/windsurf/mcp_config.json</code> and add the server configuration above.
                        </p>
                      </div>
                    </details>

                    {/* Cursor */}
                    <details className="bg-white p-3 rounded border">
                      <summary className="font-medium cursor-pointer flex items-center gap-2">
                        <Icons.terminal className="h-4 w-4" />
                        Cursor
                      </summary>
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>AI-Assisted (Recommended)</strong>
                        </p>
                        <div className="bg-gray-100 p-2 rounded">
                          <p className="text-xs font-mono mb-2">Copy this prompt and paste it in Cursor:</p>
                          <textarea 
                            readOnly
                            className="w-full h-24 text-xs font-mono p-2 border rounded"
                            value={`Please update my MCP configuration file at ~/Library/Application Support/Claude/claude_desktop_config.json to add the Engify server. Add this server configuration:

"engify": {
  "command": "pnpm",
  "args": ["start"],
  "cwd": "/Users/donlaur/dev/Engify-AI-App/mcp-server"
}

Add it to the existing mcpServers object, keeping the existing servers.`}
                            onClick={(e) => e.currentTarget.select()}
                          />
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const prompt = `Please update my MCP configuration file at ~/Library/Application Support/Claude/claude_desktop_config.json to add the Engify server. Add this server configuration:

"engify": {
  "command": "pnpm",
  "args": ["start"],
  "cwd": "/Users/donlaur/dev/Engify-AI-App/mcp-server"
}

Add it to the existing mcpServers object, keeping the existing servers.`;
                            navigator.clipboard.writeText(prompt);
                            toast.success('Prompt copied to clipboard!');
                          }}
                        >
                          <Icons.copy className="mr-2 h-3 w-3" />
                          Copy Prompt
                        </Button>
                      </div>
                    </details>

                    {/* VS Code */}
                    <details className="bg-white p-3 rounded border">
                      <summary className="font-medium cursor-pointer flex items-center gap-2">
                        <Icons.code className="h-4 w-4" />
                        VS Code
                      </summary>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          VS Code MCP support is coming soon. For now, use Cursor or Windsurf.
                        </p>
                      </div>
                    </details>
                  </div>
                  
                  <p className="text-xs text-blue-700 mt-3">
                    After configuration, restart your IDE and try: <code className="bg-blue-100 px-1 rounded">@Engify get new bug reports</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-1">🔒 Security Notice</h4>
            <p className="text-sm text-yellow-800">
              This token allows access to your bug reports. Never share it publicly or commit it to version control.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
