import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import logo from '../../assets/logo.png'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const { itemCount } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    logout()
    setAccountOpen(false)
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-brand-border/50 sticky top-0 z-50">
      <div className="container-page">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={logo} alt="BookHeaven" className="h-9 sm:h-11 w-auto" />
            <div className="hidden sm:block">
              <span className="font-serif text-lg text-brand-dark leading-none tracking-tight">BookHeaven</span>
              <span className="block text-[10px] text-brand-text-light font-sans tracking-widest uppercase leading-none mt-0.5">Gaborone</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors duration-200 ${
                    isActive ? 'text-brand-gold' : 'text-brand-text hover:text-brand-gold'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 text-brand-text hover:text-brand-gold transition-colors p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0 bg-brand-gold text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Account — desktop */}
            <div className="hidden md:block relative" ref={accountRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 text-brand-text hover:text-brand-gold transition-colors p-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-cream flex items-center justify-center">
                      <span className="font-serif text-sm text-brand-gold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg className={`w-3.5 h-3.5 transition-transform ${accountOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-brand-border/60 rounded-xl shadow-lg shadow-brand-dark/5 py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-brand-border/40">
                        <p className="text-sm font-medium text-brand-dark truncate">{user.name}</p>
                        <p className="text-xs text-brand-text-light truncate">{user.email}</p>
                      </div>
                      {user.role === 'customer' && (
                        <Link
                          to="/account"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-cream/50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-brand-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          My Account
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-cream/50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-brand-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-brand-border/40 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-cream/50 transition-colors w-full text-left"
                        >
                          <svg className="w-4 h-4 text-brand-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-sm font-medium text-brand-text hover:text-brand-gold transition-colors p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-brand-text"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-5 border-t border-brand-border/40 pt-4">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${isActive ? 'text-brand-gold bg-brand-cream/50' : 'text-brand-text hover:bg-brand-cream/30'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Mobile auth section */}
            <div className="border-t border-brand-border/40 mt-3 pt-3">
              {user ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
                      <span className="font-serif text-sm text-brand-gold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-dark truncate">{user.name}</p>
                      <p className="text-xs text-brand-text-light truncate">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'customer' && (
                    <Link
                      to="/account"
                      onClick={() => setMenuOpen(false)}
                      className="text-sm font-medium py-2.5 px-3 rounded-lg text-brand-text hover:bg-brand-cream/30 transition-colors"
                    >
                      My Account
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="text-sm font-medium py-2.5 px-3 rounded-lg text-brand-text hover:bg-brand-cream/30 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium py-2.5 px-3 rounded-lg text-brand-text hover:bg-brand-cream/30 transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium py-2.5 px-3 rounded-lg text-brand-text hover:bg-brand-cream/30 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium py-2.5 px-3 rounded-lg text-brand-gold hover:bg-brand-cream/30 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
