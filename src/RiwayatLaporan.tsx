import React, { useState, useEffect } from "react";

interface Props {
  onBack: () => void;
  onLihatDetail: (item: any) => void;
}

const RiwayatLaporan: React.FC<Props> = ({ onBack, onLihatDetail }) => {
  const [laporan, setLaporan] = useState<any[]>([]);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    fetch(`http://localhost:8080/api/laporan/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => setLaporan(Array.isArray(data) ? data : []))
      .catch(() => setLaporan([]));
  }, [user.id]);

  const formatTanggal = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Fungsi untuk menentukan warna badge status secara dinamis
  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "TERKIRIM":
        return "bg-blue-500 text-white shadow-blue-200";
      case "DIPROSES":
        return "bg-orange-500 text-white shadow-orange-200";
      case "SELESAI":
        return "bg-green-500 text-white shadow-green-200";
      default:
        return "bg-gray-500 text-white shadow-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-left">
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto flex justify-between items-end mb-12 border-l-8 border-blue-900 pl-6">
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
          className="bg-red-500 text-white px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 active:scale-95 transition-all"
        >
          Kembali
        </button>
      </div>

      {/* GRID LAPORAN */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {laporan.length > 0 ? (
          laporan.map((item) => (
            <div
              key={item.id}
              onClick={() => onLihatDetail(item)}
              className="group bg-white rounded-[35px] p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden"
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
                  className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase shadow-md transition-transform group-hover:scale-110 ${getStatusStyle(item.status)}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-gray-500 text-sm leading-relaxed italic line-clamp-2">
                  "{item.deskripsi || "Tidak ada deskripsi tambahan..."}"
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end">
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2">
                  Lihat Detail <span>→</span>
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center">
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