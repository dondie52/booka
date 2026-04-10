import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { useCart } from '../../contexts/CartContext'
import BookCover from '../../components/ui/BookCover'
import SEOHead from '../../components/seo/SEOHead'
import { buildProductSchema } from '../../components/seo/jsonld'
import { getBookCoverUrl } from '../../components/seo/coverUrl'

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getBookById, getCategoryName } = useData()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const book = getBookById(id)
  if (!book) {
    return (
      <div className="container-page py-20 text-center">
        <SEOHead title="Book Not Found" path={`/book/${id}`} noindex />
        <h2 className="font-serif text-2xl text-brand-dark mb-3">Book not found</h2>
        <Link to="/shop" className="text-sm text-brand-gold hover:text-brand-gold-dark">
          &larr; Back to shop
        </Link>
      </div>
    )
  }

  const inStock = book.stock > 0
  const coverImageUrl = getBookCoverUrl(book)

  function handleAddToCart() {
    addItem(book, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <SEOHead
        title={`${book.title} by ${book.author}`}
        description={book.description}
        path={`/book/${book.id}`}
        type="product"
        image={coverImageUrl}
        jsonLd={buildProductSchema(book, coverImageUrl)}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-brand-text-light mb-8 font-sans">
        <Link to="/shop" className="hover:text-brand-gold transition-colors">Shop</Link>
        <span className="text-brand-border">/</span>
        <Link to={`/shop?category=${book.categoryId}`} className="hover:text-brand-gold transition-colors">
          {getCategoryName(book.categoryId)}
        </Link>
        <span className="text-brand-border">/</span>
        <span className="text-brand-text truncate max-w-[200px]">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Cover */}
        <div className="flex justify-center">
          <div className="w-full max-w-xs sm:max-w-sm">
            <BookCover title={book.title} author={book.author} color={book.coverColor} isbn={book.isbn} coverImage={book.coverImage} size="lg" priority />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-xs text-brand-gold font-sans font-semibold uppercase tracking-[0.2em] mb-2">
            {getCategoryName(book.categoryId)}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-dark leading-tight">
            {book.title}
          </h1>
          <p className="text-brand-text-light mt-1.5 font-sans text-base">by {book.author}</p>

          {/* Price & stock */}
          <div className="flex items-baseline gap-4 mt-6 pb-6 border-b border-brand-border/50">
            <span className="text-3xl font-sans font-bold text-brand-dark">
              P{book.price.toFixed(2)}
            </span>
            <span className={`text-sm font-sans font-medium px-2.5 py-1 rounded-full ${
              inStock
                ? 'bg-brand-success-light text-brand-success'
                : 'bg-brand-error-light text-brand-error'
            }`}>
              {inStock ? `In Stock (${book.stock})` : 'Out of Stock'}
            </span>
          </div>

          {/* Description */}
          <p className="text-brand-text-light text-sm leading-relaxed mt-6">
            {book.description}
          </p>

          {/* Meta info */}
          {(book.isbn || book.publishedYear) && (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-brand-text-light font-sans">
              {book.isbn && <p>ISBN: <span className="text-brand-text">{book.isbn}</span></p>}
              {book.publishedYear && <p>Published: <span className="text-brand-text">{book.publishedYear}</span></p>}
            </div>
          )}

          {/* Add to Cart */}
          {inStock ? (
            <div className="mt-8 pt-6 border-t border-brand-border/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center border border-brand-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3.5 py-3 text-brand-text hover:bg-brand-cream transition-colors font-sans"
                  >
                    &minus;
                  </button>
                  <span className="px-5 py-3 text-sm font-medium min-w-[48px] text-center border-x border-brand-border font-sans">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(book.stock, q + 1))}
                    className="px-3.5 py-3 text-brand-text hover:bg-brand-cream transition-colors font-sans"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`btn-primary w-full sm:w-auto sm:min-w-[180px] ${added ? 'bg-brand-success hover:bg-brand-success' : ''}`}
                >
                  {added ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Added to Cart
                    </span>
                  ) : 'Add to Cart'}
                </button>
              </div>

              {added && (
                <button
                  onClick={() => navigate('/cart')}
                  className="mt-3 text-sm text-brand-gold hover:text-brand-gold-dark font-medium transition-colors"
                >
                  View Cart &rarr;
                </button>
              )}
            </div>
          ) : (
            <div className="mt-8 pt-6 border-t border-brand-border/50">
              <p className="text-sm text-brand-error font-sans">
                This book is currently out of stock. <Link to="/contact" className="text-brand-gold hover:text-brand-gold-dark transition-colors">Contact us</Link> to be notified when it's back.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
