import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCategories } from '@/api/categories'
import { useCreateProduct, useUpdateProduct, type ProductInput } from '@/api/products'
import type { Product } from '@/types'
import { Button } from '@/components/ui/Button'
import { Select, TextInput, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'

// Fields are strings in the form; they are converted when sent to the API.
const schema = z.object({
  sku: z.string().trim().min(1, 'SKU is required'),
  name: z.string().trim().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Choose a category'),
  price: z
    .string()
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0, 'Enter a price above 0 (max 2 decimals)'),
  stock: z.string().refine((v) => /^\d+$/.test(v), 'Enter a whole number, 0 or more'),
  brand: z.string().trim(),
  imageUrl: z.string().trim().refine((v) => {
    if (!v) return true
    try {
      return ['http:', 'https:'].includes(new URL(v).protocol)
    } catch {
      return false
    }
  }, 'Enter a full image URL starting with https://'),
  description: z.string().trim(),
})
type FormValues = z.infer<typeof schema>

const emptyValues: FormValues = {
  sku: '',
  name: '',
  categoryId: '',
  price: '',
  stock: '0',
  brand: '',
  imageUrl: '',
  description: '',
}

const toFormValues = (p: Product): FormValues => ({
  sku: p.sku,
  name: p.name,
  categoryId: p.categoryId,
  price: p.price,
  stock: String(p.stock),
  brand: p.brand ?? '',
  imageUrl: p.imageUrl ?? '',
  description: p.description ?? '',
})

const toInput = (v: FormValues): ProductInput => ({
  sku: v.sku,
  name: v.name,
  categoryId: v.categoryId,
  price: Number(v.price),
  stock: Number(v.stock),
  brand: v.brand,
  imageUrl: v.imageUrl,
  description: v.description,
})

interface ProductFormModalProps {
  open: boolean
  /** Pass a product to edit it; omit to create a new one. */
  product?: Product
  onClose: () => void
}

export function ProductFormModal({ open, product, onClose }: ProductFormModalProps) {
  const categories = useCategories()
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues })

  useEffect(() => {
    if (open) reset(product ? toFormValues(product) : emptyValues)
  }, [open, product, reset])

  const saving = create.isPending || update.isPending

  const onSubmit = (values: FormValues) => {
    const input = toInput(values)
    if (product) update.mutate({ id: product.id, input }, { onSuccess: onClose })
    else create.mutate(input, { onSuccess: onClose })
  }

  return (
    <Modal
      open={open}
      title={product ? 'Edit product' : 'New product'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" loading={saving}>
            {product ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="SKU" error={errors.sku?.message} {...register('sku')} />
          <TextInput label="Brand" error={errors.brand?.message} {...register('brand')} />
        </div>
        <TextInput label="Name" error={errors.name?.message} {...register('name')} />
        <Select label="Category" error={errors.categoryId?.message} {...register('categoryId')}>
          <option value="">Select a category</option>
          {categories.data?.items.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Price (INR)"
            inputMode="decimal"
            error={errors.price?.message}
            {...register('price')}
          />
          <TextInput
            label="Stock"
            inputMode="numeric"
            error={errors.stock?.message}
            {...register('stock')}
          />
        </div>
        <TextInput
          label="Image URL"
          type="url"
          placeholder="https://"
          error={errors.imageUrl?.message}
          {...register('imageUrl')}
        />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
      </form>
    </Modal>
  )
}
