'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icons } from '@/lib/icons';
import { toast } from 'sonner';

interface RequestAccessFormData {
  name: string;
  email: string;
  company?: string;
  role?: string;
  useCase?: string;
  // Hidden tracking fields
  ref?: string; // Company name or identifier
  version?: string; // Resume version
  source?: string; // Where they came from
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export function RequestAccessForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<RequestAccessFormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    useCase: '',
    // Capture UTM params from URL
    ref: searchParams?.get('ref') || undefined,
    version:
      searchParams?.get('version') || searchParams?.get('v') || undefined,
    source: searchParams?.get('source') || undefined,
    utm_source: searchParams?.get('utm_source') || undefined,
    utm_medium: searchParams?.get('utm_medium') || undefined,
    utm_campaign: searchParams?.get('utm_campaign') || undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        toast.success(
          "Access request received! We'll review and get back to you within 24 hours."
        );
      } else {
        toast.error(result.error || 'Failed to submit request');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Request access error:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Icons.check className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold">Request Received!</h3>
          <p className="text-muted-foreground">
            We&apos;ll review your request and send you beta access within 24
            hours. Check your email for confirmation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="you@company.com"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company (Optional)</Label>
          <Input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            placeholder="Acme Corp"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Your Role (Optional)</Label>
          <Input
            id="role"
            name="role"
            type="text"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g., Director of Engineering"
            disabled={isSubmitting}
            list="roles"
          />
          <datalist id="roles">
            <option value="Engineer" />
            <option value="Engineering Manager" />
            <option value="Director of Engineering" />
            <option value="VP of Engineering" />
            <option value="CTO" />
            <option value="Product Manager" />
            <option value="Designer" />
          </datalist>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="useCase">
          How do you plan to use Engify? (Optional)
        </Label>
        <Textarea
          id="useCase"
          name="useCase"
          value={formData.useCase}
          onChange={handleChange}
          placeholder="Tell us about your use case..."
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {/* Hidden tracking fields - populated from URL params */}
      {formData.ref && <input type="hidden" name="ref" value={formData.ref} />}
      {formData.version && (
        <input type="hidden" name="version" value={formData.version} />
      )}
      {formData.source && (
        <input type="hidden" name="source" value={formData.source} />
      )}
      {formData.utm_source && (
        <input type="hidden" name="utm_source" value={formData.utm_source} />
      )}
      {formData.utm_medium && (
        <input type="hidden" name="utm_medium" value={formData.utm_medium} />
      )}
      {formData.utm_campaign && (
        <input
          type="hidden"
          name="utm_campaign"
          value={formData.utm_campaign}
        />
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Icons.mail className="mr-2 h-4 w-4" />
            Request Beta Access
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        We&apos;ll review your request within 24 hours and send you access
        details via email.
      </p>
    </form>
  );
}
