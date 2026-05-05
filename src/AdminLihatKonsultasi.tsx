import React, { useState, useEffect } from "react";

interface Props {
  onBack: () => void;
  onDetail: (item: any) => void;
}

const AdminLihatKonsultasi: React.FC<Props> = ({ onBack, onDetail }) => {
  const [daftarKonsultasi, setDaftarKonsultasi] = useState<any[]>([]);

  // Ambil data user untuk proteksi role Kepsek
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isKepsek = user.role === "kepala sekolah";

  useEffect(() => {
    fetch("http://localhost:8080/api/admin/konsultasi")
      .then((res) => res.json())
      .then((data) => setDaftarKonsultasi(Array.isArray(data) ? data : []))
      .catch(() => setDaftarKonsultasi([]));
  }, []);

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
    <div className="min-h-screen bg-gray-50 p-10 font-sans text-left">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-[#1e3a8a] italic uppercase tracking-tighter">
          Panel Konsultasi
        </h1>
        <button
          onClick={onBack}
          className="bg-slate-500 text-white px-8 py-2 rounded-full font-bold uppercase text-[10px] shadow-md hover:bg-[#1e3a8a] transition-all active:scale-95 tracking-widest"
        >
          Kembali
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1e3a8a] text-white uppercase text-[10px] tracking-[0.2em] font-black">
              <th className="px-10 py-6">Siswa</th>
              <th className="px-10 py-6">Guru</th>
              <th className="px-10 py-6">Tanggal</th>
              <th className="px-10 py-6 text-center">Progres</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {daftarKonsultasi.length > 0 ? (
              daftarKonsultasi.map(
                (
                  item, // SUDAH DIPERBAIKI: daftarKonsultasi
                ) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/50 transition-all cursor-default"
                  >
                    <td className="px-10 py-7">
                      <p className="font-black text-[#1e3a8a] text-lg uppercase tracking-tight">
                        {item.nama || "Siswa"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-tighter mt-1">
                        "{item.topik}"
                      </p>
                    </td>
                    <td className="px-10 py-7">
                      <p className="font-black text-[#1e3a8a] text-[11px] uppercase italic">
                        {item.nama_guru}
                      </p>
                    </td>
                    <td className="px-10 py-7">
                      <p className="text-[10px] font-black text-gray-600 uppercase">
                        {formatTanggal(item.tanggal)}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                        {item.jam} WITA
                      </p>
                    </td>
                    <td className="px-10 py-7 text-center">
                      {isKepsek ? (
                        <button
                          onClick={() => onDetail(item)}
                          className="bg-slate-400 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-[#1e3a8a] transition-all"
                        >
                          Lihat
                        </button>
                      ) : item.status === "Selesai" ? (
                        <div className="flex items-center justify-center">
                          <span className="bg-[#1e3a8a] text-white px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md">
                            ✓ Selesai
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onDetail(item)}
                          className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all text-white ${
                            item.status === "Diterima"
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-orange-500 hover:bg-orange-600"
                          }`}
                        >
                          {item.status || "Menunggu"}
                        </button>
                      )}
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-8 py-24 text-center text-gray-300 italic font-black uppercase tracking-widest"
                >
                  Belum ada permintaan konsultasi...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLihatKonsultasi;
