// types/index.ts - All core types for Mamz Library

export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  avatar_url?: string;
  bio?: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  cover_url: string;
  pdf_url: string;
  total_pages: number;
  is_published: boolean;
  category_id: string;
  created_at: string;
  category?: Category;
  tags?: Tag[];
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  current_page: number;
  percentage: number;
  last_read_at: string;
  book?: Book;
}

export interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  duration_seconds: number;
  pages_read: number;
  started_at: string;
  ended_at: string;
  book?: Book;
}

export interface SavedBook {
  id: string;
  user_id: string;
  book_id: string;
  saved_at: string;
  book?: Book;
}

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  book_id?: string;
  event_type: "view" | "read_start" | "read_end" | "search" | "register" | "login";
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ReadingStats {
  total_started: number;
  total_finished: number;
  total_reading_time_seconds: number;
  books_in_progress: number;
}

export interface AdminStats {
  total_users: number;
  total_books: number;
  total_reading_sessions: number;
  active_users_today: number;
  new_users_this_month: number;
  most_read_books: Array<{ book: Book; read_count: number }>;
  daily_activity: Array<{ date: string; sessions: number; new_users: number }>;
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  cover_url: string;
  pdf_url: string;
  total_pages: number;
  category_id: string;
  tag_ids: string[];
  is_published: boolean;
}

export interface SearchResult {
  books: Book[];
  total: number;
  query: string;
}

// Default Persian categories
export const DEFAULT_CATEGORIES = [
  "رمان",
  "روانشناسی",
  "فلسفه",
  "تاریخی",
  "علمی",
  "موفقیت",
  "کسب‌وکار",
  "کودک و نوجوان",
  "شعر و ادبیات",
] as const;
