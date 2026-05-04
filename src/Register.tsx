import React, { useState } from "react";

interface Props {
  onSwitch: () => void;
}

const Register: React.FC<Props> = ({ onSwitch }) => {
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password, kelas }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Akun berhasil dibuat! Silakan Login.");
        onSwitch();
      } else {
        alert("Pendaftaran gagal. Pastikan database dbtridharma sudah siap.");
      }
    } catch (err) {
      alert("Server tidak merespon di port 8080.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1e3a8a]">
      {/* Dekorasi Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>

      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl w-[90%] max-w-[450px] border border-white/20 flex flex-col items-center relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-white font-black text-4xl tracking-tighter italic uppercase">
            Daftar Akun
          </h1>
          <p className="text-white/60 text-[10px] mt-2 font-bold uppercase tracking-[0.3em]">
            Bergabung dengan SIBY Group
          </p>
        </div>

        <form className="w-full space-y-4" onSubmit={handleRegister}>
          {/* Input Nama */}
          <div className="space-y-1">
            <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-white/10 text-white placeholder-white/30 outline-none border border-white/10 focus:border-white/40 focus:bg-white/20 transition-all"
              required
            />
          </div>

          {/* Input Kelas */}
          <div className="space-y-1">
            <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
              Kelas
            </label>
            <div className="relative">
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-6 py-3.5 rounded-2xl bg-white/10 text-white outline-none border border-white/10 focus:border-white/40 focus:bg-white/20 transition-all appearance-none cursor-pointer"
                required
              >
                <option value="" disabled className="bg-[#1e3a8a]">
                  Pilih Kelas
                </option>
                <option value="7" className="bg-[#1e3a8a]">
                  Kelas 7
                </option>
                <option value="8" className="bg-[#1e3a8a]">
                  Kelas 8
                </option>
                <option value="9" className="bg-[#1e3a8a]">
                  Kelas 9
                </option>
              </select>
              {/* Icon panah custom */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                ▼
              </div>
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-1">
            <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
              Email
            </label>
            <input
              type="email"
              placeholder="Email aktif"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-white/10 text-white placeholder-white/30 outline-none border border-white/10 focus:border-white/40 focus:bg-white/20 transition-all"
              required
            />
          </div>

          {/* Input Password */}
          <div className="space-y-1">
            <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
              Password (min 8 karakter)
            </label>
            <input
              type="password"
              placeholder="Buat password aman"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-3.5 rounded-2xl bg-white/10 text-white placeholder-white/30 outline-none border border-white/10 focus:border-white/40 focus:bg-white/20 transition-all"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-6 bg-white text-[#1e3a8a] font-black rounded-2xl shadow-xl transition-all hover:bg-gray-100 active:scale-95 uppercase tracking-[0.2em] text-xs"
          >
            Daftar Sekarang
          </button>
        </form>

        <p className="mt-8 text-xs text-white/60 font-medium uppercase tracking-widest">
          Sudah memiliki akun?{" "}
          <button
            onClick={onSwitch}
            className="text-white border-b border-white hover:text-blue-200 hover:border-blue-200 transition-all ml-1 font-black"
          >
            Masuk
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;