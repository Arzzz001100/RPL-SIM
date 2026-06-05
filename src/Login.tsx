import React, { useState } from "react";
import API_BASE from "./api";

interface Props {
  onSwitch: () => void;
  onLogin: (role: string) => void;
  onLupaPassword: () => void;
}

const Login: React.FC<Props> = ({ onSwitch, onLogin, onLupaPassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // PERBAIKAN: Langsung mengarah ke port backend aktif (8080) agar tidak tersesat ke port lama
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user.role);
      } else {
        alert(data.message || "Email atau Password salah!");
      }
    } catch (error) {
      alert(
        "Gagal terhubung ke server. Pastikan backend di port 8080 menyala."
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1e3a8a]">
      {/* Efek Dekorasi Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/20 rounded-full -mr-20 -mb-20 blur-3xl"></div>

      <div className="bg-white/10 backdrop-blur-xl px-8 py-7 rounded-[40px] shadow-2xl w-[80%] max-w-[340px] border border-white/20 text-center flex flex-col items-center relative z-10">
        {/* Header Section */}
        <div className="mb-3">
          <h1 className="text-white font-black text-lg tracking-tighter italic uppercase leading-tight">
            Sistem Pengaduan Masalah
          </h1>
          <p className="text-white/70 text-[9px] mt-1 font-bold uppercase tracking-[0.3em]">
            SMP TRIDHARMA MANADO
          </p>
        </div>

        {/* Logo Section */}
        <div className="group mb-5">
          <div className="w-28 h-28 bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center p-3 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 cursor-pointer">
            <img
              src="/logo-sekolah.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Form Section */}
        <form className="w-full space-y-3" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-white/10 text-white text-sm placeholder-white/40 outline-none border border-white/10 focus:border-white/40 focus:bg-white/20 transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-white/10 text-white text-sm placeholder-white/40 outline-none border border-white/10 focus:border-white/40 focus:bg-white/20 transition-all"
            required
          />

          {/* Link Lupa Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={onLupaPassword}
              className="text-white/50 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-all"
            >
              Lupa Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-white text-[#1e3a8a] font-black rounded-2xl shadow-xl transition-all hover:bg-gray-100 active:scale-95 uppercase tracking-[0.2em] text-xs"
          >
            Masuk
          </button>
        </form>

        {/* Switch Section */}
        <p className="mt-5 text-[10px] text-white/60 font-medium uppercase tracking-widest">
          Belum punya akun?{" "}
          <button
            onClick={onSwitch}
            className="text-white border-b border-white hover:text-blue-200 hover:border-blue-200 transition-all ml-1 font-black"
          >
            Buat akun
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;