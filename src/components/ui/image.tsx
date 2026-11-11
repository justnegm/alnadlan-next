'use client';

import { useState, forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';
import NextImage from 'next/image';
import type { StaticImageData } from 'next/image';
import { cn } from '@/lib/utils';

/** Next static asset imports (import img from '@/assets/x.png') yield StaticImageData, not a URL string. */
type ImageSrc = string | StaticImageData;

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height' | 'placeholder'> {
  src?: ImageSrc;
  fallbackSrc?: ImageSrc;
  placeholderSrc?: ImageSrc;
  objectTop?: boolean;
  /** Rendered width hint for srcset selection; defaults to full viewport width. */
  sizes?: string;
}

// Must mirror images.remotePatterns in next.config.ts. Anything else (unexpected CDN,
// blob: previews of uploads, data: URLs) is served as-is so next/image never throws.
const OPTIMIZABLE_HOST = /(^|\.)alnadlan\.co\.il$|^nyc3\.digitaloceanspaces\.com$/;

const isOptimizable = (src: ImageSrc): boolean => {
  if (typeof src !== 'string') return true;
  if (src.startsWith('/')) return true;
  try {
    const url = new URL(src);
    return (
      url.protocol === 'https:' &&
      OPTIMIZABLE_HOST.test(url.hostname) &&
      (url.hostname !== 'nyc3.digitaloceanspaces.com' || url.pathname.startsWith('/alnadlan-space/'))
    );
  } catch {
    return false;
  }
};

const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    { className, src, alt, fallbackSrc, placeholderSrc, loading = 'lazy', fetchPriority, objectTop, sizes = '100vw', ...props },
    ref,
  ) => {
    const [error, setError] = useState(false);
    const current = error && fallbackSrc ? fallbackSrc : src;

    // Blur placeholder: static imports carry their own blurDataURL; otherwise accept a data: URL.
    const blurDataURL =
      typeof placeholderSrc === 'string' && placeholderSrc.startsWith('data:') ? placeholderSrc : undefined;
    const placeholder = typeof current === 'object' || blurDataURL ? 'blur' : 'empty';

    return (
      <div className={cn('relative overflow-hidden flex w-full h-full', className)}>
        {current && (
          <NextImage
            {...props}
            ref={ref}
            src={current}
            alt={alt ?? ''}
            fill
            sizes={sizes}
            loading={fetchPriority === 'high' ? 'eager' : loading}
            fetchPriority={fetchPriority}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            unoptimized={!isOptimizable(current)}
            className={cn('object-cover', objectTop && 'object-top')}
            onError={() => setError(true)}
          />
        )}
      </div>
    );
  },
);
Image.displayName = 'Image';

export { Image };
