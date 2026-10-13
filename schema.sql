CREATE TABLE IF NOT EXISTS accounts (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  handle     TEXT UNIQUE,                       -- null until the creator claims one
  status     TEXT NOT NULL DEFAULT 'active',    -- active | suspended
  created_at INTEGER NOT NULL
);

-- Invite-gated launch: a code is consumed when an account is first created.
CREATE TABLE IF NOT EXISTS invites (
  code        TEXT PRIMARY KEY,
  created_at  INTEGER NOT NULL,
  used_by     TEXT REFERENCES accounts(id),
  used_at     INTEGER
);

-- Magic-link login. token_hash is a SHA-256 of the emailed token (never the token).
CREATE TABLE IF NOT EXISTS magic_links (
  token_hash  TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  invite_code TEXT,
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,
  account_id  TEXT NOT NULL REFERENCES accounts(id),
  expires_at  INTEGER NOT NULL
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

-- "Report this page" submissions from visitors.
CREATE TABLE IF NOT EXISTS reports (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  reason     TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS events_account_ts   ON events (account_id, ts);
CREATE INDEX IF NOT EXISTS events_account_type ON events (account_id, type, block_id);
CREATE INDEX IF NOT EXISTS sessions_account    ON sessions (account_id);
