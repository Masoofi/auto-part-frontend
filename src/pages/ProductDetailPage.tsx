import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAddToCart } from '@/api/cart'
import { useProduct } from '@/api/products'
import { ProductImage } from '@/components/domain/ProductImage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { Skeleton } from '@/components/ui/Spinner'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { ApiError } from '@/lib/http'
import { formatMoney } from '@/lib/format'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { data: product, isPending, isError, error, refetch } = useProduct(id)
  const addToCart = useAddToCart()
  const requireAuth = useRequireAuth()
  const [quantity, setQuantity] = useState(1)

  if (isPending) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/4" />
        </div>
      </div>
    )
  }

  if (isError) {
    return error instanceof ApiError && error.status === 404 ? (
      <EmptyState
        icon="search"
        title="Product not found"
        description="It may have been removed."
        action={
          <Link to="/products" className="font-semibold text-brand-700 hover:underline">
            Browse all products
          </Link>
        }
      />
    ) : (
      <ErrorState message={error.message} onRetry={() => void refetch()} />
    )
  }

  const unavailable = !product.isActive || product.stock <= 0
  const lowStock = !unavailable && product.stock <= 5

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
        <Link to="/products" className="hover:underline">
          Products
        </Link>
        {product.category && (
          <>
            {' / '}
            <Link to={`/products?categoryId=${product.category.id}`} className="hover:underline">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square rounded-2xl border border-slate-200"
        />

        <div className="space-y-5">
          <div>
            <p className="text-sm text-slate-600">
              {product.brand ?? 'Auto part'} · SKU {product.sku}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold">{product.name}</h1>
          </div>

          <p className="font-display text-3xl font-bold">{formatMoney(product.price)}</p>

          <div>
            {unavailable ? (
              <Badge tone="danger">{product.isActive ? 'Out of stock' : 'Unavailable'}</Badge>
            ) : lowStock ? (
              <Badge tone="warning">Only {product.stock} left</Badge>
            ) : (
              <Badge tone="success">In stock</Badge>
            )}
          </div>

          {product.description && <p className="leading-relaxed text-slate-700">{product.description}</p>}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <QuantityStepper
              value={quantity}
              max={product.stock}
              disabled={unavailable}
              onChange={setQuantity}
            />
            <Button
              size="lg"
              disabled={unavailable}
              loading={addToCart.isPending}
              onClick={() =>
                requireAuth(() => addToCart.mutate({ productId: product.id, quantity }))
              }
            >
              <Icon name="cart" size={18} />
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
