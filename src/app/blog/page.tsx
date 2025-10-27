import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: '15 Prompt Engineering Patterns Every Developer Should Know',
      excerpt: 'Master the essential patterns that will 10x your AI productivity.',
      date: '2025-10-27',
      category: 'Patterns',
      readTime: '8 min',
    },
    {
      id: 2,
      title: 'How to Build an AI-First Development Workflow',
      excerpt: 'Transform your team with these proven strategies and tools.',
      date: '2025-10-26',
      category: 'Strategy',
      readTime: '12 min',
    },
    {
      id: 3,
      title: 'The Future of Prompt Engineering: Trends for 2026',
      excerpt: 'What&apos;s coming next in AI and how to prepare your team.',
      date: '2025-10-25',
      category: 'Trends',
      readTime: '10 min',
    },
  ];

  return (
    <MainLayout>
      <div className="container py-16">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <Icons.book className="mr-2 h-3 w-3" />
            Blog
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Latest Insights</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Practical guides, patterns, and strategies for mastering AI.
          </p>

          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-sm text-muted-foreground">{post.date}</span>
                    <span className="text-sm text-muted-foreground">• {post.readTime} read</span>
                  </div>
                  <CardTitle className="text-2xl">{post.title}</CardTitle>
                  <CardDescription className="text-base">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Coming soon...</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
