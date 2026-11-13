import { formatMoney } from '@/lib/format'
import type { OrderItem } from '@/types'
import { Card } from '@/components/ui/Card'

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <Card>
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-slate-600">
                SKU {item.sku} · {formatMoney(item.price)} × {item.quantity}
              </p>
            </div>
            <p className="shrink-0 font-semibold">{formatMoney(item.lineTotal)}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
