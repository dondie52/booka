import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import paymentService from '../../services/paymentService'
import dpoService from '../../services/dpoService'
import orderService from '../../services/orderService'
import SEOHead from '../../components/seo/SEOHead'

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

  const defaultPaymentMethod = dpoService.isConfigured() ? 'dpo' : 'bank_transfer'

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryMethod: 'delivery',
    address: '',
    paymentMethod: defaultPaymentMethod,
    paymentReference: '',
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
    if (!isCustomer) {
      navigate('/login', { replace: true, state: { from: '/checkout' } })
    }
  }, [isCustomer, navigate])

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
    const needsRef = form.paymentMethod === 'bank_transfer'
    if (needsRef && !form.paymentReference.trim()) {
      errors.paymentReference = 'Please enter your payment reference or confirmation number.'
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
      // DPO Pay — redirect to hosted payment page
      if (form.paymentMethod === 'dpo') {
        const tempOrderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

        // Store order details for after DPO redirect
        sessionStorage.setItem('bookheaven_pending_dpo_order', JSON.stringify({
          customer: { name: form.name, email: form.email, phone: form.phone },
          deliveryMethod: form.deliveryMethod,
          address: form.address,
          tempOrderId,
        }))

        const dpoResult = await dpoService.createPayment({
          amount: total,
          orderId: tempOrderId,
          customerEmail: form.email,
          customerName: form.name,
          customerPhone: form.phone,
        })

        // Redirect to DPO payment page (user leaves the app)
        dpoService.redirectToPayment(dpoResult.paymentUrl)
        return
      }

      // Manual methods (Bank Transfer, COD)
      const paymentResult = await paymentService.processPayment({
        amount: total,
        method: form.paymentMethod,
        customerInfo: { name: form.name, email: form.email, phone: form.phone },
        paymentReference: form.paymentReference.trim() || null,
      })

      const order = await orderService.create({
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
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (!isCustomer || items.length === 0) return null

  return (
    <div className="container-page py-8 sm:py-12">
      <SEOHead title="Checkout" path="/checkout" noindex />
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

              {/* Payment reference input */}
              {form.paymentMethod === 'bank_transfer' && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Payment Reference / Confirmation Number *</label>
                  <input
                    type="text"
                    value={form.paymentReference}
                    onChange={e => updateField('paymentReference', e.target.value)}
                    className={`input-field ${fieldErrors.paymentReference ? 'border-brand-error focus:ring-brand-error/30 focus:border-brand-error' : ''}`}
                    placeholder="Enter the reference from your payment"
                  />
                  {fieldErrors.paymentReference && <p className="text-xs text-brand-error mt-1">{fieldErrors.paymentReference}</p>}

                  {/* WhatsApp confirm button */}
                  <a
                    href={paymentService.getWhatsAppLink(`Hi, I've made a payment of P${total.toFixed(2)} for my BookHeaven order via Bank Transfer. Reference: ${form.paymentReference || '(pending)'}. Please confirm.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp: I've Paid
                  </a>
                </div>
              )}
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
                ) : form.paymentMethod === 'dpo'
                  ? `Pay P${total.toFixed(2)} with DPO Pay`
                  : form.paymentMethod === 'cash_on_delivery'
                    ? `Place Order — Pay P${total.toFixed(2)} on Delivery`
                    : `Confirm Payment Sent — P${total.toFixed(2)}`}
              </button>

              {/* Trust signals */}
              <div className="mt-5 pt-5 border-t border-brand-border/40 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-brand-text-light">
                  <svg className="w-3.5 h-3.5 text-brand-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Manual payment confirmation
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
