import { Link } from 'react-router-dom'
import BookCover from '../ui/BookCover'
import { useData } from '../../contexts/DataContext'

export default function BookCard({ book }) {
  const { getCategoryName } = useData()
  const inStock = book.stock > 0

  return (
    <Link
      to={`/book/${book.id}`}
      className="card group hover:shadow-lg hover:shadow-brand-dark/[0.04] transition-all duration-300"
    >
      <div className="p-3 pb-0">
        <BookCover
          title={book.title}
          author={book.author}
          color={book.coverColor}
          isbn={book.isbn}
          coverImage={book.coverImage}
          className="group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>
      <div className="p-4 pt-3">
        <p className="text-[11px] text-brand-text-light font-sans uppercase tracking-wider mb-1.5">
          {getCategoryName(book.categoryId)}
        </p>
        <h3 className="font-serif text-[15px] text-brand-dark leading-snug line-clamp-2 min-h-[2.5em]">
          {book.title}
        </h3>
        <p className="text-xs text-brand-text-light mt-1 line-clamp-1">{book.author}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border/40">
          <span className="font-sans font-bold text-brand-dark text-[15px]">
            P{book.price.toFixed(2)}
          </span>
          <span className={`text-[11px] font-sans font-medium ${inStock ? 'text-brand-success' : 'text-brand-error'}`}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </Link>
  )
}
