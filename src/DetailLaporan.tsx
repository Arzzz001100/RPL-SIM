import React from "react";

interface DetailProps {
  onBack: () => void;
  selectedData: any;
}

const DetailLaporan: React.FC<DetailProps> = ({ onBack, selectedData }) => {
  if (!selectedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-bold text-blue-900 animate-pulse">Memuat data...</p>
      </div>
    );
  }

  // Perbaikan 1: Validasi string tanggal agar terhindar dari tulisan "Invalid Date"
  const formatTanggal = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Perbaikan 2: Memangkas spasi putih sebelum/sesudah koma agar link gambar tidak rusak (%20)
  const dapatkanListFoto = (): string[] => {
    if (!selectedData.foto) return [];
    return selectedData.foto
      .split(",")
      .map((item: string) => item.trim()) // Menghapus spasi di awal/akhir string file
      .filter(Boolean); // Membuang string kosong jika ada koma ganda
  };

  const listFoto = dapatkanListFoto();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-left">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={onBack}
            className="text-4xl text-blue-900 hover:scale-110 transition-transform"
          >
            ↩
          </button>
          <div className="text-right">
            <h2 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter">
              Detail Pengaduan
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              ID Kasus: #{selectedData.id || "0"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[50px] shadow-2xl border border-blue-50 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 bg-[#1e1b4b] text-white">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-2">
                    Status Pengaduan
                  </label>
                  <span className="bg-blue-500 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                    {selectedData.status || "PENDING"}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-1">
                    Nama Pelapor
                  </label>
                  <p className="text-xl font-bold uppercase">
                    {selectedData.nama || selectedData.nama_pelapor || "Siswa Rahasia (Anonim)"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-1">
                    Kategori Masalah
                  </label>
                  <p className="text-lg font-bold text-orange-400 uppercase italic">
                    {selectedData.kategori || "LAINNYA"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-1">
                    Dibuat
                  </label>
                  <p className="font-medium">
                    {formatTanggal(selectedData.tanggal_lapor || selectedData.tanggal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10 space-y-8">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                  Deskripsi Masalah
                </label>
                <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100 italic text-gray-600 leading-relaxed">
                  "{selectedData.isi_laporan || "Tidak ada rincian deskripsi."}"
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                  Bukti Foto ({listFoto.length})
                </label>
                {listFoto.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {listFoto.map((namaFile, index) => (
                      <div 
                        key={index} 
                        className="rounded-[20px] overflow-hidden border-2 border-gray-50 shadow-md group relative bg-gray-100"
                      >
                        <img
                          src={`http://localhost:8080/uploads/${namaFile}`}
                          alt={`Bukti Laporan ${index + 1}`}
                          className="w-full h-28 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                          onClick={() =>
                            window.open(
                              `http://localhost:8080/uploads/${namaFile}`,
                              "_blank",
                            )
                          }
                          onError={(e) => {
                            // Penanganan alternatif jika file fisik gambar tidak ditemukan di backend
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Gambar+Rusak";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 bg-gray-100 rounded-[30px] flex items-center justify-center border-2 border-dashed border-gray-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase">
                      Tidak ada lampiran foto
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-10 text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">
          SIBY Group • Layanan Pengaduan Terpadu
        </p>
      </div>
    </div>
  );
};

export default DetailLaporan;