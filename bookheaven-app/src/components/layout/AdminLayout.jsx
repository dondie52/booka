import { Link, NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ScrollToTop from '../ui/ScrollToTop'
import logo from '../../assets/logo.png'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/books', label: 'Books' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/categories', label: 'Categories' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  if (user?.role !== 'admin') return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-brand-bg-alt">
      <ScrollToTop />
      {/* Admin header */}
      <header className="bg-brand-dark text-white sticky top-0 z-50">
        <div className="container-page flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2">
              <img src={logo} alt="" className="h-7 w-auto opacity-80" />
              <span className="font-serif text-lg">BookHeaven</span>
            </Link>
            <span className="text-[10px] text-white/30 font-sans uppercase tracking-widest hidden sm:block">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-white/50 hover:text-white transition-colors font-sans">
              View Store
            </Link>
            <button
              onClick={logout}
              className="text-xs text-white/50 hover:text-white transition-colors font-sans"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Admin nav */}
      <nav className="bg-white border-b border-brand-border/60">
        <div className="container-page flex gap-1 overflow-x-auto">
          {adminLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-brand-gold text-brand-gold'
                    : 'border-transparent text-brand-text-light hover:text-brand-text'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="container-page py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
