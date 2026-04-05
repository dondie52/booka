import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import logo from '../../assets/logo.png'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { user, loginAdmin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user?.role === 'admin') return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your credentials.')
      return
    }

    setLoading(true)

    try {
      const result = await loginAdmin(email, password)
      setLoading(false)

      if (result.success) {
        navigate('/admin')
      } else {
        setError(result.error)
      }
    } catch {
      setLoading(false)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="BookHeaven" className="h-12 w-auto mx-auto mb-3 opacity-90" />
          <h1 className="font-serif text-2xl text-white">BookHeaven</h1>
          <p className="text-xs text-white/40 mt-1 font-sans uppercase tracking-widest">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-brand-charcoal/60 border border-white/10 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 font-sans">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold/50 transition-colors"
              placeholder="admin@bookheaven.co.bw"
              autoFocus
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 font-sans">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold/50 transition-colors"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/30 p-2.5 rounded-lg">{error}</p>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 bg-brand-gold text-white font-sans font-medium text-sm rounded-lg hover:bg-brand-gold-dark transition-colors disabled:opacity-60">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In to Admin'}
          </button>
        </form>

        <p className="text-center mt-6">
          <Link to="/" className="text-xs text-white/30 hover:text-white/50 transition-colors">
            &larr; Back to store
          </Link>
        </p>
      </div>
    </div>
  )
}
