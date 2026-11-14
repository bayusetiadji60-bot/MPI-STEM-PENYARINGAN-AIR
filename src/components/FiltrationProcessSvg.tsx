import React, { useState } from 'react';
import { Droplets, Filter, Layers, Sparkles } from 'lucide-react';

interface LayerDetail {
  id: string;
  judul: string;
  peran: string;
  ukuran: string;
  warna: string;
}

const LAYER_DETAILS: LayerDetail[] = [
  {
    id: 'air_baku',
    judul: 'Air Keruh (Campuran Heterogen)',
    peran: 'Mengandung air, serpihan daun, pasir, dan partikel lumpur halus yang belum terpisah.',
    ukuran: 'Ukuran partikel beragam (> 0,02 mm hingga > 2 mm)',
    warna: 'text-amber-800 bg-amber-50 border-amber-200',
  },
  {
    id: 'kerikil',
    judul: 'Lapisan 1 · Kerikil (Pori Besar)',
    peran: 'Menahan kotoran berukuran besar seperti daun, ranting, dan pasir kasar agar lapisan bawah tidak cepat tersumbat.',
    ukuran: 'Menahan partikel > 0,5 mm (Residu Kasar)',
    warna: 'text-stone-800 bg-stone-50 border-stone-200',
  },
  {
    id: 'pasir',
    judul: 'Lapisan 2 · Pasir Halus (Pori Kecil)',
    peran: 'Menyaring butiran lumpur dan partikel padat kecil yang lolos dari celah kerikil.',
    ukuran: 'Menahan partikel 0,08 - 0,5 mm (Residu Halus)',
    warna: 'text-yellow-900 bg-yellow-50 border-yellow-200',
  },
  {
    id: 'arang',
    judul: 'Lapisan 3 · Arang Aktif (Adsorpsi)',
    peran: 'Menyerap (mengadsorpsi) bau tidak sedap, zat warna keruh, dan partikel koloid sangat halus.',
    ukuran: 'Pori mikro untuk adsorpsi warna & bau',
    warna: 'text-slate-800 bg-slate-100 border-slate-300',
  },
  {
    id: 'kapas',
    judul: 'Lapisan 4 · Kapas / Spons (Penahan Akhir)',
    peran: 'Menahan sisa butiran halus arang dan pasir agar hanya air jernih yang menetes keluar.',
    ukuran: 'Penahan akhir sebelum filtrat keluar',
    warna: 'text-sky-900 bg-sky-50 border-sky-200',
  },
  {
    id: 'filtrat',
    judul: 'Hasil · Filtrat (Air Jernih)',
    peran: 'Cairan yang lolos melewati seluruh lapisan penyaring menuju gelas penampung.',
    ukuran: 'Partikel tersuspensi berkurang drastis',
    warna: 'text-teal-900 bg-teal-50 border-teal-200',
  },
];

export const FiltrationProcessSvg: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<string>('kerikil');
  const selected =
    LAYER_DETAILS.find((item) => item.id === activeLayer) || LAYER_DETAILS[1];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/40 to-teal-50/50 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-sky-600 text-white">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Diagram Proses Penyaringan Air Bertingkat (Interaktif)
            </h3>
            <p className="text-xs text-slate-600">
              Klik salah satu bagian pada gambar untuk melihat fungsi tiap lapisan penyaring.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <svg
            viewBox="0 0 540 310"
            className="mx-auto block w-full max-w-[540px] rounded-xl border border-slate-200 bg-white"
            role="img"
            aria-label="Diagram ilustrasi SVG proses penyaringan air bertingkat dari air keruh menjadi filtrat jernih"
          >
            <defs>
              <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#f0f9ff" />
              </linearGradient>
              <linearGradient id="dirtyWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a16207" stopOpacity="0.82" />
                <stop offset="100%" stopColor="#78350f" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="cleanWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.88" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="540" height="310" fill="url(#bgGrad)" />

            {/* Badan Tabung Penyaring */}
            <rect
              x="120"
              y="26"
              width="140"
              height="182"
              rx="6"
              fill="#ffffff"
              stroke="#334155"
              strokeWidth="2.5"
            />

            {/* Air Keruh Masuk */}
            <g
              onClick={() => setActiveLayer('air_baku')}
              className="cursor-pointer"
            >
              <rect
                x="123"
                y="32"
                width="134"
                height="44"
                fill="url(#dirtyWater)"
                opacity={activeLayer === 'air_baku' ? 1 : 0.88}
              />
              <circle cx="145" cy="48" r="3.5" fill="#451a03" />
              <circle cx="176" cy="58" r="4" fill="#166534" />
              <circle cx="204" cy="44" r="3" fill="#451a03" />
              <circle cx="234" cy="60" r="3.5" fill="#fde047" />
              <circle cx="162" cy="64" r="2.5" fill="#451a03" />
              <text
                x="190"
                y="56"
                textAnchor="middle"
                fill="#fef3c7"
                fontSize="10.5"
                fontWeight="700"
              >
                Air Keruh
              </text>
            </g>

            {/* Lapisan 1: Kerikil */}
            <g
              onClick={() => setActiveLayer('kerikil')}
              className="cursor-pointer"
            >
              <rect
                x="123"
                y="76"
                width="134"
                height="32"
                fill="#a8a29e"
                stroke={activeLayer === 'kerikil' ? '#0f766e' : 'none'}
                strokeWidth="2"
              />
              {[136, 154, 173, 193, 212, 232, 246].map((cx, i) => (
                <circle
                  key={cx}
                  cx={cx}
                  cy={88 + (i % 2) * 8}
                  r="5.5"
                  fill="#78716c"
                  stroke="#57534e"
                  strokeWidth="1"
                />
              ))}
              {/* Residu kasar tertahan */}
              <ellipse cx="164" cy="78" rx="6" ry="2.5" fill="#166534" />
              <circle cx="218" cy="79" r="3" fill="#451a03" />
            </g>

            {/* Lapisan 2: Pasir Halus */}
            <g
              onClick={() => setActiveLayer('pasir')}
              className="cursor-pointer"
            >
              <rect
                x="123"
                y="108"
                width="134"
                height="32"
                fill="#fde047"
                stroke={activeLayer === 'pasir' ? '#0f766e' : 'none'}
                strokeWidth="2"
              />
              {[132, 146, 160, 174, 188, 202, 216, 230, 244].map((sx, i) => (
                <circle
                  key={sx}
                  cx={sx}
                  cy={118 + (i % 3) * 6}
                  r="1.6"
                  fill="#a16207"
                />
              ))}
            </g>

            {/* Lapisan 3: Arang Aktif */}
            <g
              onClick={() => setActiveLayer('arang')}
              className="cursor-pointer"
            >
              <rect
                x="123"
                y="140"
                width="134"
                height="30"
                fill="#334155"
                stroke={activeLayer === 'arang' ? '#0ea5e9' : 'none'}
                strokeWidth="2"
              />
              {[136, 152, 168, 184, 200, 216, 232, 246].map((ax, i) => (
                <rect
                  key={ax}
                  x={ax}
                  y={148 + (i % 2) * 9}
                  width="5"
                  height="4"
                  rx="1"
                  fill="#0f172a"
                />
              ))}
            </g>

            {/* Lapisan 4: Kapas */}
            <g
              onClick={() => setActiveLayer('kapas')}
              className="cursor-pointer"
            >
              <rect
                x="123"
                y="170"
                width="134"
                height="26"
                fill="#f1f5f9"
                stroke={activeLayer === 'kapas' ? '#0f766e' : '#cbd5e1'}
                strokeWidth={activeLayer === 'kapas' ? '2' : '1'}
              />
              <path
                d="M128 183 Q145 175 162 183 T196 183 T230 183 T252 183"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
            </g>

            {/* Penahan Berlubang & Corong */}
            <rect x="123" y="196" width="134" height="6" fill="#64748b" />
            <path
              d="M174 208 L206 208 L196 226 L184 226 Z"
              fill="#e2e8f0"
              stroke="#334155"
              strokeWidth="2"
            />

            {/* Tetesan Filtrat */}
            <path d="M190 232 C190 232 185 240 185 243 A5 5 0 0 0 195 243 C195 240 190 232 190 232 Z" fill="#0284c7" />

            {/* Gelas Penampung Filtrat */}
            <g
              onClick={() => setActiveLayer('filtrat')}
              className="cursor-pointer"
            >
              <rect
                x="138"
                y="248"
                width="104"
                height="48"
                rx="4"
                fill="#ffffff"
                stroke="#334155"
                strokeWidth="2.2"
              />
              <rect x="140" y="264" width="100" height="30" rx="2" fill="url(#cleanWater)" />
              <text
                x="190"
                y="283"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10.5"
                fontWeight="700"
              >
                Filtrat Jernih
              </text>
            </g>

            {/* Label Panah Sisi Kiri (Residu vs Filtrat) */}
            <text x="16" y="54" fill="#92400e" fontSize="10.5" fontWeight="700">
              Campuran Awal
            </text>
            <line x1="98" y1="50" x2="118" y2="50" stroke="#92400e" strokeWidth="1.5" />

            <text x="16" y="88" fill="#475569" fontSize="10.5" fontWeight="700">
              Residu Tertahan
            </text>
            <line x1="98" y1="84" x2="118" y2="84" stroke="#475569" strokeWidth="1.5" />

            <text x="16" y="280" fill="#0369a1" fontSize="10.5" fontWeight="700">
              Air Hasil Saring
            </text>
            <line x1="102" y1="276" x2="134" y2="276" stroke="#0369a1" strokeWidth="1.5" />

            {/* Label Sisi Kanan (Klik-able Callouts) */}
            {[
              { id: 'air_baku', y: 54, label: '1. Air Keruh (Lumpur & Daun)' },
              { id: 'kerikil', y: 95, label: '2. Kerikil (Saring Kotoran Besar)' },
              { id: 'pasir', y: 127, label: '3. Pasir Halus (Saring Lumpur)' },
              { id: 'arang', y: 158, label: '4. Arang Aktif (Serap Bau & Warna)' },
              { id: 'kapas', y: 186, label: '5. Kapas (Penahan Partikel Halus)' },
              { id: 'filtrat', y: 278, label: '6. Filtrat (Air Bersih / Jernih)' },
            ].map((item) => {
              const isSelected = activeLayer === item.id;
              return (
                <g
                  key={item.id}
                  onClick={() => setActiveLayer(item.id)}
                  className="cursor-pointer"
                >
                  <line
                    x1="262"
                    y1={item.y - 3}
                    x2="282"
                    y2={item.y - 3}
                    stroke={isSelected ? '#0f766e' : '#94a3b8'}
                    strokeWidth={isSelected ? '2' : '1.2'}
                  />
                  <rect
                    x="284"
                    y={item.y - 14}
                    width="242"
                    height="21"
                    rx="6"
                    fill={isSelected ? '#0f766e' : '#ffffff'}
                    stroke={isSelected ? '#115e59' : '#cbd5e1'}
                    strokeWidth="1"
                  />
                  <text
                    x="293"
                    y={item.y}
                    fill={isSelected ? '#ffffff' : '#1e293b'}
                    fontSize="10.5"
                    fontWeight="600"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Kartu Penjelasan Lapisan Terpilih */}
        <div className="space-y-3 lg:col-span-5">
          <div className={`rounded-xl border p-4 transition-colors ${selected.warna}`}>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 shrink-0" />
              <h4 className="text-sm font-bold">{selected.judul}</h4>
            </div>
            <p className="mt-2 text-xs leading-relaxed opacity-95">{selected.peran}</p>
            <p className="font-mono-num mt-2 text-[11px] font-semibold opacity-85">
              Fungsi ukuran: {selected.ukuran}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-teal-800">
              <Droplets className="h-3.5 w-3.5" />
              <span>Kunci Proses Filtrasi</span>
            </div>
            <p className="mt-1 leading-relaxed">
              Air mengalir dari atas ke bawah karena gaya gravitasi. Setiap lapisan memiliki ukuran pori semakin kecil agar kotoran tersaring bertahap dari ukuran kasar hingga mikroskopis.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {LAYER_DETAILS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveLayer(item.id)}
                className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  activeLayer === item.id
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                {item.id === 'air_baku'
                  ? 'Air Keruh'
                  : item.id === 'kerikil'
                  ? 'Kerikil'
                  : item.id === 'pasir'
                  ? 'Pasir'
                  : item.id === 'arang'
                  ? 'Arang'
                  : item.id === 'kapas'
                  ? 'Kapas'
                  : 'Filtrat'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
