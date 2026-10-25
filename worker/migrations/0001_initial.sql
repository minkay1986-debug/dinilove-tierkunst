-- DiniLove private-ateliers schema. Apply only to a separate DiniLove D1 database.
-- Do not connect this to either TankstellenErtrag Supabase project.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS gallery_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  public_gallery_title TEXT NOT NULL DEFAULT 'DiniLove Atelier',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT OR IGNORE INTO gallery_settings (id) VALUES (1);

CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('wild', 'liebling', 'auftrag')),
  image_url TEXT NOT NULL,
  image_public_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_artworks_public_order
  ON artworks (published, sort_order, created_at);

-- Store message text server-side. Never send future rows to the public browser.
CREATE TABLE IF NOT EXISTS daily_surprises (
  surprise_date TEXT PRIMARY KEY, -- YYYY-MM-DD in Europe/Berlin calendar
  message TEXT NOT NULL,
  surprise_type TEXT NOT NULL DEFAULT 'daily'
    CHECK (surprise_type IN ('daily', 'birthday', 'christmas', 'anniversary', 'monthly')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS admin_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
