import { MediaOption, TurbidityOption } from '../types/lkpd';

/**
 * KONFIGURASI KURIKULUM, KONTEN, SOAL, DAN PARAMETER SIMULASI
 * Guru dapat mengubah teks materi, soal kuis, maupun parameter fisik media di file ini.
 */
export const CURRICULUM_CONFIG = {
  sekolah: 'SMP Negeri 3 Besuki',
  mapel: 'IPA · Kelas VII · Fase D',
  topik: 'Penyaringan Campuran',
  durasi: '2 JP (± 40 menit)',
  storageKey: 'lkpd_stem_filtrasi_smpn3besuki_v2',
  kelasOptions: ['VII-A', 'VII-B', 'VII-C', 'VII-D', 'VII-E', 'VII-F'],
  tujuanPembelajaran: [
    'Mengidentifikasi prinsip pemisahan campuran dengan metode penyaringan (filtrasi) berdasarkan perbedaan ukuran partikel.',
    'Menganalisis pengaruh jenis media penyaring dan ketebalan lapisan terhadap kecepatan aliran serta kejernihan filtrat melalui Lab Maya.',
    'Merancang alat penyaring air sederhana sebagai solusi masalah air keruh di lingkungan sekitar.',
  ],
  tahapan: [
    { id: 0, nama: 'Identitas', labelPendek: 'Identitas', badge: 'Siap Belajar' },
    { id: 1, nama: 'Orientasi Masalah', labelPendek: '1. Masalah', badge: 'Pengamat Kritis' },
    { id: 2, nama: 'Eksplorasi Konsep', labelPendek: '2. Konsep', badge: 'Penjelajah Konsep' },
    { id: 3, nama: 'Lab Maya', labelPendek: '3. Lab Maya', badge: 'Peneliti Muda' },
    { id: 4, nama: 'Analisis Data', labelPendek: '4. Analisis', badge: 'Analis Data' },
    { id: 5, nama: 'Rancang Solusi', labelPendek: '5. Rancang', badge: 'Insinyur Muda' },
    { id: 6, nama: 'Kesimpulan & Refleksi', labelPendek: '6. Simpulan', badge: 'Pemikir Reflektif' },
    { id: 7, nama: 'Evaluasi Singkat', labelPendek: '7. Evaluasi', badge: 'Tuntas Evaluasi' },
    { id: 8, nama: 'Rekap & PDF', labelPendek: '8. Rekap PDF', badge: 'Tuntas STEM' },
  ],
  mediaList: [
    {
      id: 'kasa',
      nama: 'Kasa Kawat (Pori Besar: 2,0 mm)',
      namaSingkat: 'Kasa Kawat',
      poriMm: 2.0,
      permeabilitas: 36,
      retensiBase: 0.22,
      lapisan: [{ nama: 'Kasa Kawat', warna: '#64748b', tekstur: 'grid' }],
    },
    {
      id: 'kerikil',
      nama: 'Kerikil & Pasir Kasar (Pori Sedang: 0,5 mm)',
      namaSingkat: 'Kerikil + Pasir Kasar',
      poriMm: 0.5,
      permeabilitas: 19,
      retensiBase: 0.56,
      lapisan: [
        { nama: 'Kerikil', warna: '#78716c', tekstur: 'pebble' },
        { nama: 'Pasir Kasar', warna: '#d6d3d1', tekstur: 'sand' },
      ],
    },
    {
      id: 'pasir_kapas',
      nama: 'Pasir Halus & Kapas (Pori Kecil: 0,08 mm)',
      namaSingkat: 'Pasir Halus + Kapas',
      poriMm: 0.08,
      permeabilitas: 10.5,
      retensiBase: 0.80,
      lapisan: [
        { nama: 'Pasir Halus', warna: '#fde047', tekstur: 'fine' },
        { nama: 'Kapas', warna: '#f8fafc', tekstur: 'cotton' },
      ],
    },
    {
      id: 'kombinasi',
      nama: 'Kombinasi Bertingkat: Kerikil + Pasir + Arang + Kapas (0,02 mm)',
      namaSingkat: 'Kombinasi Bertingkat',
      poriMm: 0.02,
      permeabilitas: 7.2,
      retensiBase: 0.93,
      lapisan: [
        { nama: 'Kerikil', warna: '#78716c', tekstur: 'pebble' },
        { nama: 'Pasir Halus', warna: '#fde047', tekstur: 'fine' },
        { nama: 'Arang Aktif', warna: '#1e293b', tekstur: 'charcoal' },
        { nama: 'Kapas', warna: '#f8fafc', tekstur: 'cotton' },
      ],
    },
  ] as MediaOption[],
  kekeruhanOptions: [
    { id: 'ringan', nama: 'Ringan (40 NTU · Agak Keruh)', ntu: 40, faktorHambat: 1.0 },
    { id: 'sedang', nama: 'Sedang (120 NTU · Air Irigasi Hujan)', ntu: 120, faktorHambat: 1.15 },
    { id: 'berat', nama: 'Pekat (240 NTU · Lumpur Tinggi)', ntu: 240, faktorHambat: 1.35 },
  ] as TurbidityOption[],
  miniQuiz: [
    {
      id: 'mq1',
      tanya: '1. Prinsip dasar pemisahan campuran menggunakan metode penyaringan (filtrasi) adalah perbedaan...',
      opsi: [
        'Titik didih zat penyusunnya',
        'Ukuran partikel zat yang dicampur',
        'Warna dan bau zat terlarut',
        'Massa jenis cairan dan gas',
      ],
      benar: 1,
      penjelasan:
        'Tepat. Filtrasi memisahkan padatan tidak larut dari cairan berdasarkan perbedaan ukuran partikel terhadap ukuran pori penyaring.',
    },
    {
      id: 'mq2',
      tanya: '2. Dalam proses menyaring air sungai yang keruh, cairan yang berhasil lolos ke wadah penampung disebut...',
      opsi: ['Residu', 'Solut', 'Filtrat', 'Endapan'],
      benar: 2,
      penjelasan:
        'Benar. Cairan hasil saringan yang melewati media penyaring disebut Filtrat, sedangkan ampas yang tertahan di atas disebut Residu.',
    },
    {
      id: 'mq3',
      tanya: '3. Mengapa arang aktif ditambahkan pada susunan alat penjernih air sederhana?',
      opsi: [
        'Memperbesar ukuran lubang pori agar air cepat turun',
        'Menyerap (mengadsorpsi) bau, warna, dan partikel sangat halus',
        'Mengubah air menjadi es secara cepat',
        'Menambah kadar lumpur di dalam air',
      ],
      benar: 1,
      penjelasan:
        'Benar. Arang aktif memiliki pori mikro yang mampu mengadsorpsi bau tidak sedap, zat warna, serta kotoran koloid sangat halus.',
    },
  ],
  evaluasiSoal: [
    {
      id: 'ev1',
      tanya: '1. Saat membuat santan, ibu memeras parutan kelapa menggunakan saringan kain. Ampas kelapa yang tertinggal di atas saringan disebut...',
      opsi: ['Filtrat', 'Residu', 'Pelarut', 'Destilat'],
      benar: 1,
      bahas:
        'Ampas atau padatan yang tertahan di atas media penyaring disebut Residu, sedangkan santan yang lolos adalah Filtrat.',
    },
    {
      id: 'ev2',
      tanya: '2. Air sumur di sekitar pesisir Besuki tercampur pasir halus dan lumpur setelah hujan deras. Manakah media penyaring yang paling efektif menghasilkan air paling jernih?',
      opsi: [
        'Kasa kawat berpori 2 mm saja',
        'Saringan teh berlubang besar',
        'Susunan bertingkat: kerikil, pasir halus, arang aktif, dan kapas',
        'Selapis kawat nyamuk tipis',
      ],
      benar: 2,
      bahas:
        'Susunan bertingkat menyaring kotoran dari ukuran besar (kerikil) hingga sangat halus (pasir/kapas) serta mengadsorpsi bau dan warna (arang aktif).',
    },
    {
      id: 'ev3',
      tanya: '3. Berdasarkan prinsip filtrasi, jika kita menggunakan media penyaring dengan ukuran pori yang sangat kecil dan lapisan yang sangat tebal, maka yang terjadi adalah...',
      opsi: [
        'Aliran air semakin cepat dan air tetap keruh',
        'Waktu penyaringan lebih lama, tetapi air hasil saringan lebih jernih',
        'Semua partikel pasir akan ikut lolos bersama air',
        'Volume air berkurang menjadi nol karena menguap',
      ],
      benar: 1,
      bahas:
        'Pori kecil dan lapisan tebal memperbesar hambatan aliran (waktu lebih lama), namun menahan lebih banyak partikel sehingga filtrat lebih jernih.',
    },
    {
      id: 'ev4',
      tanya: '4. Sebuah percobaan menyaring 200 mL air keruh membutuhkan waktu 40 detik. Berapakah laju filtrasi (debit air) yang terjadi?',
      opsi: ['0,2 mL/detik', '5 mL/detik', '80 mL/detik', '160 mL/detik'],
      benar: 1,
      bahas: 'Laju filtrasi = Volume / Waktu = 200 mL / 40 detik = 5 mL/detik.',
    },
    {
      id: 'ev5',
      tanya: '5. Jika garam dapur dilarutkan sempurna ke dalam air hingga menjadi larutan garam, apakah garam dapat dipisahkan kembali hanya dengan kertas saring biasa?',
      opsi: [
        'Bisa, karena partikel garam berukuran sangat besar',
        'Bisa, jika ketebalan kertas saring ditambah menjadi 10 cm',
        'Tidak bisa, karena partikel garam terlarut berukuran ion/molekul sangat kecil sehingga lolos melewati pori kertas saring',
        'Tidak bisa, karena garam bersifat magnetis',
      ],
      benar: 2,
      bahas:
        'Larutan sejati memiliki ukuran partikel terlarut sangat kecil (< 1 nm) sehingga lolos menembus pori filter; pemisahannya memerlukan penguapan/kristalisasi.',
    },
  ],
};
