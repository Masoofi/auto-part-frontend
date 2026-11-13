import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

interface SearchInputProps {
  value: string
  onSearch: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

/** Controlled from outside (e.g. URL params) but only fires after typing pauses. */
export function SearchInput({
  value,
  onSearch,
  placeholder = 'Search',
  label = 'Search',
  className,
}: SearchInputProps) {
  const [text, setText] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  const debounced = useDebounce(text)

  // The parent changed the value (e.g. "clear filters"): follow it.
  if (value !== lastValue) {
    setLastValue(value)
    setText(value)
  }

  useEffect(() => {
    if (debounced !== value) onSearch(debounced)
    // `value` changes come from the parent; only react to the user's typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div
      className={cn(
        'flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-brand-600',
        className,
      )}
    >
      <Icon name="search" size={18} className="shrink-0 text-slate-500" />
      <input
        type="search"
        aria-label={label}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
      />
    </div>
  )
}
