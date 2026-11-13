import { useState } from 'react'
import { useAdminPayments } from '@/api/payments'
import { PaymentStatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Select, TextInput } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { formatDateTime, formatMoney, humanize } from '@/lib/format'
import { PAYMENT_STATUSES, type Payment, type PaymentStatus } from '@/types'

const columns: Column<Payment>[] = [
  {
    key: 'payment',
    header: 'Payment',
    cell: (p) => (
      <div>
        <p className="font-medium">{p.id.slice(0, 8)}</p>
        <p className="text-xs text-slate-600">{formatDateTime(p.createdAt)}</p>
      </div>
    ),
  },
  { key: 'order', header: 'Order', cell: (p) => <span className="text-slate-700">{p.orderId.slice(0, 8)}</span> },
  { key: 'amount', header: 'Amount', cell: (p) => formatMoney(p.amount) },
  { key: 'method', header: 'Method', cell: (p) => p.paymentMethod ?? humanize(p.provider) },
  { key: 'status', header: 'Status', cell: (p) => <PaymentStatusBadge status={p.status} /> },
  {
    key: 'paid',
    header: 'Paid at',
    cell: (p) => (p.paidAt ? formatDateTime(p.paidAt) : <span className="text-slate-500">-</span>),
  },
]

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PaymentStatus | ''>('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)

  const payments = useAdminPayments({
    search,
    status: status || undefined,
    fromDate,
    toDate,
    page,
    limit: 10,
  })

  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }

  return (
    <>
      <PageHeader title="Payments" description="Every payment attempt across all orders." />

      <div className="mb-4 grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SearchInput
          label="Search payments"
          placeholder="Search by ID or reference"
          value={search}
          onSearch={reset(setSearch)}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => reset(setStatus)(e.target.value as PaymentStatus | '')}
        >
          <option value="">All statuses</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </Select>
        <TextInput
          label="From"
          type="date"
          value={fromDate}
          onChange={(e) => reset(setFromDate)(e.target.value)}
        />
        <TextInput
          label="To"
          type="date"
          value={toDate}
          onChange={(e) => reset(setToDate)(e.target.value)}
        />
      </div>

      {payments.isError ? (
        <ErrorState message={payments.error.message} onRetry={() => void payments.refetch()} />
      ) : (
        <DataTable
          caption="Payments"
          columns={columns}
          rows={payments.data?.items}
          rowKey={(p) => p.id}
          loading={payments.isPending}
          empty={<EmptyState icon="card" title="No payments found" description="Try other filters." />}
        />
      )}

      {payments.data && (
        <Pagination page={payments.data.page} totalPages={payments.data.totalPages} onChange={setPage} />
      )}
    </>
  )
}
