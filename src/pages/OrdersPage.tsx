import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '@/api/orders'
import { OrderStatusBadge } from '@/components/domain/StatusBadge'
import { ButtonLink } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Spinner'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { formatDate, formatMoney, humanize } from '@/lib/format'
import { ORDER_STATUSES, type OrderStatus } from '@/types'

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(1)
  const { data, isPending, isError, error, refetch } = useOrders({
    status: status || undefined,
    page,
    limit: 10,
  })

  return (
    <>
      <PageHeader title="My orders" />

      <div className="mb-4 w-full min-[480px]:w-56">
        <Select
          label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | '')
            setPage(1)
          }}
        >
          <option value="">All orders</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </Select>
      </div>

      {isError ? (
        <ErrorState message={error.message} onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon="package"
          title={status ? 'No orders with this status' : 'No orders yet'}
          description="Orders you place will show up here."
          action={<ButtonLink to="/products">Start shopping</ButtonLink>}
        />
      ) : (
        <ul className="space-y-3">
          {data.items.map((order) => (
            <li key={order.id}>
              <Card className="transition-shadow hover:shadow-md">
                <Link
                  to={`/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-slate-600">
                      {formatDate(order.createdAt)} · {order.items.length} item
                      {order.items.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-display text-lg font-bold">{formatMoney(order.total)}</span>
                  </div>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </>
  )
}
