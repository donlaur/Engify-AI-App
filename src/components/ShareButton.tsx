'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  hashtags?: string[];
}

export function ShareButton({
  title,
  description,
  url,
  hashtags = [],
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = description || title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareText);
    const urlParam = encodeURIComponent(shareUrl);
    const hashtagsParam =
      hashtags.length > 0 ? `&hashtags=${hashtags.join(',')}` : '';
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${urlParam}${hashtagsParam}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const handleLinkedInShare = () => {
    const urlParam = encodeURIComponent(shareUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${urlParam}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const handleFacebookShare = () => {
    const urlParam = encodeURIComponent(shareUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${urlParam}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const handleRedditShare = () => {
    const titleParam = encodeURIComponent(title);
    const urlParam = encodeURIComponent(shareUrl);
    window.open(
      `https://reddit.com/submit?title=${titleParam}&url=${urlParam}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Native share API for mobile
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Icons.share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Icons.link className="mr-2 h-4 w-4" />
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleTwitterShare}>
          <Icons.twitter className="mr-2 h-4 w-4" />
          Share on Twitter
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLinkedInShare}>
          <Icons.linkedin className="mr-2 h-4 w-4" />
          Share on LinkedIn
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleFacebookShare}>
          <Icons.facebook className="mr-2 h-4 w-4" />
          Share on Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleRedditShare}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
          </svg>
          Share on Reddit
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleEmailShare}>
          <Icons.mail className="mr-2 h-4 w-4" />
          Share via Email
        </DropdownMenuItem>

        {typeof navigator !== 'undefined' &&
          typeof navigator.share === 'function' && (
            <DropdownMenuItem onClick={handleNativeShare}>
              <Icons.share className="mr-2 h-4 w-4" />
              More Options
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
