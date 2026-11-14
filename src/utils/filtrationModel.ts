import { CURRICULUM_CONFIG } from '../data/curriculum';
import {
  AppState,
  DesignTestResult,
  LabTrial,
  LayerBottomId,
  LayerMidId,
  LayerTopId,
  MediaId,
  TurbidityId,
} from '../types/lkpd';

/**
 * MODEL SAINS SIMULASI LAB MAYA FILTRASI:
 * 1. Volume air uji tetap = 200 mL.
 * 2. Kecepatan aliran (debit Q) mengadaptasi Hukum Darcy untuk aliran melalui media berpori:
 *    Q = (permeabilitas_media / faktor_ketebalan) / faktor_kekeruhan.
 *    Semakin kecil pori dan semakin tebal lapisan, hambatan meningkat -> waktu lebih lama.
 * 3. Kekeruhan diukur dalam NTU (Nephelometric Turbidity Unit):
 *    Kekeruhan akhir = kekeruhan_awal * (1 - efisiensi_penahanan),
 *    di mana efisiensi dipengaruhi ukuran pori, ketebalan media, dan adsorpsi arang aktif.
 */
export function calculateFiltrationModel(
  mediaId: MediaId,
  ketebalanCm: number,
  kekeruhanId: TurbidityId,
  siklusPenyumbatan = 1
) {
  const media =
    CURRICULUM_CONFIG.mediaList.find((m) => m.id === mediaId) ||
    CURRICULUM_CONFIG.mediaList[0];
  const kekeruhan =
    CURRICULUM_CONFIG.kekeruhanOptions.find((k) => k.id === kekeruhanId) ||
    CURRICULUM_CONFIG.kekeruhanOptions[1];

  const factorL = 0.55 + ketebalanCm / 6.0;
  const clogMultiplier = 1 + Math.max(0, siklusPenyumbatan - 1) * (kekeruhan.ntu >= 200 ? 0.28 : 0.18);
  const rawDebit = media.permeabilitas / factorL / kekeruhan.faktorHambat / clogMultiplier;
  const debit = Math.max(0.6, Number(rawDebit.toFixed(2)));
  const waktuDetik = Number((200 / debit).toFixed(1));

  const thicknessBonus = (ketebalanCm - 2) * 0.012;
  const eff = Math.min(0.98, Math.max(0.15, media.retensiBase + thicknessBonus));
  const ntuAkhir = Number((kekeruhan.ntu * (1 - eff)).toFixed(1));
  const kejernihanPct = Number((eff * 100).toFixed(1));

  return {
    media,
    kekeruhan,
    ketebalanCm,
    siklusPenyumbatan,
    ntuAwal: kekeruhan.ntu,
    waktuDetik,
    debit,
    ntuAkhir,
    kejernihanPct,
  };
}

export const LAYER_COSTS = {
  top: { kerikil: 500, pasir_kasar: 600, kapas: 1200 },
  mid: { pasir_halus: 1000, kerikil: 500, kain: 900 },
  bottom: { kapas_arang: 2000, kapas: 1200, kerikil: 500 },
} as const;

/**
 * Evaluasi Rancangan Solusi (Tahap 5 Engineering)
 * Target: Kejernihan >= 85%, Waktu <= 45 detik, dan Estimasi Biaya Lokal <= Rp 5.500.
 */
export function evaluateEngineeringDesign(
  atas: LayerTopId,
  tengah: LayerMidId,
  bawah: LayerBottomId,
  tebalCm: number
): DesignTestResult {
  let skorKejernihan = 45;
  let hambatan = 1.0 + tebalCm * 0.16;

  if (atas === 'kerikil') skorKejernihan += 12;
  else if (atas === 'pasir_kasar') skorKejernihan += 8;
  else hambatan += 0.4; // Lapisan halus di atas cepat tersumbat lumpur kasar

  if (tengah === 'pasir_halus') skorKejernihan += 18;
  else if (tengah === 'kerikil') skorKejernihan += 7;
  else {
    skorKejernihan += 12;
    hambatan += 0.2;
  }

  if (bawah === 'kapas_arang') skorKejernihan += 22;
  else if (bawah === 'kapas') skorKejernihan += 16;
  else skorKejernihan += 6;

  skorKejernihan = Math.min(97, Math.round(skorKejernihan + (tebalCm - 4) * 1.4));
  const waktuDetik = Number((13 * hambatan).toFixed(1));
  const ntuHasil = Number((120 * (1 - skorKejernihan / 100)).toFixed(1));

  const biayaEstimasi =
    LAYER_COSTS.top[atas] +
    LAYER_COSTS.mid[tengah] +
    LAYER_COSTS.bottom[bawah] +
    tebalCm * 150;
  const hematBiaya = biayaEstimasi <= 5500;
  const lolos = skorKejernihan >= 85 && waktuDetik <= 45;

  return {
    kejernihan: skorKejernihan,
    waktuDetik,
    ntuHasil,
    biayaEstimasi,
    hematBiaya,
    lolos,
    catatan: lolos
      ? hematBiaya
        ? 'Desain lolos target teknis dan hemat biaya bahan lokal! Susunan bertingkat menjernihkan air >= 85% dalam <= 45 detik.'
        : 'Desain lolos syarat kejernihan dan waktu, namun biaya bahan agak tinggi. Kurangi ketebalan bila ingin lebih hemat.'
      : skorKejernihan < 85
      ? 'Kejernihan belum mencapai 85%. Susun media secara bertingkat dari Kerikil (atas) -> Pasir Halus (tengah) -> Arang Aktif + Kapas (bawah).'
      : 'Air sudah jernih, namun waktu saring melewati batas 45 detik. Kurangi ketebalan total media agar laju filtrasi tetap praktis.',
  };
}

export function getAnalysisStats(percobaan: LabTrial[]) {
  if (!percobaan.length) return { avgLaju: 0, avgJernih: 0 };
  const sumLaju = percobaan.reduce(
    (acc, p) => acc + Number((200 / p.waktuDetik).toFixed(2)),
    0
  );
  const sumJernih = percobaan.reduce((acc, p) => acc + Number(p.kejernihanPct), 0);
  return {
    avgLaju: Number((sumLaju / percobaan.length).toFixed(2)),
    avgJernih: Number((sumJernih / percobaan.length).toFixed(1)),
  };
}

export function getDefaultState(): AppState {
  const today = new Date().toISOString().split('T')[0];
  return {
    currentStage: 0,
    maxUnlockedStage: 0,
    points: 0,
    completedStages: [],
    soundEnabled: true,
    identitas: {
      nama: '',
      kelas: '',
      absen: '',
      tanggal: today,
    },
    tahap1: {
      modeFenomena: 'hujan',
      pertanyaan: '',
      hipotesis: '',
    },
    tahap2: {
      activeTab: 0,
      miniQuizAns: {},
      miniQuizChecked: false,
    },
    tahap3: {
      selectedMedia: 'kasa',
      ketebalan: 4,
      kekeruhanAwal: 'sedang',
      percobaan: [],
      varBebas: '',
      varTerikat: '',
      varKontrol: '',
    },
    tahap4: {
      hitungRataLaju: '',
      hitungRataJernih: '',
      cekHitungMsg: '',
      cekHitungOk: false,
      interpretasi: '',
      pola: '',
    },
    tahap5: {
      lapisanAtas: 'kerikil',
      lapisanTengah: 'pasir_halus',
      lapisanBawah: 'kapas_arang',
      tebalDesain: 6,
      hasilUji: null,
      namaAlat: '',
      alasan: '',
      prediksi: '',
    },
    tahap6: {
      kesimpulan: '',
      kehidupan: '',
      dipahami: '',
      membingungkan: '',
    },
    tahap7: {
      answers: {},
      submitted: false,
      score: 0,
    },
  };
}

export function loadStoredState(): AppState {
  const def = getDefaultState();
  try {
    const raw = localStorage.getItem(CURRICULUM_CONFIG.storageKey);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    return {
      ...def,
      ...parsed,
      identitas: { ...def.identitas, ...(parsed.identitas || {}) },
      tahap1: { ...def.tahap1, ...(parsed.tahap1 || {}) },
      tahap2: { ...def.tahap2, ...(parsed.tahap2 || {}) },
      tahap3: { ...def.tahap3, ...(parsed.tahap3 || {}) },
      tahap4: { ...def.tahap4, ...(parsed.tahap4 || {}) },
      tahap5: { ...def.tahap5, ...(parsed.tahap5 || {}) },
      tahap6: { ...def.tahap6, ...(parsed.tahap6 || {}) },
      tahap7: { ...def.tahap7, ...(parsed.tahap7 || {}) },
    };
  } catch {
    return def;
  }
}

export function persistState(state: AppState): void {
  try {
    localStorage.setItem(CURRICULUM_CONFIG.storageKey, JSON.stringify(state));
  } catch {
    // Abaikan jika browser memblokir penyimpanan lokal
  }
}

export function isAllRequiredComplete(state: AppState): boolean {
  const { identitas, tahap1, tahap3, tahap4, tahap5, tahap6, tahap7 } = state;
  return Boolean(
    identitas.nama.trim() &&
      identitas.kelas &&
      identitas.absen &&
      tahap1.pertanyaan.trim() &&
      tahap1.hipotesis.trim() &&
      tahap3.percobaan.length >= 3 &&
      tahap3.varBebas.trim() &&
      tahap3.varTerikat.trim() &&
      tahap3.varKontrol.trim() &&
      tahap4.hitungRataLaju &&
      tahap4.hitungRataJernih &&
      tahap4.interpretasi.trim() &&
      tahap4.pola.trim() &&
      tahap5.hasilUji &&
      tahap5.hasilUji.lolos &&
      tahap5.namaAlat.trim() &&
      tahap5.alasan.trim() &&
      tahap5.prediksi.trim() &&
      tahap6.kesimpulan.trim() &&
      tahap6.kehidupan.trim() &&
      tahap6.dipahami.trim() &&
      tahap6.membingungkan.trim() &&
      tahap7.submitted
  );
}
