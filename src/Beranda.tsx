import React, { useState, useEffect } from "react";

interface Props {
  onLogout: () => void;
  onTambahLaporan: () => void;
  onGoKonsultasi: () => void;
  onLihatDetail: (item: any) => void;
  onLihatDetailKonsultasi: (item: any) => void;
  onGoRiwayat: () => void;
  onGoRiwayatLapor: () => void;
}

const Beranda: React.FC<Props> = ({
  onLogout,
  onTambahLaporan,
  onGoKonsultasi,
  onLihatDetail,
  onLihatDetailKonsultasi,
  onGoRiwayat,
  onGoRiwayatLapor,
}) => {
  const [riwayatLaporan, setRiwayatLaporan] = useState<any[]>([]);
  const [riwayatKonsultasi, setRiwayatKonsultasi] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      if (!user.id) return;
      try {
        const resLapor = await fetch(
          `http://localhost:8080/api/laporan/user/${user.id}`,
        );
        if (resLapor.ok) {
          const dataLapor = await resLapor.json();
          setRiwayatLaporan(Array.isArray(dataLapor) ? dataLapor : []);
        }
        const resKonsul = await fetch(
          `http://localhost:8080/api/riwayat/${user.id}`,
        );
        if (resKonsul.ok) {
          const dataKonsul = await resKonsul.json();
          setRiwayatKonsultasi(Array.isArray(dataKonsul) ? dataKonsul : []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
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
    <div className="h-screen w-full bg-white font-sans text-left overflow-y-auto pb-10">
      <nav className="flex justify-between items-center px-10 py-6 border-b border-gray-100 bg-white sticky top-0 z-20">
        <h1 className="text-2xl font-black text-[#1e3a8a] italic tracking-tighter uppercase">
          SIBY Group
        </h1>
        <div className="flex items-center gap-8 font-bold text-sm">
          <button className="text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1 uppercase">
            Beranda
          </button>
          <button
            onClick={onGoKonsultasi}
            className="text-gray-400 hover:text-[#1e3a8a] transition-all uppercase"
          >
            Konsultasi
          </button>
          <button
            onClick={onLogout}
            className="bg-[#ef4444] text-white px-6 py-2 rounded-full shadow-lg active:scale-95 transition-all uppercase tracking-widest text-[10px]"
          >
            Log out
          </button>
        </div>
      </nav>

      {/* BANNER UTAMA */}
      <div className="mx-10 mt-6 bg-[#1e3a8a] rounded-[40px] py-14 text-center shadow-xl flex flex-col items-center relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

        <h2 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tight relative z-10">
          Sistem Pengaduan Masalah
        </h2>
        <p className="text-white font-bold tracking-[0.3em] mb-10 text-[10px] relative z-10">
          SMP TRIDHARMA MANADO
        </p>

        {/* LOGO SEKOLAH - Dibuat Mencolok dengan Kontainer Putih Solid */}
        <div className="mb-10 relative z-10 group">
          <div className="bg-white p-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] cursor-pointer">
            <img
              src="/logo-sekolah.png"
              alt="Logo Sekolah"
              className="h-24 w-24 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>

        <button
          onClick={onTambahLaporan}
          className="bg-blue-500 text-white font-black px-12 py-4 rounded-2xl shadow-lg uppercase text-sm hover:bg-blue-400 active:scale-95 transition-all relative z-10"
        >
          Buat Pengaduan!
        </button>
      </div>

      <div className="mx-10 mt-12 mb-20 grid grid-cols-1 md:grid-cols-2 gap-10">
        <section>
          <div className="flex justify-between items-center mb-6 border-l-4 border-blue-500 pl-4">
            <h3 className="text-xl font-black text-[#1e3a8a] uppercase italic">
              Riwayat Pengaduan
            </h3>
            <button
              onClick={onGoRiwayatLapor}
              className="text-[10px] font-black text-blue-500 underline uppercase"
            >
              Lihat Semua ↩
            </button>
          </div>
          <div className="space-y-4">
            {riwayatLaporan.length > 0 ? (
              riwayatLaporan.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onLihatDetail(item)}
                  className="bg-white p-6 rounded-[30px] shadow-md border border-gray-100 flex justify-between items-center cursor-pointer hover:border-blue-300 transition-all"
                >
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                      {formatTanggal(item.tanggal_lapor)}
                    </p>
                    <p className="font-bold text-[#1e3a8a] uppercase">
                      Kasus {item.kategori}
                    </p>
                  </div>
                  <span className="bg-[#1e3a8a] text-white px-4 py-1 rounded-full text-[9px] font-black uppercase">
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-300 font-bold italic ml-4">
                Belum ada laporan...
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6 border-l-4 border-orange-500 pl-4">
            <h3 className="text-xl font-black text-[#1e3a8a] uppercase italic">
              Riwayat Konsultasi
            </h3>
            <button
              onClick={onGoRiwayat}
              className="text-[10px] font-black text-orange-500 underline uppercase"
            >
              Lihat Semua ↩
            </button>
          </div>
          <div className="space-y-4">
            {riwayatKonsultasi.length > 0 ? (
              riwayatKonsultasi.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onLihatDetailKonsultasi(item)}
                  className="bg-white p-6 rounded-[30px] shadow-md border border-gray-100 flex justify-between items-center cursor-pointer hover:border-orange-300 transition-all"
                >
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                      {formatTanggal(item.tanggal)}
                    </p>
                    <p className="font-bold text-[#1e3a8a] uppercase">
                      {item.nama_guru || "Guru BK"}
                    </p>
                  </div>
                  <span
                    className={`text-white px-4 py-1 rounded-full text-[9px] font-black uppercase ${item.status === "Selesai" || item.status === "DIPROSES" ? "bg-[#1e3a8a]" : "bg-orange-500"}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-300 font-bold italic ml-4">
                Belum ada jadwal...
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Beranda;