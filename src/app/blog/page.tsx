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
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="container py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          {posts.map((post) => (
            <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-sm text-gray-500">{post.readTime} read</span>
                    </div>
                    <CardTitle className="text-2xl group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {post.excerpt}
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/blog/${post.slug}`}>
                    Read More
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
