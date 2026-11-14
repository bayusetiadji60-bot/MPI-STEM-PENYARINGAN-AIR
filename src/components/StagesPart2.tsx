import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileCheck2,
  FileDown,
  Home,
  Lightbulb,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { CURRICULUM_CONFIG } from '../data/curriculum';
import engineeringPrototypeImg from '../assets/images/engineering_filter_prototype_1794640167114.jpg';
import {
  AppState,
  LayerBottomId,
  LayerMidId,
  LayerTopId,
} from '../types/lkpd';
import {
  evaluateEngineeringDesign,
  getAnalysisStats,
  isAllRequiredComplete,
} from '../utils/filtrationModel';
import { generateLkpdPdf } from '../utils/pdfExport';
import { playErrorSound, playSuccessSound } from '../utils/soundEffects';
import { AnalysisChart } from './AnalysisChart';
import { BottleFilterBuilder } from './BottleFilterBuilder';
import { IllustrationFrame } from './IllustrationFrame';
import { MascotGuide } from './MascotGuide';

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
   TAHAP 5: RANCANG SOLUSI (ENGINEERING)
   ========================================================================= */
export const Stage5Rancang: React.FC<StageCommonProps> = ({
  state,
  updateState,
  onNext,
  onPrev,
  onNotify,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { tahap5 } = state;

  const handleTestDesign = () => {
    setError(null);
    const result = evaluateEngineeringDesign(
      tahap5.lapisanAtas,
      tahap5.lapisanTengah,
      tahap5.lapisanBawah,
      tahap5.tebalDesain
    );
    updateState((prev) => ({
      ...prev,
      tahap5: { ...prev.tahap5, hasilUji: result },
    }));
    if (result.lolos) {
      playSuccessSound(state.soundEnabled);
    } else {
      playErrorSound(state.soundEnabled);
    }
    onNotify(result.lolos ? 'Rancangan lolos kriteria target!' : 'Rancangan perlu penyesuaian');
  };

  const handleContinue = () => {
    onNext(() => {
      if (!tahap5.hasilUji) {
        const msg = 'Klik "Uji Rancangan Alat" terlebih dahulu untuk melihat performa alatmu.';
        setError(msg);
        return msg;
      }
      if (!tahap5.hasilUji.lolos) {
        const msg = 'Rancangan belum memenuhi target (Kejernihan >= 85% dan Waktu <= 45 detik). Ubah susunan atau ketebalan lalu uji lagi.';
        setError(msg);
        return msg;
      }
      if (tahap5.namaAlat.trim().length < 3) {
        const msg = 'Berikan nama untuk alat penjernih air rancanganmu.';
        setError(msg);
        return msg;
      }
      if (tahap5.alasan.trim().length < 12) {
        const msg = 'Tuliskan alasan ilmiah pemilihan susunan lapisan tersebut.';
        setError(msg);
        return msg;
      }
      if (tahap5.prediksi.trim().length < 10) {
        const msg = 'Tuliskan prediksi dan evaluasi penerapan alatmu.';
        setError(msg);
        return msg;
      }
      setError(null);
      return null;
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-teal-600" />
      <div className="bg-gradient-to-br from-amber-50/60 via-white to-orange-50/35 p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Tahap 5 · Engineering · Rancang Solusi
            </p>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900">
              Tantangan Desain: Filter Air Darurat Warga Besuki
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Rancang alat penyaring air sederhana untuk menjernihkan <strong>200 mL air irigasi keruh (120 NTU)</strong> agar memenuhi dua syarat teknis berikut:
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 pt-4 sm:p-7 sm:pt-5">
      <MascotGuide
        mood={tahap5.hasilUji?.lolos ? 'celebrate' : 'explain'}
        message="Rancang botol penyaring air darurat dengan menyusun bahan dari pori besar di atas hingga halus di bawah. Perhatikan juga target biaya hemat warga maksimal Rp 5.500!"
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        <div className="space-y-4 lg:col-span-4">
          <IllustrationFrame
            src={engineeringPrototypeImg}
            alt="Ilustrasi prototipe penyaring air dari botol plastik berisi kerikil, pasir kasar, pasir halus, arang, dan kapas"
            caption="Contoh prototipe alat penyaring air sederhana bertingkat menggunakan botol bekas dan bahan alami."
            aspectClass="aspect-[4/3]"
          />
          <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/45 p-4 text-sm text-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-700" />
              <span>Kriteria Keberhasilan Desain</span>
            </div>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs sm:text-sm">
              <li>Kejernihan hasil saringan minimal <strong>85%</strong> (&le; 18 NTU).</li>
              <li>Waktu penyaringan maksimal <strong>45 detik</strong>.</li>
              <li>Bonus STEM: Biaya bahan lokal hemat <strong>&le; Rp 5.500</strong>.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8">
          <BottleFilterBuilder
            lapisanAtas={tahap5.lapisanAtas}
            lapisanTengah={tahap5.lapisanTengah}
            lapisanBawah={tahap5.lapisanBawah}
            tebalDesain={tahap5.tebalDesain}
            hasilUji={tahap5.hasilUji}
            onChangeTop={(val: LayerTopId) =>
              updateState((prev) => ({
                ...prev,
                tahap5: { ...prev.tahap5, lapisanAtas: val },
              }))
            }
            onChangeMid={(val: LayerMidId) =>
              updateState((prev) => ({
                ...prev,
                tahap5: { ...prev.tahap5, lapisanTengah: val },
              }))
            }
            onChangeBottom={(val: LayerBottomId) =>
              updateState((prev) => ({
                ...prev,
                tahap5: { ...prev.tahap5, lapisanBawah: val },
              }))
            }
            onChangeThickness={(cm: number) =>
              updateState((prev) => ({
                ...prev,
                tahap5: { ...prev.tahap5, tebalDesain: cm },
              }))
            }
            onTestDesign={handleTestDesign}
          />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="inpNamaAlat" className="mb-1 block text-sm font-semibold text-slate-800">
            1. Nama Alat Penjernih Rancanganmu <span className="text-red-600">*</span>
          </label>
          <input
            id="inpNamaAlat"
            type="text"
            placeholder="Contoh: Filter Bersih Besuki (FBB-1)"
            value={tahap5.namaAlat}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                tahap5: { ...prev.tahap5, namaAlat: e.target.value },
              }));
            }}
            className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="inpAlasanDesain" className="mb-1 block text-sm font-semibold text-slate-800">
            2. Alasan Ilmiah Pemilihan Susunan Lapisan Tersebut <span className="text-red-600">*</span>
          </label>
          <textarea
            id="inpAlasanDesain"
            rows={3}
            placeholder="Jelaskan mengapa bahan berpori besar ditempatkan di atas dan bahan halus di bawah..."
            value={tahap5.alasan}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                tahap5: { ...prev.tahap5, alasan: e.target.value },
              }));
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="inpPrediksi" className="mb-1 block text-sm font-semibold text-slate-800">
            3. Prediksi Hasil & Catatan Keamanan Penggunaan di Rumah Warga{' '}
            <span className="text-red-600">*</span>
          </label>
          <textarea
            id="inpPrediksi"
            rows={3}
            placeholder="Apakah air hasil saringan sudah jernih untuk mencuci? Apakah perlu direbus terlebih dahulu jika hendak diminum?"
            value={tahap5.prediksi}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                tahap5: { ...prev.tahap5, prediksi: e.target.value },
              }));
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
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
          Lanjut ke Kesimpulan
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      </div>
    </section>
  );
};

/* =========================================================================
   TAHAP 6: KESIMPULAN DAN REFLEKSI
   ========================================================================= */
export const Stage6Kesimpulan: React.FC<StageCommonProps> = ({
  state,
  updateState,
  onNext,
  onPrev,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { tahap1, tahap6 } = state;

  const handleContinue = () => {
    onNext(() => {
      if (tahap6.kesimpulan.trim().length < 15) {
        const msg = 'Tuliskan kesimpulan akhir dengan jelas (minimal 15 karakter).';
        setError(msg);
        return msg;
      }
      if (tahap6.kehidupan.trim().length < 10) {
        const msg = 'Tuliskan contoh penerapan penyaringan dalam kehidupan sehari-hari.';
        setError(msg);
        return msg;
      }
      if (tahap6.dipahami.trim().length < 6) {
        const msg = 'Isi refleksi tentang hal yang paling kamu pahami.';
        setError(msg);
        return msg;
      }
      if (tahap6.membingungkan.trim().length < 4) {
        const msg = 'Isi kolom refleksi bagian yang masih membingungkan atau menantang.';
        setError(msg);
        return msg;
      }
      setError(null);
      return null;
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500" />
      <div className="bg-gradient-to-br from-sky-50/60 via-white to-teal-50/45 p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-teal-600 text-white shadow-sm">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Tahap 6 · Kesimpulan & Refleksi
            </p>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900">
              Menyimpulkan Hasil Penyelidikan
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Bandingkan dugaan awal (hipotesis) yang kamu tulis di Tahap 1 dengan bukti data percobaan Lab Maya.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 pt-4 sm:p-7 sm:pt-5">
      <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50/80 via-white to-teal-50/50 p-4 text-sm text-slate-800">
        <div className="flex items-center gap-2 font-semibold text-sky-900">
          <Home className="h-4 w-4 text-sky-700" />
          <span>Hipotesis Awalmu (Tahap 1):</span>
        </div>
        <p className="mt-1 italic text-slate-700">&ldquo;{tahap1.hipotesis}&rdquo;</p>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="inpKesimpulan" className="mb-1 block text-sm font-semibold text-slate-800">
            1. Kesimpulan Akhir: Apakah hipotesismu terbukti benar? Jelaskan kesimpulan utama tentang proses penyaringan campuran!{' '}
            <span className="text-red-600">*</span>
          </label>
          <textarea
            id="inpKesimpulan"
            rows={3}
            placeholder="Hipotesis saya terbukti benar/kurang tepat karena..."
            value={tahap6.kesimpulan}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                tahap6: { ...prev.tahap6, kesimpulan: e.target.value },
              }));
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="inpKehidupan" className="mb-1 block text-sm font-semibold text-slate-800">
            2. Keterkaitan Sehari-hari: Sebutkan minimal 2 contoh penerapan penyaringan dalam kehidupan sehari-hari di rumah atau lingkunganmu!{' '}
            <span className="text-red-600">*</span>
          </label>
          <textarea
            id="inpKehidupan"
            rows={3}
            placeholder="Contoh: Menyaring santan kelapa, menyaring ampas kopi/teh, masker penyaring debu..."
            value={tahap6.kehidupan}
            onChange={(e) => {
              setError(null);
              updateState((prev) => ({
                ...prev,
                tahap6: { ...prev.tahap6, kehidupan: e.target.value },
              }));
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inpDipahami" className="mb-1 block text-sm font-semibold text-slate-800">
              3. Refleksi: Apa yang paling kupahami hari ini?{' '}
              <span className="text-red-600">*</span>
            </label>
            <textarea
              id="inpDipahami"
              rows={3}
              placeholder="Saya paling paham tentang..."
              value={tahap6.dipahami}
              onChange={(e) => {
                setError(null);
                updateState((prev) => ({
                  ...prev,
                  tahap6: { ...prev.tahap6, dipahami: e.target.value },
                }));
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="inpBingung" className="mb-1 block text-sm font-semibold text-slate-800">
              4. Refleksi: Bagian mana yang masih membingungkan?{' '}
              <span className="text-red-600">*</span>
            </label>
            <textarea
              id="inpBingung"
              rows={3}
              placeholder="Tuliskan bagian yang masih ingin dipelajari lebih lanjut..."
              value={tahap6.membingungkan}
              onChange={(e) => {
                setError(null);
                updateState((prev) => ({
                  ...prev,
                  tahap6: { ...prev.tahap6, membingungkan: e.target.value },
                }));
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none"
            />
          </div>
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
          Lanjut ke Evaluasi Singkat
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      </div>
    </section>
  );
};

/* =========================================================================
   TAHAP 7: EVALUASI SINGKAT (5 SOAL PILIHAN GANDA)
   ========================================================================= */
export const Stage7Evaluasi: React.FC<StageCommonProps> = ({
  state,
  updateState,
  onNext,
  onPrev,
  onNotify,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { tahap7 } = state;

  const handleSubmitEval = () => {
    const allDone = CURRICULUM_CONFIG.evaluasiSoal.every(
      (q) => tahap7.answers[q.id] !== undefined
    );
    if (!allDone) {
      playErrorSound(state.soundEnabled);
      setError('Jawab seluruh 5 soal evaluasi sebelum memeriksa skor.');
      return;
    }
    setError(null);

    let benarCount = 0;
    CURRICULUM_CONFIG.evaluasiSoal.forEach((q) => {
      if (Number(tahap7.answers[q.id]) === q.benar) benarCount += 1;
    });
    const score = Math.round((benarCount / CURRICULUM_CONFIG.evaluasiSoal.length) * 100);

    playSuccessSound(state.soundEnabled);
    updateState((prev) => ({
      ...prev,
      points: prev.points + Math.round(score / 5),
      tahap7: {
        ...prev.tahap7,
        submitted: true,
        score,
      },
    }));
    onNotify(`Skor evaluasi tercatat: ${score} / 100`);
  };

  const handleContinue = () => {
    onNext(() => {
      if (!tahap7.submitted) {
        const msg = 'Klik tombol "Periksa Skor Evaluasi" terlebih dahulu untuk merekam nilaimu.';
        setError(msg);
        return msg;
      }
      setError(null);
      return null;
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-500" />
      <div className="bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/45 p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Tahap 7 · Evaluasi Pemahaman
            </p>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900">
              Evaluasi Akhir (5 Soal)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Pilih jawaban yang paling tepat, lalu tekan <strong>Periksa Skor Evaluasi</strong> untuk melihat nilai dan pembahasan tiap soal.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 pt-4 sm:p-7 sm:pt-5">
      {tahap7.submitted && (
        <MascotGuide
          mood={tahap7.score >= 80 ? 'celebrate' : 'happy'}
          message={
            tahap7.score >= 80
              ? `Hebat! Skor evaluasimu ${tahap7.score}/100. Kamu sudah menguasai konsep penyaringan campuran dan siap mencetak sertifikat serta laporan PDF!`
              : `Skor evaluasimu ${tahap7.score}/100. Baca pembahasan setiap soal di bawah agar makin mantap sebelum mengunduh laporan.`
          }
        />
      )}
      <div className="space-y-4">
        {CURRICULUM_CONFIG.evaluasiSoal.map((q) => {
          const chosen = tahap7.answers[q.id];
          const isRight = Number(chosen) === q.benar;
          return (
            <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-sm font-semibold text-slate-900">{q.tanya}</p>
              <div className="mt-2.5 space-y-2">
                {q.opsi.map((op, i) => (
                  <label
                    key={i}
                    className={`flex min-h-[42px] items-start gap-2.5 rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 ${
                      tahap7.submitted ? 'cursor-default' : 'cursor-pointer hover:border-sky-400'
                    } border-slate-200`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      disabled={tahap7.submitted}
                      checked={Number(chosen) === i}
                      onChange={() => {
                        setError(null);
                        updateState((prev) => ({
                          ...prev,
                          tahap7: {
                            ...prev.tahap7,
                            answers: { ...prev.tahap7.answers, [q.id]: i },
                          },
                        }));
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-teal-700"
                    />
                    <span>{op}</span>
                  </label>
                ))}
              </div>

              {tahap7.submitted && (
                <div
                  className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                    isRight
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-red-200 bg-red-50 text-red-900'
                  }`}
                >
                  <p className="font-bold">
                    {isRight
                      ? 'Benar!'
                      : `Kurang tepat (Jawaban benar: ${q.opsi[q.benar]}).`}
                  </p>
                  <p className="mt-1">{q.bahas}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleSubmitEval}
          disabled={tahap7.submitted}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          Periksa Skor Evaluasi
        </button>

        {tahap7.submitted && (
          <span className="font-mono-num text-base font-bold text-emerald-700">
            Skor Evaluasi: {tahap7.score} / 100
          </span>
        )}
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
          Lihat Rekap & Unduh PDF
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      </div>
    </section>
  );
};

/* =========================================================================
   TAHAP 8: REKAPITULASI & EKSPOR PDF
   ========================================================================= */
export const Stage8Rekap: React.FC<Omit<StageCommonProps, 'onNext' | 'updateState'>> = ({
  state,
  onPrev,
  onNotify,
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const { identitas, tahap1, tahap3, tahap4, tahap5, tahap6, tahap7, points, completedStages } =
    state;
  const stats = getAnalysisStats(tahap3.percobaan);
  const canDownload = isAllRequiredComplete(state);

  const handleDownloadPdf = () => {
    if (!canDownload) return;
    playSuccessSound(state.soundEnabled);
    const filename = generateLkpdPdf(state, chartRef.current);
    onNotify(`PDF diunduh: ${filename}`);
  };

  const handleCopySummary = async () => {
    const summaryText = [
      `LAPORAN LKPD STEM · ${CURRICULUM_CONFIG.sekolah}`,
      `Topik: ${CURRICULUM_CONFIG.topik}`,
      `Nama: ${identitas.nama} (${identitas.kelas}, Absen ${identitas.absen})`,
      `Tanggal: ${identitas.tanggal}`,
      `Skor Evaluasi: ${tahap7.score}/100 | Total Poin: ${points}`,
      `Percobaan Lab Maya: ${tahap3.percobaan.length} uji (Rata-rata laju ${stats.avgLaju} mL/s, kejernihan ${stats.avgJernih}%)`,
      `Alat Rancangan: ${tahap5.namaAlat} (${tahap5.hasilUji?.kejernihan ?? '-'}% jernih, ${tahap5.hasilUji?.waktuDetik ?? '-'} detik)`,
      `Kesimpulan: ${tahap6.kesimpulan}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      playSuccessSound(state.soundEnabled);
      onNotify('Ringkasan disalin — siap ditempel di WhatsApp atau Google Classroom');
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      onNotify('Gagal menyalin otomatis. Gunakan tombol Unduh PDF.');
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-teal-600 via-emerald-500 to-sky-600" />
      <div className="bg-gradient-to-br from-teal-50/70 via-white to-sky-50/55 p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-sm">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Tahap 8 · Rekapitulasi & Ekspor Laporan PDF
            </p>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900">
              Rekap Hasil Belajar {identitas.nama}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Selamat menyelesaikan seluruh alur STEM! Unduh laporan PDF atau salin ringkasan untuk dikirim ke grup kelas / Google Classroom.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 pt-4 sm:p-7 sm:pt-5">
      <MascotGuide
        mood="celebrate"
        message={`Luar biasa, ${identitas.nama || 'Peneliti Muda'}! Kamu telah menyelesaikan seluruh eksperimen Lab Maya dan merancang alat penjernih air "${tahap5.namaAlat || 'Filter Besuki'}".`}
      />

      {/* Sertifikat Mini Peneliti Muda IPA */}
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/80 via-white to-teal-50/70 p-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Award className="h-7 w-7" />
        </div>
        <p className="mt-2 text-xs font-bold tracking-wider text-amber-800 uppercase">
          Sertifikat Apresiasi Peneliti Muda IPA
        </p>
        <h3 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
          {identitas.nama || 'Siswa SMP Negeri 3 Besuki'}
        </h3>
        <p className="text-xs font-medium text-slate-600">
          Kelas {identitas.kelas || '-'} · No. Absen {identitas.absen || '-'} · {CURRICULUM_CONFIG.sekolah}
        </p>
        <p className="mx-auto mt-2.5 max-w-xl text-xs leading-relaxed text-slate-700 sm:text-sm">
          Telah menuntaskan penyelidikan STEM + Lab Maya topik{' '}
          <strong>{CURRICULUM_CONFIG.topik}</strong> dengan prototipe alat{' '}
          <strong>{tahap5.namaAlat || '-'}</strong>.
        </p>
        <div className="font-mono-num mt-3 flex flex-wrap justify-center gap-4 text-xs font-bold text-teal-900">
          <span>Skor Evaluasi: {tahap7.score}/100</span>
          <span>·</span>
          <span>Total Poin: {points}</span>
          <span>·</span>
          <span>Lencana: {completedStages.length}/{CURRICULUM_CONFIG.tahapan.length}</span>
        </div>
        <p className="mt-2.5 text-[11px] font-medium text-slate-600">
          {completedStages
            .map((sid) => CURRICULUM_CONFIG.tahapan[sid]?.badge)
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      <div className="mt-5 space-y-5 divide-y divide-slate-200">
        {/* Identitas */}
        <div className="pt-1">
          <h3 className="text-sm font-bold text-teal-800">0. Identitas & Capaian</h3>
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              <strong>Nama / Kelas / Absen:</strong> {identitas.nama} · {identitas.kelas} · No.{' '}
              {identitas.absen}
            </p>
            <p>
              <strong>Sekolah & Tanggal:</strong> {CURRICULUM_CONFIG.sekolah} · {identitas.tanggal}
            </p>
            <p className="font-mono-num">
              <strong>Skor Evaluasi:</strong> {tahap7.score} / 100
            </p>
            <p className="font-mono-num">
              <strong>Total Poin Belajar:</strong> {points} poin
            </p>
          </div>
        </div>

        {/* Tahap 1 */}
        <div className="pt-4">
          <h3 className="text-sm font-bold text-teal-800">1. Orientasi Masalah & Hipotesis</h3>
          <p className="mt-1.5 text-sm text-slate-700">
            <strong>Pertanyaan:</strong> {tahap1.pertanyaan}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            <strong>Hipotesis Awal:</strong> {tahap1.hipotesis}
          </p>
        </div>

        {/* Tahap 3 & 4 */}
        <div className="pt-4">
          <h3 className="text-sm font-bold text-teal-800">3 & 4. Data Lab Maya & Analisis</h3>
          <p className="mt-1.5 text-sm text-slate-700">
            <strong>Variabel Bebas / Terikat / Kontrol:</strong> {tahap3.varBebas} /{' '}
            {tahap3.varTerikat} / {tahap3.varKontrol}
          </p>

          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[560px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-3 py-2">No</th>
                  <th className="px-3 py-2">Media</th>
                  <th className="px-3 py-2">Tebal</th>
                  <th className="px-3 py-2">Waktu</th>
                  <th className="px-3 py-2">Laju (mL/s)</th>
                  <th className="px-3 py-2">Jernih (%)</th>
                  <th className="px-3 py-2">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tahap3.percobaan.map((p, i) => (
                  <tr key={p.id}>
                    <td className="font-mono-num px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{p.mediaNama}</td>
                    <td className="font-mono-num px-3 py-2">{p.ketebalanCm} cm</td>
                    <td className="font-mono-num px-3 py-2">{p.waktuDetik} s</td>
                    <td className="font-mono-num px-3 py-2">
                      {(200 / p.waktuDetik).toFixed(2)}
                    </td>
                    <td className="font-mono-num px-3 py-2">{p.kejernihanPct}%</td>
                    <td className="px-3 py-2">{p.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-mono-num mt-2 text-xs font-semibold text-slate-700">
            Rata-rata Lab: Laju {stats.avgLaju} mL/s · Kejernihan {stats.avgJernih}%
          </p>
          <p className="mt-1 text-sm text-slate-700">
            <strong>Interpretasi & Pola:</strong> {tahap4.interpretasi} — {tahap4.pola}
          </p>

          <div className="mt-3">
            <AnalysisChart ref={chartRef} trials={tahap3.percobaan} />
          </div>
        </div>

        {/* Tahap 5 */}
        <div className="pt-4">
          <h3 className="text-sm font-bold text-teal-800">
            5. Rancangan Solusi ({tahap5.namaAlat})
          </h3>
          <p className="mt-1.5 text-sm text-slate-700">
            <strong>Susunan:</strong> Atas ({tahap5.lapisanAtas}) &rarr; Tengah (
            {tahap5.lapisanTengah}) &rarr; Bawah ({tahap5.lapisanBawah}) · Tebal{' '}
            {tahap5.tebalDesain} cm
          </p>
          <p className="font-mono-num mt-1 text-sm text-slate-700">
            <strong>Hasil Uji:</strong> Kejernihan {tahap5.hasilUji?.kejernihan}% · Waktu{' '}
            {tahap5.hasilUji?.waktuDetik} detik ({tahap5.hasilUji?.lolos ? 'LOLOS' : 'BELUM LOLOS'})
          </p>
          <p className="mt-1 text-sm text-slate-700">
            <strong>Alasan & Prediksi:</strong> {tahap5.alasan} | {tahap5.prediksi}
          </p>
        </div>

        {/* Tahap 6 */}
        <div className="pt-4">
          <h3 className="text-sm font-bold text-teal-800">6. Kesimpulan & Refleksi</h3>
          <p className="mt-1.5 text-sm text-slate-700">
            <strong>Kesimpulan:</strong> {tahap6.kesimpulan}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            <strong>Penerapan Sehari-hari:</strong> {tahap6.kehidupan}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            <strong>Paling Dipahami / Masih Membingungkan:</strong> {tahap6.dipahami} /{' '}
            {tahap6.membingungkan}
          </p>
        </div>
      </div>

      {/* Tombol Unduh PDF & Salin Ringkasan */}
      <div className="mt-7 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/80 via-white to-sky-50/60 p-5 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={!canDownload}
            onClick={handleDownloadPdf}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-sky-700 px-6 py-3 text-base font-bold text-white shadow-sm hover:from-teal-800 hover:to-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown className="h-5 w-5" />
            Unduh Laporan LKPD (PDF)
          </button>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-teal-700 bg-white px-5 py-3 text-sm font-bold text-teal-800 hover:bg-teal-50"
          >
            {copiedSummary ? (
              <>
                <Check className="h-4 w-4 text-emerald-700" />
                Ringkasan Tersalin!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Salin Ringkasan (WA / Classroom)
              </>
            )}
          </button>
        </div>
        {!canDownload && (
          <p className="mt-2 text-xs font-semibold text-red-700">
            Lengkapi semua isian wajib di tahap sebelumnya untuk mengaktifkan unduhan PDF.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Evaluasi
        </button>
        <span />
      </div>
      </div>
    </section>
  );
};
