import React, { useState, useEffect } from "react";
import API_BASE from "./api"; // Menggunakan konfigurasi alamat port global pusat

interface SiswaPending {
  id: number;
  nama: string;
  email: string;
  kelas: string;
  created_at: string;
}

interface Props {
  onBack: () => void;
}

const AdminVerifikasiSiswa: React.FC<Props> = ({ onBack }) => {
  const [listSiswa, setListSiswa] = useState<SiswaPending[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  // Ambil data siswa yang berstatus PENDING menggunakan API_BASE global
  const fetchSiswaPending = () => {
    setLoadingFetch(true);
    fetch(`${API_BASE}/api/admin/siswa-pending`)
      .then((res) => res.json())
      .then((data) => setListSiswa(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Gagal mengambil data siswa pending:", err))
      .finally(() => setLoadingFetch(false));
  };

  useEffect(() => {
    fetchSiswaPending();
  }, []);

  // Fungsi untuk Menyetujui / Mengaktifkan Akun Siswa (AKTIF)
  const handleSetujui = async (id: number, nama: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengaktifkan akun untuk ${nama}?`)) return;
    
    setActionId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/verifikasi-siswa/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      
      if (res.ok) {
        alert(`Akun ${nama} berhasil diaktifkan!`);
        setListSiswa((prev) => prev.filter((siswa) => siswa.id !== id));
      } else {
        alert("Gagal memverifikasi siswa.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setActionId(null);
    }
  };

  // Fungsi untuk Menolak / Menghapus Akun Palsu secara Permanen
  const handleTolak = async (id: number, nama: string) => {
    if (!window.confirm(`PERINGATAN!\nApakah Anda yakin ingin menolak dan menghapus pendaftaran akun atas nama "${nama}"? Data akan dihapus permanen.`)) return;
    
    setActionId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/tolak-siswa/${id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        alert(`Pendaftaran akun "${nama}" telah ditolak dan dihapus.`);
        setListSiswa((prev) => prev.filter((siswa) => siswa.id !== id));
      } else {
        alert("Gagal menolak pendaftaran.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setActionId(null);
    }
  };

  const formatTanggalJam = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date) + " WITA";
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans text-left">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-black text-[#1e3a8a] italic uppercase tracking-tighter">
            Persetujuan Akun Siswa Baru
          </h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">
            Verifikasi identitas pendaftar untuk keamanan database sekolah
          </p>
        </div>
        <button
          onClick={onBack}
          className="bg-slate-500 text-white px-8 py-2 rounded-full font-bold uppercase text-[10px] shadow-md hover:bg-[#1e3a8a] transition-all active:scale-95 tracking-widest"
        >
          Kembali
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="max-w-6xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1e3a8a] text-white uppercase text-[10px] tracking-[0.2em] font-black">
              <th className="px-10 py-6">Tanggal Daftar</th>
              <th className="px-10 py-6">Nama Lengkap</th>
              <th className="px-10 py-6">Email / Akun</th>
              <th className="px-10 py-6 text-center">Kelas</th>
              <th className="px-10 py-6 text-center">Tindakan Verifikasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loadingFetch ? (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                  Sedang memuat data pendaftar baru...
                </td>
              </tr>
            ) : listSiswa.length > 0 ? (
              listSiswa.map((siswa) => (
                <tr
                  key={siswa.id}
                  className="hover:bg-blue-50/30 transition-all duration-200"
                >
                  <td className="px-10 py-6 text-xs font-black text-gray-400 uppercase">
                    {formatTanggalJam(siswa.created_at)}
                  </td>
                  <td className="px-10 py-6">
                    <p className="font-black text-[#1e3a8a] text-base uppercase tracking-tight">
                      {siswa.nama}
                    </p>
                  </td>
                  <td className="px-10 py-6 font-medium text-gray-500 text-sm">
                    {siswa.email}
                  </td>
                  <td className="px-10 py-6 text-center font-black text-gray-600">
                    {siswa.kelas || "-"}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleSetujui(siswa.id, siswa.nama)}
                        disabled={actionId !== null}
                        className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all disabled:bg-gray-300"
                      >
                        {actionId === siswa.id ? "Proses..." : "✓ Setujui"}
                      </button>

                      <button
                        onClick={() => handleTolak(siswa.id, siswa.nama)}
                        disabled={actionId !== null}
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all disabled:bg-gray-300"
                      >
                        {actionId === siswa.id ? "Proses..." : "✕ Tolak"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-24 text-center text-gray-300 italic font-black uppercase tracking-widest text-sm"
                >
                  Bersih! Tidak ada permintaan verifikasi akun siswa baru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVerifikasiSiswa;