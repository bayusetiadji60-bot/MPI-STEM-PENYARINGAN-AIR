import { useEffect, useState } from 'react';
import { BookOpen, Check, Home, Lock, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { LandingIntro } from './components/LandingIntro';
import {
  Stage0Identitas,
  Stage1Masalah,
  Stage2Konsep,
  Stage3LabMaya,
  Stage4Analisis,
} from './components/StagesPart1';
import {
  Stage5Rancang,
  Stage6Kesimpulan,
  Stage7Evaluasi,
  Stage8Rekap,
} from './components/StagesPart2';
import { CURRICULUM_CONFIG } from './data/curriculum';
import { AppState } from './types/lkpd';
import {
  getDefaultState,
  loadStoredState,
  persistState,
} from './utils/filtrationModel';
import {
  playBadgeSound,
  playErrorSound,
  stopIndonesianSpeech,
} from './utils/soundEffects';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadStoredState());
  const [showIntro, setShowIntro] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  useEffect(() => {
    persistState(state);
  }, [state]);

  const notify = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev));
  };

  const handleNextStage = (stageId: number, validator: () => string | null) => {
    const err = validator();
    if (err) {
      playErrorSound(state.soundEnabled);
      return;
    }

    stopIndonesianSpeech();

    setState((prev) => {
      const alreadyDone = prev.completedStages.includes(stageId);
      const completedStages = alreadyDone
        ? prev.completedStages
        : [...prev.completedStages, stageId];
      const nextStage = Math.min(8, stageId + 1);
      const maxUnlockedStage = Math.max(prev.maxUnlockedStage, nextStage);
      const points = alreadyDone ? prev.points : prev.points + 15;

      // Tandai Tahap 8 otomatis selesai begitu masuk ke Tahap 8
      const finalCompleted =
        nextStage === 8 && !completedStages.includes(8)
          ? [...completedStages, 8]
          : completedStages;

      if (!alreadyDone) {
        playBadgeSound(prev.soundEnabled);
        notify(`Lencana terbuka: ${CURRICULUM_CONFIG.tahapan[stageId].badge} (+15 Poin)`);
      }

      return {
        ...prev,
        currentStage: nextStage,
        maxUnlockedStage,
        completedStages: finalCompleted,
        points,
      };
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStage = (stageId: number) => {
    stopIndonesianSpeech();
    setState((prev) => ({
      ...prev,
      currentStage: Math.max(0, stageId - 1),
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAll = () => {
    try {
      localStorage.removeItem(CURRICULUM_CONFIG.storageKey);
    } catch {
      // Abaikan
    }
    setState(getDefaultState());
    setShowIntro(true);
    setShowResetModal(false);
    notify('Data pembelajaran berhasil diatur ulang');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalStages = CURRICULUM_CONFIG.tahapan.length - 1;
  const progressPct = Math.min(
    100,
    Math.round((state.completedStages.length / totalStages) * 100)
  );
  const activeStageMeta = CURRICULUM_CONFIG.tahapan[state.currentStage];

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-teal-50/35 text-slate-900">
      {/* Top Bar 3 Zona */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
          {/* Zona 1: Brand Wordmark Tunggal */}
          <button
            type="button"
            onClick={() => {
              setShowIntro(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="whitespace-nowrap shrink-0 text-left text-base font-extrabold tracking-tight text-teal-800 sm:text-lg"
          >
            Lab Maya Filtrasi
          </button>

          {/* Zona 2: Navigasi Ringkas */}
          <nav
            aria-label="Navigasi Cepat"
            className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex"
          >
            <button
              type="button"
              onClick={() => {
                setShowIntro(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`whitespace-nowrap shrink-0 hover:text-slate-900 hover:underline ${
                showIntro ? 'font-semibold text-teal-800' : ''
              }`}
            >
              Pengantar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowIntro(false);
                setState((p) => ({ ...p, currentStage: 0 }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="whitespace-nowrap shrink-0 hover:text-slate-900 hover:underline"
            >
              Identitas
            </button>
            <button
              type="button"
              disabled={state.maxUnlockedStage < 3}
              onClick={() => {
                setShowIntro(false);
                setState((p) => ({ ...p, currentStage: 3 }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="whitespace-nowrap shrink-0 hover:text-slate-900 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lab Maya
            </button>
            <button
              type="button"
              disabled={state.maxUnlockedStage < 4}
              onClick={() => {
                setShowIntro(false);
                setState((p) => ({ ...p, currentStage: 4 }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="whitespace-nowrap shrink-0 hover:text-slate-900 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              Analisis Data
            </button>
            <button
              type="button"
              onClick={() => setShowTeacherModal(true)}
              className="whitespace-nowrap shrink-0 hover:text-slate-900 hover:underline"
            >
              Panduan Guru
            </button>
          </nav>

          {/* Zona 3: 1 Aksi Utama */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="inline-flex min-h-[38px] items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Mulai Ulang
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div
              key="intro-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <LandingIntro
                hasProgress={Boolean(state.identitas.nama.trim() || state.completedStages.length > 0)}
                savedName={state.identitas.nama}
                currentStage={state.currentStage}
                onEnterApp={() => {
                  setShowIntro(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="workspace-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
            {/* Metadata Konteks Kurikulum & Capaian Poin (Unboxed) */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowIntro(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-teal-800 hover:underline md:hidden"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Pengantar</span>
                </button>
                <span aria-hidden="true" className="md:hidden">·</span>
                <span className="font-semibold text-slate-800">{CURRICULUM_CONFIG.sekolah}</span>
                <span aria-hidden="true">·</span>
                <span>{CURRICULUM_CONFIG.mapel}</span>
                <span aria-hidden="true">·</span>
                <span>Topik: {CURRICULUM_CONFIG.topik}</span>
                <span aria-hidden="true">·</span>
                <span>{CURRICULUM_CONFIG.durasi}</span>
              </div>
              <div className="font-mono-num flex items-center gap-3 font-semibold text-slate-800">
                <span>{state.points} Poin</span>
                <span aria-hidden="true">·</span>
                <span>
                  {state.completedStages.length} / {CURRICULUM_CONFIG.tahapan.length} Lencana
                </span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
                  }
                  className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-teal-800 hover:underline"
                  title="Aktifkan atau bisukan efek suara simulasi"
                >
                  {state.soundEnabled ? (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Suara Nyala</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-500">Suara Bisu</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stepper & Progress Bar */}
            <section
          aria-label="Penanda Progres Pembelajaran"
          className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-sky-50/40 p-4"
        >
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700 sm:text-sm">
            <span>
              Tahap {state.currentStage} dari {totalStages}: {activeStageMeta.nama}
            </span>
            <span className="font-mono-num text-teal-800">{progressPct}%</span>
          </div>

          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-teal-600 via-sky-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CURRICULUM_CONFIG.tahapan.map((t) => {
              const isActive = t.id === state.currentStage;
              const isDone = state.completedStages.includes(t.id);
              const isLocked = t.id > state.maxUnlockedStage;

              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked) {
                      setState((prev) => ({ ...prev, currentStage: t.id }));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-teal-800 bg-teal-700 text-white'
                      : isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : isLocked
                      ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isDone && !isActive && <Check className="h-3.5 w-3.5" />}
                  {isLocked && <Lock className="h-3 w-3" />}
                  <span>{t.labelPendek}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Konten Tahap Aktif dengan Transisi Fade-In Halus */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`stage-${state.currentStage}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {state.currentStage === 0 && (
              <Stage0Identitas
                state={state}
                updateState={updateState}
                onNext={(val) => handleNextStage(0, val)}
                onPrev={() => handlePrevStage(0)}
                onNotify={notify}
              />
            )}
            {state.currentStage === 1 && (
              <Stage1Masalah
                state={state}
                updateState={updateState}
                onNext={(val) => handleNextStage(1, val)}
                onPrev={() => handlePrevStage(1)}
                onNotify={notify}
              />
            )}
            {state.currentStage === 2 && (
              <Stage2Konsep
                state={state}
                updateState={updateState}
                onNext={(val) => handleNextStage(2, val)}
                onPrev={() => handlePrevStage(2)}
                onNotify={notify}
              />
            )}
            {state.currentStage === 3 && (
              <Stage3LabMaya
                state={state}
                updateState={updateState}
                onNext={(val) => handleNextStage(3, val)}
                onPrev={() => handlePrevStage(3)}
                onNotify={notify}
              />
            )}
            {state.currentStage === 4 && (
              <Stage4Analisis
                state={state}
                updateState={updateState}
                onNext={(val) => handleNextStage(4, val)}
                onPrev={() => handlePrevStage(4)}
                onNotify={notify}
              />
            )}
            {state.currentStage === 5 && (
              <Stage5Rancang
                state={state}
                updateState={updateState}
                onNext={(val) => handleNextStage(5, val)}
                onPrev={() => handlePrevStage(5)}
                onNotify={notify}
              />
            )}
            {state.currentStage === 6 && (
              <Stage6Kesimpulan
                state={state}
                updateState={updateState}
                onNext={(val) => handleNextStage(6, val)}
                onPrev={() => handlePrevStage(6)}
                onNotify={notify}
              />
            )}
            {state.currentStage === 7 && (
              <Stage7Evaluasi
                state={state}
                updateState={updateState}
                onNext={(val) => handleNextStage(7, val)}
                onPrev={() => handlePrevStage(7)}
                onNotify={notify}
              />
            )}
            {state.currentStage === 8 && (
              <Stage8Rekap
                state={state}
                onPrev={() => handlePrevStage(8)}
                onNotify={notify}
              />
            )}
          </motion.div>
        </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Bersih */}
      <footer className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-5 text-xs text-slate-500 sm:px-6">
        <span>
          Media Pembelajaran Interaktif STEM + Lab Maya · {CURRICULUM_CONFIG.sekolah}
        </span>
        <button
          type="button"
          onClick={() => setShowTeacherModal(true)}
          className="inline-flex items-center gap-1.5 font-semibold text-teal-800 hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Panduan Guru
        </button>
      </footer>

      {/* Modal Konfirmasi Mulai Ulang */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resetModalTitle"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 id="resetModalTitle" className="text-lg font-bold text-slate-900">
              Mulai Ulang Pembelajaran?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Semua jawaban dan data percobaan Lab Maya yang tersimpan di browser ini akan dihapus agar dapat diisi ulang dari awal.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="min-h-[42px] rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="min-h-[42px] rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Ya, Mulai Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Panduan Guru */}
      {showTeacherModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="teacherModalTitle"
        >
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 id="teacherModalTitle" className="text-lg font-bold text-slate-900">
              Panduan Singkat Guru IPA
            </h3>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">1. Cara Menjalankan & Membagikan ke Siswa</p>
                <p>
                  Bagikan tautan aplikasi ini melalui WhatsApp, Google Classroom, atau LMS sekolah. Siswa dapat membukanya langsung dari browser HP maupun laptop tanpa login.
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">2. Alur Pembelajaran (2 JP / ± 40 menit)</p>
                <p>
                  Siswa wajib mengisi setiap tahap secara berurutan (Tahap 0 Identitas hingga Tahap 8 Rekap). Progres tersimpan otomatis di browser siswa sehingga aman bila halaman dimuat ulang.
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">3. Pengumpulan Tugas</p>
                <p>
                  Di Tahap 8, siswa mengunduh laporan otomatis berformat PDF (
                  <span className="font-mono-num text-xs">LKPD_Penyaringan_Campuran_[NamaSiswa].pdf</span>
                  ) yang berisi seluruh jawaban, tabel data Lab Maya, grafik analisis, rancangan alat, refleksi, dan skor evaluasi.
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">4. Penyesuaian Konten</p>
                <p>
                  Teks tujuan pembelajaran, parameter media filtrasi, mini-kuis, serta soal evaluasi tersentralisasi di{' '}
                  <span className="font-mono-num text-xs">src/data/curriculum.ts</span> agar mudah disesuaikan dengan kebutuhan kelas.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTeacherModal(false)}
                className="min-h-[42px] rounded-xl bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Umpan Balik */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
    </MotionConfig>
  );
}
