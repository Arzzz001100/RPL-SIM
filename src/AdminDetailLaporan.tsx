import React, { useState, useRef } from "react";
import API_BASE from "./api"; // Hubungkan ke file konfigurasi port pusat Anda

interface AdminDetailProps {
  onBack: () => void;
  selectedData: any;
}

const AdminDetailLaporan: React.FC<AdminDetailProps> = ({
  onBack,
  selectedData,
}) => {
  const [status, setStatus] = useState(selectedData?.status || "TERKIRIM");
  const [loading, setLoading] = useState(false);

  // Ref untuk mengontrol kontainer scroll foto menggunakan mouse
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // --- [ PROTEKSI ROLE & STATUS KUNCI ] ---
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isKepsek = user.role === "kepala sekolah";
  
  // Otomatis mengunci jika status pengaduan dari database sudah SELESAI
  const isTerkunciOtomatis = selectedData?.status?.toUpperCase() === "SELESAI";
  
  // Gabungkan kondisi pembatasan edit
  const isDisabled = isKepsek || isTerkunciOtomatis;

  const handleUpdate = async () => {
    if (isDisabled) return;
    if (!selectedData?.id) return alert("ID Laporan tidak valid");

    setLoading(true);
    try {
      // Menggunakan variabel dinamis API_BASE
      const res = await fetch(
        `${API_BASE}/api/admin/update-laporan/${selectedData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: status }),
        },
      );

      if (res.ok) {
        alert("Status Pengaduan Berhasil Diperbarui!");
        onBack();
      } else {
        alert("Gagal memperbarui status.");
      }
    } catch (err) {
      alert("Kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  // Sinkronisasi jalur folder aset upload backend lewat API_BASE
  const getImageUrl = (filename: string) => {
    return encodeURI(`${API_BASE}/uploads/${filename}`);
  };

  const listFoto = selectedData?.foto
    ? selectedData.foto.split(",").filter(Boolean)
    : [];

  // --- [ LOGIKA DRAG TO SCROLL MOUSE ] ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    scrollRef.current.classList.add("active");
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    isDown.current = false;
    if (scrollRef.current) {
      scrollRef.current.classList.remove("active");
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Kecepatan geser
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <style>{`
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .cursor-grab { cursor: grab; }
        .cursor-grabbing { cursor: grabbing; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="text-4xl mb-6 text-blue-900 hover:scale-110 transition-transform active:scale-90 outline-none"
        >
          &larr;
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100">
          <h2 className="text-2xl font-black text-blue-900 mb-10 uppercase italic border-b pb-4">
            Kelola Pengaduan Siswa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 text-left">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Pengadu
                </label>
                <p className="font-bold text-blue-900 text-lg">
                  {selectedData?.nama_pelapor || selectedData?.nama} (
                  {selectedData?.kelas || "-"})
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Deskripsi
                </label>
                <div className="bg-gray-50 p-6 rounded-3xl italic text-gray-600 text-sm border border-gray-100 leading-relaxed min-h-[100px]">
                  "{selectedData?.isi_laporan}"
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                  Progres
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isDisabled}
                  className={`w-full px-6 py-4 rounded-2xl border-2 font-black outline-none transition-all ${
                    isDisabled
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-50 border-blue-600 text-blue-900 focus:ring-4 ring-blue-100 cursor-pointer"
                  }`}
                >
                  <option value="TERKIRIM">TERKIRIM</option>
                  <option value="DITERIMA">DITERIMA</option>
                  <option value="DIPROSES">DIPROSES</option>
                  <option value="SELESAI">SELESAI</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                  Bukti Foto ({listFoto.length})
                </label>
                {listFoto.length > 0 ? (
                  <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeaveOrUp}
                    onMouseUp={handleMouseLeaveOrUp}
                    onMouseMove={handleMouseMove}
                    className={`flex gap-3 overflow-x-auto h-44 hide-scroll select-none cursor-grab active:cursor-grabbing`}
                  >
                    {listFoto.map((namaFile: string, index: number) => (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-3xl border shadow-sm h-full bg-gray-100 flex-shrink-0 ${
                          listFoto.length > 1 ? "w-[75%]" : "w-full"
                        }`}
                      >
                        <img
                          src={getImageUrl(namaFile)}
                          alt={`Bukti Laporan ${index + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                          onDoubleClick={() =>
                            window.open(getImageUrl(namaFile), "_blank")
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-44 bg-gray-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200">
                    <span className="text-gray-300 font-bold text-[10px] uppercase">
                      Tidak ada foto
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isKepsek ? (
            <div className="w-full py-5 rounded-2xl font-black uppercase tracking-widest bg-blue-50 text-blue-900 border border-blue-100 text-center text-xs">
              Melihat Sebagai Kepala Sekolah (Read Only)
            </div>
          ) : isTerkunciOtomatis ? (
            <div className="w-full py-5 rounded-2xl font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 text-center text-xs shadow-inner">
              Pengaduan Terkunci (Kasus Selesai)
            </div>
          ) : (
            <button
              onClick={handleUpdate}
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 text-white hover:bg-blue-800"
              }`}
            >
              {loading ? "Sedang Memproses..." : "Simpan Perubahan Status"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDetailLaporan;