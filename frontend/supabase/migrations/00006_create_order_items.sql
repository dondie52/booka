-- ============================================================================
-- BookHeaven: Order Items
-- ============================================================================

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id     UUID REFERENCES books(id) ON DELETE SET NULL,

  -- Snapshot fields (preserved even if the book is later edited or deleted)
  book_title  TEXT NOT NULL,
  book_author TEXT NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  line_total  NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_book ON order_items(book_id);
