import { Link } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'

export default function Footer() {
  const { categories } = useData()
  const { user } = useAuth()

  return (
    <footer className="bg-brand-dark text-white/80">
      <div className="container-page py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-xl text-white mb-3">BookHeaven</h3>
            <p className="text-sm leading-relaxed text-white/50">
              Gaborone's independent bookstore. Curated reads delivered across Botswana.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans text-xs font-semibold text-white uppercase tracking-[0.15em] mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link to="/shop" className="text-sm text-white/50 hover:text-brand-gold transition-colors">Browse Books</Link></li>
              <li><Link to="/cart" className="text-sm text-white/50 hover:text-brand-gold transition-colors">Shopping Cart</Link></li>
              <li><Link to="/contact" className="text-sm text-white/50 hover:text-brand-gold transition-colors">Contact Us</Link></li>
              {user?.role === 'customer' ? (
                <li><Link to="/account" className="text-sm text-white/50 hover:text-brand-gold transition-colors">My Account</Link></li>
              ) : !user && (
                <li><Link to="/login" className="text-sm text-white/50 hover:text-brand-gold transition-colors">Sign In</Link></li>
              )}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-sans text-xs font-semibold text-white uppercase tracking-[0.15em] mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <Link to={`/shop?category=${cat.id}`} className="text-sm text-white/50 hover:text-brand-gold transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-xs font-semibold text-white uppercase tracking-[0.15em] mb-4">Get in Touch</h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li>Main Mall, Gaborone</li>
              <li>
                <a href="tel:+26771234567" className="hover:text-brand-gold transition-colors">+267 71 234 567</a>
              </li>
              <li>
                <a href="mailto:hello@bookheaven.co.bw" className="hover:text-brand-gold transition-colors">hello@bookheaven.co.bw</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} BookHeaven. All rights reserved.</p>
          <Link to="/admin/login" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
