'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { getAllBlogPosts } from '@/data/blog-posts';
import Link from 'next/link';

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-5xl font-bold">Blog</h1>
            <p className="text-xl text-gray-600">
              Insights on AI adoption, rapid development, and engineering leadership
            </p>
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
