# BookHeaven Database Architecture

## Schema Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  auth.users  │     │  categories  │     │   payments   │
│  (Supabase)  │     │              │     │              │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │ 1:1                │ 1:N                │ N:1
       ▼                    ▼                    │
┌──────────────┐     ┌──────────────┐            │
│   profiles   │     │    books     │            │
│              │     │              │            │
└──────┬───────┘     └──────┬───────┘            │
       │ 1:N                │ N:1                │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    orders    │────▶│ order_items  │     │    orders    │
│              │ 1:N │              │     │  (linked)    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Table Details

### 1. `profiles` — User accounts

Extends Supabase's built-in `auth.users`. Every signup automatically creates a profile row via trigger.

| Column      | Type        | Notes                              |
|-------------|-------------|------------------------------------|
| id          | UUID (PK)   | References auth.users(id)          |
| full_name   | TEXT        | Display name                       |
| email       | TEXT        | Unique, matches auth email         |
| phone       | TEXT        | Optional, for order contact        |
| role        | user_role   | 'customer' (default) or 'admin'    |
| created_at  | TIMESTAMPTZ | Auto-set                           |
| updated_at  | TIMESTAMPTZ | Auto-updated via trigger           |

**Why it exists:** Supabase Auth handles authentication (passwords, sessions, tokens). This table stores app-specific profile data and the role used for access control. Keeping role here (not in auth metadata) makes RLS policies simpler and more secure.

---

### 2. `categories` — Book categories

| Column        | Type    | Notes                                 |
|---------------|---------|---------------------------------------|
| id            | UUID (PK) | Auto-generated                     |
| name          | TEXT    | Unique, e.g. "Fiction"                |
| slug          | TEXT    | Unique, URL-safe, e.g. "fiction"      |
| description   | TEXT    | Short description for UI              |
| is_active     | BOOLEAN | Soft-delete / hide from storefront    |
| display_order | INTEGER | Controls sort order on frontend       |
| created_at    | TIMESTAMPTZ | Auto-set                         |
| updated_at    | TIMESTAMPTZ | Auto-updated                     |

**Why it exists:** Categories are a first-class entity that books reference. The slug enables clean URLs (`/shop/self-help`). `is_active` lets admins hide categories without deleting them (and breaking book references). `display_order` controls the category filter sort on the shop page.

---

### 3. `books` — Book catalog

| Column            | Type        | Notes                                      |
|-------------------|-------------|----------------------------------------------|
| id                | UUID (PK)   | Auto-generated                              |
| title             | TEXT        | Required                                     |
| author            | TEXT        | Required                                     |
| description       | TEXT        | For book detail page                         |
| price             | NUMERIC(10,2) | BWP, must be >= 0                         |
| stock_quantity    | INTEGER     | Current stock, must be >= 0                  |
| category_id       | UUID (FK)   | References categories, RESTRICT on delete    |
| cover_image_url   | TEXT        | URL to cover image                           |
| cover_color       | TEXT        | Hex fallback color for BookCover component   |
| isbn              | TEXT        | For OpenLibrary cover lookup                 |
| published_year    | INTEGER     | Nullable                                     |
| is_featured       | BOOLEAN     | Show on homepage                             |
| status            | book_status | active / draft / out_of_stock / needs_verification |
| verification_notes| TEXT        | Admin notes for unverified books             |
| created_at        | TIMESTAMPTZ | Auto-set                                    |
| updated_at        | TIMESTAMPTZ | Auto-updated                                |

**Why it exists:** Core product table. The `status` enum replaces the old `needsVerification` boolean with a richer lifecycle. `cover_color` is preserved for the existing BookCover component's fallback rendering. `ON DELETE RESTRICT` on category prevents orphaned books.

**Key indexes:**
- `idx_books_category` — filter by category
- `idx_books_featured` — partial index for homepage query
- `idx_books_search` — GIN index for full-text search on title + author

---

### 4. `orders` — Customer orders

| Column           | Type          | Notes                                    |
|------------------|---------------|------------------------------------------|
| id               | UUID (PK)     | Internal ID                              |
| order_number     | TEXT          | Human-readable: BH-20260311-0001         |
| customer_id      | UUID (FK)     | References profiles, SET NULL on delete   |
| customer_name    | TEXT          | Snapshot at order time                   |
| customer_email   | TEXT          | Snapshot at order time                   |
| customer_phone   | TEXT          | Snapshot at order time                   |
| subtotal         | NUMERIC(10,2) | Sum of line totals                      |
| delivery_fee     | NUMERIC(10,2) | P35 for delivery, P0 for pickup         |
| total            | NUMERIC(10,2) | subtotal + delivery_fee                 |
| delivery_method  | delivery_method | 'delivery' or 'pickup'               |
| delivery_address | TEXT          | Required if delivery                     |
| order_status     | order_status  | pending → confirmed → processing → completed |
| payment_method   | payment_method | card / mobile_money / etc.            |
| payment_status   | payment_status | pending / completed / failed / refunded |
| notes            | TEXT          | Admin notes                              |
| created_at       | TIMESTAMPTZ   | Auto-set                                |
| updated_at       | TIMESTAMPTZ   | Auto-updated                            |

**Why it exists:** Tracks the full order lifecycle. Customer details are snapshotted (not just referenced) because the customer might update their profile later, but the order record should preserve who placed it and where it was shipped. The `order_number` trigger auto-generates a readable ID like `BH-20260311-0001`.

**Design decision — `customer_id` uses SET NULL:** If a customer deletes their account, the order history is preserved for bookkeeping but the link is severed. This is standard for ecommerce.

---

### 5. `order_items` — Line items within an order

| Column      | Type          | Notes                                   |
|-------------|---------------|-----------------------------------------|
| id          | UUID (PK)     | Auto-generated                          |
| order_id    | UUID (FK)     | References orders, CASCADE on delete     |
| book_id     | UUID (FK)     | References books, SET NULL on delete     |
| book_title  | TEXT          | Snapshot — preserved if book is deleted   |
| book_author | TEXT          | Snapshot                                 |
| quantity    | INTEGER       | Must be > 0                              |
| unit_price  | NUMERIC(10,2) | Price at time of purchase               |
| line_total  | NUMERIC(10,2) | quantity * unit_price                   |
| created_at  | TIMESTAMPTZ   | Auto-set                                |

**Why it exists:** An order can contain multiple books. Snapshot fields (title, author, price) ensure order history remains accurate even if the book is later updated or removed from the catalog.

---

### 6. `payments` — Payment records

| Column                  | Type          | Notes                                |
|-------------------------|---------------|--------------------------------------|
| id                      | UUID (PK)     | Auto-generated                      |
| order_id                | UUID (FK)     | References orders                    |
| payment_reference       | TEXT          | Internal ref (unique)                |
| payment_provider        | TEXT          | 'stripe', 'paypal', 'orange_money', 'manual' |
| payment_method          | payment_method | Method used                        |
| amount                  | NUMERIC(10,2) | Must be > 0                        |
| status                  | payment_status | pending / completed / failed / refunded |
| provider_transaction_id | TEXT          | ID from Stripe/PayPal/etc.           |
| metadata                | JSONB         | Flexible store for provider-specific data |
| created_at              | TIMESTAMPTZ   | Auto-set                            |
| updated_at              | TIMESTAMPTZ   | Auto-updated                        |

**Why it exists:** Separating payments from orders enables multiple payment attempts per order (retries, partial refunds). The `payment_provider` is a TEXT field (not enum) to accommodate new providers like Orange Money or local Botswana methods without a migration. The `metadata` JSONB field stores provider-specific response data (Stripe charge IDs, webhook payloads, etc.) without schema changes.

---

## Enum Types

| Enum             | Values                                                     |
|------------------|-------------------------------------------------------------|
| user_role        | customer, admin                                             |
| book_status      | active, draft, out_of_stock, needs_verification             |
| order_status     | pending, confirmed, processing, completed, cancelled         |
| payment_status   | pending, completed, failed, refunded                        |
| payment_method   | card, mobile_money, cash_on_delivery, bank_transfer          |
| delivery_method  | delivery, pickup                                            |

---

## Row-Level Security Summary

| Table       | Anonymous      | Customer (authenticated)       | Admin               |
|-------------|----------------|--------------------------------|----------------------|
| profiles    | No access      | Read/update own profile only   | Read/update all      |
| categories  | Read active    | Read active                    | Full CRUD            |
| books       | Read active    | Read active                    | Full CRUD            |
| orders      | No access      | Read/create own orders         | Full CRUD            |
| order_items | No access      | Read/create for own orders     | Full CRUD            |
| payments    | No access      | Read for own orders            | Full CRUD            |

**Key policy:** Users cannot change their own `role` — the UPDATE policy on profiles checks that the role matches the existing value.

---

## MVP vs Future Tables

### MVP (included now)
All 6 tables above are MVP-essential. This is the minimum to run a real bookstore:
- `profiles` — auth
- `categories` — organize catalog
- `books` — the product
- `orders` + `order_items` — purchase flow
- `payments` — payment tracking

### Future additions (not built yet)
These can be added later without changing the MVP schema:

| Future Table    | Purpose                           | When to add                    |
|-----------------|-----------------------------------|--------------------------------|
| `reviews`       | Customer book reviews/ratings     | When social features are needed |
| `wishlists`     | Save-for-later                    | When customer engagement grows  |
| `coupons`       | Discount codes                    | When marketing campaigns start  |
| `inventory_log` | Stock change audit trail          | When inventory tracking matters |
| `addresses`     | Multiple saved addresses per user | When repeat customers want it   |
| `analytics_events` | Page views, click tracking    | When dashboard analytics needed |

---

## Key Recommendations

### Cart: Keep in localStorage (for now)

**Recommendation: Stay with localStorage for MVP.**

Reasons:
- The current CartContext works well and requires zero backend calls
- DB carts add complexity: syncing anonymous → authenticated, handling stale items, real-time stock checks
- localStorage carts are instant (no network latency)
- Cart abandonment analytics can be added later via an `analytics_events` table

**When to move to DB:** When you need cart persistence across devices, or cart abandonment email campaigns.

### Book Images: Use URLs, not Supabase Storage (for now)

**Recommendation: Store image URLs in `cover_image_url`, not files in Supabase Storage.**

Reasons:
- The BookCover component already has a solid fallback chain (custom URL → OpenLibrary via ISBN → color gradient)
- Most books have ISBNs, so OpenLibrary covers work automatically
- Supabase Storage adds upload UI complexity, bucket policies, and CDN configuration
- A URL field works with any image host (OpenLibrary, Cloudinary, Supabase Storage later)

**When to move to Storage:** When you have custom book photos (used bookstore shots) or need reliable, self-hosted images that won't depend on OpenLibrary uptime.

### Safest MVP Migration Path

1. **Set up Supabase project** — create project, get URL + anon key
2. **Run migrations 00001–00008** in Supabase SQL editor (in order)
3. **Run seed data (00009)** to populate categories and books
4. **Install `@supabase/supabase-js`** in the React app
5. **Create a `supabaseClient.js`** with your project URL and anon key
6. **Migrate reads first** — replace `defaultBooks` and `defaultCategories` imports with Supabase queries. Keep localStorage as a fallback cache.
7. **Migrate auth** — replace AuthContext's localStorage auth with Supabase Auth (signUp, signInWithPassword, onAuthStateChange)
8. **Migrate writes** — orders, payments, stock updates
9. **Remove localStorage fallbacks** once Supabase is stable
10. **Promote first admin** — manually set `role = 'admin'` in profiles table for your admin account

This path lets you migrate incrementally. At each step, the app still works.

---

## Migration File Order

```
supabase/migrations/
├── 00001_create_enums.sql          # Enum types
├── 00002_create_profiles.sql       # User profiles + auto-create trigger
├── 00003_create_categories.sql     # Book categories
├── 00004_create_books.sql          # Book catalog
├── 00005_create_orders.sql         # Orders + auto order number
├── 00006_create_order_items.sql    # Line items
├── 00007_create_payments.sql       # Payment records
├── 00008_row_level_security.sql    # RLS policies for all tables
└── 00009_seed_data.sql             # Initial categories + books
```

Run these in order in the Supabase SQL Editor, or use the Supabase CLI (`supabase db push`).
