-- ============================================================================
-- BookHeaven: Enum Types
-- ============================================================================

-- User roles for access control
CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- Book lifecycle status
CREATE TYPE book_status AS ENUM ('active', 'draft', 'out_of_stock', 'needs_verification');

-- Order lifecycle status
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'completed', 'cancelled');

-- Payment processing status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Accepted payment methods (extensible for Botswana market)
CREATE TYPE payment_method AS ENUM ('card', 'mobile_money', 'cash_on_delivery', 'bank_transfer');

-- Delivery options
CREATE TYPE delivery_method AS ENUM ('delivery', 'pickup');
