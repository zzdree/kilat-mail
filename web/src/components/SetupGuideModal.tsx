import React from 'react';
import { X, CheckCircle2, Cloud, Database, Mail, Terminal } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-pop">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#0B0F19]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Panduan Setup Kilat Mail di Cloudflare</h3>
              <p className="text-xs text-gray-400">Langkah menghubungkan domain gratis dan database D1 ke Worker</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300">
          {/* Step 1 */}
          <div className="flex gap-3.5">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-cyan-500/40">
              1
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Buat Database Cloudflare D1</span>
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Jalankan perintah berikut di terminal folder <code>worker/</code>:
              </p>
              <pre className="bg-gray-950 p-3 rounded-lg border border-gray-800 font-mono text-xs text-amber-300 overflow-x-auto">
                npx wrangler d1 create kilat_mail_db
              </pre>
              <p className="text-xs text-gray-400">
                Salin <code>database_id</code> yang muncul ke file <code>worker/wrangler.jsonc</code>, lalu inisialisasi tabel:
              </p>
              <pre className="bg-gray-950 p-3 rounded-lg border border-gray-800 font-mono text-xs text-amber-300 overflow-x-auto">
                npx wrangler d1 execute kilat_mail_db --remote --file=./src/schema.sql
              </pre>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3.5">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-amber-500/40">
              2
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Deploy Worker ke Cloudflare</span>
              </h4>
              <p className="text-xs text-gray-400">
                Deploy kode Worker kamu ke cloud:
              </p>
              <pre className="bg-gray-950 p-3 rounded-lg border border-gray-800 font-mono text-xs text-amber-300 overflow-x-auto">
                npx wrangler deploy
              </pre>
              <p className="text-xs text-gray-400">
                Setelah deploy selesai, salin URL worker (misal: <code>https://kilat-mail-worker.xxx.workers.dev</code>) ke menu <strong>Settings</strong> di web ini.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-emerald-500/40">
              3
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Konfigurasi Email Routing (Catch-All Rule)</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-400 leading-relaxed">
                <li>Buka dashboard Cloudflare dan pilih domain kamu (contoh: <code>eu.org</code> / <code>my.id</code>).</li>
                <li>Pilih menu <strong>Email</strong> → <strong>Email Routing</strong>.</li>
                <li>Aktifkan Email Routing (Cloudflare akan otomatis menambahkan MX record).</li>
                <li>Buka tab <strong>Routing rules</strong> → <strong>Catch-all rule</strong>.</li>
                <li>Ubah Action menjadi <strong>Send to Worker</strong> dan pilih <code>kilat-mail-worker</code>.</li>
              </ol>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-300 leading-relaxed">
              <strong>Selesai!</strong> Sekarang setiap email yang dikirim ke alamat apapun di domain kamu akan otomatis ditangkap, diekstrak kode OTP-nya, dan langsung muncul secara realtime di Kilat Mail.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#0B0F19] flex justify-end">
          <button onClick={onClose} className="btn-primary !py-2 !px-5 text-xs">
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
