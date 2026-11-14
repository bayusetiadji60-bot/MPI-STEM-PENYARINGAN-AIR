import React, { useEffect, useRef, useState } from 'react';
import {
  Film,
  Pause,
  Play,
  RotateCcw,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface SceneInfo {
  id: number;
  start: number;
  end: number;
  judul: string;
  narasi: string;
}

const TOTAL_DURATION = 20; // detik

const SCENES: SceneInfo[] = [
  {
    id: 0,
    start: 0,
    end: 5,
    judul: 'Babak 1 · Kondisi Normal',
    narasi:
      'Pada cuaca cerah, air di saluran irigasi sekitar Besuki mengalir jernih dan bebas dari endapan lumpur.',
  },
  {
    id: 1,
    start: 5,
    end: 10,
    judul: 'Babak 2 · Hujan Deras Mengguyur',
    narasi:
      'Saat hujan deras turun, air hujan mengikis tanah sawah dan membawa pasir, lumpur, serta serpihan daun ke saluran.',
  },
  {
    id: 2,
    start: 10,
    end: 15,
    judul: 'Babak 3 · Air Berubah Keruh',
    narasi:
      'Aliran saluran dan air yang ditampung warga berubah cokelat pekat sehingga tidak layak langsung dipakai mencuci.',
  },
  {
    id: 3,
    start: 15,
    end: 20,
    judul: 'Babak 4 · Tantangan Pemisahan Campuran',
    narasi:
      'Air keruh ini merupakan campuran heterogen. Bagaimana cara memisahkan partikel padatnya agar air kembali jernih?',
  },
];

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `00:${s < 10 ? `0${s}` : s}`;
}

export const ProblemVideoPlayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoName, setCustomVideoName] = useState<string>('');
  const lastSpokenSceneRef = useRef<number>(-1);

  const currentScene =
    SCENES.find((s) => currentTime >= s.start && currentTime < s.end) ||
    SCENES[SCENES.length - 1];

  // Putar suara narasi bahasa Indonesia bila diaktifkan
  useEffect(() => {
    if (!audioEnabled || !isPlaying || customVideoUrl) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (lastSpokenSceneRef.current === currentScene.id) return;

    lastSpokenSceneRef.current = currentScene.id;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(currentScene.narasi);
      utter.lang = 'id-ID';
      utter.rate = 1.0;
      window.speechSynthesis.speak(utter);
    } catch {
      // Abaikan bila browser membatasi speechSynthesis
    }
  }, [audioEnabled, isPlaying, currentScene.id, currentScene.narasi, customVideoUrl]);

  useEffect(() => {
    if (!isPlaying || !audioEnabled) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Abaikan
        }
      }
      if (!isPlaying) {
        lastSpokenSceneRef.current = -1;
      }
    }
  }, [isPlaying, audioEnabled]);

  // Bersihkan object URL custom video saat unmount
  useEffect(() => {
    return () => {
      if (customVideoUrl) {
        URL.revokeObjectURL(customVideoUrl);
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Abaikan
        }
      }
    };
  }, [customVideoUrl]);

  // Loop animasi video ilustrasi
  useEffect(() => {
    if (customVideoUrl) return;

    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= TOTAL_DURATION) {
          setIsPlaying(false);
          return TOTAL_DURATION;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, customVideoUrl]);

  // Gambar frame kanvas berdasarkan currentTime
  useEffect(() => {
    if (customVideoUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const t = currentTime;

    // Faktor transisi cuaca: 0 = cerah (0..4.5s), naik ke 1 = hujan/keruh (5..15s)
    const rainFactor = t < 4.5 ? 0 : t < 6.5 ? (t - 4.5) / 2 : 1;
    const mudFactor = t < 5.5 ? 0 : t < 11 ? (t - 5.5) / 5.5 : 1;

    ctx.clearRect(0, 0, W, H);

    // 1. Langit berubah dari biru cerah menjadi mendung
    const skyR = Math.round(186 - rainFactor * 70);
    const skyG = Math.round(230 - rainFactor * 90);
    const skyB = Math.round(253 - rainFactor * 105);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 140);
    skyGrad.addColorStop(0, `rgb(${skyR}, ${skyG}, ${skyB})`);
    skyGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, 145);

    // Matahari memudar saat mendung
    if (rainFactor < 0.85) {
      ctx.save();
      ctx.globalAlpha = 1 - rainFactor;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(470, 42, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Awan bergerak
    const cloudOffset = (t * 14) % 90;
    const drawCloud = (cx: number, cy: number, scale: number) => {
      ctx.fillStyle = rainFactor > 0.4 ? '#64748b' : '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38 * scale, 15 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 22 * scale, cy - 6 * scale, 26 * scale, 13 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 22 * scale, cy + 2 * scale, 24 * scale, 11 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCloud(90 + cloudOffset * 0.4, 38, 1.0);
    drawCloud(280 + cloudOffset * 0.3, 44, 1.2);
    drawCloud(440 - cloudOffset * 0.25, 34, 0.9);

    // Bukit & Sawah hijau di latar
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(0, 132);
    ctx.quadraticCurveTo(140, 102, 280, 128);
    ctx.quadraticCurveTo(420, 105, 560, 130);
    ctx.lineTo(560, 175);
    ctx.lineTo(0, 175);
    ctx.closePath();
    ctx.fill();

    // Pohon kelapa / desa
    const drawHouse = (hx: number, hy: number) => {
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(hx, hy, 38, 22);
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.moveTo(hx - 5, hy);
      ctx.lineTo(hx + 19, hy - 16);
      ctx.lineTo(hx + 43, hy);
      ctx.closePath();
      ctx.fill();
    };
    drawHouse(48, 124);
    drawHouse(98, 128);

    // Tanah & Tanggul Saluran Irigasi
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(0, 165, W, H - 165);
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(0, 165, W, 10);

    // Saluran Air (Potongan melintang di tengah)
    ctx.fillStyle = '#57534e';
    ctx.beginPath();
    ctx.moveTo(110, 172);
    ctx.lineTo(450, 172);
    ctx.lineTo(415, 255);
    ctx.lineTo(145, 255);
    ctx.closePath();
    ctx.fill();

    // Air dalam saluran (berubah warna dari biru jernih -> cokelat keruh)
    const wr = Math.round(14 + mudFactor * 132);
    const wg = Math.round(165 - mudFactor * 95);
    const wb = Math.round(233 - mudFactor * 208);
    ctx.fillStyle = `rgb(${wr}, ${wg}, ${wb})`;
    ctx.beginPath();
    ctx.moveTo(124, 192);
    ctx.lineTo(436, 192);
    ctx.lineTo(410, 250);
    ctx.lineTo(150, 250);
    ctx.closePath();
    ctx.fill();

    // Riak aliran air bergerak
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 - mudFactor * 0.25})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const rx = 155 + ((i * 68 + t * 48) % 245);
      const ry = 205 + (i % 2) * 18;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 26, ry);
      ctx.stroke();
    }

    // Partikel lumpur, pasir & daun terbawa air
    if (mudFactor > 0.1) {
      const particleCount = Math.round(mudFactor * 26);
      for (let i = 0; i < particleCount; i++) {
        const px = 152 + ((i * 37 + t * (32 + (i % 4) * 8)) % 256);
        const py = 198 + ((i * 19) % 44);
        ctx.fillStyle = i % 5 === 0 ? '#166534' : i % 3 === 0 ? '#fde047' : '#451a03';
        ctx.beginPath();
        ctx.arc(px, py, i % 4 === 0 ? 3.8 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Rintik hujan turun pada babak 2 & 3
    if (t >= 4.5 && t <= 15.5) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.72)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 34; i++) {
        const rx = (i * 29 + t * 50) % W;
        const ry = (i * 23 + t * 230) % 210;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 6, ry + 14);
        ctx.stroke();
      }
    }

    // Babak 3: Gelas sampel air warga di sebelah kanan (t >= 10)
    if (t >= 10) {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(465, 192, 62, 74);
      ctx.strokeRect(465, 192, 62, 74);

      ctx.fillStyle = `rgba(${wr}, ${wg}, ${wb}, 0.9)`;
      ctx.fillRect(467, 212, 58, 52);
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sampel Air', 496, 278);
    }

    // Babak 4: Lensa Pembesar Partikel (t >= 15)
    if (t >= 15) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(0, 0, W, H);

      // Lingkaran kaca pembesar
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(280, 145, 92, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#0f766e';
      ctx.stroke();

      // Air keruh + partikel besar-kecil di dalam lensa
      ctx.fillStyle = 'rgba(146, 64, 14, 0.32)';
      ctx.beginPath();
      ctx.arc(280, 145, 88, 0, Math.PI * 2);
      ctx.fill();

      const zoomParticles = [
        { x: 245, y: 120, r: 9, c: '#166534', label: 'Daun' },
        { x: 310, y: 118, r: 7, c: '#ca8a04', label: 'Pasir' },
        { x: 265, y: 165, r: 6, c: '#78350f', label: 'Lumpur' },
        { x: 315, y: 168, r: 4, c: '#451a03', label: '' },
        { x: 232, y: 156, r: 4.5, c: '#78350f', label: '' },
        { x: 288, y: 140, r: 5, c: '#451a03', label: '' },
      ];
      zoomParticles.forEach((p, idx) => {
        const wobble = Math.sin(t * 3 + idx) * 2.5;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x + wobble, p.y - wobble * 0.5, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.label) {
          ctx.fillStyle = '#0f172a';
          ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.label, p.x + wobble, p.y + p.r + 12);
        }
      });

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Campuran Heterogen: Bagaimana cara memisahkannya?', 280, 266);
      ctx.restore();
    }

    // Label Babak di pojok kiri atas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fillRect(12, 12, 238, 26);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(currentScene.judul, 20, 29);
  }, [currentTime, customVideoUrl, currentScene.judul]);

  const handleTogglePlay = () => {
    if (currentTime >= TOTAL_DURATION) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleRestart = () => {
    lastSpokenSceneRef.current = -1;
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customVideoUrl) {
      URL.revokeObjectURL(customVideoUrl);
    }
    const url = URL.createObjectURL(file);
    setCustomVideoUrl(url);
    setCustomVideoName(file.name);
    setIsPlaying(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white shadow-sm">
      {/* Header Pemutar Video */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-bold tracking-wide text-slate-100 sm:text-sm">
            Video Ilustrasi Masalah: Air Saluran Keruh Saat Hujan
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={handleFileChange}
            className="hidden"
          />
          {customVideoUrl ? (
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(customVideoUrl);
                setCustomVideoUrl(null);
                setCustomVideoName('');
              }}
              className="rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
            >
              Kembali ke Animasi Bawaan
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
              title="Opsional: Guru dapat memutar file video MP4/WebM dari perangkat"
            >
              <Upload className="h-3 w-3" />
              <span>Muat Video MP4</span>
            </button>
          )}
        </div>
      </div>

      {/* Layar Video */}
      {customVideoUrl ? (
        <div className="bg-black">
          <video
            src={customVideoUrl}
            controls
            className="mx-auto aspect-video w-full max-w-3xl"
          />
          <div className="border-t border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-300">
            Memutar video lokal: <strong className="text-white">{customVideoName}</strong>
          </div>
        </div>
      ) : (
        <>
          <div className="relative bg-slate-950 p-2 sm:p-3">
            <canvas
              ref={canvasRef}
              width={560}
              height={295}
              onClick={handleTogglePlay}
              className="mx-auto block aspect-[560/295] w-full max-w-[680px] cursor-pointer rounded-xl border border-slate-700"
            />
          </div>

          {/* Kontrol Video (Play, Restart, Scrubber, Audio Narasi) */}
          <div className="space-y-2.5 border-t border-slate-800 bg-slate-900/95 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-500"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span>{currentTime >= TOTAL_DURATION ? 'Putar Ulang' : 'Putar Video'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                aria-label="Ulangi video dari awal"
                className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Ulang</span>
              </button>

              <div className="flex flex-1 items-center gap-2.5 min-w-[160px]">
                <input
                  type="range"
                  aria-label="Garis waktu video"
                  min={0}
                  max={TOTAL_DURATION}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => {
                    setCurrentTime(Number(e.target.value));
                  }}
                  className="h-1.5 flex-1 cursor-pointer accent-sky-400"
                />
                <span className="font-mono-num shrink-0 text-xs font-semibold text-slate-300">
                  {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAudioEnabled((prev) => !prev)}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  audioEnabled
                    ? 'border-teal-500 bg-teal-600/30 text-teal-200'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {audioEnabled ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Suara Aktif</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span>Suara Mati</span>
                  </>
                )}
              </button>
            </div>

            {/* Tombol Loncat Babak */}
            <div className="flex flex-wrap gap-1.5">
              {SCENES.map((sc) => {
                const active = currentScene.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      lastSpokenSceneRef.current = -1;
                      setCurrentTime(sc.start + 0.05);
                    }}
                    className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-600/25 text-sky-200'
                        : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sc.judul}
                  </button>
                );
              })}
            </div>

            {/* Subtitle / Narasi Babak */}
            <div className="rounded-lg border border-slate-700/80 bg-slate-800/70 px-3.5 py-2.5 text-xs leading-relaxed text-slate-200 sm:text-sm">
              <span className="font-semibold text-sky-300">{currentScene.judul}: </span>
              <span>{currentScene.narasi}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
