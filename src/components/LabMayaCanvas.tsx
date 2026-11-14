import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Play, PlusCircle, RotateCcw } from 'lucide-react';
import { CURRICULUM_CONFIG } from '../data/curriculum';
import { LabTrial, MediaId, TurbidityId } from '../types/lkpd';
import { calculateFiltrationModel } from '../utils/filtrationModel';

interface LabMayaCanvasProps {
  selectedMedia: MediaId;
  ketebalan: number;
  kekeruhanAwal: TurbidityId;
  onMediaChange: (media: MediaId) => void;
  onKetebalanChange: (cm: number) => void;
  onKekeruhanChange: (turbidity: TurbidityId) => void;
  onRecordTrial: (trial: Omit<LabTrial, 'id' | 'catatan'>) => void;
}

interface SimParticle {
  x: number;
  y: number;
  r: number;
  speed: number;
  trapped: boolean;
  color: string;
}

interface SimState {
  status: 'idle' | 'running' | 'done';
  volumeFiltered: number;
  elapsedSec: number;
  totalTimeTarget: number;
  finalNtu: number;
  clarityPct: number;
  debit: number;
  particles: SimParticle[];
  drops: number[];
  lastTimestamp: number;
}

function createParticles(ntuAwal: number): SimParticle[] {
  const count = Math.round(ntuAwal / 3.5);
  const arr: SimParticle[] = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: 138 + Math.random() * 144,
      y: 36 + Math.random() * 68,
      r: 1.8 + Math.random() * 3.4,
      speed: 0.5 + Math.random() * 0.6,
      trapped: false,
      color: Math.random() > 0.35 ? '#451a03' : '#713f12',
    });
  }
  return arr;
}

export const LabMayaCanvas: React.FC<LabMayaCanvasProps> = ({
  selectedMedia,
  ketebalan,
  kekeruhanAwal,
  onMediaChange,
  onKetebalanChange,
  onKekeruhanChange,
  onRecordTrial,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const model = calculateFiltrationModel(selectedMedia, ketebalan, kekeruhanAwal);

  const simRef = useRef<SimState>({
    status: 'idle',
    volumeFiltered: 0,
    elapsedSec: 0,
    totalTimeTarget: model.waktuDetik,
    finalNtu: model.ntuAkhir,
    clarityPct: model.kejernihanPct,
    debit: model.debit,
    particles: createParticles(model.ntuAwal),
    drops: [],
    lastTimestamp: 0,
  });

  const [readout, setReadout] = useState({
    status: 'idle' as 'idle' | 'running' | 'done',
    elapsedSec: 0,
    volumeFiltered: 0,
    finalNtu: model.ntuAkhir,
    clarityPct: model.kejernihanPct,
  });

  const stopAnimation = () => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const sim = simRef.current;
    const media = model.media;
    const ntuAwal = model.ntuAwal;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Meja laboratorium
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, H - 24, W, 24);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, H - 24, W, 2);

    // Statif & klem penyangga
    ctx.fillStyle = '#475569';
    ctx.fillRect(52, 22, 10, H - 46);
    ctx.fillRect(36, H - 30, 56, 8);
    ctx.fillRect(62, 120, 68, 7);

    const progress = sim.volumeFiltered / 200;
    const topWaterLevel = Math.max(0, 1 - progress);

    // Tabung Penyaring Atas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(130, 26, 160, 185);

    // Air Baku di atas media
    if (topWaterLevel > 0.01) {
      const waterH = 80 * topWaterLevel;
      const waterY = 116 - waterH;
      const brownAlpha = Math.min(0.85, 0.35 + ntuAwal / 320);
      ctx.fillStyle = `rgba(146, 64, 14, ${brownAlpha})`;
      ctx.fillRect(132, waterY, 156, waterH);
    }

    // Lapisan Media Penyaring
    const mediaTotalH = 30 + ketebalan * 5.6;
    const mediaStartY = 206 - mediaTotalH;
    const layerH = mediaTotalH / media.lapisan.length;

    media.lapisan.forEach((lay, idx) => {
      const ly = mediaStartY + idx * layerH;
      ctx.fillStyle = lay.warna;
      ctx.fillRect(132, ly, 156, layerH);

      ctx.save();
      if (lay.tekstur === 'grid') {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        for (let gx = 138; gx < 286; gx += 12) {
          ctx.beginPath();
          ctx.moveTo(gx, ly);
          ctx.lineTo(gx, ly + layerH);
          ctx.stroke();
        }
      } else if (lay.tekstur === 'pebble') {
        ctx.fillStyle = '#57534e';
        for (let px = 140; px < 282; px += 15) {
          ctx.beginPath();
          ctx.arc(px, ly + layerH * 0.5, 3.8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (
        lay.tekstur === 'sand' ||
        lay.tekstur === 'fine' ||
        lay.tekstur === 'charcoal'
      ) {
        ctx.fillStyle = lay.tekstur === 'charcoal' ? '#0f172a' : '#ca8a04';
        for (let sx = 138; sx < 284; sx += 9) {
          ctx.fillRect(sx, ly + ((sx % 3) * 4) + 2, 2, 2);
        }
      }
      ctx.restore();

      ctx.fillStyle = '#334155';
      ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(lay.nama, 298, ly + layerH / 2 + 3);
    });

    // Penahan dasar tabung
    ctx.fillStyle = '#64748b';
    ctx.fillRect(130, 206, 160, 5);

    // Partikel pengotor
    sim.particles.forEach((p) => {
      if (p.y > 116 - 80 * topWaterLevel || p.trapped) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Dinding kaca & corong
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(130, 26, 160, 185);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(195, 211);
    ctx.lineTo(225, 211);
    ctx.lineTo(216, 235);
    ctx.lineTo(204, 235);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tetesan filtrat
    if (sim.status === 'running') {
      sim.drops.forEach((dy) => {
        ctx.fillStyle = sim.clarityPct > 75 ? '#0284c7' : '#a16207';
        ctx.beginPath();
        ctx.arc(210, dy, 3.8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Gelas Ukur Penampung Filtrat
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(150, 244, 120, 112);

    if (progress > 0.01) {
      const fillH = 96 * progress;
      const fillY = 356 - fillH;
      const mudRatio = Math.max(0, 1 - sim.clarityPct / 100);
      const r = Math.round(14 + mudRatio * 140);
      const g = Math.round(165 - mudRatio * 75);
      const b = Math.round(233 - mudRatio * 195);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
      ctx.fillRect(152, fillY, 116, fillH);
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(150, 244, 120, 112);

    ctx.fillStyle = '#334155';
    ctx.font = '500 10px "IBM Plex Mono", monospace';
    [50, 100, 150, 200].forEach((vol) => {
      const sy = 356 - (vol / 200) * 96;
      ctx.beginPath();
      ctx.moveTo(152, sy);
      ctx.lineTo(164, sy);
      ctx.stroke();
      ctx.fillText(`${vol}mL`, 167, sy + 3);
    });

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Air Baku (Campuran)', 154, 18);
    ctx.fillText('Filtrat (Hasil Saring)', 152, 372);
  };

  const resetSimulation = () => {
    stopAnimation();
    const freshModel = calculateFiltrationModel(selectedMedia, ketebalan, kekeruhanAwal);
    simRef.current = {
      status: 'idle',
      volumeFiltered: 0,
      elapsedSec: 0,
      totalTimeTarget: freshModel.waktuDetik,
      finalNtu: freshModel.ntuAkhir,
      clarityPct: freshModel.kejernihanPct,
      debit: freshModel.debit,
      particles: createParticles(freshModel.ntuAwal),
      drops: [],
      lastTimestamp: 0,
    };
    setReadout({
      status: 'idle',
      elapsedSec: 0,
      volumeFiltered: 0,
      finalNtu: freshModel.ntuAkhir,
      clarityPct: freshModel.kejernihanPct,
    });
    drawCanvas();
  };

  useEffect(() => {
    resetSimulation();
    return () => stopAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMedia, ketebalan, kekeruhanAwal]);

  const startSimulation = () => {
    if (simRef.current.status === 'running') return;
    resetSimulation();

    const media = model.media;
    const mediaTopY = 206 - (30 + ketebalan * 5.6);

    simRef.current.status = 'running';
    simRef.current.lastTimestamp = performance.now();
    simRef.current.drops = [238, 268, 298];

    const step = (now: number) => {
      const sim = simRef.current;
      const dt = Math.min(0.05, (now - sim.lastTimestamp) / 1000);
      sim.lastTimestamp = now;

      const timeScale = sim.totalTimeTarget > 9 ? sim.totalTimeTarget / 7.5 : 1.0;
      sim.elapsedSec = Math.min(sim.totalTimeTarget, sim.elapsedSec + dt * timeScale);
      sim.volumeFiltered = Math.min(
        200,
        (sim.elapsedSec / sim.totalTimeTarget) * 200
      );

      sim.particles.forEach((p) => {
        if (!p.trapped) {
          p.y += p.speed * (1.2 + dt * 15);
          if (p.y >= mediaTopY) {
            const thresholdR = media.poriMm >= 1.5 ? 4.2 : media.poriMm >= 0.4 ? 3.0 : 1.8;
            if (p.r >= thresholdR || Math.random() < sim.clarityPct / 100) {
              p.trapped = true;
              p.y = mediaTopY + Math.random() * 6;
            } else if (p.y > 205) {
              p.y = 205;
              p.trapped = true;
            }
          }
        }
      });

      sim.drops = sim.drops.map((dy) => {
        const nextY = dy + 120 * dt;
        return nextY > 345 ? 238 : nextY;
      });

      drawCanvas();
      setReadout({
        status: sim.elapsedSec < sim.totalTimeTarget ? 'running' : 'done',
        elapsedSec: sim.elapsedSec,
        volumeFiltered: sim.volumeFiltered,
        finalNtu: sim.finalNtu,
        clarityPct: sim.clarityPct,
      });

      if (sim.elapsedSec < sim.totalTimeTarget) {
        animRef.current = requestAnimationFrame(step);
      } else {
        sim.status = 'done';
        sim.elapsedSec = sim.totalTimeTarget;
        sim.volumeFiltered = 200;
        drawCanvas();
        setReadout({
          status: 'done',
          elapsedSec: sim.totalTimeTarget,
          volumeFiltered: 200,
          finalNtu: sim.finalNtu,
          clarityPct: sim.clarityPct,
        });
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  const handleRecord = () => {
    if (readout.status !== 'done') return;
    onRecordTrial({
      mediaId: selectedMedia,
      mediaNama: model.media.namaSingkat,
      ketebalanCm: ketebalan,
      ntuAwal: model.ntuAwal,
      waktuDetik: model.waktuDetik,
      debit: model.debit,
      ntuAkhir: model.ntuAkhir,
      kejernihanPct: model.kejernihanPct,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600">
          Status simulasi:{' '}
          <strong className="text-slate-900">
            {readout.status === 'idle'
              ? 'Siap diuji'
              : readout.status === 'running'
              ? 'Sedang menyaring...'
              : 'Selesai — silakan rekam data'}
          </strong>
        </span>
        <button
          type="button"
          onClick={() => setShowHelp((prev) => !prev)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <BookOpen className="h-3.5 w-3.5" />
          {showHelp ? 'Tutup Petunjuk' : 'Petunjuk Singkat'}
        </button>
      </div>

      {showHelp && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3.5 text-sm text-slate-700">
          <ol className="list-decimal space-y-1 pl-5">
            <li>Pilih <strong>Jenis Media Penyaring</strong>, <strong>Ketebalan Lapisan (cm)</strong>, dan <strong>Kekeruhan Air Awal (NTU)</strong>.</li>
            <li>Tekan <strong>Mulai Menyaring</strong> untuk mengamati penahanan partikel dan laju filtrasi secara real-time.</li>
            <li>Setelah volume filtrat mencapai <strong>200 mL</strong>, tekan <strong>Rekam Data</strong> untuk memasukkan hasil ke tabel.</li>
            <li>Lakukan minimal <strong>3 percobaan berbeda</strong> agar dapat dianalisis pada tahap berikutnya.</li>
          </ol>
        </div>
      )}

      {/* Tata Letak 2 Zona: Kiri Kanvas Simulasi, Kanan Kontrol Variabel */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        {/* Zona Kiri: Kanvas & Pembacaan Alat Ukur */}
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-white lg:col-span-7">
          <canvas
            ref={canvasRef}
            width={430}
            height={380}
            className="mx-auto block h-auto w-full max-w-[430px] rounded-lg bg-slate-50"
          />

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-center">
              <span className="block text-[11px] text-slate-400">Waktu Saring</span>
              <span className="font-mono-num text-base font-bold text-sky-300">
                {readout.elapsedSec.toFixed(1)} s
              </span>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-center">
              <span className="block text-[11px] text-slate-400">Volume Filtrat</span>
              <span className="font-mono-num text-base font-bold text-sky-300">
                {Math.round(readout.volumeFiltered)} / 200 mL
              </span>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-center">
              <span className="block text-[11px] text-slate-400">Kekeruhan Akhir</span>
              <span className="font-mono-num text-base font-bold text-amber-300">
                {readout.status === 'done' ? `${readout.finalNtu} NTU` : '—'}
              </span>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-center">
              <span className="block text-[11px] text-slate-400">Kejernihan</span>
              <span className="font-mono-num text-base font-bold text-emerald-300">
                {readout.status === 'done' ? `${readout.clarityPct}%` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Zona Kanan: Panel Kontrol Parameter */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-5">
          <div>
            <label
              htmlFor="selMedia"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              1. Jenis Media Penyaring
            </label>
            <select
              id="selMedia"
              value={selectedMedia}
              disabled={readout.status === 'running'}
              onChange={(e) => onMediaChange(e.target.value as MediaId)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60"
            >
              {CURRICULUM_CONFIG.mediaList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="rngTebal" className="text-sm font-semibold text-slate-800">
                2. Ketebalan Lapisan Media
              </label>
              <span className="font-mono-num rounded bg-teal-700 px-2 py-0.5 text-xs font-bold text-white">
                {ketebalan} cm
              </span>
            </div>
            <input
              id="rngTebal"
              type="range"
              min={2}
              max={10}
              step={2}
              value={ketebalan}
              disabled={readout.status === 'running'}
              onChange={(e) => onKetebalanChange(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-teal-700 disabled:opacity-60"
            />
            <div className="font-mono-num mt-1 flex justify-between text-[11px] text-slate-500">
              <span>2 cm</span>
              <span>4 cm</span>
              <span>6 cm</span>
              <span>8 cm</span>
              <span>10 cm</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="selKeruh"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              3. Kekeruhan Air Awal (Volume tetap 200 mL)
            </label>
            <select
              id="selKeruh"
              value={kekeruhanAwal}
              disabled={readout.status === 'running'}
              onChange={(e) => onKekeruhanChange(e.target.value as TurbidityId)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60"
            >
              {CURRICULUM_CONFIG.kekeruhanOptions.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={startSimulation}
              disabled={readout.status === 'running'}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Mulai Menyaring
            </button>
            <button
              type="button"
              onClick={handleRecord}
              disabled={readout.status !== 'done'}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <PlusCircle className="h-4 w-4" />
              Rekam Data
            </button>
          </div>

          <button
            type="button"
            onClick={resetSimulation}
            className="inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Simulasi
          </button>
        </div>
      </div>
    </div>
  );
};
