import React, { useState, useEffect } from "react";

// Struktur data riwayat bimbingan yang jelas
interface RiwayatItem {
  id: number;
  jam?: string;
  nama_guru?: string;
  tanggal: string;
  status?: string;
  catatan?: string; // Menjaga ketersediaan properti detail tambahan jika ada
}

interface Props {
  onBack: () => void;
  onDetail: (item: RiwayatItem) => void;
}

const RiwayatKonsultasi: React.FC<Props> = ({ onBack, onDetail }) => {
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Parsing dilakukan di dalam useEffect agar bersih dari siklus render komponen utama
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    
    if (!storedUser.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:8080/api/riwayat/${storedUser.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data server");
        return res.json();
      })
      .then((data) => {
        setRiwayat(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Gagal memuat riwayat:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Cukup dijalankan sekali saat komponen dipasang (mount)

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-left pb-20">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-8 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-[#1e3a8a] rounded-full"></div>
          <div>
            <h2 className="text-2xl font-black text-[#1e3a8a] italic uppercase tracking-tighter">
              Riwayat Konsultasi
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
              Monitoring Bimbingan
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white border border-gray-200 text-[#1e3a8a] px-8 py-2 rounded-2xl font-black text-[10px] uppercase shadow-sm hover:bg-gray-50 transition-all tracking-widest active:scale-95"
        >
          Kembali ↩
        </button>
      </nav>

      {/* Konten Utama */}
      <div className="max-w-6xl mx-auto mt-12 px-10 space-y-6">
        {loading ? (
          /* State saat memuat data */
          <div className="py-24 text-center bg-white rounded-[50px] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-black italic uppercase tracking-[0.2em] text-xs">
              Memuat Riwayat Konsultasi...
            </p>
          </div>
        ) : riwayat.length > 0 ? (
          /* State jika data tersedia */
          riwayat.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => onDetail(item)}
              className="group flex items-center bg-white p-8 rounded-[35px] border border-gray-50 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(30,58,138,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onDetail(item);
                }
              }}
            >
              {/* Kolom Jam Bimbingan */}
              <div className="w-40 border-r-2 border-gray-50 pr-10 mr-10 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
                  Pukul
                </p>
                <p className="text-2xl font-black text-[#1e3a8a] tracking-tight">
                  {item.jam || "12:00"}
                </p>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">
                  WITA
                </p>
              </div>

              {/* Kolom Nama Guru & Tanggal */}
              <div className="flex-1">
                <h3 className="text-3xl font-black text-[#1e3a8a] italic uppercase tracking-tighter mb-2 group-hover:text-blue-700 transition-colors">
                  {item.nama_guru || "Guru Pembimbing"}
                </h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {item.tanggal}
                </p>
              </div>

              {/* Kolom Status Badge */}
              <div className="ml-10">
                <span className="bg-[#1e3a8a] text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(30,58,138,0.3)]">
                  {item.status || "Selesai"}
                </span>
              </div>
            </div>
          ))
        ) : (
          /* State jika data kosong */
          <div className="py-24 text-center bg-white rounded-[50px] border border-dashed border-gray-200">
            <p className="text-gray-300 font-black italic uppercase tracking-[0.4em] text-sm text-center">
              Belum Ada Jadwal Riwayat Konsultasi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatKonsultasi;