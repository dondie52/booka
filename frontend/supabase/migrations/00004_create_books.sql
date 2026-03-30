-- ============================================================================
-- BookHeaven: Books
-- ============================================================================

CREATE TABLE books (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  author              TEXT NOT NULL,
  description         TEXT DEFAULT '',
  price               NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity      INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  category_id         UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  cover_image_url     TEXT DEFAULT '',
  cover_color         TEXT DEFAULT '#2C2C2C',
  isbn                TEXT DEFAULT '',
  published_year      INTEGER,
  is_featured         BOOLEAN NOT NULL DEFAULT false,
  status              book_status NOT NULL DEFAULT 'active',
  verification_notes  TEXT DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_featured ON books(is_featured) WHERE is_featured = true;
CREATE INDEX idx_books_isbn ON books(isbn) WHERE isbn != '';

-- Full-text search on title and author
CREATE INDEX idx_books_search ON books USING GIN (
  to_tsvector('english', title || ' ' || author)
);
