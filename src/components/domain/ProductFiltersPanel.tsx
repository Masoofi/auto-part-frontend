import { useState, type FormEvent } from 'react'
import type { Category } from '@/types'
import { Button } from '@/components/ui/Button'
import { TextInput, Select } from '@/components/ui/Field'

export interface FilterValues {
  categoryId: string
  brand: string
  minPrice: string
  maxPrice: string
}

interface ProductFiltersPanelProps {
  values: FilterValues
  categories: Category[]
  onChange: (patch: Partial<FilterValues>) => void
  onClear: () => void
}

export function ProductFiltersPanel({ values, categories, onChange, onClear }: ProductFiltersPanelProps) {
  const [draft, setDraft] = useState(values)
  const [error, setError] = useState<string>()

  const apply = (e: FormEvent) => {
    e.preventDefault()
    if (draft.minPrice && draft.maxPrice && Number(draft.minPrice) > Number(draft.maxPrice)) {
      setError('Minimum price cannot be greater than maximum price')
      return
    }
    setError(undefined)
    onChange(draft)
  }

  return (
    <form onSubmit={apply} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <Select
        label="Category"
        value={draft.categoryId}
        onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <TextInput
        label="Brand"
        value={draft.brand}
        onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
        placeholder="e.g. Bosch"
      />
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Min price"
          type="number"
          min={0}
          inputMode="numeric"
          value={draft.minPrice}
          onChange={(e) => setDraft({ ...draft, minPrice: e.target.value })}
        />
        <TextInput
          label="Max price"
          type="number"
          min={0}
          inputMode="numeric"
          value={draft.maxPrice}
          onChange={(e) => setDraft({ ...draft, maxPrice: e.target.value })}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" fullWidth>
          Apply
        </Button>
        <Button variant="secondary" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  )
}
