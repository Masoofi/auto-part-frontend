import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

/** Shared frame for the login and register forms. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="mx-auto max-w-md py-6">
      <Card className="p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-700">{footer}</p>
    </div>
  )
}
