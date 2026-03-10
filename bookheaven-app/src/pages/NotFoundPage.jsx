import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container-page py-20 text-center">
      <h2 className="font-serif text-2xl text-brand-dark mb-3">Page not found</h2>
      <p className="text-brand-text-light text-sm mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  )
}
