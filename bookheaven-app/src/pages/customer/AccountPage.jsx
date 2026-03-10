import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import orderService from '../../services/orderService'

export default function AccountPage() {
  const { user, isCustomer, logout, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')

  if (!isCustomer) return <Navigate to="/login" replace />

  const orders = orderService.getAll().filter(o =>
    o.customer?.email?.toLowerCase() === user.email.toLowerCase()
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  function handleSaveProfile(e) {
    e.preventDefault()
    setProfileMsg('')
    setProfileError('')

    if (!name.trim() || name.trim().length < 2) {
      setProfileError('Please enter a valid name.')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setProfileError('Please enter a valid email.')
      return
    }

    const result = updateProfile({ name, email })
    if (result.success) {
      setProfileMsg('Profile updated.')
      setEditing(false)
    } else {
      setProfileError(result.error)
    }
  }

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700',
    paid: 'bg-blue-50 text-blue-700',
    processing: 'bg-blue-50 text-blue-700',
    completed: 'bg-brand-success-light text-brand-success',
    cancelled: 'bg-brand-error-light text-brand-error',
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-brand-dark">My Account</h1>
            <p className="text-sm text-brand-text-light mt-1">
              Welcome back, {user.name}
            </p>
          </div>
          <button
            onClick={logout}
            className="btn-secondary btn-sm"
          >
            Sign Out
          </button>
        </div>

        {/* Profile section */}
        <div className="card p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-brand-dark">Profile</h2>
            {!editing && (
              <button
                onClick={() => { setEditing(true); setProfileMsg('') }}
                className="text-sm text-brand-gold hover:text-brand-gold-dark font-medium transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setProfileError('') }}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setProfileError('') }}
                  className="input-field"
                />
              </div>
              {profileError && (
                <p className="text-xs text-brand-error bg-brand-error-light p-2.5 rounded">{profileError}</p>
              )}
              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary btn-sm">Save Changes</button>
                <button type="button" onClick={() => { setEditing(false); setName(user.name); setEmail(user.email); setProfileError('') }} className="text-sm text-brand-text-light hover:text-brand-text transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
                  <span className="font-serif text-lg text-brand-gold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-brand-dark">{user.name}</p>
                  <p className="text-sm text-brand-text-light">{user.email}</p>
                </div>
              </div>
              {profileMsg && (
                <p className="text-xs text-brand-success bg-brand-success-light p-2.5 rounded">{profileMsg}</p>
              )}
            </div>
          )}
        </div>

        {/* Order history */}
        <div className="card p-5 sm:p-6">
          <h2 className="font-serif text-lg text-brand-dark mb-4">Order History</h2>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-brand-text-light mb-4">You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn-primary btn-sm">Browse Books</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="border border-brand-border/60 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-mono text-xs text-brand-text-light">{order.id}</p>
                      <p className="text-sm text-brand-text-light mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[order.orderStatus] || 'bg-gray-50 text-gray-600'}`}>
                        {order.orderStatus}
                      </span>
                      <span className="font-semibold text-brand-dark text-sm">
                        P{order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-brand-text-light">
                    {order.items.map(item => item.title).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
