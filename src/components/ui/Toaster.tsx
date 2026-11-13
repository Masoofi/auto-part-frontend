import { useToastStore, type ToastKind } from '@/store/toast'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

const styles: Record<ToastKind, string> = {
  success: 'border-green-300 bg-green-50 text-green-900',
  error: 'border-red-300 bg-red-50 text-red-900',
  info: 'border-slate-300 bg-white text-ink',
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg',
            styles[t.kind],
          )}
        >
          <Icon name={t.kind === 'error' ? 'alert' : 'check'} size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">{t.message}</p>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
