import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon="alert"
      title="Page not found"
      description="The page you are looking for does not exist or has moved."
      action={<ButtonLink to="/">Back to home</ButtonLink>}
    />
  )
}
