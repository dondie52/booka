import BookCard from './BookCard'

export default function BookGrid({ books }) {
  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-text-light font-sans">No books found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
