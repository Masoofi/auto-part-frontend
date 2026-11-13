import { useState } from 'react'
import { useCategories } from '@/api/categories'
import {
  useDeactivateProduct,
  useProducts,
  useRestoreProduct,
} from '@/api/products'
import { ProductFormModal } from '@/components/domain/ProductFormModal'
import { ProductImage } from '@/components/domain/ProductImage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { formatMoney } from '@/lib/format'
import type { Product } from '@/types'

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [deactivating, setDeactivating] = useState<Product | null>(null)

  const categories = useCategories()
  const products = useProducts(
    { search, categoryId, page, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
    { admin: true },
  )
  const deactivate = useDeactivateProduct()
  const restore = useRestoreProduct()

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <ProductImage src={p.imageUrl} alt={p.name} className="size-10 shrink-0 rounded-lg" />
          <div className="min-w-0">
            <p className="font-medium">{p.name}</p>
            <p className="text-xs text-slate-600">{p.sku}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category', cell: (p) => p.category?.name ?? '-' },
    { key: 'price', header: 'Price', cell: (p) => formatMoney(p.price) },
    {
      key: 'stock',
      header: 'Stock',
      cell: (p) => (
        <span className={p.stock <= 5 ? 'font-semibold text-red-700' : undefined}>{p.stock}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (p) => <Badge tone={p.isActive ? 'success' : 'neutral'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>
            <Icon name="edit" size={18} />
          </Button>
          {p.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeactivating(p)}
              aria-label={`Deactivate ${p.name}`}
            >
              <Icon name="trash" size={18} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              loading={restore.isPending && restore.variables === p.id}
              onClick={() => restore.mutate(p.id)}
              aria-label={`Restore ${p.name}`}
            >
              <Icon name="refresh" size={18} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Products"
        description="Add, edit and deactivate the parts you sell."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Icon name="plus" size={18} />
            New product
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <SearchInput
          className="min-w-56 flex-1"
          label="Search products"
          placeholder="Search by name or description"
          value={search}
          onSearch={(v) => {
            setSearch(v)
            setPage(1)
          }}
        />
        <div className="w-full min-[480px]:w-56">
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All categories</option>
            {categories.data?.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {products.isError ? (
        <ErrorState message={products.error.message} onRetry={() => void products.refetch()} />
      ) : (
        <DataTable
          caption="Products"
          columns={columns}
          rows={products.data?.items}
          rowKey={(p) => p.id}
          loading={products.isPending}
          empty={
            <EmptyState
              title="No products found"
              description="Create a product or change the filters."
              action={<Button onClick={() => setEditing('new')}>New product</Button>}
            />
          }
        />
      )}

      {products.data && (
        <Pagination page={products.data.page} totalPages={products.data.totalPages} onChange={setPage} />
      )}

      <ProductFormModal
        open={editing !== null}
        product={editing === 'new' || editing === null ? undefined : editing}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={deactivating !== null}
        title="Deactivate product?"
        message={`"${deactivating?.name}" will be hidden from the store. You can restore it later.`}
        confirmLabel="Deactivate"
        danger
        loading={deactivate.isPending}
        onClose={() => setDeactivating(null)}
        onConfirm={() =>
          deactivating &&
          deactivate.mutate(deactivating.id, { onSettled: () => setDeactivating(null) })
        }
      />
    </>
  )
}
