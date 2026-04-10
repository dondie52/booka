import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

const SITE_URL = 'https://bookhavenbw.shop'

/**
 * Extracts book entries from books.js using regex.
 * Returns array of { id, needsVerification } objects.
 */
function parseBooks(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const books = []
  // Match each object block with id and needsVerification fields
  const idRegex = /id:\s*'([^']+)'/g
  const verifyRegex = /needsVerification:\s*(true|false)/g

  const ids = [...content.matchAll(idRegex)].map(m => m[1])
  const verifications = [...content.matchAll(verifyRegex)].map(m => m[1] === 'true')

  for (let i = 0; i < ids.length; i++) {
    books.push({
      id: ids[i],
      needsVerification: verifications[i] ?? false,
    })
  }
  return books
}

/**
 * Extracts category IDs from categories.js using regex.
 */
function parseCategories(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const idRegex = /id:\s*'([^']+)'/g
  return [...content.matchAll(idRegex)].map(m => m[1])
}

function buildUrl(loc, priority, changefreq, today) {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export function sitemapPlugin() {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      const today = new Date().toISOString().split('T')[0]

      const books = parseBooks(path.resolve('src/data/books.js'))
      const categoryIds = parseCategories(path.resolve('src/data/categories.js'))

      const urls = [
        buildUrl('/', '1.0', 'daily', today),
        buildUrl('/shop', '0.9', 'daily', today),
        buildUrl('/contact', '0.5', 'monthly', today),
        ...categoryIds.map(id =>
          buildUrl(`/shop?category=${id}`, '0.8', 'weekly', today)
        ),
        ...books
          .filter(b => !b.needsVerification)
          .map(b => buildUrl(`/book/${b.id}`, '0.7', 'weekly', today)),
      ]

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

      writeFileSync(path.resolve('dist/sitemap.xml'), xml)
      console.log(`[sitemap] Generated ${urls.length} URLs`)
    },
  }
}
