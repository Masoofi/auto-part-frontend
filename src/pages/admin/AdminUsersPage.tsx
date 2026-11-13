import { useState } from 'react'
import { useUpdateUser, useUsers } from '@/api/users'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { formatDate } from '@/lib/format'
import { useAuth } from '@/store/auth'
import type { Role, User } from '@/types'

export default function AdminUsersPage() {
  const me = useAuth((s) => s.user)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [page, setPage] = useState(1)

  const users = useUsers({ search, role: role || undefined, page, limit: 10 })
  const update = useUpdateUser()
  const busyId = update.isPending ? update.variables?.id : undefined

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      cell: (u) => (
        <div>
          <p className="font-medium">
            {u.firstName} {u.lastName}
          </p>
          <p className="text-xs text-slate-600">{u.email}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', cell: (u) => u.phone ?? '-' },
    { key: 'joined', header: 'Joined', cell: (u) => formatDate(u.createdAt) },
    {
      key: 'role',
      header: 'Role',
      cell: (u) => (
        <select
          aria-label={`Role for ${u.email}`}
          value={u.role}
          disabled={u.id === me?.id || busyId === u.id}
          onChange={(e) => update.mutate({ id: u.id, role: e.target.value as Role })}
          className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm disabled:bg-slate-100"
        >
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </select>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (u) => <Badge tone={u.isActive ? 'success' : 'neutral'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (u) => (
        <Button
          variant="secondary"
          size="sm"
          disabled={u.id === me?.id}
          loading={busyId === u.id}
          onClick={() => update.mutate({ id: u.id, isActive: !u.isActive })}
        >
          {u.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage roles and access. You cannot change your own account here."
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <SearchInput
          className="min-w-56 flex-1"
          label="Search users"
          placeholder="Search by name or email"
          value={search}
          onSearch={(v) => {
            setSearch(v)
            setPage(1)
          }}
        />
        <div className="w-full min-[480px]:w-48">
          <Select
            label="Role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as Role | '')
              setPage(1)
            }}
          >
            <option value="">All roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
      </div>

      {users.isError ? (
        <ErrorState message={users.error.message} onRetry={() => void users.refetch()} />
      ) : (
        <DataTable
          caption="Users"
          columns={columns}
          rows={users.data?.items}
          rowKey={(u) => u.id}
          loading={users.isPending}
          empty={<EmptyState icon="users" title="No users found" description="Try other filters." />}
        />
      )}

      {users.data && (
        <Pagination page={users.data.page} totalPages={users.data.totalPages} onChange={setPage} />
      )}
    </>
  )
}
