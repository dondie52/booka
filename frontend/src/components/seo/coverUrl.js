const GOOGLE_BOOKS_IDS = {
  '9781529146516': 'YmHXzwEACAAJ',
  '9781443461771': 'VK0N0AEACAAJ',
  '9781529345414': 'DYVhzQEACAAJ',
  '9781988171968': 'HhOgzwEACAAJ',
}

/**
 * Returns the best available cover image URL for a book,
 * using the same priority as BookCover: custom → OpenLibrary → Google Books.
 */
export function getBookCoverUrl(book) {
  if (book.coverImage) return book.coverImage

  if (book.isbn) {
    const clean = book.isbn.replace(/-/g, '')
    const olUrl = `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`

    const googleId = GOOGLE_BOOKS_IDS[clean]
    // Prefer OpenLibrary; Google Books is a backup but we can't check at render time
    return olUrl || (googleId
      ? `https://books.google.com/books/content?id=${googleId}&printsec=frontcover&img=1&zoom=1`
      : null)
  }

  return null
}
