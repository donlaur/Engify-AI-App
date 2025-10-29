'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; score: number }>;
  usedRAG?: boolean;
}

export default function RAGChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hi! I&apos;m your RAG-powered AI assistant. I can search through our knowledge base to give you accurate, sourced answers about prompt engineering, AI patterns, and best practices. What would you like to know?',
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
          useRAG: true,
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

  const quickQuestions = [
    'What is Chain of Thought prompting?',
    'How do I write better prompts?',
    'What are the best AI patterns?',
    'Show me examples of few-shot learning',
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">RAG-Powered AI Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions about prompt engineering, AI patterns, and best
          practices. I&apos;ll search our knowledge base to give you accurate,
          sourced answers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="flex h-[700px] flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <Icons.bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">RAG Chatbot</CardTitle>
                <Badge variant="secondary" className="text-xs">Beta</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-0">
              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <div className="break-words">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>

                      {/* Show sources if available */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 border-t border-gray-200 pt-3">
                          <p className="mb-2 text-xs font-medium text-gray-500">
                            Sources:
                          </p>
                          <div className="space-y-1">
                            {message.sources.map((source, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-xs text-gray-600"
                              >
                                <Icons.fileText className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{source.title}</span>
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {source.score.toFixed(2)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show RAG indicator */}
                      {message.usedRAG && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Icons.search className="mr-1 h-3 w-3" />
                            Knowledge Base Search
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg bg-muted px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                        <span className="text-sm">
                          Searching knowledge base...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                  >
                    <Icons.send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto w-full justify-start p-4 text-left hover:bg-muted/50"
                  onClick={() => setInput(question)}
                >
                  <Icons.messageSquare className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="text-sm break-words">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* RAG Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">RAG Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Icons.search className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Vector Search: Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.database className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm">Knowledge Base: Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.brain className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span className="text-sm">AI Model: GPT-3.5-turbo</span>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                • Semantic search through knowledge base
              </div>
              <div className="text-sm text-muted-foreground">
                • Source citations with relevance scores
              </div>
              <div className="text-sm text-muted-foreground">
                • Context-aware responses
              </div>
              <div className="text-sm text-muted-foreground">
                • Fallback to general knowledge
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
