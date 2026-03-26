import storageService from './storageService'

const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

function getAll() {
  return storageService.get(storageService.KEYS.ORDERS, [])
}

function getById(id) {
  return getAll().find(o => o.id === id) || null
}

function create({ customer, items, subtotal, deliveryMethod, address, paymentMethod, paymentResult }) {
  const orders = getAll()
  const order = {
    id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    customer,
    items,
    subtotal,
    deliveryFee: deliveryMethod === 'delivery' ? 35.00 : 0,
    total: subtotal + (deliveryMethod === 'delivery' ? 35.00 : 0),
    deliveryMethod,
    address: deliveryMethod === 'delivery' ? address : null,
    paymentMethod,
    paymentStatus: paymentResult?.status || 'pending',
    paymentReference: paymentResult?.paymentReference || null,
    transactionId: paymentResult?.transactionId || null,
    orderStatus: ORDER_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  orders.unshift(order)
  storageService.set(storageService.KEYS.ORDERS, orders)
  return order
}

function updateStatus(id, orderStatus) {
  const orders = getAll()
  const idx = orders.findIndex(o => o.id === id)
  if (idx === -1) return null
  orders[idx].orderStatus = orderStatus
  orders[idx].updatedAt = new Date().toISOString()
  storageService.set(storageService.KEYS.ORDERS, orders)
  return orders[idx]
}

function updatePaymentStatus(id, paymentStatus) {
  const orders = getAll()
  const idx = orders.findIndex(o => o.id === id)
  if (idx === -1) return null
  orders[idx].paymentStatus = paymentStatus
  orders[idx].updatedAt = new Date().toISOString()
  storageService.set(storageService.KEYS.ORDERS, orders)
  return orders[idx]
}

function confirmPayment(id) {
  const orders = getAll()
  const idx = orders.findIndex(o => o.id === id)
  if (idx === -1) return null
  orders[idx].paymentStatus = 'completed'
  orders[idx].paymentConfirmedAt = new Date().toISOString()
  orders[idx].updatedAt = new Date().toISOString()
  storageService.set(storageService.KEYS.ORDERS, orders)
  return orders[idx]
}

function getStats() {
  const orders = getAll()
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.orderStatus === ORDER_STATUS.PENDING).length,
    completedOrders: orders.filter(o => o.orderStatus === ORDER_STATUS.COMPLETED).length,
    totalRevenue: orders
      .filter(o => o.paymentStatus === 'completed')
      .reduce((sum, o) => sum + o.total, 0),
  }
}

const orderService = { ORDER_STATUS, getAll, getById, create, updateStatus, updatePaymentStatus, confirmPayment, getStats }
export default orderService
