-- ============================================================================
-- BookHeaven: Payments
-- ============================================================================

CREATE TABLE payments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_reference       TEXT NOT NULL UNIQUE,
  payment_provider        TEXT NOT NULL DEFAULT 'manual',
  payment_method          payment_method NOT NULL,
  amount                  NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  status                  payment_status NOT NULL DEFAULT 'pending',
  provider_transaction_id TEXT DEFAULT '',
  metadata                JSONB DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(payment_reference);
