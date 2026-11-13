import { useState } from 'react'
import { useAdminOrders, useUpdateOrderStatus } from '@/api/orders'
import { OrderItemsList } from '@/components/domain/OrderItemsList'
import { OrderStatusBadge } from '@/components/domain/StatusBadge'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { formatDateTime, formatMoney, humanize } from '@/lib/format'
import { NEXT_STATUS } from '@/lib/orders'
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/types'

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<Order | null>(null)

  const orders = useAdminOrders({ search, status: status || undefined, page, limit: 10 })
  const updateStatus = useUpdateOrderStatus()

  const columns: Column<Order>[] = [
    {
      key: 'order',
      header: 'Order',
      cell: (o) => (
        <div>
          <p className="font-medium">{o.orderNumber}</p>
          <p className="text-xs text-slate-600">{formatDateTime(o.createdAt)}</p>
        </div>
      ),
    },
    { key: 'customer', header: 'Customer', cell: (o) => o.user?.email ?? '-' },
    { key: 'total', header: 'Total', cell: (o) => formatMoney(o.total) },
    { key: 'status', header: 'Status', cell: (o) => <OrderStatusBadge status={o.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (o) => {
        const next = NEXT_STATUS[o.status]
        return (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setViewing(o)}>
              Details
            </Button>
            {next && (
              <Button
                size="sm"
                loading={updateStatus.isPending && updateStatus.variables?.id === o.id}
                onClick={() => updateStatus.mutate({ id: o.id, status: next })}
              >
                Mark {humanize(next).toLowerCase()}
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader title="Orders" description="Move orders forward one step at a time." />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <SearchInput
          className="min-w-56 flex-1"
          label="Search orders"
          placeholder="Search by order number or customer"
          value={search}
          onSearch={(v) => {
            setSearch(v)
            setPage(1)
          }}
        />
        <div className="w-full min-[480px]:w-52">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatus | '')
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {orders.isError ? (
        <ErrorState message={orders.error.message} onRetry={() => void orders.refetch()} />
      ) : (
        <DataTable
          caption="Orders"
          columns={columns}
          rows={orders.data?.items}
          rowKey={(o) => o.id}
          loading={orders.isPending}
          empty={<EmptyState icon="cart" title="No orders found" description="Try other filters." />}
        />
      )}

      {orders.data && (
        <Pagination page={orders.data.page} totalPages={orders.data.totalPages} onChange={setPage} />
      )}

      <Modal
        open={viewing !== null}
        title={viewing ? `Order ${viewing.orderNumber}` : ''}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {viewing.user?.email} · {formatDateTime(viewing.createdAt)}
            </p>
            <OrderItemsList items={viewing.items} />
            <p className="text-right font-display text-lg font-bold">
              Total {formatMoney(viewing.total)}
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}
