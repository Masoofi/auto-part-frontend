import type { ReactNode } from 'react'
import type { Product } from '@/types'
import { ProductCard, ProductCardSkeleton } from './ProductCard'

interface ProductGridProps {
  products: Product[] | undefined
  loading?: boolean
  empty?: ReactNode
  skeletonCount?: number
}

export function ProductGrid({ products, loading, empty, skeletonCount = 8 }: ProductGridProps) {
  if (!loading && products?.length === 0) return <>{empty}</>

  return (
    <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {loading
        ? Array.from({ length: skeletonCount }, (_, i) => <ProductCardSkeleton key={i} />)
        : products?.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
