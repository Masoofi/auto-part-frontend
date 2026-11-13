import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart, useClearCart } from '@/api/cart'
import { usePlaceOrder } from '@/api/orders'
import { CartLine } from '@/components/domain/CartLine'
import { OrderSummary } from '@/components/domain/OrderSummary'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Spinner'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { cartLineIssue } from '@/lib/cart'

export default function CartPage() {
  const navigate = useNavigate()
  const { data: cart, isPending, isError, error, refetch } = useCart()
  const clearCart = useClearCart()
  const placeOrder = usePlaceOrder()
  const [confirmClear, setConfirmClear] = useState(false)

  if (isPending) return <Skeleton className="h-96" />
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon="cart"
        title="Your cart is empty"
        description="Find the right part and add it to your cart."
        action={<ButtonLink to="/products">Browse products</ButtonLink>}
      />
    )
  }

  const hasIssues = cart.items.some((i) => cartLineIssue(i) !== null)

  return (
    <>
      <PageHeader
        title="Your cart"
        description={`${cart.summary.totalQuantity} item${cart.summary.totalQuantity === 1 ? '' : 's'}`}
        actions={
          <Button variant="secondary" onClick={() => setConfirmClear(true)}>
            Clear cart
          </Button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <ul className="divide-y divide-slate-100">
            {cart.items.map((item) => (
              <CartLine key={item.id} item={item} />
            ))}
          </ul>
        </Card>

        <div className="lg:sticky lg:top-24">
          <OrderSummary
            lines={[
              { label: `Items (${cart.summary.totalQuantity})`, value: cart.summary.subtotal },
              { label: 'Shipping', value: 0, muted: true },
              { label: 'Tax', value: 0, muted: true },
            ]}
            total={cart.summary.subtotal}
          >
            {hasIssues && (
              <p role="alert" className="text-sm text-red-700">
                Fix the highlighted items to continue.
              </p>
            )}
            <Button
              size="lg"
              fullWidth
              disabled={hasIssues}
              loading={placeOrder.isPending}
              onClick={() =>
                placeOrder.mutate(undefined, {
                  onSuccess: (order) => navigate(`/checkout/${order.id}`),
                })
              }
            >
              Place order and pay
            </Button>
          </OrderSummary>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear your cart?"
        message="All items will be removed from your cart."
        confirmLabel="Clear cart"
        danger
        loading={clearCart.isPending}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => clearCart.mutate(undefined, { onSettled: () => setConfirmClear(false) })}
      />
    </>
  )
}
