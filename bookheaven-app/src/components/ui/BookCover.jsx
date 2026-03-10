import { useState } from 'react'

function getOpenLibraryCover(isbn) {
  if (!isbn) return null
  const clean = isbn.replace(/-/g, '')
  return `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`
}

export default function BookCover({ title, author, color = '#2C2C2C', isbn, coverImage, className = '' }) {
  const [imgFailed, setImgFailed] = useState(false)
  // Priority: custom coverImage → OpenLibrary via ISBN → color fallback
  const coverUrl = coverImage || getOpenLibraryCover(isbn)
  const showImage = coverUrl && !imgFailed

  return (
    <div
      className={`relative rounded-sm overflow-hidden ${className}`}
      style={{ aspectRatio: '2/3' }}
    >
      {showImage ? (
        <>
          <img
            src={coverUrl}
            alt={`${title} by ${author}`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
            onLoad={e => {
              if (e.target.naturalWidth < 10) setImgFailed(true)
            }}
            loading="lazy"
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
