import React, { useState, useEffect } from "react";

interface Props {
  onBack: () => void;
  onLihatDetail: (item: any) => void;
}

const RiwayatKonsultasi: React.FC<Props> = ({ onBack, onLihatDetail }) => {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetch(`http://localhost:8080/api/riwayat/${user.id}`)
      .then((res) => res.json())
      .then((data) => setRiwayat(Array.isArray(data) ? data : []))
      .catch(() => setRiwayat([]));
  }, [user.id]);

  const formatTanggal = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DITERIMA":
        return "bg-orange-500 text-white shadow-orange-100";
      case "SELESAI":
        return "bg-blue-600 text-white shadow-blue-100";
      case "DITOLAK":
        return "bg-red-500 text-white shadow-red-100";
      default:
        return "bg-gray-400 text-white shadow-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-left">
      {/* HEADER SECTION */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-12">
        <div className="border-l-8 border-orange-500 pl-6">
          <h1 className="text-4xl font-black text-blue-900 uppercase italic tracking-tighter">
            Riwayat Konsultasi
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
            Jadwal Pertemuan & Bimbingan Siswa
          </p>
        </div>
        <button
          onClick={onBack}
          className="bg-red-500 text-white px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-red-600 active:scale-95 transition-all"
        >
          Kembali
        </button>
      </div>

      {/* LIST KONSULTASI */}
      <div className="max-w-5xl mx-auto space-y-6">
        {riwayat.length > 0 ? (
          riwayat.map((item) => (
            <div
              key={item.id}
              onClick={() => onLihatDetail(item)}
              className="group bg-white rounded-[30px] p-2 pr-8 shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer overflow-hidden"
            >
              {/* Jam/Waktu Section */}
              <div className="bg-[#1e1b4b] text-white p-8 rounded-[25px] min-w-[140px] text-center group-hover:bg-orange-500 transition-colors duration-300">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">
                  Pukul
                </p>
                <p className="text-xl font-black italic">
                  {item.jam.slice(0, 5)}
                </p>
                <p className="text-[9px] font-bold uppercase mt-1">WITA</p>
              </div>

              {/* Info Guru & Status */}
              <div className="flex-grow">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
                  {formatTanggal(item.tanggal)}
                </p>
                <h3 className="text-2xl font-black text-blue-900 uppercase italic leading-none mb-2">
                  {item.nama_guru || "Guru Pembimbing"}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">
                    Klik untuk lihat status & link zoom
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg ${getStatusBadge(item.status)}`}
                >
                  {item.status}
                </span>
                {item.status?.toUpperCase() === "DITERIMA" && (
                  <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">
                    Link Zoom Siap
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-200">
            <p className="text-gray-300 font-black italic text-lg uppercase">
              Belum ada riwayat pertemuan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatKonsultasi;