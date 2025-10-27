import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: October 27, 2025
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By accessing Engify.ai, you agree to these terms. If you disagree with any part,
                please do not use our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Use License</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We grant you a personal, non-exclusive, non-transferable license to:
                <br />
                • Access and use Engify.ai
                <br />
                • View and copy prompts for personal/commercial use
                <br />
                • Modify prompts for your needs
                <br />
                • Share prompts with attribution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You agree to:
                <br />
                • Use the service legally and ethically
                <br />
                • Not abuse or misuse AI providers
                <br />
                • Not attempt to hack or disrupt the service
                <br />
                • Respect intellectual property rights
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Content Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                • Prompts and patterns are provided for educational use
                <br />
                • You own any prompts you create
                <br />
                • We own the platform and original content
                <br />
                • Attribution appreciated but not required
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Engify.ai is provided &quot;as is&quot; without warranties. We do not guarantee:
                <br />
                • Uninterrupted service
                <br />
                • Error-free operation
                <br />
                • Specific results from prompts
                <br />
                • Compatibility with all AI providers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We are not liable for:
                <br />
                • Costs from AI provider usage
                <br />
                • Results from using our prompts
                <br />
                • Data loss or service interruptions
                <br />
                • Third-party actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update these terms. Continued use after changes constitutes acceptance.
                Major changes will be announced.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Questions about terms?
                <br />
                Email: <a href="mailto:legal@engify.ai" className="text-primary hover:underline">
                  legal@engify.ai
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
