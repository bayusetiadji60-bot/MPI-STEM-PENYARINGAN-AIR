import React, { useEffect, useRef, useState } from 'react';
import { Microscope, X } from 'lucide-react';

type MixtureType = 'heterogen' | 'larutan';
type PorePreset = 'kasa' | 'kerikil' | 'kombinasi';

interface MicroParticle {
  x: number;
  y: number;
  r: number;
  vy: number;
  kind: 'water' | 'mud' | 'colloid' | 'salt';
  trapped: boolean;
}

const PORE_SPECS: Record<
  PorePreset,
  { label: string; gapPx: number; desc: string; wallColor: string }
> = {
  kasa: {
    label: 'Kasa Kawat (2,0 mm)',
    gapPx: 44,
    desc: 'Lubang pori sangat lebar: hanya menahan serpihan kasar, sementara lumpur halus ikut lolos ke filtrat.',
    wallColor: '#64748b',
  },
  kerikil: {
    label: 'Kerikil + Pasir (0,5 mm)',
    gapPx: 22,
    desc: 'Celah pori sedang: butiran pasir dan gumpalan lumpur besar tertahan, namun koloid sangat halus masih bisa menerobos.',
    wallColor: '#78716c',
  },
  kombinasi: {
    label: 'Kombinasi Bertingkat (0,02 mm)',
    gapPx: 9,
    desc: 'Pori super rapat + arang aktif: hampir semua partikel lumpur & koloid tersaring menjadi Residu, kecuali molekul air dan ion garam terlarut!',
    wallColor: '#0f766e',
  },
};

function createMicroParticles(mixture: MixtureType): MicroParticle[] {
  const list: MicroParticle[] = [];
  // Molekul air
  for (let i = 0; i < 24; i++) {
    list.push({
      x: 24 + Math.random() * 412,
      y: Math.random() * 110,
      r: 2.3,
      vy: 1.05 + Math.random() * 0.55,
      kind: 'water',
      trapped: false,
    });
  }
  if (mixture === 'heterogen') {
    for (let i = 0; i < 16; i++) {
      list.push({
        x: 26 + Math.random() * 408,
        y: Math.random() * 100,
        r: 7.5 + Math.random() * 6,
        vy: 0.7 + Math.random() * 0.4,
        kind: 'mud',
        trapped: false,
      });
    }
    for (let i = 0; i < 16; i++) {
      list.push({
        x: 26 + Math.random() * 408,
        y: Math.random() * 100,
        r: 3.6 + Math.random() * 2.4,
        vy: 0.85 + Math.random() * 0.45,
        kind: 'colloid',
        trapped: false,
      });
    }
  } else {
    // Larutan garam: ion Na+ / Cl- berukuran < 1 nm
    for (let i = 0; i < 26; i++) {
      list.push({
        x: 24 + Math.random() * 412,
        y: Math.random() * 110,
        r: 1.8,
        vy: 1.05 + Math.random() * 0.55,
        kind: 'salt',
        trapped: false,
      });
    }
  }
  return list;
}

export const MicroscopeZoomView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mixture, setMixture] = useState<MixtureType>('heterogen');
  const [pore, setPore] = useState<PorePreset>('kombinasi');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const particles = createMicroParticles(mixture);
    const spec = PORE_SPECS[pore];
    const barrierY = 132;
    const barrierH = 26;

    // Bangun posisi balok penghalang pori
    const blocks: { x: number; w: number }[] = [];
    const blockW = 24;
    let cursor = 10;
    while (cursor < canvas.width - 10) {
      blocks.push({ x: cursor, w: blockW });
      cursor += blockW + spec.gapPx;
    }

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Latar atas (air baku) dan bawah (filtrat)
      ctx.fillStyle = mixture === 'heterogen' ? '#fef3c7' : '#e0f2fe';
      ctx.fillRect(0, 0, W, barrierY);
      ctx.fillStyle =
        mixture === 'heterogen' && pore === 'kasa'
          ? '#fef3c7'
          : mixture === 'heterogen' && pore === 'kerikil'
          ? '#e0f2fe'
          : '#f0f9ff';
      ctx.fillRect(0, barrierY + barrierH, W, H - (barrierY + barrierH));

      // Pita media penyaring & celah pori
      ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
      ctx.fillRect(0, barrierY, W, barrierH);
      blocks.forEach((b) => {
        ctx.fillStyle = spec.wallColor;
        ctx.beginPath();
        ctx.roundRect(b.x, barrierY, b.w, barrierH, 6);
        ctx.fill();
      });

      // Update & gambar partikel
      particles.forEach((p) => {
        if (!p.trapped) {
          p.y += p.vy;
          if (p.y + p.r >= barrierY && p.y - p.r <= barrierY + barrierH) {
            if (p.kind === 'mud' && spec.gapPx <= 24) {
              p.trapped = true;
              p.y = barrierY - p.r - 1;
            } else if (p.kind === 'colloid' && spec.gapPx <= 12) {
              p.trapped = true;
              p.y = barrierY - p.r - 1;
            }
          }
          if (p.y > H + 10) {
            p.y = -8;
            p.x = 22 + Math.random() * (W - 44);
          }
        }

        if (p.kind === 'water') {
          ctx.fillStyle = '#0284c7';
        } else if (p.kind === 'salt') {
          ctx.fillStyle = '#16a34a';
        } else if (p.kind === 'mud') {
          ctx.fillStyle = '#78350f';
        } else {
          ctx.fillStyle = '#b45309';
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Label zona
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ZONA ATAS · Partikel Menuju Penyaring', 12, 18);
      ctx.fillText('ZONA BAWAH · Filtrat (Cairan yang Lolos Pori)', 12, H - 10);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mixture, pore]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMixture('heterogen')}
            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              mixture === 'heterogen'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Air Lumpur (Heterogen)
          </button>
          <button
            type="button"
            onClick={() => setMixture('larutan')}
            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              mixture === 'larutan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Air Garam (Larutan Sejati)
          </button>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {(Object.keys(PORE_SPECS) as PorePreset[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPore(key)}
              className={`whitespace-nowrap shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                pore === key
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {PORE_SPECS[key].label}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={460}
        height={250}
        className="w-full rounded-xl border border-slate-200 bg-white"
      />

      {/* Legenda Partikel */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-600" />
          Molekul Air (H₂O)
        </span>
        {mixture === 'heterogen' ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-amber-950" />
              Butiran Pasir/Lumpur Besar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-700" />
              Koloid Lumpur Halus
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
            Ion Garam Terlarut (&lt; 1 nm — selalu lolos pori!)
          </span>
        )}
      </div>

      <p className="rounded-xl border border-sky-200 bg-sky-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-slate-700">
        {mixture === 'larutan'
          ? 'Perhatikan: Pada larutan sejati seperti air garam, ion terlarut berukuran lebih kecil dari 1 nanometer sehingga tetap lolos menembus pori penyaring paling rapat sekalipun. Garam hanya bisa dipisahkan dengan penguapan/kristalisasi.'
          : PORE_SPECS[pore].desc}
      </p>
    </div>
  );
};

interface MicroscopeZoomModalProps {
  open: boolean;
  onClose: () => void;
}

export const MicroscopeZoomModal: React.FC<MicroscopeZoomModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="microModalTitle"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-teal-700" />
            <h3 id="microModalTitle" className="text-base font-bold text-slate-900">
              Kaca Pembesar Mikroskopis: Ukuran Partikel vs Pori Filter
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup kaca pembesar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <MicroscopeZoomView />
      </div>
    </div>
  );
};
