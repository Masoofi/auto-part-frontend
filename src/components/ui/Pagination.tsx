import { Button } from './Button'
import { Icon } from './Icon'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
      <Button
        variant="secondary"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <Icon name="chevron-left" size={18} />
        Prev
      </Button>
      <span className="text-sm text-slate-700" aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next
        <Icon name="chevron-right" size={18} />
      </Button>
    </nav>
  )
}
