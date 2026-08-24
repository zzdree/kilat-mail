import React from 'react';
import { Copy, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Salin Alamat Email',
      desc: 'Klik tombol salin di kotak atas atau pilih nama kustom sesuai keinginanmu.',
      icon: Copy,
      color: 'amber',
    },
    {
      step: '02',
      title: 'Gunakan untuk Registrasi',
      desc: 'Pakai email ini untuk daftar akun, uji coba aplikasi, download file, atau verifikasi.',
      icon: ShieldCheck,
      color: 'cyan',
    },
    {
      step: '03',
      title: 'Terima Pesan & Salin OTP',
      desc: 'Email masuk otomatis muncul. Sistem mendeteksi kode OTP untuk kamu salin 1-klik.',
      icon: KeyRound,
      color: 'emerald',
    },
  ];

  return (
    <section id="cara-kerja" className="w-full py-8 border-t border-gray-800/80">
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2.5">
          <span>Mudah & Cepat</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">
          Cara Kerja Kilat Mail
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
          Tiga langkah mudah menerima pesan dan kode OTP tanpa ribet registrasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-[#111827] border border-gray-800/90 hover:border-gray-700/90 rounded-2xl p-5 relative overflow-hidden transition-all duration-200 group flex flex-col justify-between shadow-lg"
            >
              {/* Step indicator tag */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black font-mono text-gray-700 group-hover:text-amber-500/40 transition-colors">
                  {item.step}
                </span>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    item.color === 'amber'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : item.color === 'cyan'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-gray-700 pointer-events-none">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
