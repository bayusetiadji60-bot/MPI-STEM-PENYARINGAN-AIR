import React, { useEffect, useState } from 'react';
import { CheckCircle2, Coins, FlaskConical, Gauge, ShieldCheck, XCircle } from 'lucide-react';
import { DesignTestResult, LayerBottomId, LayerMidId, LayerTopId } from '../types/lkpd';
import { LAYER_COSTS } from '../utils/filtrationModel';

interface BottleFilterBuilderProps {
  lapisanAtas: LayerTopId;
  lapisanTengah: LayerMidId;
  lapisanBawah: LayerBottomId;
  tebalDesain: number;
  hasilUji: DesignTestResult | null;
  onChangeTop: (val: LayerTopId) => void;
  onChangeMid: (val: LayerMidId) => void;
  onChangeBottom: (val: LayerBottomId) => void;
  onChangeThickness: (cm: number) => void;
  onTestDesign: () => void;
}

const TOP_OPTIONS: { id: LayerTopId; label: string; pori: string; fill: string }[] = [
  { id: 'kerikil', label: 'Kerikil Bersih', pori: 'Pori Besar', fill: '#78716c' },
  { id: 'pasir_kasar', label: 'Pasir Kasar', pori: 'Pori Sedang', fill: '#d6d3d1' },
  { id: 'kapas', label: 'Kapas', pori: 'Pori Halus', fill: '#f8fafc' },
];

const MID_OPTIONS: { id: LayerMidId; label: string; pori: string; fill: string }[] = [
  { id: 'pasir_halus', label: 'Pasir Halus', pori: 'Pori Rapat', fill: '#fde047' },
  { id: 'kerikil', label: 'Kerikil', pori: 'Pori Besar', fill: '#78716c' },
  { id: 'kain', label: 'Kain Kasa', pori: 'Pori Sedang', fill: '#cbd5e1' },
];

const BOTTOM_OPTIONS: { id: LayerBottomId; label: string; pori: string; fill: string }[] = [
  { id: 'kapas_arang', label: 'Arang Aktif + Kapas', pori: 'Adsorpsi Bau & Warna', fill: '#1e293b' },
  { id: 'kapas', label: 'Kapas Saja', pori: 'Penyaring Akhir', fill: '#f8fafc' },
  { id: 'kerikil', label: 'Kerikil Saja', pori: 'Pori Besar', fill: '#78716c' },
];

export const BottleFilterBuilder: React.FC<BottleFilterBuilderProps> = ({
  lapisanAtas,
  lapisanTengah,
  lapisanBawah,
  tebalDesain,
  hasilUji,
  onChangeTop,
  onChangeMid,
  onChangeBottom,
  onChangeThickness,
  onTestDesign,
}) => {
  const [animating, setAnimating] = useState(false);

  const estimatedCost =
    LAYER_COSTS.top[lapisanAtas] +
    LAYER_COSTS.mid[lapisanTengah] +
    LAYER_COSTS.bottom[lapisanBawah] +
    tebalDesain * 150;

  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => setAnimating(false), 1400);
    return () => clearTimeout(t);
  }, [animating]);

  const handleRunTest = () => {
    setAnimating(true);
    onTestDesign();
  };

  const topMeta = TOP_OPTIONS.find((o) => o.id === lapisanAtas) || TOP_OPTIONS[0];
  const midMeta = MID_OPTIONS.find((o) => o.id === lapisanTengah) || MID_OPTIONS[0];
  const botMeta = BOTTOM_OPTIONS.find((o) => o.id === lapisanBawah) || BOTTOM_OPTIONS[0];

  const filtrateColor =
    hasilUji && hasilUji.kejernihan >= 85
      ? '#38bdf8'
      : hasilUji && hasilUji.kejernihan >= 70
      ? '#7dd3fc'
      : '#d97706';

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/75 via-white to-teal-50/35 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">
          Susun Langsung Lapisan ke Botol Filter & Kelola Anggaran
        </h3>
        <span className="font-mono-num inline-flex items-center gap-1 text-xs font-bold text-slate-700">
          <Coins className="h-3.5 w-3.5 text-amber-600" />
          Estimasi Biaya: Rp {estimatedCost.toLocaleString('id-ID')}
          <span className={estimatedCost <= 5500 ? 'text-emerald-700' : 'text-amber-700'}>
            ({estimatedCost <= 5500 ? 'Hemat <= Rp 5.500' : 'Melebihi Rp 5.500'})
          </span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-12 md:items-start">
        {/* Visualisasi Botol Filter Interaktif */}
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-3 md:col-span-5">
          <p className="mb-2 text-xs font-semibold text-slate-700">
            Penampang Prototipe Botol
          </p>
          <svg
            viewBox="0 0 200 285"
            className="h-auto w-full max-w-[195px]"
            role="img"
            aria-label="Penampang botol plastik berisi lapisan media penyaring air"
          >
            {/* Air Keruh Masuk */}
            <rect x="46" y="14" width="108" height="24" rx="3" fill="#92400e" fillOpacity="0.82" />
            <text x="100" y="30" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="700">
              Air Irigasi 120 NTU
            </text>

            {/* Lapisan Atas */}
            <rect x="46" y="40" width="108" height="36" fill={topMeta.fill} stroke="#94a3b8" strokeWidth="1" />
            <text
              x="100"
              y="62"
              textAnchor="middle"
              fill={lapisanAtas === 'kapas' ? '#0f172a' : '#ffffff'}
              fontSize="9.5"
              fontWeight="700"
            >
              Atas: {topMeta.label}
            </text>

            {/* Lapisan Tengah */}
            <rect x="46" y="78" width="108" height="38" fill={midMeta.fill} stroke="#94a3b8" strokeWidth="1" />
            <text
              x="100"
              y="100"
              textAnchor="middle"
              fill={lapisanTengah === 'kerikil' ? '#ffffff' : '#0f172a'}
              fontSize="9.5"
              fontWeight="700"
            >
              Tengah: {midMeta.label}
            </text>

            {/* Lapisan Bawah */}
            <rect x="46" y="118" width="108" height="40" fill={botMeta.fill} stroke="#94a3b8" strokeWidth="1" />
            <text
              x="100"
              y="141"
              textAnchor="middle"
              fill={lapisanBawah === 'kapas' ? '#0f172a' : '#ffffff'}
              fontSize="9"
              fontWeight="700"
            >
              Bawah: {botMeta.label}
            </text>

            {/* Dinding Botol Terbalik */}
            <path
              d="M44 10 L44 158 L84 184 L84 198 L116 198 L116 184 L156 158 L156 10"
              fill="none"
              stroke="#334155"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Tetesan Air */}
            <circle
              cx="100"
              cy={animating ? 216 : 210}
              r="4"
              fill={filtrateColor}
              className="transition-all duration-300"
            />

            {/* Gelas Penampung */}
            <rect x="64" y="222" width="72" height="50" rx="4" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
            <rect
              x="66"
              y={hasilUji ? 236 : 254}
              width="68"
              height={hasilUji ? 34 : 16}
              rx="2"
              fill={filtrateColor}
              fillOpacity="0.82"
              className="transition-all duration-500"
            />
            <text x="100" y="260" textAnchor="middle" fill="#0f172a" fontSize="9.5" fontWeight="700">
              {hasilUji ? `${hasilUji.kejernihan}% Jernih` : 'Siap Diuji'}
            </text>
          </svg>
        </div>

        {/* Pemilih Bahan Visual per Lapisan */}
        <div className="space-y-3.5 md:col-span-7">
          {/* Slot 1: Lapisan Atas */}
          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-800">
              1. Lapisan Atas (Penyaring Awal Lumpur Kasar)
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {TOP_OPTIONS.map((opt) => {
                const active = lapisanAtas === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeTop(opt.id)}
                    className={`min-h-[54px] rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      active
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-teal-500'
                    }`}
                  >
                    <span className="block font-bold">{opt.label}</span>
                    <span className={`font-mono-num text-[11px] ${active ? 'text-teal-100' : 'text-slate-500'}`}>
                      {opt.pori} · Rp {LAYER_COSTS.top[opt.id].toLocaleString('id-ID')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot 2: Lapisan Tengah */}
          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-800">
              2. Lapisan Tengah (Penahan Pasir & Partikel Sedang)
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {MID_OPTIONS.map((opt) => {
                const active = lapisanTengah === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeMid(opt.id)}
                    className={`min-h-[54px] rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      active
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-teal-500'
                    }`}
                  >
                    <span className="block font-bold">{opt.label}</span>
                    <span className={`font-mono-num text-[11px] ${active ? 'text-teal-100' : 'text-slate-500'}`}>
                      {opt.pori} · Rp {LAYER_COSTS.mid[opt.id].toLocaleString('id-ID')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot 3: Lapisan Bawah */}
          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-800">
              3. Lapisan Bawah (Penyaring Halus & Penyerap Bau)
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {BOTTOM_OPTIONS.map((opt) => {
                const active = lapisanBawah === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeBottom(opt.id)}
                    className={`min-h-[54px] rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      active
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-teal-500'
                    }`}
                  >
                    <span className="block font-bold">{opt.label}</span>
                    <span className={`font-mono-num text-[11px] ${active ? 'text-teal-100' : 'text-slate-500'}`}>
                      {opt.pori} · Rp {LAYER_COSTS.bottom[opt.id].toLocaleString('id-ID')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ketebalan Total */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="rngTebalDesain" className="text-xs font-bold text-slate-800">
                4. Ketebalan Total Media (+Rp {(tebalDesain * 150).toLocaleString('id-ID')})
              </label>
              <span className="font-mono-num rounded bg-teal-700 px-2 py-0.5 text-xs font-bold text-white">
                {tebalDesain} cm
              </span>
            </div>
            <input
              id="rngTebalDesain"
              type="range"
              min={4}
              max={16}
              step={2}
              value={tebalDesain}
              onChange={(e) => onChangeThickness(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-teal-700"
            />
            <div className="font-mono-num mt-1 flex justify-between text-[11px] text-slate-500">
              <span>4 cm</span>
              <span>8 cm</span>
              <span>12 cm</span>
              <span>16 cm</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunTest}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            <FlaskConical className="h-4 w-4" />
            Uji Rancangan Alat di Botol
          </button>
        </div>
      </div>

      {hasilUji && (
        <div
          className={`mt-4 rounded-xl border p-3.5 text-sm ${
            hasilUji.lolos
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 font-bold">
              {hasilUji.lolos ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              ) : (
                <XCircle className="h-4 w-4 text-red-700" />
              )}
              {hasilUji.lolos
                ? 'LOLOS TARGET: Rancangan Memenuhi Syarat Teknis'
                : 'PERLU PERBAIKAN DESAIN'}
            </p>
            <span className="font-mono-num inline-flex items-center gap-2 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Biaya Rp {(hasilUji.biayaEstimasi ?? estimatedCost).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="font-mono-num mt-2 grid grid-cols-3 gap-2 text-xs font-semibold">
            <div className="rounded-lg bg-white/80 px-2.5 py-1.5">
              <Gauge className="mb-0.5 inline h-3.5 w-3.5 text-teal-700" /> Kejernihan:{' '}
              {hasilUji.kejernihan}%
            </div>
            <div className="rounded-lg bg-white/80 px-2.5 py-1.5">
              Waktu: {hasilUji.waktuDetik} detik
            </div>
            <div className="rounded-lg bg-white/80 px-2.5 py-1.5">
              Sisa NTU: {hasilUji.ntuHasil} NTU
            </div>
          </div>
          <p className="mt-2 text-xs">{hasilUji.catatan}</p>
        </div>
      )}
    </div>
  );
};
