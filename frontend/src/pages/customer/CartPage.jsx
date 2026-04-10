import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import BookCover from '../../components/ui/BookCover'
import SEOHead from '../../components/seo/SEOHead'

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart()
  const { getBookById } = useData()
  const { isCustomer } = useAuth()

  const seoHead = <SEOHead title="Your Cart" path="/cart" noindex />

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        {seoHead}
        <div className="max-w-sm mx-auto">
          <svg className="w-20 h-20 mx-auto text-brand-border/60 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h2 className="font-serif text-2xl text-brand-dark mb-2">Your cart is empty</h2>
          <p className="text-sm text-brand-text-light mb-6">Browse our collection and find your next great read.</p>
          <Link to="/shop" className="btn-primary">Browse Books</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-8 sm:py-12">
      {seoHead}
      <h1 className="font-serif text-3xl text-brand-dark mb-1">
        Shopping Cart
      </h1>
      <p className="text-sm text-brand-text-light mb-8">
        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const book = getBookById(item.bookId)
            const atMaxStock = book && item.quantity >= book.stock
            return (
            <div key={item.bookId} className="card flex gap-4 p-4 sm:p-5">
              <div className="w-16 sm:w-20 shrink-0">
                <BookCover title={item.title} author={item.author} color={item.coverColor} isbn={item.isbn} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/book/${item.bookId}`} className="font-serif text-base text-brand-dark hover:text-brand-gold transition-colors line-clamp-1">
                  {item.title}
                </Link>
                <p className="text-xs text-brand-text-light mt-0.5">{item.author}</p>
                <p className="text-sm font-bold text-brand-dark mt-2 font-sans">P{item.price.toFixed(2)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-brand-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1.5 text-sm hover:bg-brand-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      &minus;
                    </button>
                    <span className="px-3 py-1.5 text-xs font-medium border-x border-brand-border min-w-[32px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                      disabled={atMaxStock}
                      className="px-2.5 py-1.5 text-sm hover:bg-brand-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.bookId)}
                    className="text-xs text-brand-error hover:text-brand-error/80 font-sans font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-brand-dark text-sm font-sans">
                  P{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          )})}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sm:p-6 sticky top-24">
            <h3 className="font-serif text-lg text-brand-dark mb-5">Order Summary</h3>
            <div className="space-y-2.5 text-sm font-sans">
              <div className="flex justify-between text-brand-text-light">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium text-brand-text">P{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brand-text-light">
                <span>Delivery</span>
                <span className="text-xs">Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-brand-border/60 mt-5 pt-5 flex justify-between font-bold text-brand-dark text-lg">
              <span>Total</span>
              <span>P{subtotal.toFixed(2)}</span>
            </div>
            <Link
              to={isCustomer ? '/checkout' : '/login'}
              state={isCustomer ? undefined : { from: '/checkout' }}
              className="btn-primary w-full mt-6"
            >
              Proceed to Checkout
            </Link>
            <Link to="/shop" className="block text-center text-xs text-brand-text-light hover:text-brand-gold mt-4 transition-colors font-medium">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
