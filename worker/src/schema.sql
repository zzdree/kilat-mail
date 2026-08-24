-- Kilat Mail Database Schema for Cloudflare D1
CREATE TABLE IF NOT EXISTS inbox (
  id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  sender_name TEXT,
  sender_address TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  detected_otp TEXT,
  magic_link TEXT,
  raw_size INTEGER DEFAULT 0,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inbox_recipient ON inbox(recipient);
CREATE INDEX IF NOT EXISTS idx_inbox_created_at ON inbox(created_at);
CREATE INDEX IF NOT EXISTS idx_inbox_recipient_otp ON inbox(recipient, detected_otp, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_recipient_created ON inbox(recipient, created_at DESC);
