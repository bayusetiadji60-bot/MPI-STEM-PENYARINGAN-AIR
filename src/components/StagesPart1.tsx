import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  ClipboardList,
  CloudRain,
  Droplets,
  Filter,
  FlaskConical,
  HelpCircle,
  Layers,
  Microscope,
  SlidersHorizontal,
  Target,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { CURRICULUM_CONFIG } from '../data/curriculum';
import diagramFiltrationImg from '../assets/images/diagram_filtration_components_1794640166947.jpg';
import heroWaterFiltrationImg from '../assets/images/hero_water_filtration_1794640166044.jpg';
import sceneBesukiRainImg from '../assets/images/scene_besuki_rain_1794640167145.jpg';
import { AppState, LabTrial } from '../types/lkpd';
import { getAnalysisStats } from '../utils/filtrationModel';
import { playErrorSound, playSuccessSound } from '../utils/soundEffects';
import { AnalysisChart } from './AnalysisChart';
import { FiltrationProcessSvg } from './FiltrationProcessSvg';
import { IllustrationFrame } from './IllustrationFrame';
import { LabMayaCanvas } from './LabMayaCanvas';
import { MascotGuide } from './MascotGuide';
import { MicroscopeZoomView } from './MicroscopeZoomView';
import { PhenomenonIllustration } from './PhenomenonIllustration';
import { ProblemVideoPlayer } from './ProblemVideoPlayer';

interface StageCommonProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNext: (validator: () => string | null) => void;
  onPrev: () => void;
  onNotify: (msg: string) => void;
}

const StageAlert: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <span>{message}</span>
    </div>
  );
};

/* =========================================================================
   TAHAP 0: IDENTITAS SISWA
   ========================================================================= */
export const Stage0Identitas: React.FC<StageCommonProps> = ({
  state,
  updateState,
  onNext,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { identitas } = state;

  const handleContinue = () => {
    onNext(() => {
      if (!identitas.nama.trim()) {
        const msg = 'Mohon isi Nama Lengkap terlebih dahulu.';
        setError(msg);
        return msg;
      }
      if (!identitas.kelas) {
        const msg = 'Mohon pilih Kelas kamu terlebih dahulu.';
        setError(msg);
        return msg;
      }
      if (!identitas.absen || Number(identitas.absen) < 1) {
        const msg = 'Mohon isi Nomor Absen yang valid.';
        setError(msg);
        return msg;
      }
      setError(null);
      return null;
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-teal-600 via-sky-500 to-cyan-500" />
      <div className="bg-gradient-to-br from-teal-50/55 via-white to-sky-50/45 p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-sky-600 text-white shadow-sm">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Tahap 0 · Persiapan Belajar · {CURRICULUM_CONFIG.durasi}
            </p>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900">
              Identitas Siswa & Tujuan Pembelajaran
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Lengkapi data dirimu sebelum memulai penyelidikan penyaringan campuran bersama {CURRICULUM_CONFIG.sekolah}.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 pt-4 sm:p-7 sm:pt-5">
        <MascotGuide
          mood="happy"
          message="Hai, aku Beri si Berang-Berang! Yuk santai aja, isi dulu nama lengkap, kelas, dan nomor absenmu supaya hasil eksperimen dan sertifikatmu tercatat rapi."
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
          <div className="rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/75 via-white to-sky-50/60 p-4 lg:col-span-6">
            <div className="flex items-center gap-2 text-teal-900">
              <Target className="h-4 w-4 shrink-0 text-teal-700" />
              <h3 className="text-sm font-bold">Tujuan Pembelajaran</h3>
            </div>
            <ul className="mt-2.5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
              {CURRICULUM_CONFIG.tujuanPembelajaran.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>
          <IllustrationFrame
            src={heroWaterFiltrationImg}
            alt="Ilustrasi eksperimen penyaringan air berlapis dengan kerikil, pasir halus, arang aktif, dan kapas"
            caption="Alat penyaring air bertingkat di laboratorium IPA untuk memisahkan kotoran dari air keruh."
            aspectClass="aspect-video lg:h-full"
            className="lg:col-span-6"
          />
        </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inpNama" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Nama Lengkap Siswa <span className="text-red-600">*</span>
          </label>
          <input
            id="inpNama"
            type="text"
            placeholder="Contoh: Siti Nurhaliza"
            value={identitas.nama}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                identitas: { ...prev.identitas, nama: e.target.value },
              }));
            }}
            className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
        </div>

        <div>
          <label htmlFor="inpKelas" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Kelas <span className="text-red-600">*</span>
          </label>
          <select
            id="inpKelas"
            value={identitas.kelas}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                identitas: { ...prev.identitas, kelas: e.target.value },
              }));
            }}
            className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          >
            <option value="">-- Pilih Kelas --</option>
            {CURRICULUM_CONFIG.kelasOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="inpAbsen" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Nomor Absen <span className="text-red-600">*</span>
          </label>
          <input
            id="inpAbsen"
            type="number"
            min={1}
            max={50}
            placeholder="Contoh: 12"
            value={identitas.absen}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                identitas: { ...prev.identitas, absen: e.target.value },
              }));
            }}
            className="font-mono-num min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
        </div>

        <div>
          <label htmlFor="inpTanggal" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Tanggal Belajar
          </label>
          <input
            id="inpTanggal"
            type="date"
            value={identitas.tanggal}
            onChange={(e) =>
              updateState((prev) => ({
                ...prev,
                identitas: { ...prev.identitas, tanggal: e.target.value },
              }))
            }
            className="font-mono-num min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
        </div>
      </div>

      <StageAlert message={error} />

      <div className="mt-6 flex items-center justify-end border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Mulai Belajar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      </div>
    </section>
  );
};

/* =========================================================================
   TAHAP 1: ORIENTASI MASALAH (SCIENCE)
   ========================================================================= */
export const Stage1Masalah: React.FC<StageCommonProps> = ({
  state,
  updateState,
  onNext,
  onPrev,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { tahap1 } = state;

  const handleContinue = () => {
    onNext(() => {
      if (tahap1.pertanyaan.trim().length < 8) {
        const msg = 'Tuliskan pertanyaan ilmiah yang muncul di benakmu (minimal 8 karakter).';
        setError(msg);
        return msg;
      }
      if (tahap1.hipotesis.trim().length < 10) {
        const msg = 'Tuliskan dugaan awal (hipotesis) kamu secara jelas sebelum melanjutkan.';
        setError(msg);
        return msg;
      }
      setError(null);
      return null;
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-600" />
      <div className="bg-gradient-to-br from-sky-50/60 via-white to-teal-50/40 p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-teal-600 text-white shadow-sm">
            <CloudRain className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Tahap 1 · Science · Orientasi Masalah
            </p>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900">
              Mengapa Air Saluran dan Sumur Menjadi Keruh?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Saat hujan deras mengguyur kawasan pertanian dan pesisir Besuki, aliran air saluran serta sebagian sumur warga menjadi cokelat keruh karena terbawa lumpur, pasir halus, dan serpihan daun kering.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 pt-4 sm:p-7 sm:pt-5">
      <MascotGuide
        mood="curious"
        message="Santai dulu dan tonton video singkatnya, atau coba geser perbandingan cuaca normal dan hujan deras. Habis itu, tulis pertanyaan serta tebakan awalmu di bawah, ya!"
      />
      <ProblemVideoPlayer />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <IllustrationFrame
          src={sceneBesukiRainImg}
          alt="Ilustrasi saluran irigasi dan persawahan di pedesaan pesisir saat hujan deras membawa aliran air keruh"
          caption="Konteks lokal: aliran air irigasi berubah keruh saat hujan deras membawa partikel tanah dan daun."
          aspectClass="aspect-video lg:h-[238px]"
        />
        <PhenomenonIllustration
          mode={tahap1.modeFenomena}
          onModeChange={(mode) =>
            updateState((prev) => ({
              ...prev,
              tahap1: { ...prev.tahap1, modeFenomena: mode },
            }))
          }
        />
      </div>

      <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/70 via-white to-sky-50/40 p-4">
        <div className="flex items-center gap-2 text-slate-900">
          <HelpCircle className="h-4 w-4 text-sky-600" />
          <span className="text-sm font-bold">Rumusan Pertanyaan & Hipotesis Awal</span>
        </div>
        <div>
          <label htmlFor="inpTanya" className="mb-1 block text-sm font-semibold text-slate-800">
            1. Pertanyaan apa yang muncul di benakmu setelah mengamati fenomena air keruh tersebut?{' '}
            <span className="text-red-600">*</span>
          </label>
          <p className="mb-1.5 text-xs text-slate-500">
            Contoh: Bahan alami apa saja yang dapat memisahkan lumpur dari air agar kembali jernih?
          </p>
          <textarea
            id="inpTanya"
            rows={3}
            placeholder="Tuliskan pertanyaan ilmiahmu di sini..."
            value={tahap1.pertanyaan}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                tahap1: { ...prev.tahap1, pertanyaan: e.target.value },
              }));
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
        </div>

        <div>
          <label htmlFor="inpHipotesis" className="mb-1 block text-sm font-semibold text-slate-800">
            2. Dugaan Awal (Hipotesis): Menurutmu, bagaimana ukuran pori dan susunan media penyaring memengaruhi kejernihan air serta kecepatan aliran?{' '}
            <span className="text-red-600">*</span>
          </label>
          <textarea
            id="inpHipotesis"
            rows={3}
            placeholder="Tuliskan dugaan awalmu (hipotesis)..."
            value={tahap1.hipotesis}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                tahap1: { ...prev.tahap1, hipotesis: e.target.value },
              }));
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
        </div>
      </div>

      <StageAlert message={error} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Lanjut ke Eksplorasi Konsep
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      </div>
    </section>
  );
};

/* =========================================================================
   TAHAP 2: EKSPLORASI KONSEP (SCIENCE)
   ========================================================================= */
export const Stage2Konsep: React.FC<StageCommonProps> = ({
  state,
  updateState,
  onNext,
  onPrev,
  onNotify,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { tahap2 } = state;

  const conceptTabs = [
    {
      judul: '1. Prinsip Filtrasi',
      isi: (
        <div className="space-y-2 text-sm leading-relaxed text-slate-700">
          <p>
            <strong>Penyaringan (Filtrasi)</strong> adalah metode pemisahan campuran heterogen antara zat padat tidak larut dan zat cair menggunakan media berpori.
          </p>
          <p>
            Prinsip kerjanya bergantung pada <strong>perbedaan ukuran partikel</strong>: partikel padat yang lebih besar dari pori penyaring akan tertahan, sedangkan cairan yang partikelnya sangat kecil lolos melewati pori.
          </p>
        </div>
      ),
    },
    {
      judul: '2. Komponen Utama',
      isi: (
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
          <li>
            <strong>Media Penyaring (Filter):</strong> Bahan berpori tempat campuran dilewatkan (kasa, kerikil, pasir, arang, kapas, kertas saring).
          </li>
          <li>
            <strong>Residu:</strong> Padatan atau ampas kotoran yang tertahan di atas penyaring karena ukurannya lebih besar dari pori.
          </li>
          <li>
            <strong>Filtrat:</strong> Cairan hasil penyaringan yang berhasil lolos melewati media penyaring menuju wadah penampung.
          </li>
        </ul>
      ),
    },
    {
      judul: '3. Filter Bertingkat',
      isi: (
        <div className="space-y-2 text-sm leading-relaxed text-slate-700">
          <p>
            Untuk menjernihkan air keruh tanpa cepat tersumbat, penyaringan disusun{' '}
            <strong>bertingkat dari pori besar di atas ke pori kecil di bawah</strong>:
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li><strong>Kerikil (atas):</strong> Menahan daun, ranting, dan pasir besar.</li>
            <li><strong>Pasir halus:</strong> Menyaring lumpur dan endapan halus.</li>
            <li><strong>Arang aktif:</strong> Mengadsorpsi bau, warna, dan partikel koloid.</li>
            <li><strong>Kapas/spons (bawah):</strong> Penahan akhir agar pasir/arang tidak turun ke filtrat.</li>
          </ol>
        </div>
      ),
    },
  ];

  const handleCheckMiniQuiz = () => {
    const allAnswered = CURRICULUM_CONFIG.miniQuiz.every(
      (q) => tahap2.miniQuizAns[q.id] !== undefined
    );
    if (!allAnswered) {
      playErrorSound(state.soundEnabled);
      setError('Pilih jawaban untuk seluruh 3 soal mini-kuis terlebih dahulu.');
      return;
    }
    setError(null);
    const allCorrect = CURRICULUM_CONFIG.miniQuiz.every(
      (q) => Number(tahap2.miniQuizAns[q.id]) === q.benar
    );
    if (allCorrect) {
      playSuccessSound(state.soundEnabled);
    } else {
      playErrorSound(state.soundEnabled);
    }
    updateState((prev) => ({
      ...prev,
      tahap2: { ...prev.tahap2, miniQuizChecked: true },
    }));
    onNotify('Jawaban mini-kuis diperiksa');
  };

  const handleContinue = () => {
    onNext(() => {
      const allAnswered = CURRICULUM_CONFIG.miniQuiz.every(
        (q) => tahap2.miniQuizAns[q.id] !== undefined
      );
      if (!allAnswered) {
        const msg = 'Jawab seluruh 3 soal mini-kuis terlebih dahulu.';
        setError(msg);
        return msg;
      }
      if (!tahap2.miniQuizChecked) {
        const msg = 'Klik tombol "Cek Jawaban Mini-Kuis" terlebih dahulu.';
        setError(msg);
        return msg;
      }
      const allCorrect = CURRICULUM_CONFIG.miniQuiz.every(
        (q) => Number(tahap2.miniQuizAns[q.id]) === q.benar
      );
      if (!allCorrect) {
        const msg = 'Masih ada jawaban mini-kuis yang kurang tepat. Perbaiki dan cek kembali agar siap ke Lab Maya.';
        setError(msg);
        return msg;
      }
      setError(null);
      return null;
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-teal-600 via-emerald-500 to-sky-500" />
      <div className="bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/40 p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Tahap 2 · Science · Eksplorasi Konsep
            </p>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900">
              Memahami Prinsip Penyaringan Campuran
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Pelajari kartu konsep, jelajahi diagram SVG proses penyaringan, baca ringkasan materi, lalu selesaikan mini-kuis sebelum masuk ke Lab Maya.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 pt-4 sm:p-7 sm:pt-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <IllustrationFrame
            src={diagramFiltrationImg}
            alt="Diagram penampang penyaringan dengan corong kaca, kertas saring penahan residu, dan filtrat jernih di labu Erlenmeyer"
            caption="Penampang proses filtrasi: partikel lumpur tertahan di penyaring (residu), sementara air jernih lolos ke bawah (filtrat)."
            aspectClass="aspect-video"
          />
        </div>

        <div className="lg:col-span-7">
          <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
            {conceptTabs.map((t, idx) => (
              <button
                key={t.judul}
                type="button"
                onClick={() =>
                  updateState((prev) => ({
                    ...prev,
                    tahap2: { ...prev.tahap2, activeTab: idx },
                  }))
                }
                className={`whitespace-nowrap shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  tahap2.activeTab === idx
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.judul}
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            {conceptTabs[tahap2.activeTab]?.isi}
          </div>
        </div>
      </div>

      {/* Diagram SVG Interaktif Proses Penyaringan */}
      <div className="mt-5">
        <FiltrationProcessSvg />
      </div>

      {/* Kaca Pembesar Mikroskopis */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-slate-900">
          <Microscope className="h-4 w-4 text-teal-700" />
          <h3 className="text-sm font-bold">
            Kaca Pembesar Mikroskopis: Mengapa Air Lumpur Tersaring tetapi Air Garam Lolos?
          </h3>
        </div>
        <MicroscopeZoomView />
      </div>

      {/* Ringkasan Materi Inti */}
      <div className="mt-5 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-white to-sky-50/60 p-4">
        <div className="flex items-center gap-2 text-teal-900">
          <BookOpen className="h-4 w-4 text-teal-700" />
          <h3 className="text-sm font-bold">Ringkasan Materi: Penyaringan Campuran (Filtrasi)</h3>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-lg border border-teal-100 bg-white/90 p-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Filter className="h-3.5 w-3.5 text-teal-700" />
              <span>1. Prinsip & Batasan Filtrasi</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Filtrasi memisahkan padatan tidak larut dari cairan berdasarkan <strong>perbedaan ukuran partikel</strong>. Hanya efektif untuk campuran heterogen (misalnya air lumpur), bukan larutan sejati seperti air garam.
            </p>
          </div>
          <div className="rounded-lg border border-teal-100 bg-white/90 p-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Layers className="h-3.5 w-3.5 text-sky-700" />
              <span>2. Tiga Komponen Utama</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              <strong>Filter</strong> adalah media berpori penyaring; <strong>Residu</strong> adalah kotoran padat yang tertahan di atas; <strong>Filtrat</strong> adalah cairan yang berhasil lolos ke wadah penampung.
            </p>
          </div>
          <div className="rounded-lg border border-teal-100 bg-white/90 p-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Droplets className="h-3.5 w-3.5 text-cyan-700" />
              <span>3. Pengaruh Pori & Ketebalan</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Pori lebih kecil dan lapisan lebih tebal menahan partikel lebih baik sehingga filtrat lebih jernih, tetapi memperbesar hambatan sehingga waktu saring lebih lama.
            </p>
          </div>
          <div className="rounded-lg border border-teal-100 bg-white/90 p-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Calculator className="h-3.5 w-3.5 text-amber-600" />
              <span>4. Susunan Bertingkat & Laju Aliran</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Susun media dari pori besar ke kecil (kerikil &rarr; pasir &rarr; arang aktif &rarr; kapas) agar tidak cepat tersumbat. Kecepatan saring diukur sebagai laju filtrasi: <span className="font-mono-num font-semibold text-slate-800">Q = Volume / Waktu</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-base font-bold text-slate-900">
          Mini-Kuis Pemahaman Konsep (Wajib)
        </h3>
        <div className="mt-3 space-y-3.5">
          {CURRICULUM_CONFIG.miniQuiz.map((q) => {
            const chosen = tahap2.miniQuizAns[q.id];
            const showFb = tahap2.miniQuizChecked && chosen !== undefined;
            const isCorrect = Number(chosen) === q.benar;
            return (
              <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-slate-900">{q.tanya}</p>
                <div className="mt-2.5 space-y-2">
                  {q.opsi.map((op, i) => (
                    <label
                      key={i}
                      className="flex min-h-[46px] cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 hover:border-sky-400 hover:bg-sky-50/40"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={Number(chosen) === i}
                        onChange={() => {
                          setError(null);
                          updateState((prev) => ({
                            ...prev,
                            tahap2: {
                              ...prev.tahap2,
                              miniQuizChecked: false,
                              miniQuizAns: { ...prev.tahap2.miniQuizAns, [q.id]: i },
                            },
                          }));
                        }}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-teal-700"
                      />
                      <span>{op}</span>
                    </label>
                  ))}
                </div>
                {showFb && (
                  <div
                    className={`mt-2.5 flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                      isCorrect
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {isCorrect
                        ? q.penjelasan
                        : 'Kurang tepat. Baca kembali tab konsep di atas lalu pilih jawaban yang benar.'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleCheckMiniQuiz}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          Cek Jawaban Mini-Kuis
        </button>
      </div>

      <StageAlert message={error} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Masuk ke Lab Maya
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      </div>
    </section>
  );
};

/* =========================================================================
   TAHAP 3: LAB MAYA (TECHNOLOGY & ENGINEERING)
   ========================================================================= */
export const Stage3LabMaya: React.FC<StageCommonProps> = ({
  state,
  updateState,
  onNext,
  onPrev,
  onNotify,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { tahap3 } = state;

  const handleRecordTrial = (trialData: Omit<LabTrial, 'id' | 'catatan'>) => {
    setError(null);
    const newTrial: LabTrial = {
      ...trialData,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      catatan: '',
    };
    updateState((prev) => ({
      ...prev,
      tahap3: {
        ...prev.tahap3,
        percobaan: [...prev.tahap3.percobaan, newTrial],
      },
    }));
    onNotify(`Data percobaan #${tahap3.percobaan.length + 1} berhasil direkam`);
  };

  const handleContinue = () => {
    onNext(() => {
      if (tahap3.percobaan.length < 3) {
        const msg = `Baru ada ${tahap3.percobaan.length} data percobaan. Rekam minimal 3 percobaan berbeda di Lab Maya.`;
        setError(msg);
        return msg;
      }
      if (!tahap3.varBebas.trim() || !tahap3.varTerikat.trim() || !tahap3.varKontrol.trim()) {
        const msg = 'Lengkapi identifikasi Variabel Bebas, Variabel Terikat, dan Variabel Kontrol terlebih dahulu.';
        setError(msg);
        return msg;
      }
      setError(null);
      return null;
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-sky-600 to-teal-600" />
      <div className="bg-gradient-to-br from-cyan-50/55 via-white to-sky-50/45 p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-700 text-white shadow-sm">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Tahap 3 · Technology & Engineering · Lab Maya Interaktif
            </p>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900">
              Simulasi Penyaringan Air Keruh (200 mL)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ubah jenis media penyaring, ketebalan lapisan, dan kekeruhan air awal. Lakukan minimal{' '}
              <strong>3 percobaan berbeda</strong> lalu rekam ke tabel pengamatan.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 pt-4 sm:p-7 sm:pt-5">
      <MascotGuide
        mood="explain"
        message="Seru nih! Di Lab Maya kamu boleh coba Mode Bandingkan 2 Filter, tes efek lumpur menumpuk, atau intip lewat Kaca Pembesar Mikroskopis. Santai aja, rekam minimal 3 percobaan berbeda, ya."
      />
      <div>
        <LabMayaCanvas
          selectedMedia={tahap3.selectedMedia}
          ketebalan={tahap3.ketebalan}
          kekeruhanAwal={tahap3.kekeruhanAwal}
          soundEnabled={state.soundEnabled}
          onMediaChange={(media) =>
            updateState((prev) => ({
              ...prev,
              tahap3: { ...prev.tahap3, selectedMedia: media },
            }))
          }
          onKetebalanChange={(cm) =>
            updateState((prev) => ({
              ...prev,
              tahap3: { ...prev.tahap3, ketebalan: cm },
            }))
          }
          onKekeruhanChange={(turb) =>
            updateState((prev) => ({
              ...prev,
              tahap3: { ...prev.tahap3, kekeruhanAwal: turb },
            }))
          }
          onRecordTrial={handleRecordTrial}
        />
      </div>

      {/* Tabel Data Pengamatan */}
      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-teal-700" />
            <h3 className="text-base font-bold text-slate-900">
              Tabel Data Pengamatan
            </h3>
          </div>
          <span className="font-mono-num text-xs font-semibold text-slate-600">
            Terekam: {tahap3.percobaan.length} / 3 minimal
          </span>
        </div>

        <p className="mb-1.5 text-[11px] text-slate-500 sm:hidden">
          Geser tabel ke samping untuk melihat semua kolom.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-800 text-xs font-semibold text-white">
                <th className="px-3 py-2.5">No</th>
                <th className="px-3 py-2.5">Media Penyaring</th>
                <th className="px-3 py-2.5">Tebal</th>
                <th className="px-3 py-2.5">NTU Awal</th>
                <th className="px-3 py-2.5">Waktu (s)</th>
                <th className="px-3 py-2.5">NTU Akhir</th>
                <th className="px-3 py-2.5">Jernih (%)</th>
                <th className="px-3 py-2.5">Catatan Pengamatan</th>
                <th className="px-3 py-2.5 text-center">Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tahap3.percobaan.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-sm text-slate-500">
                    Belum ada data percobaan. Jalankan simulasi di atas lalu klik <strong>Rekam Data</strong>.
                  </td>
                </tr>
              ) : (
                tahap3.percobaan.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                    <td className="font-mono-num px-3 py-2.5 font-semibold text-slate-700">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-900">{p.mediaNama}</td>
                    <td className="font-mono-num px-3 py-2.5 text-slate-700">{p.ketebalanCm} cm</td>
                    <td className="font-mono-num px-3 py-2.5 text-slate-700">{p.ntuAwal}</td>
                    <td className="font-mono-num px-3 py-2.5 font-semibold text-slate-900">
                      {p.waktuDetik}
                    </td>
                    <td className="font-mono-num px-3 py-2.5 text-slate-700">{p.ntuAkhir}</td>
                    <td className="font-mono-num px-3 py-2.5 font-semibold text-teal-800">
                      {p.kejernihanPct}%
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="Tulis catatan singkat..."
                        value={p.catatan}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateState((prev) => ({
                            ...prev,
                            tahap3: {
                              ...prev.tahap3,
                              percobaan: prev.tahap3.percobaan.map((item, i) =>
                                i === idx ? { ...item, catatan: val } : item
                              ),
                            },
                          }));
                        }}
                        className="w-full min-w-[150px] rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        aria-label={`Hapus percobaan ${idx + 1}`}
                        onClick={() =>
                          updateState((prev) => ({
                            ...prev,
                            tahap3: {
                              ...prev.tahap3,
                              percobaan: prev.tahap3.percobaan.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Identifikasi Variabel */}
      <div className="mt-7 space-y-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/70 via-white to-teal-50/40 p-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-teal-700" />
          <h3 className="text-base font-bold text-slate-900">Identifikasi Variabel Percobaan</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inpVarBebas" className="mb-1 block text-sm font-semibold text-slate-800">
              Variabel Bebas (yang kamu ubah) <span className="text-red-600">*</span>
            </label>
            <input
              id="inpVarBebas"
              type="text"
              placeholder="Contoh: Jenis media dan ketebalan lapisan"
              value={tahap3.varBebas}
              onChange={(e) => {
                setError(null);
                updateState((prev) => ({
                  ...prev,
                  tahap3: { ...prev.tahap3, varBebas: e.target.value },
                }));
              }}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base sm:text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="inpVarTerikat" className="mb-1 block text-sm font-semibold text-slate-800">
              Variabel Terikat (hasil yang diukur) <span className="text-red-600">*</span>
            </label>
            <input
              id="inpVarTerikat"
              type="text"
              placeholder="Contoh: Waktu penyaringan dan kejernihan filtrat"
              value={tahap3.varTerikat}
              onChange={(e) => {
                setError(null);
                updateState((prev) => ({
                  ...prev,
                  tahap3: { ...prev.tahap3, varTerikat: e.target.value },
                }));
              }}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base sm:text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="inpVarKontrol" className="mb-1 block text-sm font-semibold text-slate-800">
            Variabel Kontrol (yang dibuat tetap sama) <span className="text-red-600">*</span>
          </label>
          <input
            id="inpVarKontrol"
            type="text"
            placeholder="Contoh: Volume air baku 200 mL"
            value={tahap3.varKontrol}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                tahap3: { ...prev.tahap3, varKontrol: e.target.value },
              }));
            }}
            className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base sm:text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
          />
        </div>
      </div>

      <StageAlert message={error} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Lanjut ke Analisis Data
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      </div>
    </section>
  );
};

/* =========================================================================
   TAHAP 4: ANALISIS DATA (MATHEMATICS)
   ========================================================================= */
export const Stage4Analisis: React.FC<StageCommonProps> = ({
  state,
  updateState,
  onNext,
  onPrev,
  onNotify,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { tahap3, tahap4 } = state;
  const stats = getAnalysisStats(tahap3.percobaan);

  const handleCheckCalc = () => {
    if (!tahap4.hitungRataLaju || !tahap4.hitungRataJernih) {
      setError('Isi kedua kolom rata-rata terlebih dahulu sebelum memeriksa.');
      return;
    }
    setError(null);
    const uLaju = Number(tahap4.hitungRataLaju);
    const uJernih = Number(tahap4.hitungRataJernih);
    const okLaju = Math.abs(uLaju - stats.avgLaju) <= 1.2;
    const okJernih = Math.abs(uJernih - stats.avgJernih) <= 2.0;

    const msg = `Nilai eksak sistem: Rata-rata Laju = ${stats.avgLaju} mL/s (${
      okLaju ? 'hitunganmu tepat' : 'periksa lagi pembagiannya'
    }) · Rata-rata Kejernihan = ${stats.avgJernih}% (${
      okJernih ? 'hitunganmu tepat' : 'periksa lagi penjumlahan persentase'
    }).`;

    updateState((prev) => ({
      ...prev,
      tahap4: {
        ...prev.tahap4,
        cekHitungMsg: msg,
        cekHitungOk: okLaju && okJernih,
      },
    }));
    if (okLaju && okJernih) {
      playSuccessSound(state.soundEnabled);
    } else {
      playErrorSound(state.soundEnabled);
    }
    onNotify('Perhitungan rata-rata diperiksa');
  };

  const handleContinue = () => {
    onNext(() => {
      if (!tahap4.hitungRataLaju || !tahap4.hitungRataJernih) {
        const msg = 'Isi perhitungan rata-rata laju filtrasi dan rata-rata kejernihan terlebih dahulu.';
        setError(msg);
        return msg;
      }
      if (tahap4.interpretasi.trim().length < 12) {
        const msg = 'Tuliskan interpretasi grafik secara lengkap.';
        setError(msg);
        return msg;
      }
      if (tahap4.pola.trim().length < 12) {
        const msg = 'Tuliskan pola hubungan yang kamu temukan dari data percobaan.';
        setError(msg);
        return msg;
      }
      setError(null);
      return null;
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-sky-600 via-indigo-500 to-teal-600" />
      <div className="bg-gradient-to-br from-sky-50/65 via-white to-indigo-50/40 p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Tahap 4 · Mathematics · Analisis Data
            </p>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900">
              Mengolah Data dan Membaca Grafik Filtrasi
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Hitung laju aliran air (debit) dan efisiensi penjernihan dari data Lab Maya, lalu baca pola pada grafik otomatis.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 pt-4 sm:p-7 sm:pt-5">
      <MascotGuide
        mood="explain"
        message="Yuk kita lihat grafiknya bareng-bareng. Coba perhatikan batang biru untuk kejernihan dan batang oranye untuk kecepatan aliran, kelihatan banget bedanya kan!"
      />
      <div className="rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50/70 via-white to-teal-50/50 p-4 text-sm text-slate-700">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Calculator className="h-4 w-4 text-sky-700" />
          <span>Rumus Pengolahan Data:</span>
        </div>
        <p className="font-mono-num mt-1.5">
          1. Laju Filtrasi (Q) = Volume (200 mL) / Waktu saring (detik) [mL/s]
        </p>
        <p className="font-mono-num mt-1">
          2. Efisiensi Kejernihan (%) = ((NTU Awal - NTU Akhir) / NTU Awal) x 100%
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[540px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-800 text-xs font-semibold text-white">
              <th className="px-3 py-2.5">Percobaan</th>
              <th className="px-3 py-2.5">Media & Tebal</th>
              <th className="px-3 py-2.5">Waktu (s)</th>
              <th className="px-3 py-2.5">Laju Filtrasi (mL/s)</th>
              <th className="px-3 py-2.5">Kejernihan (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tahap3.percobaan.map((p, i) => (
              <tr key={p.id} className={i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                <td className="font-mono-num px-3 py-2.5 font-semibold">Uji {i + 1}</td>
                <td className="px-3 py-2.5">
                  {p.mediaNama} ({p.ketebalanCm} cm)
                </td>
                <td className="font-mono-num px-3 py-2.5">{p.waktuDetik} s</td>
                <td className="font-mono-num px-3 py-2.5 font-bold text-amber-700">
                  {(200 / p.waktuDetik).toFixed(2)} mL/s
                </td>
                <td className="font-mono-num px-3 py-2.5 font-bold text-sky-700">
                  {p.kejernihanPct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Latihan Numerasi Rata-Rata */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <h3 className="text-sm font-bold text-slate-900">Latihan Numerasi: Hitung Rata-Rata</h3>
        <p className="mt-1 text-xs text-slate-600">
          Jumlahkan hasil seluruh percobaan di atas lalu bagi dengan banyaknya percobaan ({tahap3.percobaan.length}).
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inpRataLaju" className="mb-1 block text-xs font-semibold text-slate-800">
              Rata-rata Laju Filtrasi (mL/s) <span className="text-red-600">*</span>
            </label>
            <input
              id="inpRataLaju"
              type="number"
              step="0.01"
              placeholder="Contoh: 12.50"
              value={tahap4.hitungRataLaju}
              onChange={(e) => {
                setError(null);
                updateState((prev) => ({
                  ...prev,
                  tahap4: { ...prev.tahap4, hitungRataLaju: e.target.value },
                }));
              }}
              className="font-mono-num min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base sm:text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="inpRataJernih" className="mb-1 block text-xs font-semibold text-slate-800">
              Rata-rata Kejernihan (%) <span className="text-red-600">*</span>
            </label>
            <input
              id="inpRataJernih"
              type="number"
              step="0.1"
              placeholder="Contoh: 68.5"
              value={tahap4.hitungRataJernih}
              onChange={(e) => {
                setError(null);
                updateState((prev) => ({
                  ...prev,
                  tahap4: { ...prev.tahap4, hitungRataJernih: e.target.value },
                }));
              }}
              className="font-mono-num min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base sm:text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleCheckCalc}
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
        >
          <Calculator className="h-4 w-4" />
          Periksa Hitungan Saya
        </button>
        {tahap4.cekHitungMsg && (
          <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-medium text-teal-900">
            {tahap4.cekHitungMsg}
          </div>
        )}
      </div>

      {/* Grafik Otomatis */}
      <div className="mt-5">
        <AnalysisChart trials={tahap3.percobaan} />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="inpInterpretasi" className="mb-1 block text-sm font-semibold text-slate-800">
            1. Interpretasi Grafik: Percobaan mana yang paling cepat menyaring dan mana yang menghasilkan air paling jernih?{' '}
            <span className="text-red-600">*</span>
          </label>
          <textarea
            id="inpInterpretasi"
            rows={3}
            placeholder="Jelaskan perbandingan antar percobaan berdasarkan grafik..."
            value={tahap4.interpretasi}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                tahap4: { ...prev.tahap4, interpretasi: e.target.value },
              }));
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="inpPola" className="mb-1 block text-sm font-semibold text-slate-800">
            2. Pola Hubungan: Bagaimana hubungan antara ukuran pori dan ketebalan media terhadap laju filtrasi serta kejernihan air?{' '}
            <span className="text-red-600">*</span>
          </label>
          <textarea
            id="inpPola"
            rows={3}
            placeholder="Contoh: Semakin kecil ukuran pori dan semakin tebal media penyaring, maka..."
            value={tahap4.pola}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                tahap4: { ...prev.tahap4, pola: e.target.value },
              }));
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
          />
        </div>
      </div>

      <StageAlert message={error} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Lanjut ke Rancang Solusi
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      </div>
    </section>
  );
};
