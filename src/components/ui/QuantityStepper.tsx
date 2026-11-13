import { Icon } from './Icon'

interface QuantityStepperProps {
  value: number
  min?: number
  max?: number
  disabled?: boolean
  onChange: (value: number) => void
}

export function QuantityStepper({ value, min = 1, max, disabled, onChange }: QuantityStepperProps) {
  const button =
    'flex size-11 items-center justify-center text-ink hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400'

  return (
    <div
      role="group"
      aria-label="Quantity"
      className="inline-flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white"
    >
      <button
        type="button"
        className={button}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      >
        <Icon name="minus" size={16} />
      </button>
      <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={button}
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}
