import React, { useState } from "react";

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

  // --- [ PROTEKSI ROLE ] ---
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isKepsek = user.role === "kepala sekolah";

  const handleUpdate = async () => {
    // Keamanan tambahan: cegah fungsi jalan jika role adalah kepsek
    if (isKepsek) return;
    if (!selectedData?.id) return alert("ID Laporan tidak valid");

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/update-laporan/${selectedData.id}`,
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

  const getImageUrl = (filename: string) => {
    return encodeURI(`http://localhost:8080/uploads/${filename}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="text-4xl mb-6 text-blue-900 hover:scale-110 transition-transform active:scale-90 outline-none"
        >
          ↩
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
                {/* PERBAIKAN: Menambahkan 'disabled' jika isKepsek true */}
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isKepsek}
                  className={`w-full px-6 py-4 rounded-2xl border-2 font-black outline-none transition-all ${
                    isKepsek
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
                  Bukti Foto
                </label>
                {selectedData?.foto ? (
                  <div className="relative overflow-hidden rounded-3xl border shadow-sm h-44 bg-gray-100">
                    <img
                      src={getImageUrl(selectedData.foto)}
                      alt="Bukti"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() =>
                        window.open(getImageUrl(selectedData.foto), "_blank")
                      }
                    />
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

          {/* PERBAIKAN: Tombol aksi berubah menjadi label info jika role adalah kepsek */}
          {isKepsek ? (
            <div className="w-full py-5 rounded-2xl font-black uppercase tracking-widest bg-blue-50 text-blue-900 border border-blue-100 text-center text-xs"></div>
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
