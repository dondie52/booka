import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import Modal from '../../components/ui/Modal'
import BookCover from '../../components/ui/BookCover'

const emptyBook = {
  title: '', author: '', price: '', description: '', categoryId: '', coverColor: '#2C2C2C', coverImage: '', stock: '', isbn: '', publishedYear: '', featured: false, needsVerification: false, verificationNotes: '',
}

export default function ManageBooksPage() {
  const { books, categories, addBook, updateBook, deleteBook, getCategoryName } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyBook)
  const [search, setSearch] = useState('')
  const [filterVerification, setFilterVerification] = useState(false)

  const filtered = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = !filterVerification || b.needsVerification
    return matchesSearch && matchesFilter
  })

  const verificationCount = books.filter(b => b.needsVerification).length

  function openAdd() {
    setEditing(null)
    setForm(emptyBook)
    setModalOpen(true)
  }

  function openEdit(book) {
    setEditing(book.id)
    setForm({
      title: book.title,
      author: book.author,
      price: String(book.price),
      description: book.description,
      categoryId: book.categoryId,
      coverColor: book.coverColor || '#2C2C2C',
      coverImage: book.coverImage || '',
      stock: String(book.stock),
      isbn: book.isbn || '',
      publishedYear: book.publishedYear ? String(book.publishedYear) : '',
      featured: book.featured || false,
      needsVerification: book.needsVerification || false,
      verificationNotes: book.verificationNotes || '',
    })
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const data = {
      ...form,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      publishedYear: form.publishedYear ? parseInt(form.publishedYear) : null,
    }

    if (editing) {
      updateBook(editing, data)
    } else {
      addBook(data)
    }
    setModalOpen(false)
  }

  function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this book?')) {
      deleteBook(id)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl text-brand-dark">Manage Books</h1>
        <button onClick={openAdd} className="btn-primary btn-sm">
          + Add Book
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field max-w-sm"
        />
        {verificationCount > 0 && (
          <button
            onClick={() => setFilterVerification(v => !v)}
            className={`text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
              filterVerification
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'border-brand-border text-brand-text-light hover:border-amber-300'
            }`}
          >
            Needs review ({verificationCount})
          </button>
        )}
      </div>

      {/* Books table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border/40 bg-brand-bg-alt/50">
                <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Book</th>
                <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider hidden md:table-cell">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-sans font-medium text-brand-text-light uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(book => (
                <tr key={book.id} className="border-b border-brand-border/20 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-12 shrink-0 rounded-sm overflow-hidden">
                        <BookCover title="" author="" color={book.coverColor} isbn={book.isbn} coverImage={book.coverImage} size="sm" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-brand-dark truncate">{book.title}</p>
                          {book.needsVerification && (
                            <span className="shrink-0 inline-block w-2 h-2 rounded-full bg-amber-400" title="Needs verification" />
                          )}
                        </div>
                        <p className="text-xs text-brand-text-light">{book.author}</p>
                        {book.needsVerification && book.verificationNotes && (
                          <p className="text-[10px] text-amber-600 mt-0.5 truncate max-w-[220px]">{book.verificationNotes}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-text-light text-xs hidden sm:table-cell">{getCategoryName(book.categoryId)}</td>
                  <td className="px-4 py-3 font-medium">P{book.price.toFixed(2)}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={book.stock > 0 ? 'text-brand-success' : 'text-brand-error'}>
                      {book.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(book)} className="text-xs text-brand-gold hover:text-brand-gold-dark font-medium">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(book.id)} className="text-xs text-brand-error hover:opacity-70 font-medium">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-5 text-sm text-brand-text-light text-center">No books found.</p>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Book' : 'Add New Book'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Author *</label>
            <input type="text" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Price (BWP) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Stock *</label>
              <input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Category</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="input-field">
              <option value="">Select category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field h-20 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Cover Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.coverColor} onChange={e => setForm(f => ({ ...f, coverColor: e.target.value }))} className="w-10 h-10 rounded border border-brand-border cursor-pointer" />
                <span className="text-xs text-brand-text-light font-mono">{form.coverColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">ISBN</label>
              <input type="text" value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Cover Image URL</label>
            <input type="text" value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className="input-field" placeholder="Optional — overrides ISBN cover" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Published Year</label>
              <input type="number" value={form.publishedYear} onChange={e => setForm(f => ({ ...f, publishedYear: e.target.value }))} className="input-field" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-3">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-brand-gold w-4 h-4" />
                <span className="text-sm font-sans text-brand-dark">Featured book</span>
              </label>
            </div>
          </div>

          {/* Verification section */}
          <div className="border-t border-brand-border/40 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.needsVerification} onChange={e => setForm(f => ({ ...f, needsVerification: e.target.checked }))} className="accent-amber-500 w-4 h-4" />
              <span className="text-sm font-sans text-amber-700">Needs verification</span>
            </label>
            {form.needsVerification && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-amber-600 mb-1 font-sans">Verification notes</label>
                <textarea value={form.verificationNotes} onChange={e => setForm(f => ({ ...f, verificationNotes: e.target.value }))} className="input-field h-16 resize-none text-xs border-amber-200 focus:border-amber-400" placeholder="What needs to be confirmed?" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" className="btn-primary btn-sm">{editing ? 'Save Changes' : 'Add Book'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
