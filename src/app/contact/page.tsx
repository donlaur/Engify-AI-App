import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="container py-16">
        <div className="mx-auto max-w-2xl">
          <Badge variant="secondary" className="mb-4">
            <Icons.users className="mr-2 h-3 w-3" />
            Get in Touch
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Have questions? We&apos;d love to hear from you.
          </p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.users className="h-5 w-5" />
                  General Inquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  For general questions about Engify.ai
                </p>
                <a href="mailto:hello@engify.ai" className="text-primary hover:underline">
                  hello@engify.ai
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  Report security vulnerabilities
                </p>
                <a href="mailto:security@engify.ai" className="text-primary hover:underline">
                  security@engify.ai
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.code className="h-5 w-5" />
                  GitHub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  Contribute or report issues
                </p>
                <a
                  href="https://github.com/donlaur/Engify-AI-App"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  github.com/donlaur/Engify-AI-App
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
