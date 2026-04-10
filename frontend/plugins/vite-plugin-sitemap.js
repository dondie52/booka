import { readFileSync, writeFileSync } from 'fs'
import { loadEnv } from 'vite'
import path from 'path'

const SITE_URL = 'https://bookhavenbw.shop'

function buildUrl(loc, priority, changefreq, today) {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

/**
 * Fetches books and categories from Supabase REST API at build time
 * to generate sitemap.xml with real UUIDs.
 */
async function fetchFromSupabase(supabaseUrl, anonKey) {
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  }

  const [booksRes, catsRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/books?select=id,status&status=eq.active`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/categories?select=id&order=display_order`, { headers }),
  ])

  if (!booksRes.ok) throw new Error(`Failed to fetch books: ${booksRes.statusText}`)
  if (!catsRes.ok) throw new Error(`Failed to fetch categories: ${catsRes.statusText}`)

  const books = await booksRes.json()
  const categories = await catsRes.json()

  return { books, categories }
}

export function sitemapPlugin() {
  return {
    name: 'generate-sitemap',
    async closeBundle() {
      const today = new Date().toISOString().split('T')[0]

      // Load VITE_ env vars from .env files + process.env
      const env = {
        ...loadEnv('production', process.cwd(), 'VITE_'),
        ...process.env,
      }
      const supabaseUrl = env.VITE_SUPABASE_URL
      const anonKey = env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !anonKey) {
        console.warn('[sitemap] Missing Supabase env vars — generating static-only sitemap')
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${buildUrl('/', '1.0', 'daily', today)}
${buildUrl('/shop', '0.9', 'daily', today)}
${buildUrl('/contact', '0.5', 'monthly', today)}
</urlset>`
        writeFileSync(path.resolve('dist/sitemap.xml'), xml)
        console.log('[sitemap] Generated 3 static URLs (no Supabase connection)')
        return
      }

      try {
        const { books, categories } = await fetchFromSupabase(supabaseUrl, anonKey)

        const urls = [
          buildUrl('/', '1.0', 'daily', today),
          buildUrl('/shop', '0.9', 'daily', today),
          buildUrl('/contact', '0.5', 'monthly', today),
          ...categories.map(c =>
            buildUrl(`/shop?category=${c.id}`, '0.8', 'weekly', today)
          ),
          ...books.map(b =>
            buildUrl(`/book/${b.id}`, '0.7', 'weekly', today)
          ),
        ]

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

        writeFileSync(path.resolve('dist/sitemap.xml'), xml)
        console.log(`[sitemap] Generated ${urls.length} URLs from Supabase`)
      } catch (err) {
        console.error('[sitemap] Error fetching from Supabase:', err.message)
        // Fallback: static pages only
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${buildUrl('/', '1.0', 'daily', today)}
${buildUrl('/shop', '0.9', 'daily', today)}
${buildUrl('/contact', '0.5', 'monthly', today)}
</urlset>`
        writeFileSync(path.resolve('dist/sitemap.xml'), xml)
        console.log('[sitemap] Generated 3 static URLs (fallback)')
      }
    },
  }
}
