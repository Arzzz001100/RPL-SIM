import React, { useState, useEffect } from "react";

interface Props {
  onBack: () => void;
  // PERBAIKAN: Tambahkan baris ini agar App.tsx tidak error
  onLihatDetail: (item: any) => void;
}

const RiwayatKonsultasi: React.FC<Props> = ({ onBack, onLihatDetail }) => {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

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

  return (
    <div className="min-h-screen bg-white p-10 font-sans text-left">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-blue-900 italic uppercase">
          Riwayat Konsultasi
        </h1>
        <button
          onClick={onBack}
          className="bg-red-500 text-white px-10 py-3 rounded-full font-black uppercase text-xs shadow-lg active:scale-95 transition-all"
        >
          Kembali
        </button>
      </div>

      <div className="space-y-6">
        {riwayat.length > 0 ? (
          riwayat.map((item) => (
            <div
              key={item.id}
              // PERBAIKAN: Panggil onLihatDetail saat kotak diklik
              onClick={() => onLihatDetail(item)}
              className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-50 flex justify-between items-center cursor-pointer hover:border-orange-200 active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 text-2xl shadow-inner">
                  {item.status === "Selesai" ? "✓" : "⏳"}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {formatTanggal(item.tanggal)}
                  </p>
                  <h4 className="text-xl font-black text-blue-900 group-hover:text-orange-500 transition-colors">
                    {item.nama_guru}
                  </h4>
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">
                    Klik untuk lihat status & link →
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${
                    item.status === "Diterima"
                      ? "bg-orange-500 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {item.status}
                </span>
                <p className="text-[10px] font-bold text-gray-300 mt-2 italic">
                  {item.jam} WITA
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold italic uppercase tracking-widest">
              Belum ada riwayat konsultasi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatKonsultasi;
