/**
 * Interactive Demo Component
 * Shows bad prompt → good prompt → AI response comparison
 * No signup required - instant value demonstration
 */

'use client';

import { useState } from 'react';
import { Icons } from '@/lib/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DemoExample {
  id: string;
  scenario: string;
  badPrompt: string;
  goodPrompt: string;
  pattern: string;
  badResponse: string;
  goodResponse: string;
  improvement: string;
  timeSaved: string;
}

const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: 'code-review',
    scenario: 'Code Review',
    badPrompt: 'Review this code',
    goodPrompt: `Act as a senior software engineer with 10+ years of experience.

Review this code for:
1. Security vulnerabilities
2. Performance issues
3. Best practice violations
4. Potential bugs

For each issue found:
- Severity (Critical/High/Medium/Low)
- Specific line numbers
- Why it's a problem
- How to fix it

Code:
[Your code here]`,
    pattern: 'Persona + Template',
    badResponse: `The code looks okay. There might be some issues with error handling. Consider adding more comments.`,
    goodResponse: `**Security Issues:**

🔴 CRITICAL - Line 23: SQL Injection vulnerability
- Problem: Direct string concatenation in SQL query
- Fix: Use parameterized queries
\`\`\`javascript
// Bad: "SELECT * FROM users WHERE id = " + userId
// Good: "SELECT * FROM users WHERE id = ?"
\`\`\`

⚠️ HIGH - Line 45: Sensitive data in logs
- Problem: Logging user passwords
- Fix: Remove or redact sensitive data

**Performance Issues:**

🟡 MEDIUM - Line 67: N+1 query problem
- Problem: Database query inside loop
- Fix: Use batch query or JOIN

**Best Practices:**

🟢 LOW - Line 12: Magic numbers
- Problem: Hardcoded values
- Fix: Use named constants`,
    improvement: '10x more actionable',
    timeSaved: '2 hours',
  },
  {
    id: 'email-writing',
    scenario: 'Professional Email',
    badPrompt: 'Write an email to my manager about the project delay',
    goodPrompt: `Write a professional email to my manager about a project delay.

Context:
- Project: User authentication feature
- Original deadline: Friday
- New estimate: Next Wednesday
- Reason: Unexpected security requirements
- Current status: 70% complete

Tone: Professional, solution-focused, accountable
Include:
- Clear subject line
- Brief explanation
- New timeline
- Mitigation plan
- Next steps`,
    pattern: 'Context Control + Template',
    badResponse: `Subject: Project Update

Hi,

The project is going to be late. We ran into some issues. It will be done next week instead.

Thanks`,
    goodResponse: `Subject: User Auth Feature - Timeline Update (New ETA: Wed, Nov 1)

Hi [Manager],

I wanted to update you on the user authentication feature timeline.

**Current Status:**
- 70% complete
- Core functionality working
- Security review in progress

**Timeline Change:**
- Original: Friday, Oct 27
- Revised: Wednesday, Nov 1 (+3 business days)

**Reason:**
During security review, we identified additional OAuth requirements that weren't in the original spec. Implementing these properly is critical for user data protection.

**Mitigation:**
- Working with security team to expedite review
- Prioritized remaining tasks
- Will have staging environment ready by Monday for early testing

**Next Steps:**
- Complete security requirements (Mon-Tue)
- Final testing (Wed morning)
- Deploy (Wed afternoon)

I'll send daily updates and flag any blockers immediately. Happy to discuss in our 1:1 tomorrow.

Best,
[Your name]`,
    improvement: '5x more professional',
    timeSaved: '30 minutes',
  },
  {
    id: 'documentation',
    scenario: 'API Documentation',
    badPrompt: 'Document this API',
    goodPrompt: `Create comprehensive API documentation for this endpoint.

Endpoint: POST /api/users
Purpose: Create new user account

Include:
1. Description
2. Authentication requirements
3. Request parameters (with types and validation)
4. Request example (JSON)
5. Success response (with example)
6. Error responses (with codes and examples)
7. Rate limiting
8. Common use cases

Format: Clear, scannable, developer-friendly`,
    pattern: 'Template + Output Formatting',
    badResponse: `This API creates users. Send a POST request with user data.`,
    goodResponse: `## POST /api/users

Create a new user account.

### Authentication
Requires API key in header: \`X-API-Key: your_key\`

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Valid email address |
| name | string | Yes | Full name (2-50 chars) |
| role | string | No | User role (default: 'user') |

### Request Example
\`\`\`json
{
  "email": "john@example.com",
  "name": "John Doe",
  "role": "admin"
}
\`\`\`

### Success Response (201 Created)
\`\`\`json
{
  "id": "usr_123abc",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "admin",
  "createdAt": "2024-10-27T10:30:00Z"
}
\`\`\`

### Error Responses

**400 Bad Request** - Invalid input
\`\`\`json
{
  "error": "Invalid email format",
  "field": "email"
}
\`\`\`

**409 Conflict** - Email already exists
\`\`\`json
{
  "error": "User already exists",
  "email": "john@example.com"
}
\`\`\`

### Rate Limiting
100 requests per hour per API key

### Common Use Cases
- User registration flow
- Admin user creation
- Bulk user import`,
    improvement: '8x more complete',
    timeSaved: '1 hour',
  },
];

export function InteractiveDemo() {
  const [selectedExample, setSelectedExample] = useState<DemoExample>(DEMO_EXAMPLES[0]);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">See the Difference</h2>
        <p className="text-lg text-muted-foreground">
          Compare generic prompts vs. expert-crafted prompts
        </p>
      </div>

      {/* Example Selector */}
      <div className="flex gap-2 justify-center flex-wrap">
        {DEMO_EXAMPLES.map((example) => (
          <Button
            key={example.id}
            variant={selectedExample.id === example.id ? 'default' : 'outline'}
            onClick={() => {
              setSelectedExample(example);
              setShowComparison(false);
            }}
          >
            {example.scenario}
          </Button>
        ))}
      </div>

      {/* Demo Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bad Prompt */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-600">❌ Generic Prompt</CardTitle>
              <Badge variant="destructive">Vague</Badge>
            </div>
            <CardDescription>What most people write</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg font-mono text-sm">
              {selectedExample.badPrompt}
            </div>
            
            {showComparison && (
              <div className="space-y-2">
                <p className="text-sm font-medium">AI Response:</p>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedExample.badResponse}
                </div>
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <Icons.alertCircle className="h-4 w-4" />
                  <span>Generic, unhelpful, wastes time</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Good Prompt */}
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-600">✅ Expert Prompt</CardTitle>
              <Badge className="bg-green-600">Using {selectedExample.pattern}</Badge>
            </div>
            <CardDescription>What experts write</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg font-mono text-sm whitespace-pre-wrap">
              {selectedExample.goodPrompt}
            </div>
            
            {showComparison && (
              <div className="space-y-2">
                <p className="text-sm font-medium">AI Response:</p>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedExample.goodResponse}
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Icons.checkCircle className="h-4 w-4" />
                  <span>{selectedExample.improvement} • Saves {selectedExample.timeSaved}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      {!showComparison ? (
        <div className="text-center">
          <Button size="lg" onClick={() => setShowComparison(true)}>
            <Icons.zap className="mr-2 h-5 w-5" />
            See the AI Responses
          </Button>
        </div>
      ) : (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Icons.sparkles className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold">Ready to write expert prompts?</h3>
              </div>
              <p className="text-muted-foreground">
                Learn {DEMO_EXAMPLES.length} proven patterns and save hours every week
              </p>
              <div className="flex gap-3 justify-center">
                <Button size="lg">
                  Start Free - No Credit Card
                </Button>
                <Button size="lg" variant="outline">
                  Browse All Patterns
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ✓ 3 prompts/day free forever ✓ No signup required to browse
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
