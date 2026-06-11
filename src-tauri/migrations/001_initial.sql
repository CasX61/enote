-- migrations/001_initial.sql

CREATE TABLE IF NOT EXISTS notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL DEFAULT '',
  content     TEXT    NOT NULL DEFAULT '',
  color       TEXT    NOT NULL DEFAULT '#888780',
  is_template INTEGER NOT NULL DEFAULT 0,   -- 0 = Notiz, 1 = Vorlage
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS update_notes_timestamp
  AFTER UPDATE ON notes
  FOR EACH ROW
  BEGIN
    UPDATE notes SET updated_at = datetime('now') WHERE id = OLD.id;
  END;
