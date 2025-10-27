import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: October 27, 2025
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Commitment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Engify.ai is committed to protecting your privacy. This policy explains how we collect,
                use, and safeguard your information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Local Storage</h3>
                <p className="text-muted-foreground">
                  • Favorites and ratings (stored on your device)
                  <br />
                  • User preferences
                  <br />
                  • No personal data leaves your device
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Optional Account Data</h3>
                <p className="text-muted-foreground">
                  If you create an account:
                  <br />
                  • Email address
                  <br />
                  • Encrypted password
                  <br />
                  • Usage statistics
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What We Don&apos;t Do</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>✗ We don&apos;t sell your data</li>
                <li>✗ We don&apos;t track you across websites</li>
                <li>✗ We don&apos;t show third-party ads</li>
                <li>✗ We don&apos;t share data with advertisers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                • All data encrypted in transit (HTTPS)
                <br />
                • Passwords hashed with bcrypt
                <br />
                • Regular security audits
                <br />
                • SOC2-compliant practices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You have the right to:
                <br />
                • Access your data
                <br />
                • Delete your account
                <br />
                • Export your data
                <br />
                • Opt out of analytics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Questions about privacy?
                <br />
                Email: <a href="mailto:privacy@engify.ai" className="text-primary hover:underline">
                  privacy@engify.ai
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
