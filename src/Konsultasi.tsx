import { useState, useEffect } from "react";

interface Props {
  onBack: () => void;
  onSent: () => void;
}

const Konsultasi: React.FC<Props> = ({ onBack, onSent }) => {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const [listGuru, setListGuru] = useState<any[]>([]);
  const [idGuru, setIdGuru] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [topik, setTopik] = useState("");

  // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD untuk membatasi kalender
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch("http://localhost:8080/api/guru")
      .then((res) => res.json())
      .then((data) => {
        setListGuru(data);
        if (data.length > 0) setIdGuru(data[0].id_guru);
      });
  }, []);

  const handleKirim = async () => {
    if (!tanggal || !jam)
      return alert("Pilih tanggal dan jam terlebih dahulu!");

    const trimmedTopik = topik.trim();
    if (!trimmedTopik) return alert("Silakan isi topik masalah konsultasi!");

    if (trimmedTopik.length < 10) {
      return alert("Topik terlalu pendek! Berikan keterangan minimal 10 karakter.");
    }

    // 1. Proteksi Anti-Spam / Karakter Suku Kata Berulang (Contoh: awawaw, asdasd, sawsawsaw)
    const spamPatternRegex = /(.{2,4})\1{2,}/i;

    // 2. Proteksi Keyboard Smash / Ketikan Acak Panjang Tanpa Spasi
    const keyboardSmashRegex = /[a-zA-Z]{20,}/;

    if (spamPatternRegex.test(trimmedTopik) || keyboardSmashRegex.test(trimmedTopik)) {
      return alert("Masukkan topik masalah yang valid dan jelas! Jangan mengetik asal-asalan.");
    }

    // 3. Memastikan teks mengandung huruf alfabet normal
    const validTextRegex = /[a-zA-Z]{3,}/;
    if (!validTextRegex.test(trimmedTopik)) {
      return alert("Masukkan topik konsultasi menggunakan huruf normal!");
    }

    const dateObj = new Date(tanggal);
    const day = dateObj.getDay(); // 0 = Minggu, 6 = Sabtu

    // Validasi Hari Kerja (Senin - Jumat)
    if (day === 0 || day === 6) {
      alert("Maaf, konsultasi tidak tersedia di hari Sabtu dan Minggu.");
      return;
    }

    // Validasi Jam Operasional (07:00 - 15:00)
    const jamTerpilih = parseInt(jam.split(":")[0]);
    const menitTerpilih = parseInt(jam.split(":")[1]);

    if (
      jamTerpilih < 7 ||
      (jamTerpilih === 15 && menitTerpilih > 0) ||
      jamTerpilih > 15
    ) {
      alert(
        "Maaf, layanan konsultasi hanya tersedia pukul 07:00 - 15:00 WITA.",
      );
      return;
    }

    // Daftar Hari Libur Nasional (Manual)
    const holidayList = ["2026-05-01", "2026-05-13", "2026-06-01"];

    if (holidayList.includes(tanggal)) {
      alert("Maaf, tanggal yang Anda pilih adalah hari libur nasional.");
      return;
    }

    const res = await fetch("http://localhost:8080/api/konsultasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_siswa: user.id,
        id_guru: idGuru,
        tanggal,
        jam,
        topik: trimmedTopik,
      }),
    });

    if (res.ok) {
      alert("Berhasil Terkirim!");
      onSent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border border-blue-50">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-4xl text-blue-900 hover:scale-110 transition-transform">
            ↩
          </button>
          <h1 className="text-xl font-black text-blue-900 uppercase italic tracking-tighter">
            Janji Konsultasi
          </h1>
        </div>
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Pilih Guru
            </label>
            <select
              value={idGuru}
              onChange={(e) => setIdGuru(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-600 outline-none cursor-pointer"
            >
              {listGuru.map((g) => (
                <option key={g.id_guru} value={g.id_guru}>
                  {g.nama_guru}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                min={today}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-600 outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">
                Jam Kelulusan
              </label>
              <input
                type="time"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-600 outline-none cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">
              Topik Masalah
            </label>
            <textarea
              placeholder="Ceritakan singkat topik masalah..."
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              maxLength={255}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-600 h-32 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>
          <button
            onClick={handleKirim}
            className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-black mt-2 text-xs"
          >
            Kirim Permintaan
          </button>
        </div>
        
        {/* Teks Jam Operasional - Diperjelas warna & keterbacaannya */}
        <div className="text-center mt-6 border-t border-gray-100 pt-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
            🕒 Operasional: 07.00 - 15.00 WITA
          </p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-0.5">
            Hari Kerja: Senin - Jumat
          </p>
        </div>
      </div>
    </div>
  );
};

export default Konsultasi;