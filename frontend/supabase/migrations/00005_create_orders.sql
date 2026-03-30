-- ============================================================================
-- BookHeaven: Orders
-- ============================================================================

CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT NOT NULL UNIQUE,
  customer_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Snapshot of customer details at time of order (in case profile changes later)
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_phone    TEXT DEFAULT '',

  -- Totals
  subtotal          NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee      NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total             NUMERIC(10, 2) NOT NULL CHECK (total >= 0),

  -- Delivery
  delivery_method   delivery_method NOT NULL DEFAULT 'pickup',
  delivery_address  TEXT DEFAULT '',

  -- Status tracking
  order_status      order_status NOT NULL DEFAULT 'pending',
  payment_method    payment_method NOT NULL,
  payment_status    payment_status NOT NULL DEFAULT 'pending',

  -- Admin notes
  notes             TEXT DEFAULT '',

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE UNIQUE INDEX idx_orders_number ON orders(order_number);

-- Generate a human-readable order number: BH-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  seq_part TEXT;
  daily_count INTEGER;
BEGIN
  date_part := to_char(now(), 'YYYYMMDD');

  SELECT COUNT(*) + 1 INTO daily_count
  FROM orders
  WHERE order_number LIKE 'BH-' || date_part || '-%';

  seq_part := lpad(daily_count::TEXT, 4, '0');
  NEW.order_number := 'BH-' || date_part || '-' || seq_part;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();
