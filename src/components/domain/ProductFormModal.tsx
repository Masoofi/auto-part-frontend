import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCategories } from '@/api/categories'
import {
  useCreateProduct,
  useDeleteProductImage,
  useUpdateProduct,
  useUploadProductImage,
  type ProductInput,
} from '@/api/products'
import { toast } from '@/store/toast'
import type { Product } from '@/types'
import { Button } from '@/components/ui/Button'
import { Select, TextInput, Textarea } from '@/components/ui/Field'
import { ImageUpload } from '@/components/ui/ImageUpload'
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
  description: '',
}

const toFormValues = (p: Product): FormValues => ({
  sku: p.sku,
  name: p.name,
  categoryId: p.categoryId,
  price: p.price,
  stock: String(p.stock),
  brand: p.brand ?? '',
  description: p.description ?? '',
})

// The image is not part of this payload: it is uploaded separately once the product exists.
const toInput = (v: FormValues): ProductInput => ({
  sku: v.sku,
  name: v.name,
  categoryId: v.categoryId,
  price: Number(v.price),
  stock: Number(v.stock),
  brand: v.brand,
  description: v.description,
})

interface ProductFormModalProps {
  open: boolean
  /** Pass a product to edit it; omit to create a new one. */
  product?: Product
  onClose: () => void
}

/** Mounts the form only while open, so every opening starts from clean state. */
export function ProductFormModal({ open, product, onClose }: ProductFormModalProps) {
  if (!open) return null
  return <ProductForm key={product?.id ?? 'new'} product={product} onClose={onClose} />
}

function ProductForm({ product, onClose }: Omit<ProductFormModalProps, 'open'>) {
  const categories = useCategories()
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const uploadImage = useUploadProductImage()
  const deleteImage = useDeleteProductImage()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product ? toFormValues(product) : emptyValues,
  })

  const onSubmit = async (values: FormValues) => {
    const input = toInput(values)
    setSaving(true)
    try {
      // Failures here are already toasted by the query client; keep the form open to retry.
      let id: string
      if (product) {
        await update.mutateAsync({ id: product.id, input })
        id = product.id
      } else {
        id = (await create.mutateAsync(input)).id
      }

      // The product is saved at this point. An image failure must not block closing,
      // otherwise a retry would try to create the same SKU again.
      let imageFailed = false
      try {
        if (imageFile) await uploadImage.mutateAsync({ id, file: imageFile })
        else if (imageRemoved && product?.imageUrl) await deleteImage.mutateAsync(id)
      } catch {
        imageFailed = true
      }

      if (imageFailed) toast.error('Product saved, but the image failed. Edit the product to retry.')
      else toast.success(product ? 'Product updated' : 'Product created')
      onClose()
    } catch {
      // Already reported.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      title={product ? 'Edit product' : 'New product'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
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
        <ImageUpload
          label="Product image"
          currentUrl={product?.imageUrl}
          currentRemoved={imageRemoved}
          file={imageFile}
          onChange={(file) => {
            setImageFile(file)
            if (file) setImageRemoved(false)
          }}
          onRemoveCurrent={() => setImageRemoved(true)}
          disabled={saving}
        />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
      </form>
    </Modal>
  )
}
