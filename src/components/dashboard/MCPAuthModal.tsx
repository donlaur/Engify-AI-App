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
                  Tokens expire after 1 hour for security
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

                {/* Instructions */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Next Steps:</h4>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    <li>Return to your terminal window</li>
                    <li>Paste the token when prompted</li>
                    <li>Your MCP server will be configured</li>
                    <li>Start using @Engify in your IDE!</li>
                  </ol>
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
