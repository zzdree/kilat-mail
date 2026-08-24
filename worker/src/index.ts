import PostalMime from 'postal-mime';
import { extractOtpCode } from './otp';
import { ApiResponse, EmailMessageRecord, Env } from './types';

// Helper CORS Headers
function getCorsHeaders(env: Env): HeadersInit {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse<T>(data: ApiResponse<T>, status = 200, env: Env): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(env),
    },
  });
}

export default {
  /**
   * 📬 1. EMAIL ROUTING EVENT HANDLER
   */
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      const rawStream = await new Response(message.raw).arrayBuffer();
      const parser = new PostalMime();
      const parsed = await parser.parse(rawStream);

      const id = crypto.randomUUID();
      const recipient = message.to.toLowerCase().trim();
      const senderAddress = message.from || parsed.from?.address || 'unknown@sender.com';
      const senderName = parsed.from?.name || null;
      const subject = parsed.subject || '(Tanpa Subjek)';
      const bodyText = parsed.text || null;
      const bodyHtml = parsed.html || null;
      const rawSize = message.rawSize || rawStream.byteLength;

      // Smart OTP Extraction
      const detectedOtp = extractOtpCode(subject, bodyText);

      // Simpan ke Cloudflare D1
      await env.DB.prepare(
        `INSERT INTO inbox (
          id, recipient, sender_name, sender_address, subject,
          body_text, body_html, detected_otp, raw_size, is_read, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`
      )
        .bind(
          id,
          recipient,
          senderName,
          senderAddress,
          subject,
          bodyText,
          bodyHtml,
          detectedOtp,
          rawSize
        )
        .run();

      console.log(`[Kilat Mail] Email saved: ${id} -> ${recipient} (OTP: ${detectedOtp || 'none'})`);
    } catch (err) {
      console.error('[Kilat Mail] Error processing email message:', err);
    }
  },

  /**
   * 🌐 2. REST API HANDLER (Bot & Agent Friendly)
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(env);

    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Route: Health Check
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return jsonResponse({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } }, 200, env);
    }

    // 🚀 SPECIAL AGENT ROUTE: GET /api/otp?email=xxx (Direct 1-line latest OTP code extraction)
    if (url.pathname === '/api/otp' && request.method === 'GET') {
      const email = url.searchParams.get('email')?.toLowerCase().trim();
      if (!email) {
        return jsonResponse({ success: false, error: 'Parameter email wajib disertakan' }, 400, env);
      }

      try {
        const latestOtpMessage = await env.DB.prepare(
          `SELECT id, recipient, sender_name, sender_address, subject, detected_otp, created_at
           FROM inbox
           WHERE recipient = ? AND detected_otp IS NOT NULL
           ORDER BY created_at DESC
           LIMIT 1`
        )
          .bind(email)
          .first<EmailMessageRecord>();

        if (latestOtpMessage && latestOtpMessage.detected_otp) {
          return jsonResponse({
            success: true,
            data: {
              has_otp: true,
              latest_otp: latestOtpMessage.detected_otp,
              message_id: latestOtpMessage.id,
              subject: latestOtpMessage.subject,
              sender: latestOtpMessage.sender_name || latestOtpMessage.sender_address,
              received_at: latestOtpMessage.created_at,
            },
          }, 200, env);
        }

        // Cek pesan terbaru walaupun regex otomatis belum mendeteksi
        const latestAnyMessage = await env.DB.prepare(
          `SELECT id, recipient, sender_name, sender_address, subject, body_text, created_at
           FROM inbox
           WHERE recipient = ?
           ORDER BY created_at DESC
           LIMIT 1`
        )
          .bind(email)
          .first<EmailMessageRecord>();

        if (latestAnyMessage) {
          const manualScanOtp = extractOtpCode(latestAnyMessage.subject, latestAnyMessage.body_text);
          return jsonResponse({
            success: true,
            data: {
              has_otp: Boolean(manualScanOtp),
              latest_otp: manualScanOtp || null,
              message_id: latestAnyMessage.id,
              subject: latestAnyMessage.subject,
              sender: latestAnyMessage.sender_name || latestAnyMessage.sender_address,
              received_at: latestAnyMessage.created_at,
            },
          }, 200, env);
        }

        return jsonResponse({
          success: true,
          data: {
            has_otp: false,
            latest_otp: null,
            message: 'Belum ada email masuk untuk alamat ini',
          },
        }, 200, env);
      } catch (err: any) {
        return jsonResponse({ success: false, error: err.message || 'Gagal mengambil OTP' }, 500, env);
      }
    }

    // Route: GET /api/inbox?email=xxx
    if (url.pathname === '/api/inbox' && request.method === 'GET') {
      const email = url.searchParams.get('email')?.toLowerCase().trim();
      if (!email) {
        return jsonResponse({ success: false, error: 'Parameter email wajib disertakan' }, 400, env);
      }

      try {
        const { results } = await env.DB.prepare(
          `SELECT id, recipient, sender_name, sender_address, subject, detected_otp, raw_size, is_read, created_at
           FROM inbox
           WHERE recipient = ?
           ORDER BY created_at DESC
           LIMIT 50`
        )
          .bind(email)
          .all<Omit<EmailMessageRecord, 'body_text' | 'body_html'>>();

        return jsonResponse({ success: true, data: results }, 200, env);
      } catch (err: any) {
        return jsonResponse({ success: false, error: err.message || 'Gagal mengambil daftar inbox' }, 500, env);
      }
    }

    // Route: GET /api/message/:id
    if (url.pathname.startsWith('/api/message/') && request.method === 'GET') {
      const id = url.pathname.replace('/api/message/', '').trim();
      if (!id) {
        return jsonResponse({ success: false, error: 'ID pesan tidak valid' }, 400, env);
      }

      try {
        const message = await env.DB.prepare(`SELECT * FROM inbox WHERE id = ?`)
          .bind(id)
          .first<EmailMessageRecord>();

        if (!message) {
          return jsonResponse({ success: false, error: 'Pesan tidak ditemukan' }, 404, env);
        }

        ctx.waitUntil(
          env.DB.prepare(`UPDATE inbox SET is_read = 1 WHERE id = ?`).bind(id).run()
        );

        return jsonResponse({ success: true, data: message }, 200, env);
      } catch (err: any) {
        return jsonResponse({ success: false, error: err.message || 'Gagal mengambil detail pesan' }, 500, env);
      }
    }

    // Route: DELETE /api/message/:id
    if (url.pathname.startsWith('/api/message/') && request.method === 'DELETE') {
      const id = url.pathname.replace('/api/message/', '').trim();
      try {
        await env.DB.prepare(`DELETE FROM inbox WHERE id = ?`).bind(id).run();
        return jsonResponse({ success: true, data: { deletedId: id } }, 200, env);
      } catch (err: any) {
        return jsonResponse({ success: false, error: err.message || 'Gagal menghapus pesan' }, 500, env);
      }
    }

    // Route: DELETE /api/inbox?email=xxx
    if (url.pathname === '/api/inbox' && request.method === 'DELETE') {
      const email = url.searchParams.get('email')?.toLowerCase().trim();
      if (!email) {
        return jsonResponse({ success: false, error: 'Parameter email wajib disertakan' }, 400, env);
      }

      try {
        await env.DB.prepare(`DELETE FROM inbox WHERE recipient = ?`).bind(email).run();
        return jsonResponse({ success: true, data: { clearedEmail: email } }, 200, env);
      } catch (err: any) {
        return jsonResponse({ success: false, error: err.message || 'Gagal mengosongkan inbox' }, 500, env);
      }
    }

    // 404 Not Found
    return jsonResponse({ success: false, error: 'Endpoint tidak ditemukan' }, 404, env);
  },

  /**
   * 🧹 3. SCHEDULED CRON AUTO-CLEANUP
   */
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const expiryHours = parseInt(env.EMAIL_EXPIRY_HOURS || '48', 10);
    try {
      const result = await env.DB.prepare(
        `DELETE FROM inbox WHERE created_at < datetime('now', '-' || ? || ' hours')`
      )
        .bind(expiryHours)
        .run();

      console.log(`[Kilat Mail Cron] Cleaned expired emails. Rows affected: ${result.meta.changes}`);
    } catch (err) {
      console.error('[Kilat Mail Cron] Cleanup error:', err);
    }
  },
};
