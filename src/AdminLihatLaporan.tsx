import React, { useState, useEffect } from "react";
import API_BASE from "./api"; // Menggunakan konfigurasi alamat port global 8080

interface Props {
  onBack: () => void;
  onDetail: (item: any) => void;
}

const AdminLihatLaporan: React.FC<Props> = ({ onBack, onDetail }) => {
  const [laporan, setLaporan] = useState<any[]>([]);

  // Mengambil data user untuk pengecekan role
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    // Sinkronisasi endpoint menggunakan API_BASE pusat
    fetch(`${API_BASE}/api/admin/laporan`)
      .then((res) => res.json())
      .then((data) => {
        setLaporan(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Gagal mengambil data laporan:", err);
        setLaporan([]);
      });
  }, []);

  // Penyesuaian warna background status yang sinkron dengan database Supabase
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "TERKIRIM":
        return "bg-orange-500 text-white";
      case "DITERIMA": 
        return "bg-yellow-400 text-yellow-950"; // Warna kuning kontras agar teks mudah dibaca
      case "DIPROSES":
        return "bg-blue-500 text-white";
      case "SELESAI":
        return "bg-green-600 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans text-left">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-blue-900 italic uppercase">
          Panel Pengaduan
        </h1>
        <button
          onClick={onBack}
          className="bg-slate-500 text-white px-8 py-2 rounded-full font-bold uppercase text-xs active:scale-95 transition-all shadow-md hover:bg-blue-900"
        >
          Kembali
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-blue-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-blue-900 text-white uppercase text-[10px] tracking-widest font-black">
              <th className="px-8 py-6">Pengadu</th>
              <th className="px-8 py-6">Kategori</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-center">Progres</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {laporan.length > 0 ? (
              laporan.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/50 transition-all cursor-default"
                >
                  <td className="px-8 py-6">
                    <p className="font-bold text-blue-900 uppercase">
                      {item.nama_pelapor || "Anonim"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                      Kelas {item.kelas || "-"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`${getStatusColor(item.status)} px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm`}
                    >
                      {item.status || "TERKIRIM"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {user.role === "kepala sekolah" ? (
                      <button
                        onClick={() => onDetail(item)}
                        className="bg-slate-400 text-white px-6 py-2 rounded-xl font-bold text-[10px] uppercase shadow-md active:scale-95 transition-all hover:bg-blue-900"
                      >
                        Lihat
                      </button>
                    ) : (
                      <button
                        onClick={() => onDetail(item)}
                        className="bg-blue-900 text-white px-6 py-2 rounded-xl font-bold text-[10px] uppercase shadow-md active:scale-95 transition-all hover:bg-black"
                      >
                        Detail
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-8 py-24 text-center text-gray-300 italic font-black uppercase tracking-widest"
                >
                  Belum ada laporan masuk...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLihatLaporan;