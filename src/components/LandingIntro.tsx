import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  Target,
  Wrench,
} from 'lucide-react';
import { CURRICULUM_CONFIG } from '../data/curriculum';
import heroWaterFiltrationImg from '../assets/images/hero_water_filtration_1794640166044.jpg';
import { IllustrationFrame } from './IllustrationFrame';

interface LandingIntroProps {
  hasProgress: boolean;
  savedName: string;
  currentStage: number;
  onEnterApp: () => void;
}

export const LandingIntro: React.FC<LandingIntroProps> = ({
  hasProgress,
  savedName,
  currentStage,
  onEnterApp,
}) => {
  const stemPillars = [
    {
      huruf: 'S · Science',
      judul: 'Amati & Pahami Konsep',
      isi: 'Selidiki fenomena air keruh saat musim hujan dan pahami prinsip pemisahan berdasarkan ukuran partikel.',
      ikon: BookOpen,
      grad: 'from-teal-600 to-emerald-600',
      bg: 'from-teal-50/70 via-white to-emerald-50/40',
    },
    {
      huruf: 'T · Technology',
      judul: 'Simulasi Lab Maya',
      isi: 'Ubah jenis media, ketebalan lapisan, serta kekeruhan air secara real-time dan rekam data pengamatan.',
      ikon: FlaskConical,
      grad: 'from-cyan-600 to-sky-600',
      bg: 'from-cyan-50/70 via-white to-sky-50/40',
    },
    {
      huruf: 'E · Engineering',
      judul: 'Rancang Alat Filter',
      isi: 'Susun lapisan kerikil, pasir, arang aktif, dan kapas untuk merancang alat penjernih air berstandar target.',
      ikon: Wrench,
      grad: 'from-amber-500 to-orange-600',
      bg: 'from-amber-50/70 via-white to-orange-50/40',
    },
    {
      huruf: 'M · Mathematics',
      judul: 'Hitung & Baca Grafik',
      isi: 'Hitung debit aliran (mL/s), efisiensi kejernihan (%), dan temukan pola dari grafik otomatis.',
      ikon: BarChart3,
      grad: 'from-sky-600 to-indigo-600',
      bg: 'from-sky-50/70 via-white to-indigo-50/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Pengantar Utama */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 via-sky-500 to-emerald-500" />
        <div className="grid grid-cols-1 gap-6 bg-gradient-to-br from-teal-50/60 via-white to-sky-50/50 p-6 sm:p-8 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-semibold text-teal-800">
                {CURRICULUM_CONFIG.sekolah} · {CURRICULUM_CONFIG.mapel} · {CURRICULUM_CONFIG.durasi}
              </p>
              <h1 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Menjernihkan Air Keruh dengan Sains dan Rekayasa Filtrasi
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Selamat datang di media pembelajaran interaktif topik{' '}
                <strong className="text-slate-900">{CURRICULUM_CONFIG.topik}</strong>. Kamu akan mengamati masalah air keruh di lingkungan sekitar, bereksperimen di Lab Maya, mengolah data secara matematis, dan merancang alat penyaring air sederhana hingga menghasilkan laporan PDF siap kumpul.
              </p>

              {hasProgress && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-xs font-medium text-emerald-900">
                  Progres tersimpan untuk <strong>{savedName || 'Siswa'}</strong> (Tahap{' '}
                  {currentStage} dari {CURRICULUM_CONFIG.tahapan.length - 1}).
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onEnterApp}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-sky-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:from-teal-800 hover:to-sky-800 sm:text-base"
              >
                <span>
                  {hasProgress ? 'Lanjutkan ke Menu Pembelajaran' : 'Masuk ke Menu Pembelajaran'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <IllustrationFrame
              src={heroWaterFiltrationImg}
              alt="Ilustrasi eksperimen laboratorium penyaringan air bertingkat dengan kerikil, pasir, arang aktif, dan kapas"
              caption="Simulasi proses pemisahan campuran heterogen menjadi air filtrat yang lebih jernih."
              aspectClass="aspect-video lg:h-full"
              className="h-full"
            />
          </div>
        </div>
      </section>

      {/* Empat Pilar Pendekatan STEM */}
      <section aria-label="Alur Pendekatan STEM">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">
            Apa yang Akan Kamu Pelajari? (Pendekatan STEM)
          </h2>
          <p className="text-xs text-slate-600 sm:text-sm">
            Pembelajaran disusun bertahap mengikuti langkah ilmiah dan rekayasa teknologi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stemPillars.map((p) => {
            const Icon = p.ikon;
            return (
              <div
                key={p.huruf}
                className={`rounded-xl border border-slate-200 bg-gradient-to-br ${p.bg} p-4`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${p.grad} text-white`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{p.huruf}</span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{p.judul}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{p.isi}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tujuan Pembelajaran & Petunjuk Alur */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50/55 via-white to-white p-5">
          <div className="flex items-center gap-2 text-teal-900">
            <Target className="h-4 w-4 text-teal-700" />
            <h2 className="text-sm font-bold">Capaian & Tujuan Pembelajaran</h2>
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            {CURRICULUM_CONFIG.tujuanPembelajaran.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50/55 via-white to-white p-5">
          <div className="flex items-center gap-2 text-sky-900">
            <CheckCircle2 className="h-4 w-4 text-sky-700" />
            <h2 className="text-sm font-bold">Petunjuk Singkat Penggunaan</h2>
          </div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            <li>
              Isi identitas dirimu terlebih dahulu di <strong>Tahap 0</strong> agar namamu tercatat pada laporan akhir.
            </li>
            <li>
              Selesaikan setiap tahap secara berurutan; seluruh jawaban tersimpan otomatis di browser perangkatmu.
            </li>
            <li>
              Di akhir pembelajaran (<strong>Tahap 8</strong>), unduh file laporan berformat <strong>PDF</strong> untuk diserahkan ke guru IPA.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
};
