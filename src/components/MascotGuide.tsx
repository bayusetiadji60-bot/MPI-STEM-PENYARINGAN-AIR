import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { stopIndonesianSpeech, toggleIndonesianSpeech } from '../utils/soundEffects';

export type MascotMood = 'explain' | 'curious' | 'happy' | 'celebrate';

interface MascotGuideProps {
  mood?: MascotMood;
  title?: string;
  message: string;
  speakText?: string;
}

export const MascotGuide: React.FC<MascotGuideProps> = ({
  mood = 'explain',
  title = 'Catatan Kak Saka · Sahabat Sains Besuki',
  message,
  speakText,
}) => {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      stopIndonesianSpeech();
    };
  }, []);

  const handleToggleSpeech = () => {
    const content = speakText || `${title}. ${message}`;
    const started = toggleIndonesianSpeech(content, speaking, () => setSpeaking(false));
    setSpeaking(started);
  };

  const bgTone =
    mood === 'celebrate'
      ? 'from-amber-50/80 via-white to-emerald-50/60 border-amber-200'
      : mood === 'happy'
      ? 'from-emerald-50/70 via-white to-teal-50/50 border-emerald-200'
      : mood === 'curious'
      ? 'from-sky-50/75 via-white to-cyan-50/55 border-sky-200'
      : 'from-teal-50/70 via-white to-sky-50/50 border-teal-200';

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-3.5 sm:p-4 ${bgTone}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {/* Ilustrasi SVG Maskot Kak Saka (Siswa/Mentor Lab IPA) */}
          <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            <svg
              viewBox="0 0 64 64"
              className="h-12 w-12 sm:h-14 sm:w-14"
              role="img"
              aria-label="Ilustrasi Kak Saka pemandu pembelajaran IPA"
            >
              <defs>
                <linearGradient id="sakaBg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ccfbf1" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="12" fill="url(#sakaBg)" />
              {/* Jas Lab */}
              <path d="M14 64 C15 49 23 45 32 45 C41 45 49 49 50 64 Z" fill="#ffffff" stroke="#0f766e" strokeWidth="1.5" />
              <path d="M27 46 L32 58 L37 46" fill="#0d9488" opacity="0.2" />
              <path d="M25 46 L32 56 L39 46" fill="none" stroke="#0f766e" strokeWidth="1.5" />
              {/* Kepala & Rambut */}
              <circle cx="32" cy="27" r="13" fill="#fde68a" stroke="#b45309" strokeWidth="1" />
              <path d="M19 25 C19 14 27 11 33 11 C41 11 46 16 45 25 C43 20 39 18 32 18 C25 18 21 20 19 25 Z" fill="#1e293b" />
              {/* Kacamata Sains */}
              <circle cx="26.5" cy="27" r="4" fill="#ffffff" fillOpacity="0.65" stroke="#0f172a" strokeWidth="1.4" />
              <circle cx="37.5" cy="27" r="4" fill="#ffffff" fillOpacity="0.65" stroke="#0f172a" strokeWidth="1.4" />
              <line x1="30.5" y1="27" x2="33.5" y2="27" stroke="#0f172a" strokeWidth="1.4" />
              {/* Mata */}
              <circle cx="26.5" cy="27" r="1.3" fill="#0f172a" />
              <circle cx="37.5" cy="27" r="1.3" fill="#0f172a" />
              {/* Ekspresi Mulut */}
              {mood === 'curious' ? (
                <circle cx="32" cy="34" r="1.8" fill="#9a3412" />
              ) : mood === 'celebrate' || mood === 'happy' ? (
                <path d="M27 33 Q32 37.5 37 33" fill="none" stroke="#9a3412" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M28 33.5 Q32 36 36 33.5" fill="none" stroke="#9a3412" strokeWidth="1.6" strokeLinecap="round" />
              )}
              {/* Tetes air kecil di kerah */}
              <path d="M47 47 C47 47 50 51 50 53 A3 3 0 1 1 44 53 C44 51 47 47 47 47 Z" fill="#0284c7" />
            </svg>
          </div>

          <div>
            <p className="text-xs font-bold text-teal-900">{title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-700 sm:text-sm">{message}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleSpeech}
          className="inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap self-start rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:self-center"
        >
          {speaking ? (
            <>
              <VolumeX className="h-3.5 w-3.5 text-red-600" />
              Hentikan Suara
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5 text-teal-700" />
              Bacakan Panduan
            </>
          )}
        </button>
      </div>
    </div>
  );
};
