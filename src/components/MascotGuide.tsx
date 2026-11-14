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
  title = 'Beri si Berang-Berang · Pemandu Air Jernih',
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
    // Baca pesan santai secara langsung tanpa awalan judul yang kaku
    const content = speakText || message;
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
          {/* Ilustrasi SVG Maskot Hewan Lucu: Beri si Berang-Berang */}
          <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            <svg
              viewBox="0 0 72 72"
              className="h-14 w-14 sm:h-16 sm:w-16"
              role="img"
              aria-label="Ilustrasi Beri si Berang-Berang, maskot hewan lucu pemandu pembelajaran IPA"
            >
              <defs>
                <linearGradient id="beriBg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ccfbf1" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
              </defs>
              <rect width="72" height="72" rx="14" fill="url(#beriBg)" />

              {/* Telinga bulat lucu */}
              <circle cx="17" cy="22" r="7" fill="#9a643b" stroke="#784722" strokeWidth="1.2" />
              <circle cx="17" cy="22" r="3.6" fill="#fbcfe8" />
              <circle cx="55" cy="22" r="7" fill="#9a643b" stroke="#784722" strokeWidth="1.2" />
              <circle cx="55" cy="22" r="3.6" fill="#fbcfe8" />

              {/* Badan berang-berang & syal sains teal */}
              <path
                d="M17 72 C18 54 25 49 36 49 C47 49 54 54 55 72 Z"
                fill="#a97142"
                stroke="#784722"
                strokeWidth="1.2"
              />
              <ellipse cx="36" cy="64" rx="11" ry="9" fill="#fef3c7" />
              {/* Syal bandana lab warna teal */}
              <path
                d="M23 51 Q36 57 49 51 L44 60 L36 57 L28 60 Z"
                fill="#0f766e"
              />

              {/* Kepala bulat chubby */}
              <ellipse
                cx="36"
                cy="33"
                rx="20"
                ry="18"
                fill="#b47b49"
                stroke="#784722"
                strokeWidth="1.2"
              />

              {/* Pipi cream lembut */}
              <ellipse cx="36" cy="39" rx="13.5" ry="10.5" fill="#fef3c7" />

              {/* Rona pipi merah muda */}
              <ellipse cx="22.5" cy="36.5" rx="3.4" ry="2.1" fill="#fda4af" opacity="0.7" />
              <ellipse cx="49.5" cy="36.5" rx="3.4" ry="2.1" fill="#fda4af" opacity="0.7" />

              {/* Mata sesuai mood */}
              {mood === 'celebrate' ? (
                <>
                  <path
                    d="M24 28.5 Q27 24.5 30 28.5"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M42 28.5 Q45 24.5 48 28.5"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <circle cx="27" cy="28" r="3" fill="#1e293b" />
                  <circle cx="26" cy="26.9" r="1.1" fill="#ffffff" />
                  <circle cx="45" cy="28" r="3" fill="#1e293b" />
                  <circle cx="44" cy="26.9" r="1.1" fill="#ffffff" />
                </>
              )}

              {/* Kacamata lab bulat kecil di dahi/mata */}
              {mood === 'curious' && (
                <path
                  d="M42 22.5 Q45.5 20.5 49 22.5"
                  fill="none"
                  stroke="#57351b"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
              <circle cx="27" cy="28" r="5.3" fill="#ffffff" fillOpacity="0.18" stroke="#0d9488" strokeWidth="1.4" />
              <circle cx="45" cy="28" r="5.3" fill="#ffffff" fillOpacity="0.18" stroke="#0d9488" strokeWidth="1.4" />
              <line x1="32.3" y1="28" x2="39.7" y2="28" stroke="#0d9488" strokeWidth="1.4" />

              {/* Hidung mungil gelap berbentuk segitiga membulat */}
              <path
                d="M32.5 34.5 Q36 32.5 39.5 34.5 Q38.5 38 36 38.5 Q33.5 38 32.5 34.5 Z"
                fill="#292524"
              />
              <ellipse cx="35" cy="34.7" rx="1.2" ry="0.6" fill="#78716c" />

              {/* Mulut & ekspresi */}
              {mood === 'curious' ? (
                <circle cx="36" cy="43" r="2.1" fill="#9a3412" />
              ) : mood === 'celebrate' || mood === 'happy' ? (
                <path
                  d="M30.5 41 Q33.5 45 36 41.5 Q38.5 45 41.5 41"
                  fill="none"
                  stroke="#57351b"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M31.5 41.5 Q36 44.5 40.5 41.5"
                  fill="none"
                  stroke="#57351b"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}

              {/* Kumis kecil */}
              <line x1="16" y1="36" x2="22" y2="37" stroke="#784722" strokeWidth="1" strokeLinecap="round" />
              <line x1="15.5" y1="39.5" x2="22" y2="39.5" stroke="#784722" strokeWidth="1" strokeLinecap="round" />
              <line x1="56" y1="36" x2="50" y2="37" stroke="#784722" strokeWidth="1" strokeLinecap="round" />
              <line x1="56.5" y1="39.5" x2="50" y2="39.5" stroke="#784722" strokeWidth="1" strokeLinecap="round" />

              {/* Tangan mungil & tetes air jernih */}
              <ellipse cx="55" cy="58" rx="4.5" ry="3.5" fill="#b47b49" stroke="#784722" strokeWidth="1" />
              <path
                d="M58 43 C58 43 62.5 48.5 62.5 51.2 A4.5 4.5 0 1 1 53.5 51.2 C53.5 48.5 58 43 58 43 Z"
                fill="#0284c7"
              />
              <circle cx="56.6" cy="50.5" r="1.1" fill="#e0f2fe" />
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
              Dengarkan Panduan
            </>
          )}
        </button>
      </div>
    </div>
  );
};
