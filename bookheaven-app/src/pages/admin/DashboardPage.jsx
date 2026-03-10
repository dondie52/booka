import { Link } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import orderService from '../../services/orderService'

export default function DashboardPage() {
  const { books } = useData()
  const stats = orderService.getStats()
  const recentOrders = orderService.getAll().slice(0, 5)

  const cards = [
    { label: 'Total Books', value: books.length, color: 'bg-blue-50 text-blue-700', link: '/admin/books' },
    { label: 'Total Orders', value: stats.totalOrders, color: 'bg-amber-50 text-amber-700', link: '/admin/orders' },
    { label: 'Pending Orders', value: stats.pendingOrders, color: 'bg-orange-50 text-orange-700', link: '/admin/orders' },
    { label: 'Revenue', value: `P${stats.totalRevenue.toFixed(2)}`, color: 'bg-green-50 text-green-700', link: '/admin/orders' },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl text-brand-dark mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <Link key={card.label} to={card.link} className="card p-5 hover:shadow-md transition-shadow">
            <p className="text-xs font-sans text-brand-text-light uppercase tracking-wider">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 font-sans ${card.color.split(' ')[1]}`}>{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-brand-border/60">
          <h2 className="font-serif text-lg text-brand-dark">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-brand-gold hover:text-brand-gold-dark font-sans font-medium">
            View All &rarr;
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="p-5 text-sm text-brand-text-light">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border/40">
                  <th className="text-left px-5 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-brand-border/20 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs">{order.id}</td>
                    <td className="px-5 py-3">{order.customer.name}</td>
                    <td className="px-5 py-3 font-medium">P{order.total.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-5 py-3 text-brand-text-light">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700',
    paid: 'bg-blue-50 text-blue-700',
    processing: 'bg-purple-50 text-purple-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  )
}
