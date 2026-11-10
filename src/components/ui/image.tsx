import { useState, forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  placeholderSrc?: string;
  objectTop?: boolean;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc, placeholderSrc, loading = 'lazy', fetchPriority, objectTop, ...props }, ref) => {
    const [error, setError] = useState(false);

    return (
      <div className={cn("relative overflow-hidden flex w-full h-full", className)}>
        <LazyLoadImage
          // @ts-ignore
          ref={ref}
          src={error && fallbackSrc ? fallbackSrc : src}
          alt={alt}
          effect="blur"
          placeholderSrc={placeholderSrc}
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
