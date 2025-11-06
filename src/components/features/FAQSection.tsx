/**
 * FAQ Section Component
 * Displays FAQ questions and answers with FAQPage schema markup for SEO
 * Uses collapsible cards for better UX
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { generateFAQSchema } from '@/lib/seo/metadata';
import { APP_URL } from '@/lib/constants';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  description?: string;
  className?: string;
  currentUrl?: string; // For schema markup URL
}

export function FAQSection({
  faqs,
  title = 'Frequently Asked Questions',
  description,
  className = '',
  currentUrl,
}: FAQSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Generate FAQPage schema
  const faqSchema = generateFAQSchema(faqs);
  const schemaUrl = currentUrl || APP_URL;

  return (
    <>
      {/* FAQPage Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...faqSchema,
            url: schemaUrl,
          }),
        }}
      />
      <section className={`space-y-4 ${className}`}>
        {(title || description) && (
          <div className="mb-6">
            {title && (
              <h2 className="mb-2 text-3xl font-bold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base text-foreground/80">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isExpanded = expandedItems.has(index);
            return (
              <Card
                key={index}
                className="border border-border bg-card transition-all hover:border-primary/50 dark:border-border dark:bg-card dark:hover:border-primary/50"
              >
                <CardHeader
                  className="cursor-pointer pb-3"
                  onClick={() => toggleItem(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleItem(index);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="flex-1 pr-4 text-lg font-semibold text-foreground">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <Icons.chevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Icons.chevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pb-4 pt-0">
                    <div className="prose prose-sm max-w-none text-foreground/90 dark:text-foreground/90">
                      <p className="whitespace-pre-line leading-relaxed">{faq.answer}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
