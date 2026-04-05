# BookHeaven — Project Context

## What Is This

**BookHeaven** is an online bookstore for Botswana, live at **https://bookhavenbw.shop**. It sells physical books with delivery across Botswana or in-store pickup in Gaborone. The business WhatsApp is +267 76 984 827.

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Vite, deployed on GitHub Pages
- **Routing**: React Router DOM 6 with HashRouter (for GitHub Pages SPA compatibility)
- **Data Storage**: Currently localStorage (Supabase schema is ready but not yet wired up)
- **Payments**: DPO Pay (Botswana payment gateway) via Supabase Edge Functions, plus manual methods (Orange Money, bank transfer, cash on delivery)
- **Backend**: Supabase (auth, PostgreSQL, Edge Functions). No custom Node.js backend yet — `backend/` is empty
- **Repo**: https://github.com/dondie52/booka

## Project Structure

```
frontend/                  # React SPA (the main app)
  src/
    components/            # Reusable UI: BookCard, BookGrid, Header, Footer, Modal, etc.
    contexts/              # React Context providers
      AuthContext.jsx      # User auth state (login/signup/logout, localStorage-based)
      CartContext.jsx      # Shopping cart state (persisted in localStorage)
      DataContext.jsx      # Books, categories, orders CRUD (localStorage-based)
    pages/
      customer/            # Customer-facing: Home, Shop, BookDetail, Cart, Checkout, Account, etc.
      admin/               # Admin panel: Dashboard, ManageBooks, ManageOrders, ManageCategories
    services/
      dpoService.js        # DPO Pay integration (calls Supabase Edge Functions)
      orderService.js      # Order creation and management
      paymentService.js    # Payment processing coordination
      storageService.js    # localStorage wrapper with namespaced keys
    data/
      books.js             # 150+ book catalog (seed data)
      categories.js        # Book categories
  supabase/
    migrations/            # 9 SQL migrations (enums, profiles, books, orders, payments, RLS)
    functions/             # Edge Functions: create-dpo-token, verify-dpo-payment
  public/                  # Static assets: favicon, CNAME, robots.txt, sitemap.xml
backend/                   # Empty — reserved for future Node.js/Express backend
brand asserts/             # Logo and brand guidelines PNG files
.github/workflows/         # GitHub Actions: deploy to GitHub Pages on push to main
```

## Key Features

**Customer Side:**
- Browse books by category, search, filter by price/stock
- Book detail pages with ISBN-based cover images (OpenLibrary fallback)
- Shopping cart (localStorage-persisted)
- Multi-step checkout: customer info → delivery method (delivery P35 / free pickup) → payment
- 4 payment methods: DPO Pay (card/mobile money), Orange Money, bank transfer, cash on delivery
- User accounts (signup/login/profile editing)

**Admin Side (admin@bookheaven.co.bw):**
- Dashboard with stats (book count, orders, revenue)
- Full CRUD for books, categories, and orders
- Order status and payment tracking

## Payment Flow (DPO Pay)

1. Customer selects card/mobile money at checkout
2. Frontend calls `dpoService.createPayment()` → Supabase Edge Function
3. Edge Function calls DPO API (XML) with amount in BWP, gets transaction token
4. Customer redirected to DPO's hosted payment page
5. After payment, DPO redirects back to `#/payment-return`
6. `PaymentReturnPage` verifies transaction via another Edge Function
7. On success: order created, stock deducted, cart cleared

## Data Layer

Currently **all data lives in localStorage** with `bookheaven_` prefix keys:
- `bookheaven_books`, `bookheaven_categories`, `bookheaven_orders`, `bookheaven_users`
- `bookheaven_cart`, `bookheaven_current_user`, `bookheaven_auth`

Supabase PostgreSQL schema is fully defined in `frontend/supabase/migrations/` with RLS policies, but the app hasn't been migrated to use it yet. This is a planned next step.

## Currency & Locale

All prices are in **BWP (Botswana Pula)**. Delivery fee is P35 for home delivery, free for in-store pickup.

## Deployment

- GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- Custom domain: bookhavenbw.shop (GoDaddy DNS → GitHub Pages)
- HTTPS enforced, SSL via GitHub/Let's Encrypt
- Google Search Console verified with sitemap submitted

## What Needs Work

- Migrate from localStorage to Supabase (schema is ready)
- Build out the `backend/` (API layer, server-side logic)
- Order history page for customers
- Email notifications for orders
- Image uploads for book covers (currently using OpenLibrary ISBN lookup + color fallbacks)
