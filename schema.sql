-- Safe to re-run: existing visits are preserved.
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0)
);
INSERT OR IGNORE INTO visits (id, total) VALUES (1, 0);
