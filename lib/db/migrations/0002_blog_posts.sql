CREATE TABLE IF NOT EXISTS blog_posts (
  id               TEXT PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  excerpt          TEXT,
  content          TEXT NOT NULL DEFAULT '',
  cover_image_url  TEXT,
  tag              TEXT,
  published        BOOLEAN NOT NULL DEFAULT false,
  published_at     TIMESTAMP,
  author_id        TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published, published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_tag_idx ON blog_posts (tag);
