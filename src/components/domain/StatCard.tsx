import { Card } from '@/components/ui/Card'
import { Icon, type IconName } from '@/components/ui/Icon'

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string
  value: string | number
  icon: IconName
  hint?: string
}) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-slate-600">{label}</p>
        <p className="font-display text-2xl font-bold">{value}</p>
        {hint && <p className="text-sm text-slate-600">{hint}</p>}
      </div>
    </Card>
  )
}
