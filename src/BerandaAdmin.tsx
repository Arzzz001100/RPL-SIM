import React, { useState, useEffect, useCallback } from "react";
import API_BASE from "./api"; // Menggunakan konfigurasi alamat port global pusat

interface AdminProps {
  onLogout: () => void;
  onGoLaporan: () => void;
  onGoKonsultasi: () => void;
  onGoVerifikasi: () => void; // Navigasi untuk memicu halaman verifikasi siswa
}

const BerandaAdmin: React.FC<AdminProps> = ({
  onLogout,
  onGoLaporan,
  onGoKonsultasi,
  onGoVerifikasi,
}) => {
  const [stats, setStats] = useState({
    totalPengaduan: 0,
    pengaduanSelesai: 0,
    totalKonsultasi: 0,
    konsultasiSelesai: 0,
  });

  // Default menggunakan bulan dan tahun saat ini (Juni 2026)
  const [bulan, setBulan] = useState<number>(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());

  const fetchStats = useCallback(async () => {
    try {
      // PERBAIKAN UTAMA: Tambahkan parameter &all=true agar backend tahu kita ingin mengambil semua data jika filter bulan/tahun tidak cocok
      const res = await fetch(
        `${API_BASE}/api/admin/stats?bulan=${bulan}&tahun=${tahun}&all=true`,
      );
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      
      // Menyelaraskan mapping key dari database backend (mengantisipasi snake_case dan camelCase)
      setStats({
        totalPengaduan: data.total_pengaduan ?? data.totalPengaduan ?? 0,
        pengaduanSelesai: data.pengaduan_selesai ?? data.pengaduanSelesai ?? 0,
        totalKonsultasi: data.total_konsultasi ?? data.totalKonsultasi ?? 0,
        konsultasiSelesai: data.konsultasi_selesai ?? data.konsultasiSelesai ?? 0,
      });
    } catch (err) {
      console.error("Gagal ambil stats:", err);
    }
  }, [bulan, tahun]);

  useEffect(() => {
    fetchStats();

    // AUTO-UPDATE: Terus memantau database setiap 5 detik. Jika ada pengaduan baru masuk, angka otomatis bertambah.
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-left pb-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-100/40 rounded-full blur-[100px] -z-10"></div>

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-gray-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-black text-[#1e3a8a] italic tracking-tighter uppercase">
          SIBY Group
        </h1>
        <div className="flex items-center gap-8 font-bold text-sm text-[#1e3a8a]">
          <button className="border-b-2 border-[#1e3a8a] pb-1 uppercase tracking-widest">
            Beranda
          </button>
          <button
            onClick={onGoVerifikasi}
            className="opacity-40 hover:opacity-100 uppercase transition-all tracking-widest"
          >
            Verifikasi
          </button>
          <button
            onClick={onGoLaporan}
            className="opacity-40 hover:opacity-100 uppercase transition-all tracking-widest"
          >
            Pengaduan
          </button>
          <button
            onClick={onGoKonsultasi}
            className="opacity-40 hover:opacity-100 uppercase transition-all tracking-widest"
          >
            Konsultasi
          </button>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-full shadow-lg text-[10px] uppercase hover:scale-105 transition-all"
          >
            Log out
          </button>
        </div>
      </nav>

      {/* BANNER UTAMA */}
      <div className="mx-10 mt-6 bg-[#1e3a8a] rounded-[40px] py-14 text-center shadow-2xl flex flex-col items-center relative overflow-hidden">
        <h2 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tight relative z-10">
          Sistem Pengaduan Masalah
        </h2>
        <p className="text-white/60 font-bold tracking-[0.3em] mb-10 text-[10px] relative z-10 uppercase">
          SMP Tridharma Manado
        </p>
        <div className="mb-4 relative z-10 group">
          <div className="bg-white p-5 rounded-full shadow-2xl border-4 border-white/20 group-hover:scale-110 transition-all duration-500 cursor-pointer">
            <img
              src="/logo-sekolah.png"
              alt="Logo"
              className="h-24 w-24 object-contain"
            />
          </div>
        </div>
      </div>

      {/* FILTER PERIODE */}
      <div className="mx-10 mt-10 flex items-center justify-between p-8 bg-white/40 backdrop-blur-xl rounded-[35px] border border-white/60 shadow-xl">
        <div className="border-l-4 border-[#1e3a8a] pl-5">
          <h3 className="text-sm font-black text-[#1e3a8a] uppercase italic">
            Statistik Sistem
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Data Periode Terpilih
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className="px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all cursor-pointer"
          >
            {[
              "Januari", "Februari", "Maret", "April", "Mei", "Juni",
              "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ].map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all cursor-pointer"
          >
            {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="mx-10 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Total Pengaduan */}
        <div
          onClick={onGoLaporan}
          className="group relative bg-white/40 backdrop-blur-2xl p-10 rounded-[45px] shadow-xl border border-white/60 flex flex-col items-center justify-center cursor-pointer hover:bg-white/60 hover:-translate-y-2 transition-all duration-500"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <p className="text-[10px] font-black text-[#1e3a8a]/50 uppercase mb-4 tracking-[0.2em] relative z-10 text-center">
            Total Pengaduan
          </p>
          <h4 className="text-6xl font-black text-[#1e3a8a] tracking-tighter relative z-10 group-hover:scale-110 transition-transform">
            {stats.totalPengaduan}
          </h4>
          <div className="mt-4 w-12 h-1.5 bg-[#1e3a8a] rounded-full relative z-10 shadow-sm shadow-[#1e3a8a]/40"></div>
        </div>

        {/* Pengaduan Selesai */}
        <div 
          onClick={onGoLaporan}
          className="group relative bg-white/40 backdrop-blur-2xl p-10 rounded-[45px] shadow-xl border border-white/60 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-white/60 hover:-translate-y-2"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
          <p className="text-[10px] font-black text-teal-600/50 uppercase mb-4 tracking-[0.2em] relative z-10 text-center">
            Pengaduan Selesai
          </p>
          <h4 className="text-6xl font-black text-[#0d9488] tracking-tighter relative z-10 group-hover:scale-110 transition-transform">
            {stats.pengaduanSelesai}
          </h4>
          <div className="mt-4 w-12 h-1.5 bg-[#0d9488] rounded-full relative z-10 shadow-sm shadow-teal-500/40"></div>
        </div>

        {/* Total Konsultasi */}
        <div
          onClick={onGoKonsultasi}
          className="group relative bg-white/40 backdrop-blur-2xl p-10 rounded-[45px] shadow-xl border border-white/60 flex flex-col items-center justify-center cursor-pointer hover:bg-white/60 hover:-translate-y-2 transition-all duration-500"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <p className="text-[10px] font-black text-[#1e3a8a]/50 uppercase mb-4 tracking-[0.2em] relative z-10 text-center">
            Total Konsultasi
          </p>
          <h4 className="text-6xl font-black text-[#1e3a8a] tracking-tighter relative z-10 group-hover:scale-110 transition-transform">
            {stats.totalKonsultasi}
          </h4>
          <div className="mt-4 w-12 h-1.5 bg-[#1e3a8a] rounded-full relative z-10 shadow-sm shadow-[#1e3a8a]/40"></div>
        </div>

        {/* Konsultasi Selesai */}
        <div 
          onClick={onGoKonsultasi}
          className="group relative bg-white/40 backdrop-blur-2xl p-10 rounded-[45px] shadow-xl border border-white/60 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-white/60 hover:-translate-y-2"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
          <p className="text-[10px] font-black text-teal-600/50 uppercase mb-4 tracking-[0.2em] relative z-10 text-center">
            Konsultasi Selesai
          </p>
          <h4 className="text-6xl font-black text-[#0d9488] tracking-tighter relative z-10 group-hover:scale-110 transition-transform">
            {stats.konsultasiSelesai}
          </h4>
          <div className="mt-4 w-12 h-1.5 bg-[#0d9488] rounded-full relative z-10 shadow-sm shadow-teal-500/40"></div>
        </div>
      </div>
    </div>
  );
};

export default BerandaAdmin;