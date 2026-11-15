import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useLogin } from '@/api/auth'
import { AuthCard } from '@/components/domain/AuthCard'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/Field'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = (values: FormValues) =>
    login.mutate(values, {
      onSuccess: ({ user }) => {
        const from = (location.state as { from?: string } | null)?.from
        navigate(from ?? (user.role === 'ADMIN' ? '/admin' : '/'), { replace: true })
      },
    })

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to see your cart and orders."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="demo_user@gmail.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextInput
          label="Password"
          type="password"
          placeholder="********"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" fullWidth loading={login.isPending}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  )
}
