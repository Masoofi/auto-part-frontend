import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

interface FieldProps {
  label: string
  error?: string
  hint?: string
}

const controlClasses = (error?: string) =>
  cn(
    'w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-slate-500 disabled:bg-slate-100',
    error ? 'border-red-600' : 'border-slate-300 hover:border-slate-400',
  )

function FieldShell({
  id,
  label,
  error,
  hint,
  children,
}: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-slate-600">{hint}</p>
      )}
    </div>
  )
}

type InputProps = FieldProps & InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }

export function TextInput({ label, error, hint, className, ...rest }: InputProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(controlClasses(error), 'h-11', className)}
        {...rest}
      />
    </FieldShell>
  )
}

type SelectProps = FieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & { ref?: Ref<HTMLSelectElement> }

export function Select({ label, error, hint, className, children, ...rest }: SelectProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(controlClasses(error), 'h-11', className)}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  )
}

type TextareaProps = FieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }

export function Textarea({ label, error, hint, className, ...rest }: TextareaProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(controlClasses(error), 'min-h-24 py-2', className)}
        {...rest}
      />
    </FieldShell>
  )
}
