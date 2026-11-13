import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCancelOrder, useOrder } from '@/api/orders'
import { useOrderPayments } from '@/api/payments'
import { OrderItemsList } from '@/components/domain/OrderItemsList'
import { OrderSummary } from '@/components/domain/OrderSummary'
import { OrderTimeline } from '@/components/domain/OrderTimeline'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/domain/StatusBadge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/States'
import { formatDateTime, formatMoney } from '@/lib/format'
import { canCancel, canPay } from '@/lib/orders'

export default function OrderDetailPage() {
  const { id } = useParams()
  const { data: order, isPending, isError, error, refetch } = useOrder(id)
  const { data: payments } = useOrderPayments(id)
  const cancel = useCancelOrder()
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (isPending) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-600">
        <Link to="/orders" className="hover:underline">
          My orders
        </Link>{' '}
        / {order.orderNumber}
      </nav>

      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <>
            {canPay(order.status) && (
              <ButtonLink to={`/checkout/${order.id}`}>Pay now</ButtonLink>
            )}
            {canCancel(order.status) && (
              <Button variant="secondary" onClick={() => setConfirmCancel(true)}>
                Cancel order
              </Button>
            )}
          </>
        }
      />

      <Card className="mb-6 p-5">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-display text-lg font-semibold">Status</h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <OrderTimeline status={order.status} />
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <OrderItemsList items={order.items} />

          <Card className="p-5">
            <h2 className="font-display text-lg font-semibold">Payments</h2>
            {!payments || payments.length === 0 ? (
              <p className="mt-2 text-slate-600">No payment attempts yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="font-medium">{formatMoney(p.amount)}</p>
                      <p className="text-sm text-slate-600">
                        {formatDateTime(p.createdAt)}
                        {p.paymentMethod ? ` · ${p.paymentMethod}` : ''}
                      </p>
                      {p.failureReason && (
                        <p className="text-sm text-red-700">{p.failureReason}</p>
                      )}
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <OrderSummary
          lines={[
            { label: 'Subtotal', value: order.subtotal },
            { label: 'Shipping', value: order.shippingFee, muted: true },
            { label: 'Tax', value: order.tax, muted: true },
          ]}
          total={order.total}
        />
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message="This cannot be undone. Any payment already made is handled separately."
        confirmLabel="Cancel order"
        danger
        loading={cancel.isPending}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => cancel.mutate(order.id, { onSettled: () => setConfirmCancel(false) })}
      />
    </>
  )
}
