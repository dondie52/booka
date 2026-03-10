-- ============================================================================
-- BookHeaven: Row-Level Security Policies
-- ============================================================================

-- Helper: check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but not their role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read active categories
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Admins can view all categories (including inactive)
CREATE POLICY "Admins can view all categories"
  ON categories FOR SELECT
  USING (is_admin());

-- Admins can insert/update/delete categories
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- BOOKS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Anyone can view active books
CREATE POLICY "Public can view active books"
  ON books FOR SELECT
  USING (status = 'active');

-- Admins can view all books
CREATE POLICY "Admins can view all books"
  ON books FOR SELECT
  USING (is_admin());

-- Admins can manage books
CREATE POLICY "Admins can manage books"
  ON books FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- ORDERS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Customers can create orders (for themselves)
CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Admins can view and manage all orders
CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- ORDER ITEMS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Customers can view items for their own orders
CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Customers can insert items for their own orders
CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Admins can manage all order items
CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ────────────────────────────────────────────────────────────────────────────
-- PAYMENTS
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Customers can view payments for their own orders
CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Admins can manage all payments
CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
