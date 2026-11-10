'use client';

import { useState, forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';
import type { StaticImageData } from 'next/image';
import { cn } from '@/lib/utils';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

/** Next static asset imports (import img from '@/assets/x.png') yield StaticImageData, not a URL string. */
type ImageSrc = string | StaticImageData;

const resolveSrc = (src?: ImageSrc): string | undefined =>
  typeof src === 'object' && src !== null ? src.src : src;

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: ImageSrc;
  fallbackSrc?: ImageSrc;
  placeholderSrc?: ImageSrc;
  objectTop?: boolean;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc, placeholderSrc, loading = 'lazy', fetchPriority, objectTop, ...props }, ref) => {
    const [error, setError] = useState(false);
    const resolvedSrc = resolveSrc(src);
    const resolvedFallback = resolveSrc(fallbackSrc);

    return (
      <div className={cn("relative overflow-hidden flex w-full h-full", className)}>
        <LazyLoadImage
          // @ts-ignore
          ref={ref}
          src={error && resolvedFallback ? resolvedFallback : resolvedSrc}
          alt={alt}
          effect="blur"
          placeholderSrc={resolveSrc(placeholderSrc)}
          // @ts-ignore - fetchPriority is standard but types might be outdated
          fetchpriority={fetchPriority}
          visibleByDefault={fetchPriority === 'high' || loading === 'eager'}
          className={cn(
            "w-full h-full object-cover",
            objectTop && "object-top"
          )}
          wrapperProps={{
            style: { display: 'flex', width: '100%', height: '100%' }
          }}
          onError={() => {
            setError(true);
          }}
          {...props}
        />
      </div>
    );
  }
);
Image.displayName = 'Image';

export { Image };
