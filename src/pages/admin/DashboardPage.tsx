import { Link } from 'react-router-dom'
import { useAdminStats } from '@/api/stats'
import { useAdminOrders } from '@/api/orders'
import { OrderStatusBadge } from '@/components/domain/StatusBadge'
import { StatCard } from '@/components/domain/StatCard'
import { Card, PageHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/States'
import { formatDate, formatMoney, humanize } from '@/lib/format'
import { ORDER_STATUSES } from '@/types'

export default function DashboardPage() {
  const stats = useAdminStats()
  const recent = useAdminOrders({ limit: 5 })

  if (stats.isError) {
    return <ErrorState message={stats.error.message} onRetry={() => void stats.refetch()} />
  }

  const data = stats.data

  return (
    <>
      <PageHeader title="Dashboard" description="How the store is doing right now." />

      {data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Revenue" icon="card" value={formatMoney(data.revenue)} hint="Captured payments" />
          <StatCard
            label="Orders"
            icon="cart"
            value={data.orders.total}
            hint={`${data.orders.today} today`}
          />
          <StatCard label="Active products" icon="package" value={data.products.active} />
          <StatCard label="Customers" icon="users" value={data.customers} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Orders by status</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {ORDER_STATUSES.map((s) => (
              <li key={s} className="flex items-center justify-between py-2.5 text-sm">
                <span>{humanize(s)}</span>
                <span className="font-semibold">{data?.orders.byStatus[s] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Low stock</h2>
            {data && (
              <span className="text-sm text-slate-600">
                {data.products.lowStockCount} at or below {data.products.lowStockThreshold}
              </span>
            )}
          </div>
          {data && data.products.lowStock.length === 0 ? (
            <p className="mt-3 text-slate-600">All products are well stocked.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {data?.products.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0 truncate">
                    {p.name} <span className="text-slate-600">({p.sku})</span>
                  </span>
                  <span className="shrink-0 font-semibold text-red-700">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        {recent.isPending ? (
          <Skeleton className="mt-3 h-32" />
        ) : recent.data?.items.length === 0 ? (
          <p className="mt-3 text-slate-600">No orders yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {recent.data?.items.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-slate-600">
                    {o.user?.email} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={o.status} />
                  <span className="font-semibold">{formatMoney(o.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
