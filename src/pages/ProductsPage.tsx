import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCategories } from '@/api/categories'
import { useProducts, type ProductFilters } from '@/api/products'
import { ProductFiltersPanel } from '@/components/domain/ProductFiltersPanel'
import { ProductGrid } from '@/components/domain/ProductGrid'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState } from '@/components/ui/States'

const SORTS = {
  newest: { label: 'Newest', sortBy: 'createdAt', sortOrder: 'desc' },
  'price-asc': { label: 'Price: low to high', sortBy: 'price', sortOrder: 'asc' },
  'price-desc': { label: 'Price: high to low', sortBy: 'price', sortOrder: 'desc' },
  name: { label: 'Name: A to Z', sortBy: 'name', sortOrder: 'asc' },
} as const
type SortKey = keyof typeof SORTS

const PAGE_SIZE = 12

export default function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const categories = useCategories()

  const get = (key: string) => params.get(key) ?? ''
  const sort = (get('sort') in SORTS ? get('sort') : 'newest') as SortKey
  const page = Math.max(Number(get('page')) || 1, 1)

  /** Filters live in the URL so results are shareable and survive a refresh. */
  const update = (patch: Record<string, string | undefined>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        if (!('page' in patch)) next.delete('page')
        return next
      },
      { replace: true },
    )

  const filters: ProductFilters = {
    search: get('search') || undefined,
    categoryId: get('categoryId') || undefined,
    brand: get('brand') || undefined,
    minPrice: get('minPrice') ? Number(get('minPrice')) : undefined,
    maxPrice: get('maxPrice') ? Number(get('maxPrice')) : undefined,
    sortBy: SORTS[sort].sortBy,
    sortOrder: SORTS[sort].sortOrder,
    page,
    limit: PAGE_SIZE,
  }

  const { data, isPending, isError, error, refetch } = useProducts(filters)
  const hasFilters = ['search', 'categoryId', 'brand', 'minPrice', 'maxPrice'].some((k) => get(k))

  return (
    <>
      <PageHeader
        title="Products"
        description={data ? `${data.total} part${data.total === 1 ? '' : 's'} found` : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside>
          <Button
            variant="secondary"
            fullWidth
            className="mb-3 lg:hidden"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <Icon name="filter" size={18} />
            Filters
          </Button>
          <div className={filtersOpen ? 'block' : 'hidden lg:block'}>
            <ProductFiltersPanel
              key={`${get('categoryId')}|${get('brand')}|${get('minPrice')}|${get('maxPrice')}`}
              values={{
                categoryId: get('categoryId'),
                brand: get('brand'),
                minPrice: get('minPrice'),
                maxPrice: get('maxPrice'),
              }}
              categories={categories.data?.items ?? []}
              onChange={(patch) => update(patch)}
              onClear={() => setParams({}, { replace: true })}
            />
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <SearchInput
              className="min-w-56 flex-1"
              label="Search products"
              placeholder="Search by name or description"
              value={get('search')}
              onSearch={(search) => update({ search })}
            />
            <div className="w-full min-[480px]:w-52">
              <Select
                label="Sort by"
                value={sort}
                onChange={(e) => update({ sort: e.target.value === 'newest' ? undefined : e.target.value })}
              >
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {isError ? (
            <ErrorState message={error.message} onRetry={() => void refetch()} />
          ) : (
            <ProductGrid
              products={data?.items}
              loading={isPending}
              skeletonCount={PAGE_SIZE}
              empty={
                <EmptyState
                  icon="search"
                  title="No parts match your search"
                  description="Try different keywords or remove some filters."
                  action={
                    hasFilters ? (
                      <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
                        Clear all filters
                      </Button>
                    ) : undefined
                  }
                />
              }
            />
          )}

          {data && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onChange={(p) => {
                update({ page: String(p) })
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          )}
        </section>
      </div>
    </>
  )
}
