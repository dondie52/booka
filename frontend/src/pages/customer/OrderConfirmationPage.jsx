import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import orderService from '../../services/orderService'
import paymentService from '../../services/paymentService'

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getById(orderId).then(o => {
      setOrder(o)
      setLoading(false)
    })
  }, [orderId])

  if (loading) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-brand-text-light text-sm">Loading order...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-page py-20 text-center">
        <h2 className="font-serif text-2xl text-brand-dark mb-3">Order not found</h2>
        <Link to="/shop" className="text-sm text-brand-gold">Continue Shopping &rarr;</Link>
      </div>
    )
  }

  const isAwaiting = order.paymentStatus === 'awaiting_confirmation'
  const isCOD = order.paymentMethod === 'cash_on_delivery'

  return (
    <div className="container-page py-12 sm:py-20">
      <div className="max-w-xl mx-auto text-center">
        {/* Status icon */}
        {isAwaiting ? (
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-brand-success-light flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}

        <h1 className="font-serif text-3xl text-brand-dark mb-2">
          {isAwaiting ? 'Order placed — payment pending' : 'Order confirmed'}
        </h1>
        <p className="text-brand-text-light text-sm">
          {isAwaiting
            ? 'We\'ve received your order. We\'ll verify your payment and update your order status.'
            : isCOD
              ? 'Your order has been placed. Please have payment ready on delivery/pickup.'
              : 'We\'ve received your order and will begin processing it shortly.'}
        </p>

        {/* Awaiting payment banner */}
        {isAwaiting && (
          <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
            <p className="text-sm font-medium text-amber-800">Payment Awaiting Confirmation</p>
            <p className="text-xs text-amber-700 mt-1">We'll verify your payment reference and confirm your order. This usually takes a few minutes during business hours.</p>
          </div>
        )}

        <div className="mt-8 card p-5 text-left">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-brand-text-light font-sans">Order ID</p>
              <p className="font-mono text-sm text-brand-dark font-medium">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-brand-text-light font-sans">Date</p>
              <p className="text-sm text-brand-dark">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Payment reference */}
          {order.paymentReference && (
            <div className="mb-4 p-3 bg-brand-cream/60 rounded-lg">
              <p className="text-xs text-brand-text-light font-sans">Payment Reference</p>
              <p className="font-mono text-sm text-brand-dark font-medium">{order.paymentReference}</p>
            </div>
          )}

          <div className="border-t border-brand-border/60 pt-4 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-brand-text-light">
                  {item.title} &times; {item.quantity}
                </span>
                <span className="text-brand-text font-medium">P{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-brand-border/60 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-brand-text-light">
              <span>Subtotal</span>
              <span>P{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-brand-text-light">
              <span>Delivery</span>
              <span>{order.deliveryFee > 0 ? `P${order.deliveryFee.toFixed(2)}` : 'Free (Pickup)'}</span>
            </div>
            <div className="flex justify-between font-bold text-brand-dark pt-2 border-t border-brand-border/40">
              <span>Total</span>
              <span>P{order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-brand-border/60 mt-4 pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-brand-text-light mb-1">Customer</p>
              <p className="text-brand-dark">{order.customer.name}</p>
              <p className="text-brand-text-light text-xs">{order.customer.phone}</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-light mb-1">Delivery</p>
              <p className="text-brand-dark capitalize">{order.deliveryMethod}</p>
              {order.address && <p className="text-brand-text-light text-xs">{order.address}</p>}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-brand-cream/60 rounded-xl p-5">
          <h3 className="font-serif text-base text-brand-dark mb-2">What happens next?</h3>
          <ul className="text-sm text-brand-text-light space-y-1.5 text-left">
            {isAwaiting ? (
              <>
                <li>1. We'll verify your payment reference.</li>
                <li>2. Once confirmed, we'll prepare your order.</li>
                <li>3. {order.deliveryMethod === 'delivery'
                  ? 'Your books will be delivered to your address.'
                  : 'We\'ll notify you when your order is ready for pickup.'}</li>
              </>
            ) : isCOD ? (
              <>
                <li>1. We'll prepare your order.</li>
                <li>2. Pay P{order.total.toFixed(2)} in cash on {order.deliveryMethod === 'delivery' ? 'delivery' : 'pickup'}.</li>
                <li>3. {order.deliveryMethod === 'delivery'
                  ? 'Your books will be delivered to your address.'
                  : 'We\'ll notify you when your order is ready for pickup.'}</li>
              </>
            ) : (
              <>
                <li>1. We confirm your payment and prepare your order.</li>
                <li>2. {order.deliveryMethod === 'delivery'
                  ? 'Your books will be delivered to your address.'
                  : 'We\'ll notify you when your order is ready for pickup.'}</li>
                <li>3. Questions? Get in touch via WhatsApp or phone.</li>
              </>
            )}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
          <a
            href={paymentService.getWhatsAppLink(`Hi, I have a question about my order ${order.id}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  )
}
