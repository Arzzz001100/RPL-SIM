import React, { useState, useEffect, useRef } from "react";

interface LaporanProps {
  onBack: () => void;
}

const Laporan: React.FC<LaporanProps> = ({ onBack }) => {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jenis, setJenis] = useState<string>("");
  const [deskripsi, setDeskripsi] = useState<string>("");

  // State array untuk menampung hingga 4 foto
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const savedDraft = sessionStorage.getItem(`draft_laporan_${user.id}`);
    if (savedDraft) {
      const { kategori, isi } = JSON.parse(savedDraft);
      setJenis(kategori);
      setDeskripsi(isi);
    }
  }, [user.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Cek jika total foto yang akan dimasukkan melebihi 4
      if (fotos.length + selectedFiles.length > 4) {
        alert("Maksimal hanya boleh mengunggah 4 foto!");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const maxSizeBytes = 4 * 1024 * 1024; // 4 MB per file
      const validFiles: File[] = [];
      const validPreviews: string[] = [];

      for (const file of selectedFiles) {
        if (file.size > maxSizeBytes) {
          alert(`File "${file.name}" terlalu besar! Maksimal 4 MB per foto.`);
          continue;
        }
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      }

      setFotos((prev) => [...prev, ...validFiles]);
      setPreviews((prev) => [...prev, ...validPreviews]);

      // Reset input agar bisa pilih file yang sama jika dihapus
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Fungsi untuk menghapus salah satu foto dari list pratinjau
  const handleRemoveFoto = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah terpicunya klik pada kontainer upload
    setFotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSimpanDraft = () => {
    sessionStorage.setItem(
      `draft_laporan_${user.id}`,
      JSON.stringify({ kategori: jenis, isi: deskripsi }),
    );
    alert("Draf disimpan! Kamu akan kembali ke beranda.");
    onBack();
  };

  const handleKirimLaporan = async () => {
    if (!jenis) return alert("Silakan pilih kategori masalah!");

    const trimmedDeskripsi = deskripsi.trim();
    if (!trimmedDeskripsi) return alert("Isi deskripsi laporan wajib diisi!");

    if (trimmedDeskripsi.length < 10) {
      return alert(
        "Deskripsi terlalu pendek! Berikan keterangan minimal 10 karakter.",
      );
    }

    // 1. Proteksi Anti-Spam / Karakter Berulang (Contoh: sawsawsaw, asdasdasd, hahahaha)
    const spamPatternRegex = /(.{2,4})\1{2,}/i;
    
    // 2. Proteksi Keyboard Smash / Ketikan Acak Panjang Tanpa Spasi
    const keyboardSmashRegex = /[a-zA-Z]{20,}/;

    if (spamPatternRegex.test(trimmedDeskripsi) || keyboardSmashRegex.test(trimmedDeskripsi)) {
      return alert("Masukkan deskripsi laporan yang valid dan jelas! Jangan mengetik asal-asalan.");
    }

    // 3. Memastikan minimal berisi huruf normal alfabet
    const validTextRef = /[a-zA-Z]{3,}/;
    if (!validTextRef.test(trimmedDeskripsi)) {
      return alert("Masukkan deskripsi laporan yang menggunakan huruf normal!");
    }

    // Amankan susunan Multipart Form Data
    const formData = new FormData();
    formData.append("id_siswa", user.id);
    formData.append("kategori", jenis);
    formData.append("isi_laporan", trimmedDeskripsi);

    // Lampirkan array file di akhir stream data
    if (fotos.length > 0) {
      fotos.forEach((file) => {
        formData.append("foto", file);
      });
    }

    try {
      const res = await fetch("http://localhost:8080/api/laporan", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        sessionStorage.removeItem(`draft_laporan_${user.id}`);
        alert("Laporan Berhasil Terkirim!");
        onBack();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Gagal mengirim laporan: ${errorData.error || "Terjadi galat internal pada server backend."}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi ke backend!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="px-10 py-5 bg-white border-b flex justify-between items-center shadow-sm">
        <div className="text-xl font-black text-blue-900 italic tracking-tighter">
          SIBY Group
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-300 transition-all"
        >
          Kembali
        </button>
      </nav>

      <div className="flex-grow flex justify-center items-center p-6">
        <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl border border-blue-100 p-10">
          <h1 className="text-3xl font-black text-center mb-10 text-blue-900 tracking-tight italic uppercase">
            Formulir Pengaduan
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">
                  Nama Pengadu
                </label>
                <input
                  type="text"
                  value={user.nama || ""}
                  disabled
                  className="w-full px-5 py-3 rounded-xl bg-gray-100 text-gray-400 border border-gray-200 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">
                  Kelas
                </label>
                <input
                  type="text"
                  value={user.kelas || "-"}
                  disabled
                  className="w-full px-5 py-3 rounded-xl bg-gray-100 text-gray-400 border border-gray-200 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">
                  Jenis Masalah
                </label>
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-900"
                >
                  <option value="">Pilih masalah...</option>
                  <option value="Bullying">Bullying</option>
                  <option value="Fasilitas">Fasilitas</option>
                  <option value="Kekerasan">Kekerasan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">
                  Bukti Foto ({fotos.length}/4)
                </label>
                <div
                  onClick={() =>
                    fotos.length < 4 && fileInputRef.current?.click()
                  }
                  className={`h-32 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center bg-blue-50/30 text-blue-400 overflow-hidden transition-all text-center px-4 ${fotos.length < 4 ? "cursor-pointer hover:bg-blue-50" : "cursor-not-allowed"}`}
                >
                  {previews.length > 0 ? (
                    /* Grid Pratinjau Foto yang Terunggah */
                    <div className="grid grid-cols-4 gap-2 w-full h-full p-2 bg-white">
                      {previews.map((src, index) => (
                        <div
                          key={index}
                          className="relative group w-full h-full rounded-lg overflow-hidden border border-gray-100 shadow-sm"
                        >
                          <img
                            src={src}
                            className="w-full h-full object-cover"
                            alt={`Preview ${index}`}
                          />
                          <button
                            type="button"
                            onClick={(e) => handleRemoveFoto(index, e)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-red-600 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {/* Kotak Tambahan (+) jika jumlah foto masih di bawah 4 */}
                      {previews.length < 4 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-lg font-bold hover:bg-gray-50 transition-colors">
                          +
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl">📤</span>
                      <span className="text-[10px] font-black mt-2 tracking-tighter uppercase">
                        UPLOAD GAMBAR
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold mt-1 normal-case tracking-normal">
                        (Maksimal 4 foto, maks 4 MB per file)
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  multiple
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">
                  Deskripsi
                </label>
                <textarea
                  placeholder="Ceritakan detail masalah..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  maxLength={1000}
                  className="w-full h-32 px-5 py-3 rounded-2xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium text-blue-900"
                ></textarea>
              </div>
            </div>
          </div>
          <div className="flex gap-6 mt-12">
            <button
              onClick={handleSimpanDraft}
              className="flex-1 py-4 bg-blue-500 text-white font-black rounded-2xl shadow-lg uppercase text-sm tracking-widest transition-all active:scale-95 hover:bg-blue-600"
            >
              DRAF
            </button>
            <button
              onClick={handleKirimLaporan}
              className="flex-1 py-4 bg-[#1e1b4b] text-white font-black rounded-2xl shadow-lg uppercase text-sm tracking-widest transition-all active:scale-95 hover:bg-black"
            >
              KIRIM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Laporan;