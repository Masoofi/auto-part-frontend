import { Link } from 'react-router-dom'
import { useRemoveCartItem, useUpdateCartItem } from '@/api/cart'
import { cartLineIssue } from '@/lib/cart'
import { formatMoney } from '@/lib/format'
import type { CartItem } from '@/types'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { ProductImage } from './ProductImage'

export function CartLine({ item }: { item: CartItem }) {
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const issue = cartLineIssue(item)

  return (
    <li className="flex gap-4 p-4">
      <Link to={`/products/${item.productId}`} className="shrink-0">
        <ProductImage
          src={item.product.imageUrl}
          alt={item.product.name}
          className="size-20 rounded-lg sm:size-24"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/products/${item.productId}`} className="font-semibold hover:text-brand-700">
              {item.product.name}
            </Link>
            <p className="text-sm text-slate-600">{formatMoney(item.product.price)} each</p>
          </div>
          <p className="shrink-0 font-display font-bold">{formatMoney(item.lineTotal)}</p>
        </div>

        {issue && (
          <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-red-700">
            <Icon name="alert" size={16} />
            {issue}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <QuantityStepper
            value={item.quantity}
            max={item.product.stock}
            disabled={update.isPending}
            onChange={(quantity) => update.mutate({ itemId: item.id, quantity })}
          />
          <Button
            variant="ghost"
            loading={remove.isPending}
            onClick={() => remove.mutate(item.id)}
            aria-label={`Remove ${item.product.name}`}
          >
            <Icon name="trash" size={18} />
            <span className="hidden sm:inline">Remove</span>
          </Button>
        </div>
      </div>
    </li>
  )
}
