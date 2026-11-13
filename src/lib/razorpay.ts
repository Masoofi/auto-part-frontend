import type { CheckoutDetails, VerifyPaymentInput } from '@/api/payments'

interface RazorpaySuccess {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  prefill?: { name?: string; email?: string }
  theme?: { color: string }
  handler: (response: RazorpaySuccess) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open: () => void
  on: (event: 'payment.failed', cb: (r: { error: { description: string } }) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
let scriptPromise: Promise<void> | null = null

function loadScript() {
  if (window.Razorpay) return Promise.resolve()
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Could not load the payment window. Check your connection.'))
    }
    document.body.appendChild(script)
  })
  return scriptPromise
}

export class PaymentCancelledError extends Error {
  constructor() {
    super('Payment window closed')
    this.name = 'PaymentCancelledError'
  }
}

/** Opens Razorpay's popup; resolves with the signed result to send to /payments/verify. */
export async function openRazorpayCheckout(
  details: CheckoutDetails,
  prefill: { name: string; email: string },
): Promise<VerifyPaymentInput> {
  await loadScript()
  const Razorpay = window.Razorpay
  if (!Razorpay) throw new Error('Payment window is unavailable')

  return new Promise((resolve, reject) => {
    const checkout = new Razorpay({
      key: details.keyId,
      amount: details.amount,
      currency: details.currency,
      order_id: details.razorpayOrderId,
      name: 'AutoParts',
      prefill,
      theme: { color: '#c2410c' },
      handler: (r) => resolve(r),
      modal: { ondismiss: () => reject(new PaymentCancelledError()) },
    })
    checkout.on('payment.failed', (r) => reject(new Error(r.error.description)))
    checkout.open()
  })
}
