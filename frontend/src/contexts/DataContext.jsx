import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DataContext = createContext()

// Map Supabase snake_case row → camelCase object the UI expects
function mapBook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description || '',
    price: parseFloat(row.price),
    categoryId: row.category_id,
    coverColor: row.cover_color || '#2C2C2C',
    coverImage: row.cover_image_url || '',
    stock: row.stock_quantity,
    isbn: row.isbn || '',
    publishedYear: row.published_year,
    featured: row.is_featured,
    needsVerification: row.status === 'needs_verification',
    verificationNotes: row.verification_notes || '',
  }
}

// Map camelCase form data → Supabase snake_case for insert/update
function toBookRow(data) {
  return {
    title: data.title,
    author: data.author,
    description: data.description || '',
    price: parseFloat(data.price) || 0,
    category_id: data.categoryId || null,
    cover_color: data.coverColor || '#2C2C2C',
    cover_image_url: data.coverImage || '',
    stock_quantity: parseInt(data.stock) || 0,
    isbn: data.isbn || '',
    published_year: data.publishedYear ? parseInt(data.publishedYear) : null,
    is_featured: data.featured || false,
    status: data.needsVerification ? 'needs_verification' : 'active',
    verification_notes: data.verificationNotes || '',
  }
}

function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    displayOrder: row.display_order,
  }
}

export function DataProvider({ children }) {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch books and categories from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [booksRes, catsRes] = await Promise.all([
        supabase.from('books').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order'),
      ])

      if (booksRes.data) setBooks(booksRes.data.map(mapBook))
      if (catsRes.data) setCategories(catsRes.data.map(mapCategory))

      if (booksRes.error) console.error('Failed to fetch books:', booksRes.error)
      if (catsRes.error) console.error('Failed to fetch categories:', catsRes.error)
      setLoading(false)
    }
    fetchData()
  }, [])

  // Book CRUD
  const addBook = useCallback(async (data) => {
    const row = toBookRow(data)
    const { data: inserted, error } = await supabase.from('books').insert(row).select().single()
    if (error) {
      console.error('Failed to add book:', error)
      return null
    }
    const newBook = mapBook(inserted)
    setBooks(prev => [newBook, ...prev])
    return newBook
  }, [])

  const updateBook = useCallback(async (id, data) => {
    const row = toBookRow(data)
    const { data: updated, error } = await supabase.from('books').update(row).eq('id', id).select().single()
    if (error) {
      console.error('Failed to update book:', error)
      return
    }
    const mapped = mapBook(updated)
    setBooks(prev => prev.map(b => b.id === id ? mapped : b))
  }, [])

  const deleteBook = useCallback(async (id) => {
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete book:', error)
      return
    }
    setBooks(prev => prev.filter(b => b.id !== id))
  }, [])

  const getBookById = useCallback((id) => {
    return books.find(b => b.id === id) || null
  }, [books])

  // Category CRUD
  const addCategory = useCallback(async (data) => {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const row = { name: data.name, slug, description: data.description || '' }
    const { data: inserted, error } = await supabase.from('categories').insert(row).select().single()
    if (error) {
      console.error('Failed to add category:', error)
      return null
    }
    const newCat = mapCategory(inserted)
    setCategories(prev => [...prev, newCat])
    return newCat
  }, [])

  const updateCategory = useCallback(async (id, data) => {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const row = { name: data.name, slug, description: data.description || '' }
    const { data: updated, error } = await supabase.from('categories').update(row).eq('id', id).select().single()
    if (error) {
      console.error('Failed to update category:', error)
      return
    }
    const mapped = mapCategory(updated)
    setCategories(prev => prev.map(c => c.id === id ? mapped : c))
  }, [])

  const deleteCategory = useCallback(async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete category:', error)
      alert('Cannot delete this category — it may still have books assigned to it.')
      return
    }
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  const getCategoryName = useCallback((categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized'
  }, [categories])

  return (
    <DataContext.Provider value={{
      books, categories, loading,
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
