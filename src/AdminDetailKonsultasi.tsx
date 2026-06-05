import React, { useState } from "react";

interface Props {
  onBack: () => void;
  selectedData: any;
}

const AdminDetailKonsultasi: React.FC<Props> = ({ onBack, selectedData }) => {
  const [jam, setJam] = useState(selectedData?.jam || "");
  const [linkZoom, setLinkZoom] = useState(selectedData?.link_zoom || "");
  const [pesan, setPesan] = useState(selectedData?.pesan_admin || "");
  const [status, setStatus] = useState(selectedData?.status || "MENUNGGU");
  const [loading, setLoading] = useState(false);

  // --- [ PENGECEKAN ROLE & STATUS KUNCI ] ---
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isKepsek = user.role === "kepala sekolah";
  
  // Otomatis mengunci jika status dari database sudah SELESAI atau DITOLAK
  const statusAwal = selectedData?.status?.toUpperCase();
  const isTerkunciOtomatis = statusAwal === "SELESAI" || statusAwal === "DITOLAK";
  
  // Gabungkan semua kondisi pembatasan akses edit
  const isDisabled = isKepsek || isTerkunciOtomatis;

  const handleUpdate = async () => {
    if (isDisabled) return; // Mencegah eksekusi jika role kepsek atau data sudah final (terkunci)

    const trimmedLink = linkZoom.trim();
    const trimmedPesan = pesan.trim();

    // 1. Validasi Wajib Isi Link & Pesan jika status disetujui/proses (DITERIMA / SELESAI)
    if (status === "DITERIMA" || status === "SELESAI") {
      if (!trimmedLink) return alert("Link pertemuan online (Zoom/Google Meet) wajib diisi!");
      if (!trimmedPesan) return alert("Pesan admin/catatan untuk siswa wajib diisi!");
    }

    // 2. Validasi Struktur Tautan Pertemuan Online (Wajib mengandung zoom.us atau meet.google.com)
    if (trimmedLink) {
      const meetRegex = /(zoom\.us|meet\.google\.com)/i;
      if (!meetRegex.test(trimmedLink)) {
        return alert("Tautan tidak valid! Masukkan Link Zoom atau Google Meet yang benar.");
      }
    }

    // 3. Proteksi SUPER KETAT Anti-Spam & Keyboard Smash di Kolom Pesan Admin
    if (trimmedPesan) {
      if (trimmedPesan.length < 5) {
        return alert("Pesan admin terlalu pendek! Berikan instruksi minimal 5 karakter.");
      }

      const spamPatternRegex = /(.{2,4})\1{1,}/i;
      const keyboardSmashRegex = /[a-zA-Z]{15,}/;

      if (spamPatternRegex.test(trimmedPesan) || keyboardSmashRegex.test(trimmedPesan)) {
        return alert("Masukkan pesan admin yang valid dan jelas! Jangan mengetik asal-asalan.");
      }

      const hurufSaja = trimmedPesan.replace(/[^a-zA-Z]/g, "");
      const kumpulanHurufUnik = Array.from(new Set(hurufSaja.toLowerCase()));
      
      if (hurufSaja.length >= 8 && kumpulanHurufUnik.length <= 4) {
        return alert("Pesan admin terdeteksi berisi ketikan acak. Harap masukkan kalimat yang jelas dan mudah dipahami!");
      }
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/update-konsultasi/${selectedData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jam,
            link_zoom: trimmedLink,
            pesan_admin: trimmedPesan,
            status,
          }),
        },
      );
      if (res.ok) {
        alert("Data Konsultasi Berhasil Diperbarui!");
        onBack();
      } else {
        alert("Gagal memperbarui data konsultasi.");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border border-blue-50">
        <div className="flex items-center gap-4 mb-8 text-left">
          <button onClick={onBack} className="text-4xl text-blue-900">
            ↩
          </button>
          <h1 className="text-xl font-black text-blue-900 uppercase">
            Detail Konsultasi
          </h1>
        </div>

        <div className="space-y-5 text-left">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Siswa & Guru
            </label>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="font-bold text-blue-900 text-sm">
                {selectedData?.nama} ({selectedData?.kelas})
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                Guru: {selectedData?.nama_guru}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                Jam
              </label>
              <input
                type="time"
                value={jam}
                disabled={isDisabled}
                onChange={(e) => setJam(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-600 outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                Status
              </label>
              <select
                value={status}
                disabled={isDisabled}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-600 outline-none disabled:opacity-50"
              >
                <option value="MENUNGGU">MENUNGGU</option>
                <option value="DITERIMA">DITERIMA</option>
                <option value="SELESAI">SELESAI</option>
                <option value="DITOLAK">DITOLAK</option>
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="Link Zoom / Google Meet"
            value={linkZoom}
            disabled={isDisabled}
            onChange={(e) => setLinkZoom(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-600 outline-none disabled:opacity-50"
          />

          <textarea
            placeholder="Pesan admin..."
            value={pesan}
            disabled={isDisabled}
            onChange={(e) => setPesan(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-600 h-24 outline-none disabled:opacity-50 resize-none"
          ></textarea>

          {/* Dinamisasi Tombol: Mengunci klik & mengubah style warna jika data sudah berstatus SELESAI/DITOLAK atau user adalah KEPSEK */}
          <button
            onClick={handleUpdate}
            disabled={loading || isDisabled}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all ${
              isDisabled
                ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-blue-900 text-white active:scale-95 hover:bg-black"
            }`}
          >
            {isKepsek
              ? "Monitoring"
              : isTerkunciOtomatis
                ? "Data Terkunci (Final)"
                : loading
                  ? "Loading..."
                  : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDetailKonsultasi;