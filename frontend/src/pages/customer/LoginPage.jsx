import { useState } from 'react'
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import SEOHead from '../../components/seo/SEOHead'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loginCustomer, loginAdmin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from === '/checkout' ? '/checkout' : '/account'

  if (user?.role === 'customer') return <Navigate to={redirectTo} replace />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      // Try customer login first, then admin
      const customerResult = await loginCustomer(email, password)
      if (customerResult.success) {
        setLoading(false)
        navigate(redirectTo, { replace: true })
        return
      }

      const adminResult = await loginAdmin(email, password)
      setLoading(false)

      if (adminResult.success) {
        navigate('/admin')
      } else {
        setError('Invalid email or password.')
      }
    } catch {
      setLoading(false)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="container-page py-12 sm:py-20">
      <SEOHead title="Sign In" path="/login" noindex />
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-brand-dark">Welcome back</h1>
          <p className="text-sm text-brand-text-light mt-2">
            Sign in to your BookHeaven account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              className="input-field"
              placeholder="you@email.com"
              autoFocus
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              className="input-field"
              placeholder="Your password"
              autoComplete="current-password"
            />
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
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>

          <p className="text-center text-sm text-brand-text-light pt-1">
            <span className="text-brand-text-light/60">Forgot password?</span>
            {' '}
            <Link to="/contact" className="text-brand-gold hover:text-brand-gold-dark transition-colors font-medium">
              Contact us
            </Link>
          </p>
        </form>

        <p className="text-center text-sm text-brand-text-light mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-gold hover:text-brand-gold-dark transition-colors font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
