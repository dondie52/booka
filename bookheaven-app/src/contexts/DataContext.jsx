import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import storageService from '../services/storageService'
import defaultBooks from '../data/books'
import defaultCategories from '../data/categories'

const DataContext = createContext()

// Bump this version whenever default catalog data changes.
// Forces a refresh from defaults on next load, replacing stale localStorage data.
const CATALOG_VERSION = 2

export function DataProvider({ children }) {
  const catalogIsCurrent = storageService.get('bookheaven_catalog_version') === CATALOG_VERSION

  const [books, setBooks] = useState(() => {
    if (!catalogIsCurrent) return defaultBooks
    const stored = storageService.get(storageService.KEYS.BOOKS)
    return stored && stored.length > 0 ? stored : defaultBooks
  })

  const [categories, setCategories] = useState(() => {
    if (!catalogIsCurrent) return defaultCategories
    const stored = storageService.get(storageService.KEYS.CATEGORIES)
    return stored && stored.length > 0 ? stored : defaultCategories
  })

  useEffect(() => {
    storageService.set('bookheaven_catalog_version', CATALOG_VERSION)
  }, [])

  useEffect(() => {
    storageService.set(storageService.KEYS.BOOKS, books)
  }, [books])

  useEffect(() => {
    storageService.set(storageService.KEYS.CATEGORIES, categories)
  }, [categories])

  // Book CRUD
  const addBook = useCallback((book) => {
    const newBook = { ...book, id: `book-${Date.now()}` }
    setBooks(prev => [...prev, newBook])
    return newBook
  }, [])

  const updateBook = useCallback((id, updates) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [])

  const deleteBook = useCallback((id) => {
    setBooks(prev => prev.filter(b => b.id !== id))
  }, [])

  const getBookById = useCallback((id) => {
    return books.find(b => b.id === id) || null
  }, [books])

  // Category CRUD
  const addCategory = useCallback((category) => {
    const newCat = { ...category, id: `cat-${Date.now()}` }
    setCategories(prev => [...prev, newCat])
    return newCat
  }, [])

  const updateCategory = useCallback((id, updates) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  const getCategoryName = useCallback((categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized'
  }, [categories])

  return (
    <DataContext.Provider value={{
      books, categories,
      addBook, updateBook, deleteBook, getBookById,
      addCategory, updateCategory, deleteCategory, getCategoryName,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
