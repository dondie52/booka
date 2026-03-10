import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import BookGrid from '../../components/books/BookGrid'

export default function ShopPage() {
  const { books, categories } = useData()
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState('')
  const selectedCategory = searchParams.get('category') || ''
  const [sortBy, setSortBy] = useState('name-asc')

  const filtered = useMemo(() => {
    let result = [...books]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      )
    }

    if (selectedCategory) {
      result = result.filter(b => b.categoryId === selectedCategory)
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      default:
        result.sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [books, search, selectedCategory, sortBy])

  function handleCategoryChange(catId) {
    if (catId) {
      setSearchParams({ category: catId })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-brand-dark">All Books</h1>
        <p className="text-brand-text-light text-sm mt-1.5">
          Showing {filtered.length} of {books.length} {books.length === 1 ? 'book' : 'books'}
        </p>
      </div>

      {/* Filters bar */}
      <div className="bg-brand-cream/40 border border-brand-border/40 rounded-xl p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={e => handleCategoryChange(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="name-asc">Name: A &rarr; Z</option>
            <option value="name-desc">Name: Z &rarr; A</option>
            <option value="price-asc">Price: Low &rarr; High</option>
            <option value="price-desc">Price: High &rarr; Low</option>
          </select>
        </div>
      </div>

      {/* Active filter chip */}
      {selectedCategory && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xs text-brand-text-light">Filtered by:</span>
          <button
            onClick={() => handleCategoryChange('')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-cream rounded-full text-xs font-medium text-brand-dark hover:bg-brand-gold/10 transition-colors"
          >
            {categories.find(c => c.id === selectedCategory)?.name}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Grid */}
      <BookGrid books={filtered} />
    </div>
  )
}
