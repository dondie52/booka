import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import Modal from '../../components/ui/Modal'

export default function ManageCategoriesPage() {
  const { categories, books, addCategory, updateCategory, deleteCategory } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  function openAdd() {
    setEditing(null)
    setForm({ name: '', description: '' })
    setModalOpen(true)
  }

  function openEdit(cat) {
    setEditing(cat.id)
    setForm({ name: cat.name, description: cat.description || '' })
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (editing) {
      updateCategory(editing, form)
    } else {
      addCategory(form)
    }
    setModalOpen(false)
  }

  function handleDelete(id) {
    const bookCount = books.filter(b => b.categoryId === id).length
    const msg = bookCount > 0
      ? `This category has ${bookCount} book(s). Are you sure you want to delete it?`
      : 'Are you sure you want to delete this category?'
    if (window.confirm(msg)) {
      deleteCategory(id)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl text-brand-dark">Manage Categories</h1>
        <button onClick={openAdd} className="btn-primary btn-sm">+ Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const bookCount = books.filter(b => b.categoryId === cat.id).length
          return (
            <div key={cat.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-base text-brand-dark">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-xs text-brand-text-light mt-1">{cat.description}</p>
                  )}
                  <p className="text-xs text-brand-text-light mt-2 font-sans">
                    {bookCount} {bookCount === 1 ? 'book' : 'books'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(cat)} className="text-xs text-brand-gold hover:text-brand-gold-dark font-medium">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-xs text-brand-error hover:opacity-70 font-medium">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {categories.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-brand-text-light text-sm">No categories.</p>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Category Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-text-light mb-1 font-sans">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field h-20 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" className="btn-primary btn-sm">{editing ? 'Save Changes' : 'Add Category'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
