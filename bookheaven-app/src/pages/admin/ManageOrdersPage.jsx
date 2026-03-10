import { useState, useEffect } from 'react'
import orderService from '../../services/orderService'
import Modal from '../../components/ui/Modal'

const statusOptions = ['pending', 'paid', 'processing', 'completed', 'cancelled']

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    setOrders(orderService.getAll())
  }, [])

  function refreshOrders() {
    setOrders(orderService.getAll())
  }

  function handleStatusChange(orderId, newStatus) {
    orderService.updateStatus(orderId, newStatus)
    refreshOrders()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(orderService.getById(orderId))
    }
  }

  const filtered = filterStatus
    ? orders.filter(o => o.orderStatus === filterStatus)
    : orders

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl text-brand-dark">Manage Orders</h1>
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
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} className="border-b border-brand-border/20 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-xs text-brand-text-light">{order.customer.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-brand-text-light hidden sm:table-cell">{order.items.length} items</td>
                    <td className="px-4 py-3 font-medium">P{order.total.toFixed(2)}</td>
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

            <div className="border-t border-brand-border/60 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-brand-text-light mb-1">Payment Status</p>
                <p className="capitalize font-medium">{selectedOrder.paymentStatus}</p>
              </div>
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
