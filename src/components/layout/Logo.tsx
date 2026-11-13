import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export function Logo({ to = '/', light }: { to?: string; light?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 font-display text-xl font-bold',
        light ? 'text-white' : 'text-ink',
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Icon name="gear" size={18} />
      </span>
      AutoParts
    </Link>
  )
}
