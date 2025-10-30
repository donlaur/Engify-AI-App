import { MainLayout } from '@/components/layout/MainLayout';
import { ContactForm } from '@/components/forms/ContactForm';

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground">
            Have questions about Engify.ai? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div>
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="rounded-lg border p-6">
              <h3 className="mb-4 text-lg font-semibold">Get in Touch</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    📧
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href="mailto:donlaur@engify.ai"
                      className="text-primary hover:underline"
                    >
                      donlaur@engify.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    🌐
                  </div>
                  <div>
                    <p className="font-medium">Website</p>
                    <a
                      href="https://engify.ai"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      engify.ai
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6">
              <h3 className="mb-4 text-lg font-semibold">
                What We Can Help With
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Prompt engineering questions</li>
                <li>• AI pattern recommendations</li>
                <li>• Workbench tool usage</li>
                <li>• Technical support</li>
                <li>• Feature requests</li>
                <li>• Partnership opportunities</li>
              </ul>
            </div>

            <div className="rounded-lg border p-6">
              <h3 className="mb-4 text-lg font-semibold">Response Time</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <strong>General inquiries:</strong> Within 24 hours
                </p>
                <p className="text-muted-foreground">
                  <strong>Technical support:</strong> Within 12 hours
                </p>
                <p className="text-muted-foreground">
                  <strong>Urgent matters:</strong> Email us directly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
