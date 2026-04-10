import { useState } from 'react'

const OL_SUFFIX = { sm: 'S', md: 'M', lg: 'L' }

function getOpenLibraryCover(isbn, size = 'md') {
  if (!isbn) return null
  const clean = isbn.replace(/-/g, '')
  const suffix = OL_SUFFIX[size] || 'M'
  return `https://covers.openlibrary.org/b/isbn/${clean}-${suffix}.jpg`
}

// Google Books ID lookup for books missing from OpenLibrary
const GOOGLE_BOOKS_IDS = {
  '9781529146516': 'YmHXzwEACAAJ',  // The Diary of a CEO
  '9781443461771': 'VK0N0AEACAAJ',  // The Wealth Money Can't Buy
  '9781529345414': 'DYVhzQEACAAJ',  // Happy Sexy Millionaire
  '9781988171968': 'HhOgzwEACAAJ',  // The Pivot Year
}

function getGoogleBooksCover(isbn) {
  if (!isbn) return null
  const clean = isbn.replace(/-/g, '')
  const id = GOOGLE_BOOKS_IDS[clean]
  if (!id) return null
  return `https://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=1`
}

const DIMENSIONS = { sm: { w: 128, h: 192 }, md: { w: 200, h: 300 }, lg: { w: 320, h: 480 } }

export default function BookCover({ title, author, color = '#2C2C2C', isbn, coverImage, className = '', size = 'md', priority = false }) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const dims = DIMENSIONS[size] || DIMENSIONS.md

  // Priority: custom coverImage → OpenLibrary → Google Books → color fallback
  const sources = [
    coverImage,
    getOpenLibraryCover(isbn, size),
    getGoogleBooksCover(isbn),
  ].filter(Boolean)

  const coverUrl = sources[sourceIndex]
  const showImage = coverUrl && sourceIndex < sources.length

  return (
    <div
      className={`relative rounded-sm overflow-hidden ${className}`}
      style={{ aspectRatio: '2/3' }}
    >
      {showImage ? (
        <>
          {/* Skeleton pulse while loading */}
          {loading && (
            <div className="absolute inset-0 animate-pulse bg-brand-border/30 rounded-sm" />
          )}
          <img
            src={coverUrl}
            alt={`Cover of ${title} by ${author}`}
            width={dims.w}
            height={dims.h}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => { setSourceIndex(i => i + 1); setLoading(true) }}
            onLoad={e => {
              if (e.target.naturalWidth < 10) { setSourceIndex(i => i + 1); setLoading(true); return }
              setLoading(false)
            }}
            loading={priority ? undefined : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
          />
          {/* Spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/30 to-transparent" />
          {/* Subtle page edge on right */}
          <div className="absolute right-0 top-1 bottom-1 w-px bg-white/20" />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5"
            style={{ backgroundColor: color }}
          >
            {/* Decorative top accent */}
            <div className="absolute top-4 left-4 right-4 h-px bg-white/20" />
            <div className="absolute top-6 left-4 right-4 h-px bg-white/10" />

            <div className="relative z-10">
              <h3 className="font-serif text-white text-sm sm:text-base leading-snug line-clamp-3 drop-shadow-sm">
                {title}
              </h3>
              <p className="text-white/70 text-[11px] sm:text-xs mt-1.5 font-sans">
                {author}
              </p>
            </div>
          </div>
          {/* Spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20 rounded-l-sm" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5 rounded-sm" />
        </>
      )}
    </div>
  )
}
