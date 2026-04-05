import { useState, useEffect } from 'react'
import orderService from '../../services/orderService'
import paymentService from '../../services/paymentService'
import Modal from '../../components/ui/Modal'

const statusOptions = ['pending', 'paid', 'processing', 'completed', 'cancelled']

function PaymentBadge({ status }) {
  const styles = {
    completed: 'bg-brand-success-light text-brand-success',
    awaiting_confirmation: 'bg-amber-100 text-amber-700',
    pending: 'bg-gray-100 text-gray-600',
    failed: 'bg-brand-error-light text-brand-error',
  }
  const labels = {
    completed: 'Paid',
    awaiting_confirmation: 'Awaiting',
    pending: 'Pending',
    failed: 'Failed',
  }
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full font-sans ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  )
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    orderService.getAll().then(setOrders)
  }, [])

  async function refreshOrders() {
    setOrders(await orderService.getAll())
  }

  async function handleStatusChange(orderId, newStatus) {
    await orderService.updateStatus(orderId, newStatus)
    await refreshOrders()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(await orderService.getById(orderId))
    }
  }

  async function handleConfirmPayment(orderId) {
    await orderService.confirmPayment(orderId)
    await refreshOrders()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(await orderService.getById(orderId))
    }
  }

  const awaitingCount = orders.filter(o => o.paymentStatus === 'awaiting_confirmation').length

  const filtered = filterStatus
    ? orders.filter(o => o.orderStatus === filterStatus)
    : orders

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl text-brand-dark">Manage Orders</h1>
          {awaitingCount > 0 && (
            <p className="text-xs text-amber-700 mt-1 font-sans font-medium">
              {awaitingCount} order{awaitingCount > 1 ? 's' : ''} awaiting payment confirmation
            </p>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field sm:w-44"
        >
          <option value="">All Statuses</option>
          {statusOptions.map(s => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-brand-text-light text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border/40 bg-brand-bg-alt/50">
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider hidden sm:table-cell">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} className={`border-b border-brand-border/20 last:border-0 ${order.paymentStatus === 'awaiting_confirmation' ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-xs text-brand-text-light">{order.customer.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-brand-text-light hidden sm:table-cell">{order.items.length} items</td>
                    <td className="px-4 py-3 font-medium">P{order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PaymentBadge status={order.paymentStatus} />
                        {order.paymentStatus === 'awaiting_confirmation' && (
                          <button
                            onClick={() => handleConfirmPayment(order.id)}
                            className="text-[10px] text-brand-success hover:text-brand-success/80 font-semibold font-sans uppercase tracking-wider"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.orderStatus}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className="text-xs border border-brand-border rounded px-2 py-1 bg-white font-sans"
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-brand-text-light text-xs hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs text-brand-gold hover:text-brand-gold-dark font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details">
        {selectedOrder && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-brand-text-light">Order ID</p>
                <p className="font-mono font-medium">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-xs text-brand-text-light">Date</p>
                <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-brand-text-light">Customer</p>
                <p className="font-medium">{selectedOrder.customer.name}</p>
                <p className="text-xs text-brand-text-light">{selectedOrder.customer.email}</p>
                <p className="text-xs text-brand-text-light">{selectedOrder.customer.phone}</p>
              </div>
              <div>
                <p className="text-xs text-brand-text-light">Delivery</p>
                <p className="capitalize">{selectedOrder.deliveryMethod}</p>
                {selectedOrder.address && <p className="text-xs text-brand-text-light">{selectedOrder.address}</p>}
              </div>
            </div>

            <div className="border-t border-brand-border/60 pt-4">
              <p className="text-xs text-brand-text-light mb-2">Items</p>
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span>{item.title} &times; {item.quantity}</span>
                  <span className="font-medium">P{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-border/60 pt-4 space-y-1">
              <div className="flex justify-between text-brand-text-light">
                <span>Subtotal</span><span>P{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brand-text-light">
                <span>Delivery</span><span>{selectedOrder.deliveryFee > 0 ? `P${selectedOrder.deliveryFee.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="flex justify-between font-bold text-brand-dark pt-1 border-t border-brand-border/40">
                <span>Total</span><span>P{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-brand-border/60 pt-4 space-y-3">
              {/* Payment info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-brand-text-light mb-1">Payment Status</p>
                  <PaymentBadge status={selectedOrder.paymentStatus} />
                </div>
                <div>
                  <p className="text-xs text-brand-text-light mb-1">Payment Method</p>
                  <p className="capitalize">{selectedOrder.paymentMethod?.replace(/_/g, ' ') || 'N/A'}</p>
                </div>
              </div>

              {/* Payment reference */}
              {selectedOrder.paymentReference && (
                <div className="p-3 bg-brand-cream/60 rounded-lg">
                  <p className="text-xs text-brand-text-light">Payment Reference</p>
                  <p className="font-mono font-medium">{selectedOrder.paymentReference}</p>
                </div>
              )}

              {/* Confirm payment button */}
              {selectedOrder.paymentStatus === 'awaiting_confirmation' && (
                <button
                  onClick={() => handleConfirmPayment(selectedOrder.id)}
                  className="w-full py-2.5 bg-brand-success text-white text-sm font-medium rounded-lg hover:bg-brand-success/90 transition-colors"
                >
                  Confirm Payment Received
                </button>
              )}

              {/* WhatsApp customer link */}
              {selectedOrder.customer.phone && (
                <a
                  href={paymentService.getWhatsAppLink(`Hi ${selectedOrder.customer.name}, regarding your BookHeaven order ${selectedOrder.id} — `)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Message Customer on WhatsApp
                </a>
              )}

              <div>
                <p className="text-xs text-brand-text-light mb-1">Order Status</p>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="text-xs border border-brand-border rounded px-2 py-1.5 bg-white font-sans w-full"
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
