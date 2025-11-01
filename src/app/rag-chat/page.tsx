'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; content?: string; score: number }>;
  usedRAG?: boolean;
}

export default function RAGChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm Engify Assistant, your RAG-powered AI helper. I can search through our knowledge base to give you accurate, sourced answers about prompt engineering, AI patterns, and best practices. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
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

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hi! I'm Engify Assistant, your RAG-powered AI helper. I can search through our knowledge base to give you accurate, sourced answers about prompt engineering, AI patterns, and best practices. What would you like to know?",
      },
    ]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const quickQuestions = [
    'How do I improve my prompting?',
    'How do I use AI in engineering workflows?',
    'What workflows or guardrails should I have?',
    'What IDE or AI editor is best?',
    'How do AI coding assistants compare?',
    'What is Chain of Thought prompting?',
  ];

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Chat Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Icons.bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold">Engify Assistant</h1>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="outline" className="mr-2 text-xs">
                    RAG-Powered
                  </Badge>
                  Ask questions about prompt engineering, AI patterns, and best
                  practices
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearChat}>
                <Icons.delete className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Badge variant="secondary">Beta</Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4">
              <div className="mx-auto max-w-3xl space-y-6 py-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex gap-4',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Icons.bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'flex max-w-[85%] flex-col gap-2',
                        message.role === 'user' ? 'items-end' : 'items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'group relative rounded-2xl px-4 py-3 shadow-sm',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        )}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                        {/* Copy button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Icons.copy className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Show sources if available */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="w-full space-y-2">
                          <Separator />
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Sources ({message.sources.length}):
                            </p>
                            {message.sources.map((source, idx) => (
                              <Card key={idx} className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <Icons.fileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                                      <span className="truncate text-xs font-medium">
                                        {source.title}
                                      </span>
                                    </div>
                                    {source.content && (
                                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                        {source.content}
                                      </p>
                                    )}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="shrink-0 text-xs"
                                  >
                                    {Math.round(source.score * 100)}%
                                  </Badge>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show RAG indicator */}
                      {message.usedRAG && (
                        <Badge variant="secondary" className="w-fit text-xs">
                          <Icons.search className="mr-1 h-3 w-3" />
                          Knowledge Base Search
                        </Badge>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Icons.user className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Icons.bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl bg-muted px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Searching knowledge base...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t bg-background">
              <div className="mx-auto max-w-3xl px-4 py-4">
                <div className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about prompts, patterns, or AI..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={isLoading}
                      className="max-h-[200px] min-h-[44px] resize-none pr-12"
                      rows={1}
                    />
                    <div className="absolute bottom-2 right-2">
                      <Button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="h-8 w-8"
                      >
                        {isLoading ? (
                          <Icons.spinner className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icons.send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden w-80 border-l bg-muted/30 lg:block">
            <div className="h-full space-y-4 overflow-y-auto p-4">
              {/* Quick Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-auto w-full justify-start p-3 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        setInput(question);
                        setTimeout(() => {
                          textareaRef.current?.focus();
                        }, 100);
                      }}
                    >
                      <Icons.messageSquare className="mr-2 h-4 w-4 shrink-0" />
                      <span className="break-words">{question}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* RAG Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">RAG Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icons.search className="h-4 w-4 shrink-0 text-green-600" />
                    <span className="text-sm">Vector Search: Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.database className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="text-sm">Knowledge Base: Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.brain className="h-4 w-4 shrink-0 text-purple-600" />
                    <span className="text-sm">AI Model: GPT-3.5-turbo</span>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Features</CardTitle>
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
      </div>
    </MainLayout>
  );
}
