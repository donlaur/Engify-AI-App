'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { getBlogPost, getAllBlogPosts } from '@/data/blog-posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Link href="/blog" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
              <Icons.arrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
            
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="secondary">{post.category}</Badge>
              <span className="text-sm text-gray-500">{post.readTime} read</span>
            </div>
            
            <h1 className="mb-4 text-5xl font-bold">{post.title}</h1>
            
            <div className="flex items-center gap-4 text-gray-600">
              <span className="font-medium">{post.author}</span>
              <span>•</span>
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container py-12">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="prose prose-lg max-w-none p-8">
              <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="py-12">
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Team?</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Start using AI to accelerate your engineering team today.
                </p>
                <div className="flex justify-center gap-4">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600" asChild>
                    <Link href="/signup">
                      Get Started Free
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/library">Browse Prompts</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
