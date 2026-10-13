CREATE TABLE IF NOT EXISTS accounts (
  id         TEXT PRIMARY KEY,
  handle     TEXT NOT NULL UNIQUE,
  dash_token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

-- One page per account in Phase A. profile_json holds name, bio, avatar, theme
-- and the ordered blocks array (see src/profile.mjs).
CREATE TABLE IF NOT EXISTS pages (
  account_id   TEXT PRIMARY KEY REFERENCES accounts(id),
  profile_json TEXT NOT NULL,
  updated_at   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ts         INTEGER NOT NULL,
  account_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  type       TEXT NOT NULL,   -- view | imp | click | scroll | play
  block_id   TEXT,
  scroll     INTEGER,         -- max scroll depth percent, scroll events only
  source     TEXT,
  medium     TEXT,
  campaign   TEXT,
  device     TEXT,            -- mobile | tablet | desktop
  country    TEXT
);

CREATE INDEX IF NOT EXISTS events_account_ts   ON events (account_id, ts);
CREATE INDEX IF NOT EXISTS events_account_type ON events (account_id, type, block_id);
