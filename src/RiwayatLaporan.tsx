import React, { useState, useEffect } from "react";

interface Props {
  onBack: () => void;
  onLihatDetail: (item: any) => void;
}

const RiwayatLaporan: React.FC<Props> = ({ onBack, onLihatDetail }) => {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    fetch(`http://localhost:8080/api/laporan/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        // Cek data di console jika deskripsi masih tidak muncul
        console.log("Cek data laporan:", data);
        setRiwayat(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setRiwayat([]);
      });
  }, [user.id]);

  // Fungsi merapikan tanggal (Menghilangkan format ISO .000Z)
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

  return (
    /* h-screen + overflow-y-auto agar halaman tidak terpotong dan bisa di-scroll */
    <div className="h-screen w-full bg-gray-50 font-sans text-left overflow-y-auto pb-20">
      {/* Header Sticky agar tetap terlihat saat scroll */}
      <div className="p-10 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-blue-600 rounded-full shadow-md"></div>
          <h1 className="text-4xl font-black text-blue-900 italic uppercase tracking-tighter">
            Semua Laporan Saya
          </h1>
        </div>
        <button
          onClick={onBack}
          className="bg-red-500 text-white px-10 py-3 rounded-2xl font-black uppercase text-xs shadow-lg shadow-red-200 active:scale-95 hover:bg-red-600 transition-all"
        >
          Kembali
        </button>
      </div>

      {/* Grid Laporan */}
      <div className="px-10 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {riwayat.length > 0 ? (
          riwayat.map((item) => (
            <div
              key={item.id}
              onClick={() => onLihatDetail(item)}
              className="bg-white p-10 rounded-[50px] shadow-2xl shadow-gray-200 border border-white flex justify-between items-center cursor-pointer hover:border-blue-200 transition-all active:scale-[0.99] group"
            >
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-[0.2em]">
                  {formatTanggal(item.tanggal_lapor || item.tanggal)}
                </p>
                <h4 className="text-2xl font-black text-blue-900 uppercase italic mb-3">
                  Kasus {item.kategori}
                </h4>

                {/* SOLUSI DESKRIPSI: Mengecek semua kemungkinan nama property dari database */}
                <p className="text-sm text-gray-400 font-medium italic leading-relaxed">
                  {item.keluhan ||
                    item.deskripsi ||
                    item.isi_laporan ||
                    "Detail deskripsi tidak ditemukan"}
                </p>
              </div>

              <div className="ml-6 flex-shrink-0">
                <span
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                    item.status === "Selesai"
                      ? "bg-blue-600 text-white shadow-blue-200"
                      : "bg-blue-500 text-white shadow-blue-100"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 py-24 text-center bg-white rounded-[50px] shadow-inner border-2 border-dashed border-gray-100">
            <p className="text-gray-300 font-black italic uppercase tracking-widest">
              Belum ada data laporan yang tersimpan
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatLaporan;
