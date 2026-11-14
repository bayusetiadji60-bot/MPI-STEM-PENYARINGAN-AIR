import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { LabTrial } from '../types/lkpd';

interface AnalysisChartProps {
  trials: LabTrial[];
}

export const AnalysisChart = forwardRef<HTMLCanvasElement | null, AnalysisChartProps>(
  ({ trials }, ref) => {
    const internalRef = useRef<HTMLCanvasElement | null>(null);

    useImperativeHandle(ref, () => internalRef.current as HTMLCanvasElement);

    useEffect(() => {
      const canvas = internalRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      if (!trials.length) return;

      const padL = 54;
      const padR = 44;
      const padT = 46;
      const padB = 58;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;

      // Judul
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Perbandingan Kejernihan (%) dan Laju Filtrasi (mL/s)', W / 2, 22);

      // Legenda
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(W / 2 - 148, 30, 12, 10);
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'left';
      ctx.fillText('Kejernihan (%)', W / 2 - 131, 39);

      ctx.fillStyle = '#d97706';
      ctx.fillRect(W / 2 + 18, 30, 12, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Laju (mL/s)', W / 2 + 35, 39);

      // Sumbu
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, H - padB);
      ctx.lineTo(W - padR, H - padB);
      ctx.stroke();

      // Garis kisi
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#64748b';
      for (let pct = 0; pct <= 100; pct += 25) {
        const y = H - padB - (pct / 100) * plotH;
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(W - padR, y);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(`${pct}%`, padL - 7, y + 3);
      }

      const maxLaju = Math.max(20, ...trials.map((d) => 200 / d.waktuDetik));
      const groupW = plotW / trials.length;
      const barW = Math.min(30, groupW * 0.28);

      trials.forEach((d, idx) => {
        const cx = padL + idx * groupW + groupW / 2;
        const laju = Number((200 / d.waktuDetik).toFixed(2));

        // Batang Kejernihan
        const h1 = (d.kejernihanPct / 100) * plotH;
        const y1 = H - padB - h1;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(cx - barW - 3, y1, barW, h1);
        ctx.fillStyle = '#0369a1';
        ctx.textAlign = 'center';
        ctx.font = '700 10px "IBM Plex Mono", monospace';
        ctx.fillText(`${d.kejernihanPct}%`, cx - barW / 2 - 3, y1 - 5);

        // Batang Laju
        const h2 = (laju / maxLaju) * plotH;
        const y2 = H - padB - h2;
        ctx.fillStyle = '#d97706';
        ctx.fillRect(cx + 3, y2, barW, h2);
        ctx.fillStyle = '#b45309';
        ctx.fillText(`${laju}`, cx + barW / 2 + 3, y2 - 5);

        // Label Sumbu X
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`Uji ${idx + 1}`, cx, H - padB + 17);
        ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(d.mediaNama.slice(0, 15), cx, H - padB + 32);
      });
    }, [trials]);

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
        <canvas
          ref={internalRef}
          width={640}
          height={300}
          className="mx-auto block h-auto w-full max-w-[640px]"
        />
      </div>
    );
  }
);

AnalysisChart.displayName = 'AnalysisChart';
