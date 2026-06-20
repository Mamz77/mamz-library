-- =============================================
-- MAMZ LIBRARY - Supabase Database Schema
-- Migration: 001_initial_schema.sql
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TAGS TABLE
-- =============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BOOKS TABLE
-- =============================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  pdf_url TEXT NOT NULL,
  total_pages INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BOOK_TAGS (Many-to-Many)
-- =============================================
CREATE TABLE book_tags (
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, tag_id)
);

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- READING PROGRESS
-- =============================================
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 1,
  percentage FLOAT DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- =============================================
-- READING SESSIONS
-- =============================================
CREATE TABLE reading_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  duration_seconds INTEGER DEFAULT 0,
  pages_read INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- =============================================
-- SAVED BOOKS
-- =============================================
CREATE TABLE saved_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- =============================================
-- ANALYTICS EVENTS
-- =============================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'view', 'read_start', 'read_end', 'search', 'register', 'login', 'save_book'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_published ON books(is_published);
CREATE INDEX idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_book ON reading_progress(book_id);
CREATE INDEX idx_reading_sessions_user ON reading_sessions(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_book ON analytics_events(book_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_profiles_username ON profiles(username);

-- =============================================
-- TRIGGER: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TRIGGER: Auto-create profile on user signup
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- BOOKS policies (public can read published books)
CREATE POLICY "Published books are viewable by everyone"
  ON books FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all books"
  ON books FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- CATEGORIES & TAGS (public read, admin write)
CREATE POLICY "Categories are public"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Tags are public"
  ON tags FOR SELECT USING (true);

CREATE POLICY "Book tags are public"
  ON book_tags FOR SELECT USING (true);

CREATE POLICY "Admins manage categories"
  ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins manage tags"
  ON tags FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins manage book_tags"
  ON book_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- READING PROGRESS (users own their data)
CREATE POLICY "Users can manage own reading progress"
  ON reading_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reading progress"
  ON reading_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- READING SESSIONS
CREATE POLICY "Users can manage own reading sessions"
  ON reading_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reading sessions"
  ON reading_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- SAVED BOOKS
CREATE POLICY "Users can manage own saved books"
  ON saved_books FOR ALL USING (auth.uid() = user_id);

-- ANALYTICS EVENTS
CREATE POLICY "Users can insert analytics events"
  ON analytics_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON analytics_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =============================================
-- SEED DATA: Default Categories
-- =============================================
INSERT INTO categories (name, slug, description) VALUES
  ('رمان', 'roman', 'داستان‌های بلند و ادبی'),
  ('روانشناسی', 'psychology', 'علم رفتار و ذهن انسان'),
  ('فلسفه', 'philosophy', 'تفکر درباره هستی و معنا'),
  ('تاریخی', 'history', 'وقایع و رویدادهای تاریخی'),
  ('علمی', 'science', 'علوم طبیعی و کاربردی'),
  ('موفقیت', 'success', 'توسعه فردی و موفقیت'),
  ('کسب‌وکار', 'business', 'مدیریت و کارآفرینی'),
  ('کودک و نوجوان', 'children', 'کتاب‌های مناسب کودکان'),
  ('شعر و ادبیات', 'poetry', 'شعر و ادبیات کلاسیک و مدرن')
ON CONFLICT (slug) DO NOTHING;

-- Seed default tags
INSERT INTO tags (name, slug) VALUES
  ('خودشناسی', 'self-knowledge'),
  ('موفقیت', 'success'),
  ('رهبری', 'leadership'),
  ('تاریخ', 'history'),
  ('فلسفه', 'philosophy'),
  ('روانشناسی', 'psychology'),
  ('انگیزشی', 'motivational'),
  ('کلاسیک', 'classic'),
  ('ایرانی', 'iranian')
ON CONFLICT (slug) DO NOTHING;
