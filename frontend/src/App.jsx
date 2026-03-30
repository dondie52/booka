import { Routes, Route } from 'react-router-dom'
import CustomerLayout from './components/layout/CustomerLayout'
import AdminLayout from './components/layout/AdminLayout'

import HomePage from './pages/customer/HomePage'
import ShopPage from './pages/customer/ShopPage'
import BookDetailPage from './pages/customer/BookDetailPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage'
import PaymentReturnPage from './pages/customer/PaymentReturnPage'
import ContactPage from './pages/customer/ContactPage'
import LoginPage from './pages/customer/LoginPage'
import SignupPage from './pages/customer/SignupPage'
import AccountPage from './pages/customer/AccountPage'

import AdminLoginPage from './pages/admin/AdminLoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import ManageBooksPage from './pages/admin/ManageBooksPage'
import ManageOrdersPage from './pages/admin/ManageOrdersPage'
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      {/* Customer routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/book/:id" element={<BookDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/payment-return" element={<PaymentReturnPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="books" element={<ManageBooksPage />} />
        <Route path="orders" element={<ManageOrdersPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
      </Route>

      {/* 404 catch-all */}
      <Route element={<CustomerLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
