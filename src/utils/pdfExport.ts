import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CURRICULUM_CONFIG } from '../data/curriculum';
import { AppState } from '../types/lkpd';
import { getAnalysisStats } from './filtrationModel';

function pdfSafe(text: string | number | undefined | null): string {
  return (
    String(text ?? '-')
      .replace(/→/g, '->')
      .replace(/≥/g, '>=')
      .replace(/≤/g, '<=')
      .replace(/×/g, 'x')
      .replace(/÷/g, '/')
      .replace(/·/g, '-')
      .replace(/[^\x20-\x7E\u00A0-\u00FF\n]/g, '')
      .trim() || '-'
  );
}

export function generateLkpdPdf(
  state: AppState,
  chartCanvasEl: HTMLCanvasElement | null
): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxW = pageW - margin * 2;
  let y = 16;

  const checkPageBreak = (needed = 16) => {
    if (y + needed > pageH - 18) {
      doc.addPage();
      y = 18;
    }
  };

  const addSectionTitle = (title: string) => {
    checkPageBreak(14);
    doc.setFillColor(240, 253, 250);
    doc.rect(margin, y, maxW, 8, 'F');
    doc.setDrawColor(15, 118, 110);
    doc.rect(margin, y, maxW, 8, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(17, 94, 89);
    doc.text(pdfSafe(title), margin + 3, y + 5.5);
    y += 12;
  };

  const addLabeledText = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const labelLines = doc.splitTextToSize(pdfSafe(label), maxW);
    checkPageBreak(labelLines.length * 4.5 + 8);
    doc.text(labelLines, margin, y);
    y += labelLines.length * 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const valLines = doc.splitTextToSize(pdfSafe(value), maxW);
    checkPageBreak(valLines.length * 4.5 + 4);
    doc.text(valLines, margin, y);
    y += valLines.length * 4.5 + 3.5;
  };

  // Header Dokumen
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageW, 27, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('LKPD INTERAKTIF STEM + LAB MAYA IPA', margin, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(
    pdfSafe(
      `${CURRICULUM_CONFIG.sekolah} | ${CURRICULUM_CONFIG.mapel} | Topik: ${CURRICULUM_CONFIG.topik}`
    ),
    margin,
    18.5
  );
  y = 34;

  const { identitas, tahap1, tahap3, tahap4, tahap5, tahap6, tahap7, points } = state;
  const stats = getAnalysisStats(tahap3.percobaan);

  addSectionTitle('0. IDENTITAS SISWA & CAPAIAN');
  addLabeledText(
    'Nama Lengkap / Kelas / No. Absen',
    `${identitas.nama} / ${identitas.kelas} / No. ${identitas.absen}`
  );
  addLabeledText(
    'Tanggal Belajar / Tanggal Cetak',
    `${identitas.tanggal} / ${new Date().toLocaleDateString('id-ID')}`
  );
  addLabeledText(
    'Skor Evaluasi Akhir & Poin',
    `Skor Evaluasi: ${tahap7.score} / 100 | Total Poin: ${points}`
  );

  addSectionTitle('1. ORIENTASI MASALAH (SCIENCE)');
  addLabeledText('Pertanyaan yang Muncul', tahap1.pertanyaan);
  addLabeledText('Dugaan Awal (Hipotesis)', tahap1.hipotesis);

  addSectionTitle('2. EKSPLORASI KONSEP');
  addLabeledText('Status Mini-Kuis Pemahaman Konsep', 'Tuntas (3/3 soal terjawab benar).');

  addSectionTitle('3. DATA PENGAMATAN LAB MAYA');
  addLabeledText('Variabel Bebas', tahap3.varBebas);
  addLabeledText('Variabel Terikat', tahap3.varTerikat);
  addLabeledText('Variabel Kontrol', tahap3.varKontrol);

  const tableRows = tahap3.percobaan.map((p, idx) => [
    String(idx + 1),
    pdfSafe(p.mediaNama),
    `${p.ketebalanCm} cm`,
    `${p.ntuAwal}`,
    `${p.waktuDetik} s`,
    `${(200 / p.waktuDetik).toFixed(2)}`,
    `${p.ntuAkhir}`,
    `${p.kejernihanPct}%`,
    pdfSafe(p.catatan || '-'),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['No', 'Media', 'Tebal', 'NTU Awal', 'Waktu', 'Laju(mL/s)', 'NTU Akhir', 'Jernih', 'Catatan']],
    body: tableRows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [17, 94, 89], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  y = (lastTable ? lastTable.finalY : y + 30) + 8;

  addSectionTitle('4. ANALISIS DATA (MATHEMATICS)');
  addLabeledText(
    'Rata-rata Hasil Hitungan Sistem',
    `Laju Filtrasi = ${stats.avgLaju} mL/detik | Kejernihan = ${stats.avgJernih}%`
  );
  addLabeledText(
    'Jawaban Siswa (Rata-rata Laju / Kejernihan)',
    `${tahap4.hitungRataLaju} mL/detik | ${tahap4.hitungRataJernih}%`
  );
  addLabeledText('Interpretasi Grafik', tahap4.interpretasi);
  addLabeledText('Pola Hubungan yang Ditemukan', tahap4.pola);

  if (chartCanvasEl) {
    checkPageBreak(76);
    const imgData = chartCanvasEl.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', margin, y, maxW, 68);
    y += 74;
  }

  addSectionTitle('5. RANCANG SOLUSI (ENGINEERING)');
  addLabeledText('Nama Alat Rancangan', tahap5.namaAlat);
  addLabeledText(
    'Susunan & Hasil Uji Desain',
    `Atas: ${tahap5.lapisanAtas}, Tengah: ${tahap5.lapisanTengah}, Bawah: ${tahap5.lapisanBawah} (Tebal ${tahap5.tebalDesain} cm). Hasil: Kejernihan ${tahap5.hasilUji?.kejernihan ?? '-'}%, Waktu ${tahap5.hasilUji?.waktuDetik ?? '-'} detik (${tahap5.hasilUji?.lolos ? 'LOLOS TARGET' : 'BELUM LOLOS'}).`
  );
  addLabeledText('Alasan Pemilihan Susunan', tahap5.alasan);
  addLabeledText('Prediksi & Evaluasi Penerapan', tahap5.prediksi);

  addSectionTitle('6. KESIMPULAN DAN REFLEKSI');
  addLabeledText('Kesimpulan Akhir', tahap6.kesimpulan);
  addLabeledText('Keterkaitan dengan Kehidupan Sehari-hari', tahap6.kehidupan);
  addLabeledText('Hal yang Paling Dipahami', tahap6.dipahami);
  addLabeledText('Hal yang Masih Membingungkan / Menantang', tahap6.membingungkan);

  addSectionTitle('7. RINGKASAN EVALUASI SINGKAT');
  addLabeledText('Skor Evaluasi Pilihan Ganda', `${tahap7.score} / 100`);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      pdfSafe(`Halaman ${i} dari ${totalPages} - ${CURRICULUM_CONFIG.sekolah}`),
      pageW / 2,
      pageH - 8,
      { align: 'center' }
    );
  }

  const cleanNama = (identitas.nama || 'Siswa').trim().replace(/[^a-zA-Z0-9_-]+/g, '_');
  const filename = `LKPD_Penyaringan_Campuran_${cleanNama}.pdf`;
  doc.save(filename);
  return filename;
}
