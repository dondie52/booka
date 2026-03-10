import { Link } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import BookCard from '../../components/books/BookCard'
import BookCover from '../../components/ui/BookCover'

export default function HomePage() {
  const { books, categories } = useData()

  const featuredBooks = books.filter(b => b.featured)
  const heroBooks = featuredBooks.slice(0, 4)
  const newArrivals = [...books].sort((a, b) => (b.publishedYear || 0) - (a.publishedYear || 0)).slice(0, 8)
  const bestSellers = featuredBooks.slice(0, 8)
  const affordable = [...books].filter(b => b.stock > 0).sort((a, b) => a.price - b.price).slice(0, 4)

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-cream">
        <div className="container-page py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-brand-gold mb-4">
                Gaborone's Independent Bookstore
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[3.25rem] text-brand-dark leading-[1.15]">
                Stories that stay<br className="hidden sm:block" /> with you
              </h1>
              <p className="text-brand-text-light text-base sm:text-lg mt-5 leading-relaxed max-w-lg">
                Self-help, business, fiction, and more — thoughtfully stocked for every reader.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Link to="/shop" className="btn-primary">Browse Collection</Link>
                <Link to="/shop?category=cat-5" className="btn-secondary">Self-Help</Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-xs text-brand-text-light font-sans">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Secure Checkout
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25V3.375c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v10.875M3.375 14.25h17.25" />
                  </svg>
                  Free Pickup in Store
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  WhatsApp Support
                </span>
              </div>
            </div>

            {/* Book cover showcase */}
            <div className="hidden lg:grid grid-cols-4 gap-3 items-end">
              {heroBooks.map((book, i) => (
                <Link
                  key={book.id}
                  to={`/book/${book.id}`}
                  className="block hover:scale-[1.03] transition-transform duration-300"
                  style={{ marginTop: i % 2 === 0 ? '0' : '28px' }}
                >
                  <BookCover title={book.title} author={book.author} color={book.coverColor} isbn={book.isbn} coverImage={book.coverImage} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Staff Picks / Best Sellers */}
      <section className="container-page py-16 sm:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-brand-gold mb-1.5">Curated for You</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Staff Picks</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-brand-gold hover:text-brand-gold-dark transition-colors hidden sm:block">
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {bestSellers.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link to="/shop" className="text-sm font-medium text-brand-gold">View All &rarr;</Link>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="bg-brand-cream/40">
        <div className="container-page py-16 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Browse by Category</h2>
            <p className="text-sm text-brand-text-light mt-2">Find your next read by genre</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map(cat => {
              const count = books.filter(b => b.categoryId === cat.id).length
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  className="bg-white rounded-xl p-5 sm:p-6 border border-brand-border/50 hover:border-brand-gold/40 hover:shadow-md transition-all duration-200 group"
                >
                  <h3 className="font-serif text-base sm:text-lg text-brand-dark group-hover:text-brand-gold transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-brand-text-light mt-1.5 font-sans">
                    {count} {count === 1 ? 'book' : 'books'}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-page py-16 sm:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-brand-gold mb-1.5">Latest Titles</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">New Arrivals</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-brand-gold hover:text-brand-gold-dark transition-colors hidden sm:block">
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {newArrivals.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Budget-Friendly */}
      <section className="bg-brand-cream/40">
        <div className="container-page py-16 sm:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-brand-gold mb-1.5">Great Value</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Under P100</h2>
            </div>
            <Link to="/shop" className="text-sm font-medium text-brand-gold hover:text-brand-gold-dark transition-colors hidden sm:block">
              Shop All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {affordable.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
