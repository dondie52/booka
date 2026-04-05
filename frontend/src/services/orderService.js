import { supabase } from '../lib/supabase'

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// Map Supabase order row + items → frontend order object
function mapOrder(row, items = []) {
  return {
    id: row.order_number || row.id,
    dbId: row.id,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone || '',
    },
    items: items.map(i => ({
      bookId: i.book_id,
      title: i.book_title,
      author: i.book_author,
      price: parseFloat(i.unit_price),
      quantity: i.quantity,
    })),
    subtotal: parseFloat(row.subtotal),
    deliveryFee: parseFloat(row.delivery_fee),
    total: parseFloat(row.total),
    deliveryMethod: row.delivery_method,
    address: row.delivery_address || null,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    paymentReference: null,
    orderStatus: row.order_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getAll() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch orders:', error)
    return []
  }

  // Fetch all order items in one query
  const orderIds = orders.map(o => o.id)
  const { data: allItems } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds)

  const itemsByOrder = {}
  ;(allItems || []).forEach(item => {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
    itemsByOrder[item.order_id].push(item)
  })

  return orders.map(o => mapOrder(o, itemsByOrder[o.id] || []))
}

async function getById(id) {
  // id could be order_number (BH-...) or UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const column = isUUID ? 'id' : 'order_number'

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq(column, id)
    .single()

  if (error || !order) return null

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)

  return mapOrder(order, items || [])
}

async function create({ customer, items, subtotal, deliveryMethod, address, paymentMethod, paymentResult }) {
  const deliveryFee = deliveryMethod === 'delivery' ? 35.00 : 0
  const total = subtotal + deliveryFee

  // Link order to authenticated user if logged in
  const { data: { session } } = await supabase.auth.getSession()

  const orderRow = {
    customer_id: session?.user?.id || null,
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone || '',
    subtotal,
    delivery_fee: deliveryFee,
    total,
    delivery_method: deliveryMethod,
    delivery_address: deliveryMethod === 'delivery' ? (address || '') : '',
    payment_method: paymentMethod === 'dpo' ? 'card' : paymentMethod,
    payment_status: paymentResult?.status || 'pending',
    order_status: ORDER_STATUS.PENDING,
    order_number: '',  // trigger will generate BH-YYYYMMDD-XXXX
  }

  const { data: inserted, error } = await supabase
    .from('orders')
    .insert(orderRow)
    .select()
    .single()

  if (error) {
    console.error('Failed to create order:', error)
    throw new Error('Could not create order. Please try again.')
  }

  // Insert order items
  const itemRows = items.map(i => ({
    order_id: inserted.id,
    book_id: i.bookId || null,
    book_title: i.title,
    book_author: i.author || '',
    quantity: i.quantity,
    unit_price: i.price,
    line_total: i.price * i.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemRows)

  if (itemsError) {
    console.error('Failed to insert order items:', itemsError)
  }

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', inserted.id)

  return mapOrder(inserted, orderItems || [])
}

async function updateStatus(id, orderStatus) {
  // Find the order by order_number or UUID
  const order = await getById(id)
  if (!order) return null

  const { data: updated, error } = await supabase
    .from('orders')
    .update({ order_status: orderStatus })
    .eq('id', order.dbId)
    .select()
    .single()

  if (error) {
    console.error('Failed to update order status:', error)
    return null
  }
  return mapOrder(updated)
}

async function updatePaymentStatus(id, paymentStatus) {
  const order = await getById(id)
  if (!order) return null

  const { data: updated, error } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus })
    .eq('id', order.dbId)
    .select()
    .single()

  if (error) {
    console.error('Failed to update payment status:', error)
    return null
  }
  return mapOrder(updated)
}

async function confirmPayment(id) {
  return updatePaymentStatus(id, 'completed')
}

async function getStats() {
  const orders = await getAll()
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
