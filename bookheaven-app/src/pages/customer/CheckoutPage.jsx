import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import paymentService from '../../services/paymentService'
import orderService from '../../services/orderService'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?\d[\d\s-]{6,}$/

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart, itemCount } = useCart()
  const { getBookById, updateBook } = useData()
  const { user, isCustomer } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryMethod: 'delivery',
    address: '',
    paymentMethod: 'card',
  })

  // Auto-fill for logged-in customers
  useEffect(() => {
    if (isCustomer && user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [isCustomer, user])

  useEffect(() => {
    if (items.length === 0) navigate('/cart', { replace: true })
  }, [items.length, navigate])

  const deliveryFee = form.deliveryMethod === 'delivery' ? 35.00 : 0
  const total = subtotal + deliveryFee

  const paymentMethods = paymentService.getSupportedMethods()

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
    setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const errors = {}

    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = 'Full name is required.'
    }
    if (!form.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!EMAIL_RE.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.'
    }
    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required.'
    } else if (!PHONE_RE.test(form.phone.trim())) {
      errors.phone = 'Enter a valid phone number (e.g. +267 71 234 567).'
    }
    if (form.deliveryMethod === 'delivery' && !form.address.trim()) {
      errors.address = 'Delivery address is required.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!validate()) return

    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setProcessing(true)

    const stockIssues = items.filter(item => {
      const book = getBookById(item.bookId)
      return !book || book.stock < item.quantity
    })
    if (stockIssues.length > 0) {
      setError('Some items exceed available stock. Please update quantities in your cart.')
      setProcessing(false)
      return
    }

    try {
      const paymentResult = await paymentService.processPayment({
        amount: total,
        method: form.paymentMethod,
        customerInfo: { name: form.name, email: form.email, phone: form.phone },
      })

      const order = orderService.create({
        customer: { name: form.name, email: form.email, phone: form.phone },
        items: items.map(i => ({ bookId: i.bookId, title: i.title, author: i.author, price: i.price, quantity: i.quantity })),
        subtotal,
        deliveryMethod: form.deliveryMethod,
        address: form.address,
        paymentMethod: form.paymentMethod,
        paymentResult,
      })

      items.forEach(item => {
        const book = getBookById(item.bookId)
        if (book) {
          updateBook(item.bookId, { stock: Math.max(0, book.stock - item.quantity) })
        }
      })

      clearCart()
      navigate(`/order-confirmation/${order.id}`)
    } catch {
      setError('Payment processing failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-brand-dark">Checkout</h1>
        <p className="text-sm text-brand-text-light mt-1">Complete your order</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer info */}
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 rounded-full bg-brand-dark text-white text-xs font-bold flex items-center justify-center font-sans">1</span>
                <h2 className="font-serif text-lg text-brand-dark">Your Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => updateField('name', e.target.value)}
                    className={`input-field ${fieldErrors.name ? 'border-brand-error focus:ring-brand-error/30 focus:border-brand-error' : ''}`}
                    placeholder="Full name"
                  />
                  {fieldErrors.name && <p className="text-xs text-brand-error mt-1">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    className={`input-field ${fieldErrors.phone ? 'border-brand-error focus:ring-brand-error/30 focus:border-brand-error' : ''}`}
                    placeholder="+267 71 234 567"
                  />
                  {fieldErrors.phone && <p className="text-xs text-brand-error mt-1">{fieldErrors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    className={`input-field ${fieldErrors.email ? 'border-brand-error focus:ring-brand-error/30 focus:border-brand-error' : ''}`}
                    placeholder="you@email.com"
                  />
                  {fieldErrors.email && <p className="text-xs text-brand-error mt-1">{fieldErrors.email}</p>}
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 rounded-full bg-brand-dark text-white text-xs font-bold flex items-center justify-center font-sans">2</span>
                <h2 className="font-serif text-lg text-brand-dark">Delivery Method</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.deliveryMethod === 'delivery' ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-border/60 hover:border-brand-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={form.deliveryMethod === 'delivery'}
                    onChange={e => updateField('deliveryMethod', e.target.value)}
                    className="accent-brand-gold mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-brand-dark">Delivery</p>
                    <p className="text-xs text-brand-text-light mt-0.5">P35.00 delivery fee</p>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.deliveryMethod === 'pickup' ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-border/60 hover:border-brand-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={form.deliveryMethod === 'pickup'}
                    onChange={e => updateField('deliveryMethod', e.target.value)}
                    className="accent-brand-gold mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-brand-dark">Pickup</p>
                    <p className="text-xs text-brand-text-light mt-0.5">Free — collect at Main Mall, Gaborone</p>
                  </div>
                </label>
              </div>

              {form.deliveryMethod === 'delivery' && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Delivery Address *</label>
                  <textarea
                    value={form.address}
                    onChange={e => updateField('address', e.target.value)}
                    className={`input-field h-20 resize-none ${fieldErrors.address ? 'border-brand-error focus:ring-brand-error/30 focus:border-brand-error' : ''}`}
                    placeholder="Street address, city"
                  />
                  {fieldErrors.address && <p className="text-xs text-brand-error mt-1">{fieldErrors.address}</p>}
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-7 h-7 rounded-full bg-brand-dark text-white text-xs font-bold flex items-center justify-center font-sans">3</span>
                <h2 className="font-serif text-lg text-brand-dark">Payment Method</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map(method => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === method.id ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-border/60 hover:border-brand-border'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={form.paymentMethod === method.id}
                      onChange={e => updateField('paymentMethod', e.target.value)}
                      className="accent-brand-gold"
                    />
                    <span className="text-sm font-medium text-brand-dark">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5 sm:p-6 sticky top-24">
              <h3 className="font-serif text-lg text-brand-dark mb-1">
                Order Summary
              </h3>
              <p className="text-xs text-brand-text-light mb-5">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.bookId} className="flex justify-between text-sm gap-2">
                    <span className="text-brand-text-light truncate">
                      {item.title} &times; {item.quantity}
                    </span>
                    <span className="text-brand-text shrink-0 font-medium">
                      P{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-brand-border/60 mt-5 pt-5 space-y-2.5 text-sm">
                <div className="flex justify-between text-brand-text-light">
                  <span>Subtotal</span>
                  <span>P{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-text-light">
                  <span>Delivery</span>
                  <span>{deliveryFee > 0 ? `P${deliveryFee.toFixed(2)}` : 'Free'}</span>
                </div>
              </div>
              <div className="border-t border-brand-border/60 mt-4 pt-4 flex justify-between font-bold text-brand-dark text-xl">
                <span>Total</span>
                <span>P{total.toFixed(2)}</span>
              </div>

              {error && (
                <p className="mt-4 text-xs text-brand-error bg-brand-error-light p-3 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={processing}
                className="btn-primary w-full mt-6 disabled:opacity-60"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : `Pay P${total.toFixed(2)}`}
              </button>

              {/* Trust signals */}
              <div className="mt-5 pt-5 border-t border-brand-border/40 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-brand-text-light">
                  <svg className="w-3.5 h-3.5 text-brand-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Secure payment processing
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text-light">
                  <svg className="w-3.5 h-3.5 text-brand-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Order confirmation sent to your email
                </div>
              </div>

              <Link to="/cart" className="block text-center text-xs text-brand-text-light hover:text-brand-gold mt-4 font-medium transition-colors">
                &larr; Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
