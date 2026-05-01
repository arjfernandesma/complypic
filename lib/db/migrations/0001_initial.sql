CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  email           TEXT UNIQUE NOT NULL,
  email_verified  TIMESTAMP,
  name            TEXT,
  image           TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  "userId"            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              TEXT NOT NULL,
  provider          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token     TEXT,
  access_token      TEXT,
  expires_at        INTEGER,
  token_type        TEXT,
  scope             TEXT,
  id_token          TEXT,
  session_state     TEXT,
  PRIMARY KEY (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                       TEXT PRIMARY KEY,
  user_id                  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id   TEXT UNIQUE,
  plan                     TEXT NOT NULL CHECK (plan IN ('free','pro','business','founding_pro')),
  status                   TEXT NOT NULL,
  billing_interval         TEXT,
  current_period_end       TIMESTAMP,
  image_credits_remaining  INTEGER NOT NULL DEFAULT 0,
  credits_reset_at         TIMESTAMP,
  ai_parse_remaining       INTEGER NOT NULL DEFAULT 0,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT false,
  created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_active_idx
  ON subscriptions(user_id) WHERE status IN ('active','trialing','past_due');

CREATE TABLE IF NOT EXISTS credit_ledger (
  id            BIGSERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta         INTEGER NOT NULL,
  reason        TEXT NOT NULL,
  ref_id        TEXT,
  stripe_event_id TEXT UNIQUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_presets (
  id           TEXT PRIMARY KEY,
  owner_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id      TEXT,
  label        TEXT NOT NULL,
  requirements JSONB NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS processing_history (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  batch_id        TEXT,
  filename        TEXT,
  width           INTEGER,
  height          INTEGER,
  format          TEXT,
  file_size_kb    INTEGER,
  compliant       BOOLEAN,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
