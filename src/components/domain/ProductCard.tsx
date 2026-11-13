import { Link } from 'react-router-dom'
import { useAddToCart } from '@/api/cart'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { formatMoney } from '@/lib/format'
import type { Product } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ProductImage } from './ProductImage'

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart()
  const requireAuth = useRequireAuth()
  const outOfStock = product.stock <= 0

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block">
        <ProductImage src={product.imageUrl} alt={product.name} className="aspect-[4/3]" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm text-slate-600">{product.brand ?? product.category?.name ?? 'Auto part'}</p>
        <h3 className="font-semibold leading-snug">
          <Link to={`/products/${product.id}`} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div>
            <p className="font-display text-xl font-bold">{formatMoney(product.price)}</p>
            {outOfStock && <Badge tone="danger">Out of stock</Badge>}
          </div>
          <Button
            size="md"
            disabled={outOfStock}
            loading={addToCart.isPending}
            aria-label={`Add ${product.name} to cart`}
            onClick={() =>
              requireAuth(() => addToCart.mutate({ productId: product.id, quantity: 1 }))
            }
          >
            <Icon name="cart" size={18} />
            Add
          </Button>
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-8 w-1/2 rounded bg-slate-200" />
      </div>
    </div>
  )
}
