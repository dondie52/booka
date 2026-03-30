import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const { user, register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user?.role === 'customer') return <Navigate to="/account" replace />

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
    setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const errors = {}

    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = 'Please enter your full name.'
    }
    if (!form.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.'
    }
    if (!form.password) {
      errors.password = 'Password is required.'
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.'
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)
    await new Promise(r => setTimeout(r, 500))

    const result = register(form.name, form.email, form.password)
    setLoading(false)

    if (result.success) {
      navigate('/account')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="container-page py-12 sm:py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-brand-dark">Create an account</h1>
          <p className="text-sm text-brand-text-light mt-2">
            Join BookHeaven to track orders and shop faster
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5" noValidate>
          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">
              Full name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              className={`input-field ${fieldErrors.name ? 'border-brand-error focus:ring-brand-error/30 focus:border-brand-error' : ''}`}
              placeholder="Your full name"
              autoFocus
              autoComplete="name"
            />
            {fieldErrors.name && <p className="text-xs text-brand-error mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">
              Email address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => updateField('email', e.target.value)}
              className={`input-field ${fieldErrors.email ? 'border-brand-error focus:ring-brand-error/30 focus:border-brand-error' : ''}`}
              placeholder="you@email.com"
              autoComplete="email"
            />
            {fieldErrors.email && <p className="text-xs text-brand-error mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => updateField('password', e.target.value)}
              className={`input-field ${fieldErrors.password ? 'border-brand-error focus:ring-brand-error/30 focus:border-brand-error' : ''}`}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            {fieldErrors.password && <p className="text-xs text-brand-error mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">
              Confirm password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => updateField('confirmPassword', e.target.value)}
              className={`input-field ${fieldErrors.confirmPassword ? 'border-brand-error focus:ring-brand-error/30 focus:border-brand-error' : ''}`}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
            {fieldErrors.confirmPassword && <p className="text-xs text-brand-error mt-1">{fieldErrors.confirmPassword}</p>}
          </div>

          {error && (
            <p className="text-xs text-brand-error bg-brand-error-light p-3 rounded-lg">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-text-light mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-gold hover:text-brand-gold-dark transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
