import React, { useState, useEffect } from "react";

// Kontrak data laporan bimbingan sesuai skema database db_sim
interface LaporanItem {
  id: number;
  tanggal_lapor: string;
  kategori: string;
  status: string;
  isi_laporan?: string;
}

interface Props {
  onBack: () => void;
  onLihatDetail: (item: LaporanItem) => void;
}

const RiwayatLaporan: React.FC<Props> = ({ onBack, onLihatDetail }) => {
  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Isolasi parsing user di dalam useEffect
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    
    if (!storedUser.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:8080/api/laporan/user/${storedUser.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Respon server bermasalah");
        return res.json();
      })
      .then((data) => setLaporan(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Gagal menarik data laporan:", err);
        setLaporan([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Berjalan sekali saat komponen dimuat

  const formatTanggal = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Validasi jika string tanggal tidak valid sebelum di-parsing Intl
      if (isNaN(date.getTime())) return dateString;

      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Penentuan warna badge status dinamis dengan shadow color yang valid
  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "TERKIRIM":
        return "bg-blue-500 text-white shadow-lg shadow-blue-500/30";
      case "DITERIMA":
        return "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30";
      case "DIPROSES":
        return "bg-orange-500 text-white shadow-lg shadow-orange-500/30";
      case "SELESAI":
        return "bg-green-500 text-white shadow-lg shadow-green-500/30";
      default:
        return "bg-gray-500 text-white shadow-lg shadow-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-left pb-20">
      
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto flex justify-between items-end mb-12 border-l-8 border-blue-900 pl-6 mt-4">
        <div>
          <h1 className="text-4xl font-black text-blue-900 uppercase italic tracking-tighter">
            Semua Laporan Saya
          </h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">
            Pantau perkembangan aduan Anda
          </p>
        </div>
        <button
          onClick={onBack}
          disabled={loading}
          className="bg-gray-200 text-gray-700 px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-md hover:bg-gray-300 active:scale-95 transition-all disabled:opacity-50"
        >
          Kembali
        </button>
      </div>

      {/* GRID / KONTEN LAPORAN */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          /* State Loading */
          <div className="py-32 text-center bg-white rounded-[45px] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-black italic uppercase tracking-[0.2em] text-xs">
              Sinkronisasi data laporan...
            </p>
          </div>
        ) : laporan.length > 0 ? (
          /* State Data Tersedia */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {laporan.map((item) => (
              <div
                key={item.id}
                onClick={() => onLihatDetail(item)}
                className="group bg-white rounded-[35px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onLihatDetail(item);
                }}
              >
                {/* Garis Aksen Samping */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                      {formatTanggal(item.tanggal_lapor)}
                    </span>
                    <h3 className="text-xl font-black text-blue-900 uppercase italic group-hover:text-blue-600 transition-colors">
                      Kasus {item.kategori}
                    </h3>
                  </div>
                  <span
                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-transform group-hover:scale-105 ${getStatusStyle(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Teks Isi Laporan */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 group-hover:bg-gray-100/50 transition-colors">
                  <p className="text-gray-500 text-sm leading-relaxed italic line-clamp-2">
                    "{item.isi_laporan || "Tidak ada deskripsi tambahan..."}"
                  </p>
                </div>

                {/* Indikator Aksi */}
                <div className="mt-6 flex items-center justify-end">
                  <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 translation-all duration-300">
                    Lihat Detail <span>→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* State Data Kosong */
          <div className="py-32 text-center bg-white rounded-[50px] border border-dashed border-gray-200">
            <p className="text-gray-300 font-black italic text-xl uppercase tracking-tighter">
              Belum ada riwayat laporan yang dibuat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatLaporan;