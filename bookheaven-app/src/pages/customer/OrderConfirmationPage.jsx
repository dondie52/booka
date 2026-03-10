import { useParams, Link } from 'react-router-dom'
import orderService from '../../services/orderService'

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const order = orderService.getById(orderId)

  if (!order) {
    return (
      <div className="container-page py-20 text-center">
        <h2 className="font-serif text-2xl text-brand-dark mb-3">Order not found</h2>
        <Link to="/shop" className="text-sm text-brand-gold">Continue Shopping &rarr;</Link>
      </div>
    )
  }

  return (
    <div className="container-page py-12 sm:py-20">
      <div className="max-w-xl mx-auto text-center">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-brand-success-light flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="font-serif text-3xl text-brand-dark mb-2">Order confirmed</h1>
        <p className="text-brand-text-light text-sm">
          We've received your order and will begin processing it shortly.
        </p>

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
            <li>1. We confirm your payment and prepare your order.</li>
            <li>2. {order.deliveryMethod === 'delivery'
              ? 'Your books will be delivered to your address.'
              : 'We\'ll notify you when your order is ready for pickup.'}</li>
            <li>3. Questions? Get in touch via WhatsApp or phone.</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
          <Link to="/contact" className="btn-secondary">Contact Us</Link>
        </div>
      </div>
    </div>
  )
}
