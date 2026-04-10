const SITE_URL = 'https://bookhavenbw.shop'

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BookHeaven',
    alternateName: 'BookHavenBW',
    url: SITE_URL,
    logo: `${SITE_URL}/icon-192.png`,
    description:
      "Botswana's online bookstore. Buy books with fast delivery across Botswana.",
    areaServed: 'BW',
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
    ],
  }
}

export function buildBookSchema(book, imageUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
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
      url: `${SITE_URL}/book/${book.id}`,
      seller: { '@type': 'Organization', name: 'BookHeaven' },
    },
  }
}

export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: `${SITE_URL}${item.url}` } : {}),
    })),
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
