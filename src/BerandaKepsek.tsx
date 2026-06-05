import React, { useState, useEffect } from "react";
// Import library untuk membuat berkas dokumen PDF secara dinamis
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  onLogout: () => void;
  onGoLaporan: () => void;
  onGoKonsultasi: () => void;
}

const BerandaKepsek: React.FC<Props> = ({
  onLogout,
  onGoLaporan,
  onGoKonsultasi,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isDownloading, setIsDownloading] = useState(false);

  const [stats, setStats] = useState<any>({
    totalPengaduan: 0,
    pengaduanSelesai: 0,
    totalKonsultasi: 0,
    konsultasiSelesai: 0,
    kategori: { BULLYING: 0, FASILITAS: 0, KEKERASAN: 0, LAINNYA: 0 },
  });

  const namaBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    fetch(
      `http://localhost:8080/api/admin/stats?bulan=${selectedMonth}&tahun=${selectedYear}`,
    )
      .then((res) => res.json())
      .then((data) => {
        // Proteksi jika backend mengirimkan data kosong atau tidak berstruktur lengkap
        if (data) {
          setStats({
            totalPengaduan: data.totalPengaduan ?? 0,
            pengaduanSelesai: data.pengaduanSelesai ?? 0,
            totalKonsultasi: data.totalKonsultasi ?? 0,
            konsultasiSelesai: data.konsultasiSelesai ?? 0,
            kategori: {
              BULLYING: data.kategori?.BULLYING ?? 0,
              FASILITAS: data.kategori?.FASILITAS ?? 0,
              KEKERASAN: data.kategori?.KEKERASAN ?? 0,
              LAINNYA: data.kategori?.LAINNYA ?? 0,
            }
          });
        }
      })
      .catch((err) => console.error("Gagal mengambil statistik:", err));
  }, [selectedMonth, selectedYear]);

  // Perbaikan 1: Menghindari distorsi bar jika total pengaduan adalah 0
  const getPercentage = (value: number) => {
    const total = stats?.totalPengaduan ?? 0;
    return total > 0 ? (value / total) * 100 : 0;
  };

  // --- [ LOGIKA CETAK PDF EKSEKUTIF DENGAN GRAFIK GARIS & ANALISIS TREN ] ---
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // 1. Ambil data pengaduan bulanan untuk dihitung detail tabelnya
      const resLaporan = await fetch(`http://localhost:8080/api/admin/laporan`);
      const semuaLaporan = await resLaporan.json().catch(() => []);

      // Hitung bulan lalu secara dinamis
      const bulanLalu = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const tahunBulanLalu = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

      // Ambil statistik data bulan lalu dari backend untuk perbandingan tren
      const resStatsLalu = await fetch(`http://localhost:8080/api/admin/stats?bulan=${bulanLalu}&tahun=${tahunBulanLalu}`);
      const statsBulanLalu = await resStatsLalu.json().catch(() => ({ totalPengaduan: 0, totalKonsultasi: 0 }));

      // Filter laporan bulan berjalan di frontend
      const laporanBulanan = semuaLaporan.filter((item: any) => {
        const d = new Date(item.tanggal_lapor || item.tanggal);
        return (d.getMonth() + 1) === selectedMonth && d.getFullYear() === selectedYear;
      });

      // Hitung akumulasi masuk vs selesai per kategori
      const listKategori = ["BULLYING", "FASILITAS", "KEKERASAN", "LAINNYA"];
      const rangkumanLaporan = listKategori.map((kat) => {
        const kasusKategori = laporanBulanan.filter((item: any) => item.kategori?.toUpperCase() === kat);
        const selesai = kasusKategori.filter((item: any) => item.status?.toUpperCase() === "SELESAI").length;
        return [kat, `${kasusKategori.length} Kasus`, `${selesai} Selesai`];
      });

      // --- LOGIKA ANALISIS KESIMPULAN TREN PERKEMBANGAN ---
      let kesimpulanTren = "";
      const totalSkrg = stats?.totalPengaduan ?? 0;
      const totalLalu = statsBulanLalu?.totalPengaduan ?? 0;
      const selisihKasus = totalSkrg - totalLalu;

      if (selisihKasus > 0) {
        kesimpulanTren = `Meningkat sebanyak ${selisihKasus} kasus dibandingkan dengan bulan ${namaBulan[bulanLalu - 1]}. Hal ini memerlukan perhatian ekstra dan evaluasi berkala terhadap penegakan kedisiplinan siswa.`;
      } else if (selisihKasus < 0) {
        kesimpulanTren = `Menurun sebanyak ${Math.abs(selisihKasus)} kasus dibandingkan dengan bulan ${namaBulan[bulanLalu - 1]}. Penurunan ini menunjukkan efektivitas program pengawasan sekolah berjalan dengan sangat baik.`;
      } else {
        kesimpulanTren = `Stabil (Sama) dengan total kasus pada bulan ${namaBulan[bulanLalu - 1]}. Disarankan untuk terus mempertahankan konsistensi bimbingan konseling rutin.`;
      }

      // --- LOGIKA PENENTUAN KASUS TERTINGGI & TERENDAH ---
      const katBullying = stats?.kategori?.BULLYING ?? 0;
      const katFasilitas = stats?.kategori?.FASILITAS ?? 0;
      const katKekerasan = stats?.kategori?.KEKERASAN ?? 0;
      const katLainnya = stats?.kategori?.LAINNYA ?? 0;

      const arrayKategori = [
        { nama: "BULLYING", jumlah: katBullying },
        { nama: "FASILITAS", jumlah: katFasilitas },
        { nama: "KEKERASAN", jumlah: katKekerasan },
        { nama: "LAINNYA", jumlah: katLainnya },
      ].sort((a, b) => a.jumlah - b.jumlah);

      const kasusPalingSedikit = totalSkrg > 0 ? `${arrayKategori[0].nama} (${arrayKategori[0].jumlah} Kasus)` : "-";
      const kasusPalingBanyak = totalSkrg > 0 ? `${arrayKategori[arrayKategori.length - 1].nama} (${arrayKategori[arrayKategori.length - 1].jumlah} Kasus)` : "-";

      const rangkumanKonsultasiGlobal = [
        ["TOTAL AGENDA BIMBINGAN", `${stats?.totalKonsultasi ?? 0} Sesi`],
        ["TOTAL LAYANAN SELESAI (KELAR)", `${stats?.konsultasiSelesai ?? 0} Sesi`]
      ];

      // 2. MULAI MEMBUAT STRUKTUR PDF A4
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      
      // KOP SURAT UTAMA
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("LAPORAN REKAPAN EKSEKUTIF BULANAN", 105, 15, { align: "center" });
      doc.setFontSize(12);
      doc.text("SMP TRIDHARMA MANADO", 105, 21, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Periode Evaluasi: ${namaBulan[selectedMonth - 1].toUpperCase()} ${selectedYear}`, 105, 27, { align: "center" });
      
      doc.setLineWidth(0.5);
      doc.line(15, 30, 195, 30);

      // SECTION I: IKHTISAR UTAMA PERIODE
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("I. IKHTISAR UTAMA & ANALISIS TREN PERIODE", 15, 40);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`• Total Pengaduan Masuk  : ${totalSkrg} Kasus (${stats?.pengaduanSelesai ?? 0} Selesai)`, 20, 47);
      doc.text(`• Total Sesi Bimbingan    : ${stats?.totalKonsultasi ?? 0} Agenda (${stats?.konsultasiSelesai ?? 0} Selesai)`, 20, 53);
      doc.text(`• Tren Pengaduan Bulan Ini: ${kesimpulanTren}`, 20, 59, { maxWidth: 170 });
      doc.text(`• Kasus Dominan Terjadi  : ${kasusPalingBanyak}`, 20, 69);
      doc.text(`• Kasus Terendah Terdata : ${kasusPalingSedikit}`, 20, 75);
      
      // SECTION II: GRAFIK TREN KATEGORI MASALAH (LINE CHART)
      doc.setFont("helvetica", "bold");
      doc.text("II. GRAFIK TREN KATEGORI MASALAH (LINE CHART)", 15, 87);
      
      // Menggambar Kotak Batas Chart (Grid Area)
      doc.setLineWidth(0.2);
      doc.setDrawColor(220, 220, 220);
      doc.rect(25, 93, 160, 40);
      
      // Menggambar Garis Bantu Horizontal (Grid Line)
      doc.line(25, 103, 185, 103);
      doc.line(25, 113, 185, 113);
      doc.line(25, 123, 185, 123);

      // Perbaikan 2: Proteksi Math.max dari nilai undefined/null agar tidak menghasilkan NaN
      const hitungYPos = (jumlahKasus: number) => {
        const maksKasus = Math.max(katBullying, katFasilitas, katKekerasan, katLainnya, 5);
        return 133 - (jumlahKasus / maksKasus) * 35;
      };

      const pX = [45, 85, 125, 165];
      const pY = [
        hitungYPos(katBullying),
        hitungYPos(katFasilitas),
        hitungYPos(katKekerasan),
        hitungYPos(katLainnya)
      ];

      // Menggambar Garis Koneksi Antar Titik
      doc.setLineWidth(0.8);
      doc.setDrawColor(30, 58, 138);
      doc.line(pX[0], pY[0], pX[1], pY[1]);
      doc.line(pX[1], pY[1], pX[2], pY[2]);
      doc.line(pX[2], pY[2], pX[3], pY[3]);

      // Menggambar Titik Bulat (Node Circle) dan Teks Angka
      doc.setFillColor(30, 58, 138);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      
      const listValues = [katBullying, katFasilitas, katKekerasan, katLainnya];
      for (let i = 0; i < 4; i++) {
        doc.circle(pX[i], pY[i], 1.2, "F");
        doc.text(`${listValues[i]}`, pX[i] - 1, pY[i] - 3);
      }

      // Teks Label Nama Kategori
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("BULLYING", pX[0], 138, { align: "center" });
      doc.text("FASILITAS", pX[1], 138, { align: "center" });
      doc.text("KEKERASAN", pX[2], 138, { align: "center" });
      doc.text("LAINNYA", pX[3], 138, { align: "center" });

      // SECTION III: TABEL ANALISIS KATEGORI PENGADUAN
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("III. TABEL RINCIAN JUMLAH KASUS PENGADUAN", 15, 149);
      
      autoTable(doc, {
        startY: 153,
        head: [["Kategori Pengaduan", "Total Kasus Terdata", "Jumlah Kasus Selesai"]],
        body: rangkumanLaporan,
        theme: "striped",
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 9.5, halign: "center" },
        columnStyles: { 0: { halign: "left" } }
      });

      // SECTION IV: TABEL RANGKUMAN KONSULTASI GLOBAL
      const posisiYTerakhir = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont("helvetica", "bold");
      doc.text("IV. RANGKUMAN AKTIVITAS BIMBINGAN KONSULTASI", 15, posisiYTerakhir);

      autoTable(doc, {
        startY: posisiYTerakhir + 4,
        head: [["Deskripsi Agenda", "Jumlah Akumulasi"]],
        body: rangkumanKonsultasiGlobal,
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9.5, halign: "center" },
        columnStyles: { 0: { halign: "left" } }
      });

      // PENGESAHAN TANDA TANGAN KEPALA SEKOLAH
      const posisiYFinal = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont("helvetica", "normal");
      doc.text("Mengetahui,", 150, posisiYFinal);
      doc.text("Kepala SMP Tridharma Manado,", 140, posisiYFinal + 4);
      
      doc.setFont("helvetica", "bold");
      doc.text("Damianus Buu, S.Fi", 145, posisiYFinal + 22);
      doc.setFont("helvetica", "normal");
      doc.text("NIP. -------------------------", 143, posisiYFinal + 26);

      doc.save("laporan pengaduan dan konsultasi SMP Tridharma Manado.pdf");
    } catch (err) {
      console.error(err);
      alert("Gagal menyusun dokumen PDF eksekutif bermetode Line Chart!");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-left text-[#1e3a8a] pb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -z-10"></div>

      {/* HEADER NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center p-2 border border-gray-100">
            <img src="/logo-sekolah.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">
              SMP Tridharma Manado
            </h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
              SIBY Group
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-8 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-lg hover:bg-red-600 active:scale-95 transition-all"
        >
          Log Out
        </button>
      </nav>

      <div className="px-10 pt-10">
        {/* BANNER IDENTITAS KEPSEK */}
        <div className="mb-10 bg-[#1e3a8a] rounded-[45px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center">
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-4xl font-black italic uppercase tracking-tight mb-2">
              Pengawasan Pengaduan dan Konsultasi
            </h2>
            <p className="text-blue-200 font-bold tracking-[0.3em] text-xs uppercase">
              Damianus Buu, S.Fi • Kepala Sekolah • SMP Tridharma Manado
            </p>
          </div>

          <div className="absolute right-[-20px] opacity-10 rotate-12 hidden md:block">
            <img src="/logo-sekolah.png" alt="watermark" className="h-64" />
          </div>

          {/* FILTER PERIODE & TOMBOL DOWNLOAD PDF */}
          <div className="mt-8 md:mt-0 flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-white/20 relative z-10">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 rounded-xl bg-white text-[#1e3a8a] font-black outline-none text-xs uppercase cursor-pointer"
            >
              {namaBulan.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m.toUpperCase()}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-xl bg-white text-[#1e3a8a] font-black outline-none text-xs cursor-pointer"
            >
              {[2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-black text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDownloading ? "Menyusun..." : "📥 CETAK PDF"}
            </button>
          </div>
        </div>

        {/* PANEL STATISTIK UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-center">
          <div className="group bg-white p-12 rounded-[50px] shadow-xl border-b-8 border-[#0d9488] hover:-translate-y-2 transition-all duration-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
              Pengaduan Selesai
            </p>
            <p className="text-7xl font-black text-[#0d9488] tracking-tighter group-hover:scale-110 transition-transform">
              {stats?.pengaduanSelesai ?? 0}
            </p>
            <div className="mt-6 inline-block px-4 py-1 bg-gray-50 rounded-full">
              <p className="text-[10px] text-gray-400 font-bold italic">
                Dari Total <span className="text-[#1e3a8a]">{stats?.totalPengaduan ?? 0}</span> Masalah Terlapor
              </p>
            </div>
          </div>

          <div className="group bg-white p-12 rounded-[50px] shadow-xl border-b-8 border-indigo-500 hover:-translate-y-2 transition-all duration-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
              Konsultasi Selesai
            </p>
            <p className="text-7xl font-black text-indigo-500 tracking-tighter group-hover:scale-110 transition-transform">
              {stats?.konsultasiSelesai ?? 0}
            </p>
            <div className="mt-6 inline-block px-4 py-1 bg-gray-50 rounded-full">
              <p className="text-[10px] text-gray-400 font-bold italic">
                Dari Total <span className="text-[#1e3a8a]">{stats?.totalKonsultasi ?? 0}</span> Agenda Bimbingan
              </p>
            </div>
          </div>
        </div>

        {/* GRAFIK PER KATEGORI */}
        <div className="bg-white p-12 rounded-[55px] shadow-2xl border border-gray-100 mb-10 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10 border-l-4 border-[#1e3a8a] pl-5">
            <h3 className="text-xl font-black italic uppercase tracking-tight">
              Analisis Kategori Masalah
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-10">
            {[
              { label: "Bullying", value: stats?.kategori?.BULLYING ?? 0, color: "bg-red-500" },
              { label: "Fasilitas", value: stats?.kategori?.FASILITAS ?? 0, color: "bg-blue-500" },
              { label: "Kekerasan", value: stats?.kategori?.KEKERASAN ?? 0, color: "bg-orange-500" },
              { label: "Lainnya", value: stats?.kategori?.LAINNYA ?? 0, color: "bg-gray-400" },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-3">
                  <p className="font-black uppercase text-xs italic tracking-widest text-[#1e3a8a]">
                    {item.label}
                  </p>
                  <p className="font-black text-xl">
                    {item.value}{" "}
                    <span className="text-[9px] text-gray-300 uppercase">
                      Kasus Terdata
                    </span>
                  </p>
                </div>
                <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out shadow-lg`}
                    style={{ width: `${getPercentage(item.value)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NAVIGASI MONITORING DETAIL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={onGoLaporan}
            className="group bg-white p-10 rounded-[45px] shadow-xl border-2 border-transparent hover:border-[#1e3a8a] transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h3 className="text-xl font-black uppercase italic tracking-tight">
                Data Pengaduan
              </h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                Laporan Pengaduan Siswa
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#1e3a8a] group-hover:text-white transition-all shadow-sm">
              <span className="text-xl">→</span>
            </div>
          </button>

          <button
            onClick={onGoKonsultasi}
            className="group bg-white p-10 rounded-[45px] shadow-xl border-2 border-transparent hover:border-[#1e3a8a] transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h3 className="text-xl font-black uppercase italic tracking-tight">
                Data Konsultasi
              </h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                Laporan Bimbingan Konseling
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#1e3a8a] group-hover:text-white transition-all shadow-sm">
              <span className="text-xl">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BerandaKepsek;