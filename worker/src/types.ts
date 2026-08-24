export interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
  EMAIL_EXPIRY_HOURS?: string;
}

export interface EmailMessageRecord {
  id: string;
  recipient: string;
  sender_name: string | null;
  sender_address: string;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  detected_otp: string | null;
  magic_link: string | null;
  raw_size: number;
  is_read: number;
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
