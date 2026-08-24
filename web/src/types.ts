export interface InboxItem {
  id: string;
  recipient: string;
  sender_name: string | null;
  sender_address: string;
  subject: string | null;
  detected_otp: string | null;
  magic_link?: string | null;
  raw_size: number;
  is_read: number;
  created_at: string;
}

export interface MessageDetail extends InboxItem {
  body_text: string | null;
  body_html: string | null;
  magic_link?: string | null;
  raw_headers?: string | null;
}
