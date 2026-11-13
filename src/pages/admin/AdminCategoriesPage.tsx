import { useState, type FormEvent } from 'react'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/api/categories'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { TextInput } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { EmptyState, ErrorState } from '@/components/ui/States'
import type { Category } from '@/types'

/** One modal for both creating and renaming a category. */
function CategoryFormModal({
  category,
  open,
  onClose,
}: {
  category?: Category
  open: boolean
  onClose: () => void
}) {
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const [name, setName] = useState(category?.name ?? '')
  const [error, setError] = useState<string>()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Name is required')
    setError(undefined)
    if (category) update.mutate({ id: category.id, name: trimmed }, { onSuccess: onClose })
    else create.mutate(trimmed, { onSuccess: onClose })
  }

  return (
    <Modal
      open={open}
      title={category ? 'Rename category' : 'New category'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" loading={create.isPending || update.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit} noValidate>
        <TextInput
          label="Name"
          value={name}
          error={error}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </form>
    </Modal>
  )
}

export default function AdminCategoriesPage() {
  const categories = useCategories(1, 100)
  const remove = useDeleteCategory()
  // `formKey` remounts the modal so its field starts from the right value.
  const [editing, setEditing] = useState<{ category?: Category; formKey: number } | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const openForm = (category?: Category) =>
    setEditing({ category, formKey: Date.now() })

  const columns: Column<Category>[] = [
    { key: 'name', header: 'Name', cell: (c) => <span className="font-medium">{c.name}</span> },
    { key: 'slug', header: 'Slug', cell: (c) => <span className="text-slate-600">{c.slug}</span> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openForm(c)} aria-label={`Rename ${c.name}`}>
            <Icon name="edit" size={18} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
            <Icon name="trash" size={18} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group products so shoppers can find them."
        actions={
          <Button onClick={() => openForm()}>
            <Icon name="plus" size={18} />
            New category
          </Button>
        }
      />

      {categories.isError ? (
        <ErrorState message={categories.error.message} onRetry={() => void categories.refetch()} />
      ) : (
        <DataTable
          caption="Categories"
          columns={columns}
          rows={categories.data?.items}
          rowKey={(c) => c.id}
          loading={categories.isPending}
          empty={
            <EmptyState
              icon="tag"
              title="No categories yet"
              action={<Button onClick={() => openForm()}>New category</Button>}
            />
          }
        />
      )}

      {editing && (
        <CategoryFormModal
          key={editing.formKey}
          open
          category={editing.category}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete category?"
        message={`"${deleting?.name}" will be deleted. Categories that still have products cannot be deleted.`}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
