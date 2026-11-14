import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Droplets,
  Maximize2,
  Microscope,
  Minimize2,
  Play,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CURRICULUM_CONFIG } from '../data/curriculum';
import { LabTrial, MediaId, TurbidityId } from '../types/lkpd';
import { calculateFiltrationModel } from '../utils/filtrationModel';
import { playDropSound, playSuccessSound } from '../utils/soundEffects';
import { MicroscopeZoomModal } from './MicroscopeZoomView';

interface LabMayaCanvasProps {
  selectedMedia: MediaId;
  ketebalan: number;
  kekeruhanAwal: TurbidityId;
  soundEnabled: boolean;
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

interface ColumnSimState {
  volumeFiltered: number;
  elapsedSec: number;
  totalTimeTarget: number;
  finalNtu: number;
  clarityPct: number;
  debit: number;
  particles: SimParticle[];
  drops: number[];
}

interface DualSimState {
  status: 'idle' | 'running' | 'done';
  lastTimestamp: number;
  lastDropSoundAt: number;
  colA: ColumnSimState;
  colB: ColumnSimState;
}

function createParticles(ntuAwal: number, xMin: number, xSpan: number): SimParticle[] {
  const count = Math.round(ntuAwal / 3.8);
  const arr: SimParticle[] = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: xMin + Math.random() * xSpan,
      y: 34 + Math.random() * 68,
      r: 1.8 + Math.random() * 3.2,
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
  soundEnabled,
  onMediaChange,
  onKetebalanChange,
  onKekeruhanChange,
  onRecordTrial,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareMediaB, setCompareMediaB] = useState<MediaId>('kombinasi');
  const [compareTebalB, setCompareTebalB] = useState<number>(6);
  const [siklusSumbat, setSiklusSumbat] = useState<number>(1);
  const [showMicroscope, setShowMicroscope] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const modelA = calculateFiltrationModel(selectedMedia, ketebalan, kekeruhanAwal, siklusSumbat);
  const modelB = calculateFiltrationModel(compareMediaB, compareTebalB, kekeruhanAwal, 1);

  const buildInitialSim = (): DualSimState => ({
    status: 'idle',
    lastTimestamp: 0,
    lastDropSoundAt: 0,
    colA: {
      volumeFiltered: 0,
      elapsedSec: 0,
      totalTimeTarget: modelA.waktuDetik,
      finalNtu: modelA.ntuAkhir,
      clarityPct: modelA.kejernihanPct,
      debit: modelA.debit,
      particles: createParticles(modelA.ntuAwal, compareMode ? 48 : 138, compareMode ? 104 : 144),
      drops: [],
    },
    colB: {
      volumeFiltered: 0,
      elapsedSec: 0,
      totalTimeTarget: modelB.waktuDetik,
      finalNtu: modelB.ntuAkhir,
      clarityPct: modelB.kejernihanPct,
      debit: modelB.debit,
      particles: createParticles(modelB.ntuAwal, 272, 104),
      drops: [],
    },
  });

  const simRef = useRef<DualSimState>(buildInitialSim());

  const [readout, setReadout] = useState({
    status: 'idle' as 'idle' | 'running' | 'done',
    elapsedA: 0,
    volA: 0,
    ntuA: modelA.ntuAkhir,
    clarityA: modelA.kejernihanPct,
    elapsedB: 0,
    volB: 0,
    ntuB: modelB.ntuAkhir,
    clarityB: modelB.kejernihanPct,
  });

  const stopAnimation = () => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  };

  const drawSingleColumn = (
    ctx: CanvasRenderingContext2D,
    col: ColumnSimState,
    model: ReturnType<typeof calculateFiltrationModel>,
    tubeX: number,
    tubeW: number,
    title: string,
    siklus: number,
    isRunning: boolean,
    showLayerNamesRight: boolean
  ) => {
    const progress = col.volumeFiltered / 200;
    const topWaterLevel = Math.max(0, 1 - progress);
    const centerX = tubeX + tubeW / 2;

    // Tabung atas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tubeX, 28, tubeW, 182);

    // Air Baku
    if (topWaterLevel > 0.01) {
      const waterH = 78 * topWaterLevel;
      const waterY = 116 - waterH;
      const brownAlpha = Math.min(0.85, 0.35 + model.ntuAwal / 320);
      ctx.fillStyle = `rgba(146, 64, 14, ${brownAlpha})`;
      ctx.fillRect(tubeX + 2, waterY, tubeW - 4, waterH);
    }

    // Lapisan media
    const mediaTotalH = 30 + model.ketebalanCm * 5.4;
    const mediaStartY = 205 - mediaTotalH;
    const layerH = mediaTotalH / model.media.lapisan.length;

    model.media.lapisan.forEach((lay, idx) => {
      const ly = mediaStartY + idx * layerH;
      ctx.fillStyle = lay.warna;
      ctx.fillRect(tubeX + 2, ly, tubeW - 4, layerH);

      ctx.save();
      if (lay.tekstur === 'grid') {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.4;
        for (let gx = tubeX + 8; gx < tubeX + tubeW - 4; gx += 12) {
          ctx.beginPath();
          ctx.moveTo(gx, ly);
          ctx.lineTo(gx, ly + layerH);
          ctx.stroke();
        }
      } else if (lay.tekstur === 'pebble') {
        ctx.fillStyle = '#57534e';
        for (let px = tubeX + 10; px < tubeX + tubeW - 8; px += 15) {
          ctx.beginPath();
          ctx.arc(px, ly + layerH * 0.5, 3.6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (
        lay.tekstur === 'sand' ||
        lay.tekstur === 'fine' ||
        lay.tekstur === 'charcoal'
      ) {
        ctx.fillStyle = lay.tekstur === 'charcoal' ? '#0f172a' : '#ca8a04';
        for (let sx = tubeX + 8; sx < tubeX + tubeW - 6; sx += 9) {
          ctx.fillRect(sx, ly + ((sx % 3) * 3) + 2, 2, 2);
        }
      }
      ctx.restore();

      if (showLayerNamesRight) {
        ctx.fillStyle = '#334155';
        ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(lay.nama, tubeX + tubeW + 8, ly + layerH / 2 + 3);
      }
    });

    // Endapan lumpur (Efek Penyumbatan / Mud Cake) di atas media
    if (siklus > 1) {
      const cakeH = Math.min(14, (siklus - 1) * 3.5);
      ctx.fillStyle = 'rgba(120, 53, 15, 0.88)';
      ctx.fillRect(tubeX + 2, mediaStartY - cakeH, tubeW - 4, cakeH);
    }

    // Penahan dasar
    ctx.fillStyle = '#64748b';
    ctx.fillRect(tubeX, 205, tubeW, 5);

    // Partikel pengotor
    col.particles.forEach((p) => {
      if (p.y > 116 - 78 * topWaterLevel || p.trapped) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Dinding kaca & corong
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(tubeX, 28, tubeW, 182);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(centerX - 15, 210);
    ctx.lineTo(centerX + 15, 210);
    ctx.lineTo(centerX + 6, 234);
    ctx.lineTo(centerX - 6, 234);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tetesan filtrat
    if (isRunning && col.volumeFiltered < 200) {
      col.drops.forEach((dy) => {
        ctx.fillStyle = col.clarityPct > 75 ? '#0284c7' : '#a16207';
        ctx.beginPath();
        ctx.arc(centerX, dy, 3.6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Gelas Ukur Bawah
    const beakerW = Math.max(92, tubeW - 34);
    const beakerX = centerX - beakerW / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(beakerX, 244, beakerW, 110);

    if (progress > 0.01) {
      const fillH = 94 * progress;
      const fillY = 354 - fillH;
      const mudRatio = Math.max(0, 1 - col.clarityPct / 100);
      const r = Math.round(14 + mudRatio * 140);
      const g = Math.round(165 - mudRatio * 75);
      const b = Math.round(233 - mudRatio * 195);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.86)`;
      ctx.fillRect(beakerX + 2, fillY, beakerW - 4, fillH);
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(beakerX, 244, beakerW, 110);

    ctx.fillStyle = '#334155';
    ctx.font = '500 9.5px "IBM Plex Mono", monospace';
    [50, 100, 150, 200].forEach((vol) => {
      const sy = 354 - (vol / 200) * 94;
      ctx.beginPath();
      ctx.moveTo(beakerX + 2, sy);
      ctx.lineTo(beakerX + 12, sy);
      ctx.stroke();
      ctx.fillText(`${vol}mL`, beakerX + 15, sy + 3);
    });

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, centerX, 18);
    ctx.fillText(`Filtrat (${col.clarityPct}% jernih)`, centerX, 371);
    ctx.textAlign = 'left';
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const sim = simRef.current;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Meja lab
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, H - 24, W, 24);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, H - 24, W, 2);

    if (!compareMode) {
      // Statif tunggal
      ctx.fillStyle = '#475569';
      ctx.fillRect(52, 24, 10, H - 48);
      ctx.fillRect(36, H - 30, 56, 8);
      ctx.fillRect(62, 120, 68, 7);

      drawSingleColumn(
        ctx,
        sim.colA,
        modelA,
        130,
        160,
        `Air Baku (${modelA.ntuAwal} NTU)`,
        siklusSumbat,
        sim.status === 'running',
        true
      );
    } else {
      // Dua tiang penyangga untuk mode bandingkan
      ctx.fillStyle = '#475569';
      ctx.fillRect(18, 24, 8, H - 48);
      ctx.fillRect(26, 118, 16, 6);
      ctx.fillRect(404, 24, 8, H - 48);
      ctx.fillRect(388, 118, 16, 6);

      drawSingleColumn(
        ctx,
        sim.colA,
        modelA,
        42,
        118,
        `A: ${modelA.media.namaSingkat}`,
        siklusSumbat,
        sim.status === 'running',
        false
      );

      // Garis pemisah tengah
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(W / 2, 16);
      ctx.lineTo(W / 2, H - 30);
      ctx.stroke();
      ctx.restore();

      drawSingleColumn(
        ctx,
        sim.colB,
        modelB,
        268,
        118,
        `B: ${modelB.media.namaSingkat}`,
        1,
        sim.status === 'running',
        false
      );
    }
  };

  const resetSimulation = () => {
    stopAnimation();
    const fresh = buildInitialSim();
    simRef.current = fresh;
    setReadout({
      status: 'idle',
      elapsedA: 0,
      volA: 0,
      ntuA: fresh.colA.finalNtu,
      clarityA: fresh.colA.clarityPct,
      elapsedB: 0,
      volB: 0,
      ntuB: fresh.colB.finalNtu,
      clarityB: fresh.colB.clarityPct,
    });
    drawCanvas();
  };

  useEffect(() => {
    resetSimulation();
    return () => stopAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMedia, ketebalan, kekeruhanAwal, compareMode, compareMediaB, compareTebalB, siklusSumbat, isFullscreen]);

  const updateColumnPhysics = (
    col: ColumnSimState,
    model: ReturnType<typeof calculateFiltrationModel>,
    dt: number
  ) => {
    if (col.elapsedSec >= col.totalTimeTarget) return;
    const mediaTopY = 205 - (30 + model.ketebalanCm * 5.4);
    const timeScale = col.totalTimeTarget > 9 ? col.totalTimeTarget / 7.5 : 1.0;
    col.elapsedSec = Math.min(col.totalTimeTarget, col.elapsedSec + dt * timeScale);
    col.volumeFiltered = Math.min(200, (col.elapsedSec / col.totalTimeTarget) * 200);

    col.particles.forEach((p) => {
      if (!p.trapped) {
        p.y += p.speed * (1.2 + dt * 15);
        if (p.y >= mediaTopY) {
          const thresholdR =
            model.media.poriMm >= 1.5 ? 4.2 : model.media.poriMm >= 0.4 ? 3.0 : 1.8;
          if (p.r >= thresholdR || Math.random() < col.clarityPct / 100) {
            p.trapped = true;
            p.y = mediaTopY + Math.random() * 6;
          } else if (p.y > 204) {
            p.y = 204;
            p.trapped = true;
          }
        }
      }
    });

    col.drops = col.drops.map((dy) => {
      const nextY = dy + 125 * dt;
      return nextY > 342 ? 236 : nextY;
    });
  };

  const startSimulation = () => {
    if (simRef.current.status === 'running') return;
    resetSimulation();

    simRef.current.status = 'running';
    simRef.current.lastTimestamp = performance.now();
    simRef.current.lastDropSoundAt = 0;
    simRef.current.colA.drops = [238, 268, 298];
    simRef.current.colB.drops = [242, 274, 306];

    const step = (now: number) => {
      const sim = simRef.current;
      const dt = Math.min(0.05, (now - sim.lastTimestamp) / 1000);
      sim.lastTimestamp = now;

      updateColumnPhysics(sim.colA, modelA, dt);
      if (compareMode) {
        updateColumnPhysics(sim.colB, modelB, dt);
      }

      if (soundEnabled && now - sim.lastDropSoundAt > 360) {
        playDropSound(true);
        sim.lastDropSoundAt = now;
      }

      const doneA = sim.colA.elapsedSec >= sim.colA.totalTimeTarget;
      const doneB = !compareMode || sim.colB.elapsedSec >= sim.colB.totalTimeTarget;
      const allDone = doneA && doneB;

      drawCanvas();
      setReadout({
        status: allDone ? 'done' : 'running',
        elapsedA: sim.colA.elapsedSec,
        volA: sim.colA.volumeFiltered,
        ntuA: sim.colA.finalNtu,
        clarityA: sim.colA.clarityPct,
        elapsedB: sim.colB.elapsedSec,
        volB: sim.colB.volumeFiltered,
        ntuB: sim.colB.finalNtu,
        clarityB: sim.colB.clarityPct,
      });

      if (!allDone) {
        animRef.current = requestAnimationFrame(step);
      } else {
        sim.status = 'done';
        playSuccessSound(soundEnabled);
        drawCanvas();
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  const handleRecordA = () => {
    if (readout.status !== 'done') return;
    playSuccessSound(soundEnabled);
    onRecordTrial({
      mediaId: selectedMedia,
      mediaNama:
        siklusSumbat > 1
          ? `${modelA.media.namaSingkat} (Siklus ${siklusSumbat})`
          : modelA.media.namaSingkat,
      ketebalanCm: ketebalan,
      ntuAwal: modelA.ntuAwal,
      waktuDetik: modelA.waktuDetik,
      debit: modelA.debit,
      ntuAkhir: modelA.ntuAkhir,
      kejernihanPct: modelA.kejernihanPct,
    });
  };

  const handleRecordB = () => {
    if (readout.status !== 'done') return;
    playSuccessSound(soundEnabled);
    onRecordTrial({
      mediaId: compareMediaB,
      mediaNama: modelB.media.namaSingkat,
      ketebalanCm: compareTebalB,
      ntuAwal: modelB.ntuAwal,
      waktuDetik: modelB.waktuDetik,
      debit: modelB.debit,
      ntuAkhir: modelB.ntuAkhir,
      kejernihanPct: modelB.kejernihanPct,
    });
  };

  const saturationStatus =
    siklusSumbat <= 1
      ? { label: 'Bersih (100%)', cls: 'text-emerald-700' }
      : siklusSumbat <= 3
      ? { label: `Mulai Jenuh (Siklus ${siklusSumbat})`, cls: 'text-amber-700' }
      : { label: `Tersumbat Lumpur (Siklus ${siklusSumbat})`, cls: 'text-red-700' };

  const simulationBody = (
    <div className="space-y-4">
      {/* Toolbar Lab Maya */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            disabled={readout.status === 'running'}
            onClick={() => setCompareMode(false)}
            className={`min-h-[40px] whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              !compareMode
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Simulasi Tunggal
          </button>
          <button
            type="button"
            disabled={readout.status === 'running'}
            onClick={() => setCompareMode(true)}
            className={`min-h-[40px] whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              compareMode
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bandingkan 2 Filter
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMicroscope(true)}
            className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-teal-300 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-100"
          >
            <Microscope className="h-3.5 w-3.5" />
            Lihat Skala Mikro
          </button>
          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {showHelp ? 'Tutup Petunjuk' : 'Petunjuk'}
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                Keluar Layar Penuh
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                Perbesar Simulasi
              </>
            )}
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3.5 text-sm text-slate-700">
          <ol className="list-decimal space-y-1 pl-5">
            <li>Pilih <strong>Jenis Media Penyaring</strong>, <strong>Ketebalan Lapisan</strong>, dan <strong>Kekeruhan Awal</strong>.</li>
            <li>Gunakan <strong>Bandingkan 2 Filter</strong> jika ingin melihat perbandingan kecepatan & kejernihan dua media sekaligus.</li>
            <li>Setelah selesai menyaring, coba tekan <strong>Tuang Ulang (+1 Siklus)</strong> untuk mengamati efek penyumbatan lumpur pada filter.</li>
            <li>Klik <strong>Rekam Data</strong> untuk memasukkan hasil ke tabel pengamatan (minimal 3 data).</li>
          </ol>
        </div>
      )}

      {/* Tata Letak 2 Zona: Kiri Kanvas Simulasi, Kanan Kontrol Variabel */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-white lg:col-span-7">
          <canvas
            ref={canvasRef}
            width={430}
            height={380}
            className="mx-auto block h-auto w-full max-w-[460px] rounded-lg bg-slate-50"
          />

          {!compareMode ? (
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-center">
                <span className="block text-[11px] text-slate-400">Waktu Saring</span>
                <span className="font-mono-num text-base font-bold text-sky-300">
                  {readout.elapsedA.toFixed(1)} s
                </span>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-center">
                <span className="block text-[11px] text-slate-400">Volume Filtrat</span>
                <span className="font-mono-num text-base font-bold text-sky-300">
                  {Math.round(readout.volA)} / 200 mL
                </span>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-center">
                <span className="block text-[11px] text-slate-400">Kekeruhan Akhir</span>
                <span className="font-mono-num text-base font-bold text-amber-300">
                  {readout.status === 'done' ? `${readout.ntuA} NTU` : '—'}
                </span>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-center">
                <span className="block text-[11px] text-slate-400">Kejernihan</span>
                <span className="font-mono-num text-base font-bold text-emerald-300">
                  {readout.status === 'done' ? `${readout.clarityA}%` : '—'}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-xs">
                <p className="font-bold text-sky-300">Filter A: {modelA.media.namaSingkat}</p>
                <p className="font-mono-num mt-1 text-slate-200">
                  Waktu: {readout.elapsedA.toFixed(1)} s · Vol: {Math.round(readout.volA)} mL · Jernih:{' '}
                  {readout.clarityA}%
                </p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-xs">
                <p className="font-bold text-emerald-300">Filter B: {modelB.media.namaSingkat}</p>
                <p className="font-mono-num mt-1 text-slate-200">
                  Waktu: {readout.elapsedB.toFixed(1)} s · Vol: {Math.round(readout.volB)} mL · Jernih:{' '}
                  {readout.clarityB}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Panel Kontrol Parameter */}
        <div className="space-y-3.5 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-5">
          <div>
            <label
              htmlFor="selMedia"
              className="mb-1 block text-xs font-bold text-slate-800"
            >
              {compareMode ? 'Filter A · Jenis Media Penyaring' : '1. Jenis Media Penyaring'}
            </label>
            <select
              id="selMedia"
              value={selectedMedia}
              disabled={readout.status === 'running'}
              onChange={(e) => onMediaChange(e.target.value as MediaId)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none disabled:opacity-60"
            >
              {CURRICULUM_CONFIG.mediaList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="rngTebal" className="text-xs font-bold text-slate-800">
                {compareMode ? 'Filter A · Ketebalan Media' : '2. Ketebalan Lapisan Media'}
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
          </div>

          {compareMode && (
            <div className="space-y-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div>
                <label htmlFor="selMediaB" className="mb-1 block text-xs font-bold text-emerald-950">
                  Filter B (Pembanding) · Jenis Media
                </label>
                <select
                  id="selMediaB"
                  value={compareMediaB}
                  disabled={readout.status === 'running'}
                  onChange={(e) => setCompareMediaB(e.target.value as MediaId)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
                >
                  {CURRICULUM_CONFIG.mediaList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>Filter B · Ketebalan</span>
                  <span className="font-mono-num">{compareTebalB} cm</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  step={2}
                  value={compareTebalB}
                  disabled={readout.status === 'running'}
                  onChange={(e) => setCompareTebalB(Number(e.target.value))}
                  className="mt-1 h-2 w-full cursor-pointer accent-emerald-700"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="selKeruh" className="mb-1 block text-xs font-bold text-slate-800">
              3. Kekeruhan Air Awal (200 mL)
            </label>
            <select
              id="selKeruh"
              value={kekeruhanAwal}
              disabled={readout.status === 'running'}
              onChange={(e) => onKekeruhanChange(e.target.value as TurbidityId)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none disabled:opacity-60"
            >
              {CURRICULUM_CONFIG.kekeruhanOptions.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Simulasi Penyumbatan / Clogging */}
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Kondisi Pori Filter A:</span>
              <span className={`font-semibold ${saturationStatus.cls}`}>{saturationStatus.label}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={readout.status === 'running' || siklusSumbat >= 5}
                onClick={() => setSiklusSumbat((s) => Math.min(5, s + 1))}
                className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-45"
              >
                <Droplets className="h-3.5 w-3.5" />
                Tuang Lagi (+1 Siklus)
              </button>
              <button
                type="button"
                disabled={readout.status === 'running' || siklusSumbat === 1}
                onClick={() => setSiklusSumbat(1)}
                className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-45"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Cuci Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={startSimulation}
              disabled={readout.status === 'running'}
              className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Mulai Menyaring
            </button>
            <button
              type="button"
              onClick={handleRecordA}
              disabled={readout.status !== 'done'}
              className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <PlusCircle className="h-4 w-4" />
              {compareMode ? 'Rekam Data A' : 'Rekam Data'}
            </button>
          </div>

          {compareMode && (
            <button
              type="button"
              onClick={handleRecordB}
              disabled={readout.status !== 'done'}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Rekam Data Filter B ke Tabel
            </button>
          )}

          <button
            type="button"
            onClick={resetSimulation}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Simulasi
          </button>
        </div>
      </div>

      <MicroscopeZoomModal open={showMicroscope} onClose={() => setShowMicroscope(false)} />
    </div>
  );

  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-100 p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Simulasi Lab Maya Layar Penuh"
      >
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6">
          {simulationBody}
        </div>
      </div>
    );
  }

  return simulationBody;
};
