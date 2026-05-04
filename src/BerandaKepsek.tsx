import React, { useState, useEffect } from "react";

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

  const [stats, setStats] = useState<any>({
    totalPengaduan: 0,
    pengaduanSelesai: 0,
    totalKonsultasi: 0,
    konsultasiSelesai: 0,
    kategori: { BULLYING: 0, FASILITAS: 0, KEKERASAN: 0, LAINNYA: 0 },
  });

  useEffect(() => {
    fetch(
      `http://localhost:8080/api/admin/stats?bulan=${selectedMonth}&tahun=${selectedYear}`,
    )
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Gagal mengambil statistik:", err));
  }, [selectedMonth, selectedYear]);

  const getPercentage = (value: number) => {
    return stats.totalPengaduan > 0 ? (value / stats.totalPengaduan) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-left text-[#1e3a8a] pb-20 relative overflow-hidden">
      {/* Dekorasi Background Halus */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -z-10"></div>

      {/* HEADER NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center p-2 border border-gray-100">
            <img
              src="/logo-sekolah.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
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

          {/* Logo Besar Transparan sebagai Dekorasi */}
          <div className="absolute right-[-20px] opacity-10 rotate-12 hidden md:block">
            <img src="/logo-sekolah.png" alt="watermark" className="h-64" />
          </div>

          {/* FILTER PERIODE - Terintegrasi di Banner */}
          <div className="mt-8 md:mt-0 flex gap-3 bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-white/20 relative z-10">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 rounded-xl bg-white text-[#1e3a8a] font-black outline-none text-xs uppercase"
            >
              {[
                "Januari",
                "Februari",
                "Maret",
                "April",
                "Mei",
                "Juni",
                "Juli",
                "Agustus",
                "September",
                "Oktober",
                "November",
                "Desember",
              ].map((m, i) => (
                <option key={i} value={i + 1}>
                  {m.toUpperCase()}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-xl bg-white text-[#1e3a8a] font-black outline-none text-xs"
            >
              {[2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PANEL STATISTIK UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-center">
          <div className="group bg-white p-12 rounded-[50px] shadow-xl border-b-8 border-[#0d9488] hover:-translate-y-2 transition-all duration-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
              Pengaduan Selesai
            </p>
            <p className="text-7xl font-black text-[#0d9488] tracking-tighter group-hover:scale-110 transition-transform">
              {stats.pengaduanSelesai}
            </p>
            <div className="mt-6 inline-block px-4 py-1 bg-gray-50 rounded-full">
              <p className="text-[10px] text-gray-400 font-bold italic">
                Dari Total{" "}
                <span className="text-[#1e3a8a]">{stats.totalPengaduan}</span>{" "}
                Masalah Terlapor
              </p>
            </div>
          </div>

          <div className="group bg-white p-12 rounded-[50px] shadow-xl border-b-8 border-indigo-500 hover:-translate-y-2 transition-all duration-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
              Konsultasi Selesai
            </p>
            <p className="text-7xl font-black text-indigo-500 tracking-tighter group-hover:scale-110 transition-transform">
              {stats.konsultasiSelesai}
            </p>
            <div className="mt-6 inline-block px-4 py-1 bg-gray-50 rounded-full">
              <p className="text-[10px] text-gray-400 font-bold italic">
                Dari Total{" "}
                <span className="text-[#1e3a8a]">{stats.totalKonsultasi}</span>{" "}
                Agenda Bimbingan
              </p>
            </div>
          </div>
        </div>

        {/* GRAFIK PER KATEGORI - Glassmorphism Card */}
        <div className="bg-white p-12 rounded-[55px] shadow-2xl border border-gray-100 mb-10 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10 border-l-4 border-[#1e3a8a] pl-5">
            <h3 className="text-xl font-black italic uppercase tracking-tight">
              Analisis Kategori Masalah
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-10">
            {[
              {
                label: "Bullying",
                value: stats.kategori.BULLYING,
                color: "bg-red-500",
              },
              {
                label: "Fasilitas",
                value: stats.kategori.FASILITAS,
                color: "bg-blue-500",
              },
              {
                label: "Kekerasan",
                value: stats.kategori.KEKERASAN,
                color: "bg-orange-500",
              },
              {
                label: "Lainnya",
                value: stats.kategori.LAINNYA,
                color: "bg-gray-400",
              },
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