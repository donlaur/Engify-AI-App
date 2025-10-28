'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { siteStats } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hi! I&apos;m your AI prompt engineering assistant. Ask me about patterns, prompts, or best practices!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    'What are the best prompt patterns?',
    'How do I write better prompts?',
    'Explain Chain of Thought',
    'Show me examples',
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const response = generateResponse(input);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('pattern')) {
      return 'We have 15 documented prompt patterns! The most popular are:\n\n1. **Chain of Thought** - Break down complex reasoning\n2. **Few-Shot Learning** - Provide examples\n3. **Role Prompting** - Define AI persona\n4. **Template Pattern** - Structured format\n\nCheck out /patterns to see all of them!';
    }

    if (lowerQuery.includes('better') || lowerQuery.includes('improve')) {
      return 'Here are 5 tips for better prompts:\n\n1. Be specific and clear\n2. Provide context\n3. Use examples (few-shot)\n4. Define the output format\n5. Iterate and refine\n\nVisit /learn for guided pathways!';
    }

    if (lowerQuery.includes('chain of thought') || lowerQuery.includes('cot')) {
      return '**Chain of Thought (CoT)** prompting helps AI reason step-by-step:\n\n"Let&apos;s think step by step:\n1. First, analyze...\n2. Then, consider...\n3. Finally, conclude..."\n\nThis improves accuracy on complex tasks by 30-50%!';
    }

    if (lowerQuery.includes('example')) {
      return `Here&apos;s a great example:\n\n**Bad**: "Write code"\n\n**Good**: "Write a Python function that validates email addresses using regex. Include error handling and unit tests. Format: function definition, docstring, implementation, tests."\n\nBrowse ${siteStats.totalPrompts}+ examples in /library!`;
    }

    return `Great question! I can help with:\n\n• Prompt patterns and techniques\n• Best practices\n• Examples from our library\n• Learning resources\n\nTry asking about specific patterns or check out /library for ${siteStats.totalPrompts}+ prompts!`;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      >
        <Icons.sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Icons.sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <Icons.close className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-80 space-y-4 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
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

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about prompts..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Icons.arrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
