-- ============================================================================
-- BookHeaven: Seed Data (Categories + Books)
-- Run this after all migrations, or use as a reference for manual seeding
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Fiction',           'fiction',           'Novels, thrillers, and literary fiction',                       1),
  ('Psychology',        'psychology',        'Understanding behaviour, thinking, and communication',         2),
  ('Strategy',          'strategy',          'Tactical thinking, leadership, and decision-making',           3),
  ('Business & Finance','business-finance',  'Entrepreneurship, money management, and career growth',        4),
  ('Self-Help',         'self-help',         'Personal development, habits, and mindset',                    5),
  ('Relationships',     'relationships',     'Communication, connection, and interpersonal skills',          6),
  ('Inspirational',     'inspirational',     'Stories and ideas that motivate and uplift',                    7),
  ('Lifestyle',         'lifestyle',         'Wellness, purpose, and everyday living',                       8),
  ('Christian / Faith', 'christian-faith',   'Faith-based living, devotionals, and spiritual growth',        9),
  ('Career',            'career',            'Career transitions, professional skills, and work life',      10);

-- ────────────────────────────────────────────────────────────────────────────
-- BOOKS
-- ────────────────────────────────────────────────────────────────────────────
-- Note: category_id references are resolved via subquery on slug

-- Verified titles
INSERT INTO books (title, author, description, price, stock_quantity, category_id, cover_color, isbn, published_year, is_featured, status, verification_notes) VALUES
  (
    'The Alchemist', 'Paulo Coelho',
    'A shepherd boy journeys from Spain to the Egyptian pyramids, discovering that the treasure he seeks is closer than he imagined.',
    180.00, 3,
    (SELECT id FROM categories WHERE slug = 'inspirational'),
    '#D4A017', '978-0062315007', 1988, true, 'active', ''
  ),
  (
    'The Mountain Is You', 'Brianna Wiest',
    'Explores self-sabotage and offers practical strategies for transforming destructive habits into personal growth.',
    180.00, 2,
    (SELECT id FROM categories WHERE slug = 'self-help'),
    '#5B7065', '978-1949759228', 2020, true, 'active', ''
  ),
  (
    'Ikigai', 'Hector Garcia & Francesc Miralles',
    'The Japanese secret to a long and purposeful life, drawn from the wisdom of Okinawa''s centenarians.',
    180.00, 2,
    (SELECT id FROM categories WHERE slug = 'lifestyle'),
    '#E8B960', '978-0143130727', 2017, true, 'active', ''
  ),
  (
    'The Subtle Art of Not Giving a F*ck', 'Mark Manson',
    'A counterintuitive approach to living well — arguing that embracing limitations leads to a more grounded life.',
    180.00, 3,
    (SELECT id FROM categories WHERE slug = 'self-help'),
    '#FF6F00', '978-0062457714', 2016, true, 'active', ''
  ),
  (
    'The Art of Seduction', 'Robert Greene',
    'A study of influence and persuasion through the lens of historical figures and timeless archetypes.',
    180.00, 1,
    (SELECT id FROM categories WHERE slug = 'psychology'),
    '#880E4F', '978-0142001196', 2001, false, 'active', ''
  ),
  (
    'Every Man''s Battle', 'Stephen Arterburn & Fred Stoeker',
    'Addresses challenges men face in maintaining personal integrity, with practical strategies grounded in faith.',
    180.00, 1,
    (SELECT id FROM categories WHERE slug = 'christian-faith'),
    '#2C3E50', '978-0307457974', 2000, false, 'active', ''
  ),
  (
    'The Lying Game', 'Ruth Ware',
    'Four friends bound by a childhood game are reunited when a body surfaces, threatening to unravel their shared secret.',
    180.00, 1,
    (SELECT id FROM categories WHERE slug = 'fiction'),
    '#1A237E', '978-1501156007', 2017, false, 'active', ''
  ),
  (
    'The Diary of a CEO', 'Steven Bartlett',
    'Unconventional lessons on business, leadership, and life from one of the world''s most popular podcast hosts.',
    180.00, 2,
    (SELECT id FROM categories WHERE slug = 'business-finance'),
    '#000000', '978-1529146516', 2023, true, 'active', ''
  ),
  (
    'The Art of War', 'Sun Tzu',
    'The classic treatise on strategy and tactical thinking, widely applied to business and leadership.',
    55.00, 3,
    (SELECT id FROM categories WHERE slug = 'strategy'),
    '#B71C1C', '978-1590302255', NULL, false, 'active', ''
  ),
  (
    'The 5 AM Club', 'Robin Sharma',
    'A structured morning routine as the foundation for productivity, focus, and personal mastery.',
    180.00, 2,
    (SELECT id FROM categories WHERE slug = 'self-help'),
    '#FBC02D', '978-1443456623', 2018, false, 'active', ''
  ),
  (
    'Surrounded by Idiots', 'Thomas Erikson',
    'Breaks down four behavioural types to help readers understand communication styles and improve relationships.',
    180.00, 2,
    (SELECT id FROM categories WHERE slug = 'psychology'),
    '#E53935', '978-1250179944', 2014, true, 'active', ''
  ),
  (
    'Atomic Habits', 'James Clear',
    'A practical system for building good habits and breaking bad ones through small changes that compound over time.',
    180.00, 3,
    (SELECT id FROM categories WHERE slug = 'self-help'),
    '#1B4D3E', '978-0735211292', 2018, true, 'active', ''
  ),
  (
    'What Happened to You?', 'Bruce D. Perry & Oprah Winfrey',
    'Shifts the question from "What''s wrong with you?" to "What happened to you?" — exploring how trauma shapes behaviour and healing.',
    180.00, 1,
    (SELECT id FROM categories WHERE slug = 'psychology'),
    '#4A148C', '978-1250223180', 2021, false, 'active', ''
  ),
  (
    'The Pivot', 'Jenny Blake',
    'A framework for navigating career transitions by building on existing strengths to move in a new direction.',
    180.00, 1,
    (SELECT id FROM categories WHERE slug = 'career'),
    '#00695C', '978-1591848202', 2016, false, 'needs_verification',
    'Most likely Jenny Blake''s career book — confirm this is the correct edition and author.'
  );

-- Unverified titles
INSERT INTO books (title, author, description, price, stock_quantity, category_id, cover_color, isbn, published_year, is_featured, status, verification_notes) VALUES
  (
    'The College of Money', 'Author to confirm',
    'A guide to financial literacy and building wealth through smart money management.',
    180.00, 2,
    (SELECT id FROM categories WHERE slug = 'business-finance'),
    '#1B5E20', '', NULL, false, 'needs_verification',
    'Author unknown — confirm author name. Title is likely correct.'
  ),
  (
    'Something More', 'Author to confirm',
    'Listed in inventory — exact edition and author need confirmation.',
    60.00, 1,
    (SELECT id FROM categories WHERE slug = 'self-help'),
    '#8E6F5E', '', NULL, false, 'needs_verification',
    'Multiple books share this title — confirm exact edition, author, and category. Price is estimated.'
  ),
  (
    'Kenny Ritchie', 'Author to confirm',
    'Title and author pending verification.',
    60.00, 1,
    (SELECT id FROM categories WHERE slug = 'fiction'),
    '#455A64', '', NULL, false, 'needs_verification',
    'Unclear if this is a title or author name — needs full verification.'
  ),
  (
    'The Throw Scott', 'Author to confirm',
    'Title pending verification.',
    60.00, 1,
    (SELECT id FROM categories WHERE slug = 'fiction'),
    '#37474F', '', NULL, false, 'needs_verification',
    'Title unclear — may be misread or abbreviated. Needs full verification.'
  ),
  (
    'This Is Ridiculous', 'Author to confirm',
    'Title pending verification.',
    35.00, 1,
    (SELECT id FROM categories WHERE slug = 'self-help'),
    '#6D4C41', '', NULL, false, 'needs_verification',
    'Could not match to a known title with confidence — verify title, author, and price.'
  ),
  (
    'This Is Amazing', 'Author to confirm',
    'Title pending verification.',
    35.00, 1,
    (SELECT id FROM categories WHERE slug = 'inspirational'),
    '#558B2F', '', NULL, false, 'needs_verification',
    'Could not match to a known title with confidence — verify title, author, and price.'
  ),
  (
    'Brandly Broket', 'Author to confirm',
    'Title pending verification.',
    60.00, 1,
    (SELECT id FROM categories WHERE slug = 'fiction'),
    '#795548', '', NULL, false, 'needs_verification',
    'Title appears unusual — may be a misspelling or lesser-known work. Needs full verification.'
  ),
  (
    'She Left Me the Gun', 'Author to confirm',
    'Possibly a memoir — title and author need confirmation.',
    60.00, 1,
    (SELECT id FROM categories WHERE slug = 'fiction'),
    '#3E2723', '', NULL, false, 'needs_verification',
    'Listed as "She Left Me in the Gun" — possibly "She Left Me the Gun" by Emma Brockes. Confirm exact title and author.'
  ),
  (
    'Robbins', 'Author to confirm',
    'Title pending verification — possibly a Tony Robbins title.',
    60.00, 1,
    (SELECT id FROM categories WHERE slug = 'self-help'),
    '#263238', '', NULL, false, 'needs_verification',
    'Likely a Tony Robbins book — confirm which specific title. Price estimated.'
  ),
  (
    'The Club', 'Author to confirm',
    'Title pending verification — multiple books share this name.',
    60.00, 1,
    (SELECT id FROM categories WHERE slug = 'fiction'),
    '#1B1B1B', '', NULL, false, 'needs_verification',
    'Multiple books with this title exist — confirm author and exact edition. Price estimated.'
  );
