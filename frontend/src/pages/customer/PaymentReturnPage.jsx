import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dpoService from '../../services/dpoService'
import orderService from '../../services/orderService'
import { useCart } from '../../contexts/CartContext'
import { useData } from '../../contexts/DataContext'

export default function PaymentReturnPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { getBookById, updateBook } = useData()
  const [status, setStatus] = useState('verifying') // verifying | success | failed | error
  const [error, setError] = useState('')

  useEffect(() => {
    verifyPayment()
  }, [])

  async function verifyPayment() {
    try {
      // Get the TransID from the URL (DPO appends it as a query param)
      const params = new URLSearchParams(window.location.search)
      let transToken = params.get('TransID') || params.get('transID')

      // Also check hash params (HashRouter may put params after the hash)
      if (!transToken) {
        const hashParts = window.location.hash.split('?')
        if (hashParts[1]) {
          const hashParams = new URLSearchParams(hashParts[1])
          transToken = hashParams.get('TransID') || hashParams.get('transID')
        }
      }

      if (!transToken) {
        setStatus('error')
        setError('No transaction reference found. Please contact support.')
        return
      }

      // Verify with DPO via edge function
      const result = await dpoService.verifyPayment(transToken)

      if (result.success) {
        // Retrieve pending order data from sessionStorage
        const pendingOrder = JSON.parse(sessionStorage.getItem('bookheaven_pending_dpo_order') || 'null')

        if (pendingOrder && items.length > 0) {
          // Create the order now that payment is confirmed
          const order = orderService.create({
            customer: pendingOrder.customer,
            items: items.map(i => ({ bookId: i.bookId, title: i.title, author: i.author, price: i.price, quantity: i.quantity })),
            subtotal,
            deliveryMethod: pendingOrder.deliveryMethod,
            address: pendingOrder.address,
            paymentMethod: 'dpo',
            paymentResult: {
              status: 'completed',
              transactionId: transToken,
              paymentReference: result.transactionRef || transToken,
              amount: result.transactionAmount,
            },
          })

          // Deduct stock
          items.forEach(item => {
            const book = getBookById(item.bookId)
            if (book) {
              updateBook(item.bookId, { stock: Math.max(0, book.stock - item.quantity) })
            }
          })

          clearCart()
          sessionStorage.removeItem('bookheaven_pending_dpo_order')

          setStatus('success')
          // Redirect to order confirmation after a brief moment
          setTimeout(() => navigate(`/order-confirmation/${order.id}`), 1500)
        } else {
          // Payment succeeded but no pending order data — possibly a page refresh
          setStatus('success')
        }
      } else {
        setStatus('failed')
        setError(result.resultExplanation || 'Payment was not completed.')
      }
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Failed to verify payment.')
    }
  }

  return (
    <div className="container-page py-20">
      <div className="max-w-md mx-auto text-center">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center mx-auto mb-6">
              <svg className="animate-spin w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl text-brand-dark mb-2">Verifying your payment...</h1>
            <p className="text-sm text-brand-text-light">Please wait while we confirm your transaction with DPO Pay.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-brand-success-light flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl text-brand-dark mb-2">Payment successful!</h1>
            <p className="text-sm text-brand-text-light">Redirecting to your order confirmation...</p>
          </>
        )}

        {(status === 'failed' || status === 'error') && (
          <>
            <div className="w-16 h-16 rounded-full bg-brand-error-light flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-brand-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl text-brand-dark mb-2">
              {status === 'failed' ? 'Payment not completed' : 'Something went wrong'}
            </h1>
            <p className="text-sm text-brand-text-light mb-6">{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/checkout" className="btn-primary">Try Again</Link>
              <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
