import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCreatePayment, useOrderPayments, useVerifyPayment } from '@/api/payments'
import { useOrder } from '@/api/orders'
import { OrderItemsList } from '@/components/domain/OrderItemsList'
import { OrderSummary } from '@/components/domain/OrderSummary'
import { OrderStatusBadge } from '@/components/domain/StatusBadge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/States'
import { errorMessage } from '@/lib/http'
import { canPay } from '@/lib/orders'
import { openRazorpayCheckout, PaymentCancelledError } from '@/lib/razorpay'
import { useAuth } from '@/store/auth'
import { toast } from '@/store/toast'

export default function CheckoutPage() {
  const { orderId } = useParams()
  const user = useAuth((s) => s.user)
  const { data: order, isPending, isError, error, refetch } = useOrder(orderId)
  const { data: payments } = useOrderPayments(orderId)
  const createPayment = useCreatePayment()
  const verifyPayment = useVerifyPayment()
  const [paying, setPaying] = useState(false)

  if (isPending) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />

  const paid = payments?.some((p) => p.status === 'CAPTURED' || p.status === 'AUTHORIZED')

  const pay = async () => {
    if (!user) return
    setPaying(true)
    try {
      const details = await createPayment.mutateAsync(order.id)
      const result = await openRazorpayCheckout(details, {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      })
      await verifyPayment.mutateAsync(result)
      toast.success('Payment successful')
    } catch (e) {
      // Failed API calls already toast through the mutation cache; handle the rest here.
      if (e instanceof PaymentCancelledError) toast.info('Payment cancelled. You can try again.')
      else if (!createPayment.isError && !verifyPayment.isError) toast.error(errorMessage(e))
    } finally {
      setPaying(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Checkout"
        description={`Order ${order.orderNumber}`}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <OrderItemsList items={order.items} />

        <OrderSummary
          title="Payment"
          lines={[
            { label: 'Subtotal', value: order.subtotal },
            { label: 'Shipping', value: order.shippingFee, muted: true },
            { label: 'Tax', value: order.tax, muted: true },
          ]}
          total={order.total}
        >
          {paid ? (
            <>
              <p className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 font-medium text-green-900">
                <Icon name="check" size={18} />
                Payment received. Thank you!
              </p>
              <ButtonLink to={`/orders/${order.id}`} variant="secondary" fullWidth>
                View order
              </ButtonLink>
            </>
          ) : canPay(order.status) ? (
            <>
              <Button size="lg" fullWidth loading={paying} onClick={() => void pay()}>
                <Icon name="card" size={18} />
                Pay securely
              </Button>
              <p className="text-center text-sm text-slate-600">
                You will be taken to Razorpay to complete the payment.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-700">
              This order can no longer be paid.{' '}
              <Link to="/orders" className="font-semibold text-brand-700 hover:underline">
                Go to my orders
              </Link>
            </p>
          )}
        </OrderSummary>
      </div>
    </>
  )
}
