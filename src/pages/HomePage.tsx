import { Link } from 'react-router-dom'
import { useCategories } from '@/api/categories'
import { useProducts } from '@/api/products'
import { ProductGrid } from '@/components/domain/ProductGrid'
import { ButtonLink } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/States'
import { Icon } from '@/components/ui/Icon'

function SectionHeading({ title, to, linkLabel }: { title: string; to: string; linkLabel: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <Link to={to} className="font-semibold text-brand-700 hover:underline">
        {linkLabel}
      </Link>
    </div>
  )
}

export default function HomePage() {
  const categories = useCategories(1, 12)
  const latest = useProducts({ sortBy: 'createdAt', sortOrder: 'desc', limit: 8 })

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-8 rounded-3xl bg-ink p-8 text-white sm:p-12 md:flex-row md:items-center">
        <div className="flex-1 space-y-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
            Auto parts store
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Genuine parts, matched to your ride.
          </h1>
          <p className="max-w-lg text-lg text-slate-300">
            Brakes, filters, batteries and more from trusted brands, with secure checkout.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/products" size="lg">
              Shop all parts
            </ButtonLink>
          </div>
        </div>
        <div
          aria-hidden
          className="hidden h-60 flex-1 items-center justify-center rounded-2xl bg-slate-800 text-brand-300 md:flex"
        >
          <Icon name="gear" size={110} strokeWidth={1.2} />
        </div>
      </section>

      <section aria-labelledby="cats">
        <h2 id="cats" className="sr-only">
          Categories
        </h2>
        <SectionHeading title="Shop by category" to="/products" linkLabel="View all" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.data?.items.map((c) => (
            <li key={c.id}>
              <Link
                to={`/products?categoryId=${c.id}`}
                className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center font-semibold hover:border-brand-600"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon name="tag" size={20} />
                </span>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading title="New arrivals" to="/products" linkLabel="See more" />
        {latest.isError ? (
          <ErrorState message={latest.error.message} onRetry={() => void latest.refetch()} />
        ) : (
          <ProductGrid
            products={latest.data?.items}
            loading={latest.isPending}
            skeletonCount={4}
            empty={<p className="text-slate-600">No products yet. Check back soon.</p>}
          />
        )}
      </section>
    </div>
  )
}
