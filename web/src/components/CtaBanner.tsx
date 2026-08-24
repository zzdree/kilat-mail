import React from 'react';
import { ShieldCheck, Zap, Lock, ArrowUp } from 'lucide-react';

interface CtaBannerProps {
  onScrollToTop: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onScrollToTop }) => {
  return (
    <section className="w-full my-8">
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-500/10 via-gray-900 to-cyan-500/10 border border-amber-500/30 p-6 sm:p-8 text-center overflow-hidden shadow-2xl">
        {/* Ambient top light */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
            Lindungi Privasi Kotak Masuk Utamamu Sekarang
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
            Hentikan spam, newsletter tak diundang, dan data broker. Dapatkan alamat email sementara sekali klik, tanpa registrasi akun apapun.
          </p>

          <button
            onClick={onScrollToTop}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all duration-150 shadow-xl hover:scale-[1.02] cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-gray-950" />
            <span>Gunakan Kilat Mail Sekarang</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
