export type MediaId = 'kasa' | 'kerikil' | 'pasir_kapas' | 'kombinasi';
export type TurbidityId = 'ringan' | 'sedang' | 'berat';
export type LayerTopId = 'kerikil' | 'pasir_kasar' | 'kapas';
export type LayerMidId = 'pasir_halus' | 'kerikil' | 'kain';
export type LayerBottomId = 'kapas_arang' | 'kapas' | 'kerikil';

export interface MediaLayer {
  nama: string;
  warna: string;
  tekstur: 'grid' | 'pebble' | 'sand' | 'fine' | 'charcoal' | 'cotton';
}

export interface MediaOption {
  id: MediaId;
  nama: string;
  namaSingkat: string;
  poriMm: number;
  permeabilitas: number;
  retensiBase: number;
  lapisan: MediaLayer[];
}

export interface TurbidityOption {
  id: TurbidityId;
  nama: string;
  ntu: number;
  faktorHambat: number;
}

export interface LabTrial {
  id: string;
  mediaId: MediaId;
  mediaNama: string;
  ketebalanCm: number;
  ntuAwal: number;
  waktuDetik: number;
  debit: number;
  ntuAkhir: number;
  kejernihanPct: number;
  catatan: string;
}

export interface DesignTestResult {
  kejernihan: number;
  waktuDetik: number;
  ntuHasil: number;
  biayaEstimasi: number;
  hematBiaya: boolean;
  lolos: boolean;
  catatan: string;
}

export interface AppState {
  currentStage: number;
  maxUnlockedStage: number;
  points: number;
  completedStages: number[];
  soundEnabled: boolean;
  identitas: {
    nama: string;
    kelas: string;
    absen: string;
    tanggal: string;
  };
  tahap1: {
    modeFenomena: 'normal' | 'hujan';
    pertanyaan: string;
    hipotesis: string;
  };
  tahap2: {
    activeTab: number;
    miniQuizAns: Record<string, number>;
    miniQuizChecked: boolean;
  };
  tahap3: {
    selectedMedia: MediaId;
    ketebalan: number;
    kekeruhanAwal: TurbidityId;
    percobaan: LabTrial[];
    varBebas: string;
    varTerikat: string;
    varKontrol: string;
  };
  tahap4: {
    hitungRataLaju: string;
    hitungRataJernih: string;
    cekHitungMsg: string;
    cekHitungOk: boolean;
    interpretasi: string;
    pola: string;
  };
  tahap5: {
    lapisanAtas: LayerTopId;
    lapisanTengah: LayerMidId;
    lapisanBawah: LayerBottomId;
    tebalDesain: number;
    hasilUji: DesignTestResult | null;
    namaAlat: string;
    alasan: string;
    prediksi: string;
  };
  tahap6: {
    kesimpulan: string;
    kehidupan: string;
    dipahami: string;
    membingungkan: string;
  };
  tahap7: {
    answers: Record<string, number>;
    submitted: boolean;
    score: number;
  };
}
