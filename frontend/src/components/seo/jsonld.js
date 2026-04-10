const SITE_URL = 'https://bookhavenbw.shop'

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BookHeaven',
    url: SITE_URL,
    logo: `${SITE_URL}/icon-192.png`,
    description:
      "Botswana's online bookstore. Buy books online with delivery across Botswana or free in-store pickup in Gaborone.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gaborone',
      addressCountry: 'BW',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+267-76-984-827',
      contactType: 'customer service',
    },
    // TODO: Fill in your social media profile URLs
    sameAs: [
      // 'https://www.facebook.com/YOUR_PAGE',
      // 'https://www.instagram.com/YOUR_HANDLE',
      // 'https://twitter.com/YOUR_HANDLE',
    ],
  }
}

export function buildProductSchema(book, imageUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: book.title,
    author: { '@type': 'Person', name: book.author },
    description: book.description,
    image: imageUrl || undefined,
    ...(book.isbn ? { isbn: book.isbn } : {}),
    offers: {
      '@type': 'Offer',
      price: book.price.toFixed(2),
      priceCurrency: 'BWP',
      availability:
        book.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'BookHeaven' },
      url: `${SITE_URL}/book/${book.id}`,
    },
  }
}

export function buildCollectionPageSchema(name, description, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${SITE_URL}${url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'BookHeaven',
      url: SITE_URL,
    },
  }
}
