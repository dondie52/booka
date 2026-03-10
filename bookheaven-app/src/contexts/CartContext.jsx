import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import storageService from '../services/storageService'
import { useData } from './DataContext'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { getBookById } = useData()
  const [items, setItems] = useState(() =>
    storageService.get(storageService.KEYS.CART, [])
  )

  useEffect(() => {
    storageService.set(storageService.KEYS.CART, items)
  }, [items])

  const addItem = useCallback((book, qty = 1) => {
    const currentBook = getBookById(book.id)
    const maxStock = currentBook?.stock ?? Infinity
    if (maxStock <= 0) return
    setItems(prev => {
      const existing = prev.find(i => i.bookId === book.id)
      if (existing) {
        return prev.map(i =>
          i.bookId === book.id ? { ...i, quantity: Math.min(i.quantity + qty, maxStock) } : i
        )
      }
      return [...prev, { bookId: book.id, title: book.title, author: book.author, price: book.price, coverColor: book.coverColor, isbn: book.isbn, quantity: Math.min(qty, maxStock) }]
    })
  }, [getBookById])

  const removeItem = useCallback((bookId) => {
    setItems(prev => prev.filter(i => i.bookId !== bookId))
  }, [])

  const updateQuantity = useCallback((bookId, quantity) => {
    if (quantity < 1) return
    const currentBook = getBookById(bookId)
    const clamped = Math.min(quantity, currentBook?.stock ?? quantity)
    setItems(prev => prev.map(i => i.bookId === bookId ? { ...i, quantity: clamped } : i))
  }, [getBookById])

  const clearCart = useCallback(() => setItems([]), [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
