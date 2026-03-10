const KEYS = {
  CART: 'bookheaven_cart',
  ORDERS: 'bookheaven_orders',
  BOOKS: 'bookheaven_books',
  CATEGORIES: 'bookheaven_categories',
  AUTH: 'bookheaven_auth',
  USERS: 'bookheaven_users',
  CURRENT_USER: 'bookheaven_current_user',
}

function get(key, fallback = null) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage write failed:', e)
  }
}

function remove(key) {
  localStorage.removeItem(key)
}

const storageService = { get, set, remove, KEYS }
export default storageService
