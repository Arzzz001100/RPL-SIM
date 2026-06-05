import React from "react";

interface DetailProps {
  onBack: () => void;
  selectedData: any;
}

const DetailKonsultasi: React.FC<DetailProps> = ({ onBack, selectedData }) => {
  if (!selectedData) return null;

  // Perbaikan 1: Validasi string tanggal agar terhindar dari tulisan "Invalid Date"
  const formatTanggal = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    
    // Memeriksa apakah tanggal valid secara komputasi internal JavaScript
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Perbaikan 2: Memastikan URL selalu memiliki awalan https:// agar tidak merusak navigasi browser
  const formatSesiUrl = (url: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    return `https://${url}`;
  };

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
              Detail Konsultasi
            </h2>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">
              Status: {selectedData.status || "PENDING"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[50px] shadow-2xl border border-orange-50 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Bagian Kiri (Informasi Guru & Waktu) */}
            <div className="p-10 bg-[#1e1b4b] text-white">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-1">
                    Guru Pembimbing
                  </label>
                  <p className="text-2xl font-black uppercase text-orange-400">
                    {selectedData.nama_guru || "Belum Ditentukan"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-1">
                    Jadwal Pertemuan
                  </label>
                  <p className="text-lg font-bold">
                    {formatTanggal(selectedData.tanggal)}
                  </p>
                  <p className="text-sm font-medium text-blue-200">
                    {selectedData.jam ? `${selectedData.jam} WITA` : "Waktu Belum Diatur"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-1">
                    Topik Pembahasan
                  </label>
                  <p className="italic text-blue-100">"{selectedData.topik || "Konsultasi Umum"}"</p>
                </div>
              </div>
            </div>

            {/* Bagian Kanan (Link & Pesan Admin) */}
            <div className="p-10 space-y-8 bg-white">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                  Link Pertemuan (Zoom/GMeet)
                </label>
                {selectedData.link_zoom ? (
                  <a
                    href={formatSesiUrl(selectedData.link_zoom)}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full p-4 bg-orange-500 text-white text-center rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-orange-600 transition-all active:scale-95"
                  >
                    Gabung Sekarang 🎥
                  </a>
                ) : (
                  <div className="p-4 bg-gray-100 text-gray-400 text-center rounded-2xl font-bold text-[10px] uppercase border-2 border-dashed">
                    Link belum tersedia / tatap muka
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                  Pesan dari Admin/Guru
                </label>
                <div className="bg-orange-50 p-6 rounded-[30px] border border-orange-100 italic text-gray-600 text-sm leading-relaxed">
                  {selectedData.pesan_admin || "Belum ada pesan tambahan."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailKonsultasi;