import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  className?: string
}

/** Falls back to a placeholder when there is no URL or the image fails to load. */
export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden bg-slate-100 text-slate-400',
        className,
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <Icon name="image" size={40} aria-label={`${alt} (no image)`} />
      )}
    </div>
  )
}
