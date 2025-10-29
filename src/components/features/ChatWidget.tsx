/**
 * Chat Widget Component
 * Simple chatbot for answering questions about prompts and patterns
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; score: number }>;
  usedRAG?: boolean;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hi! I can help you find the right prompts and patterns. What are you working on?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          sources: data.sources,
          usedRAG: data.usedRAG,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transition-transform hover:scale-110"
      >
        <Icons.messageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96">
      <Card className="shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 hover:bg-white/20"
          >
            <Icons.x className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-96 space-y-4 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>

                  {/* Show sources if available */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 border-t border-gray-200 pt-2">
                      <p className="mb-1 text-xs text-gray-500">Sources:</p>
                      <div className="space-y-1">
                        {message.sources.map((source, idx) => (
                          <div key={idx} className="text-xs text-gray-600">
                            • {source.title} (score: {source.score.toFixed(2)})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show RAG indicator */}
                  {message.usedRAG && (
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                        <Icons.search className="mr-1 h-3 w-3" />
                        Knowledge Base
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about prompts..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Icons.send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
