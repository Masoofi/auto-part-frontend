import { useEffect, useId, useMemo, useRef, useState, type DragEvent } from 'react'
import { cn } from '@/lib/cn'
import { IMAGE_TYPES, validateImage } from '@/lib/images'
import { Icon } from './Icon'

interface ImageUploadProps {
  label: string
  /** URL of the image already saved on the server, if any. */
  currentUrl?: string | null
  /** A newly chosen file that has not been uploaded yet. */
  file: File | null
  /** Called with the chosen file, or null when the user clears the field. */
  onChange: (file: File | null) => void
  /** Called when the user removes the already-saved image. */
  onRemoveCurrent?: () => void
  /** True once the saved image has been marked for removal. */
  currentRemoved?: boolean
  hint?: string
  disabled?: boolean
}

/** Pick or drop an image; shows a preview. Uploading is left to the parent form. */
export function ImageUpload({
  label,
  currentUrl,
  file,
  onChange,
  onRemoveCurrent,
  currentRemoved = false,
  hint = 'JPEG, PNG or WebP, up to 5 MB.',
  disabled,
}: ImageUploadProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()
  const [dragging, setDragging] = useState(false)

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const shownUrl = previewUrl ?? (currentRemoved ? null : currentUrl) ?? null

  const accept = (chosen: File | undefined) => {
    if (!chosen) return
    const problem = validateImage(chosen)
    setError(problem ?? undefined)
    if (!problem) onChange(chosen)
  }

  const onDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    setDragging(false)
    if (!disabled) accept(e.dataTransfer.files[0])
  }

  const clear = () => {
    setError(undefined)
    if (inputRef.current) inputRef.current.value = ''
    if (file) onChange(null)
    else onRemoveCurrent?.()
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
      </label>

      <div className="flex items-center gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg border-2 border-dashed bg-slate-50 text-slate-500',
            dragging ? 'border-brand-600 bg-brand-50' : 'border-slate-300',
          )}
        >
          {shownUrl ? (
            <img src={shownUrl} alt="Product preview" className="size-full object-cover" />
          ) : (
            <Icon name="image" size={28} />
          )}
        </div>

        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={id}
              className={cn(
                'inline-flex h-9 cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-ink hover:bg-slate-50 focus-within:ring-2 focus-within:ring-brand-600',
                disabled && 'pointer-events-none opacity-50',
              )}
            >
              {shownUrl ? 'Replace image' : 'Choose image'}
            </label>
            {shownUrl && (
              <button
                type="button"
                onClick={clear}
                disabled={disabled}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Icon name="trash" size={16} />
                Remove
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={IMAGE_TYPES.join(',')}
            disabled={disabled}
            aria-describedby={error ? `${id}-error` : undefined}
            className="sr-only"
            onChange={(e) => accept(e.target.files?.[0])}
          />
          {error ? (
            <p id={`${id}-error`} role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : (
            <p className="text-sm text-slate-600">{hint}</p>
          )}
        </div>
      </div>
    </div>
  )
}
