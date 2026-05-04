import React, { useState } from "react";

interface Props {
  onSwitch: () => void;
  onLogin: (role: string) => void; // Kita tambahkan parameter role di sini
}

const Login: React.FC<Props> = ({ onSwitch, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        // Kirim role (siswa/admin) ke App.tsx
        onLogin(data.user.role);
      } else {
        alert(data.message || "Email atau Password salah!");
      }
    } catch (error) {
      alert(
        "Gagal terhubung ke server. Pastikan backend di port 8080 menyala.",
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1e1b4b]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-black/50 -z-10"></div>
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-[50px] shadow-2xl w-[90%] max-w-[400px] border border-white/20 text-center flex flex-col items-center">
        <div className="mb-6">
          <h1 className="text-white font-bold text-3xl tracking-tight italic">
            SIBY Group
          </h1>
          <p className="text-white text-[10px] mt-1 font-semibold uppercase tracking-[0.3em]">
            SMP TRIDHARMA MANADO
          </p>
        </div>
        <div className="w-28 h-28 bg-white rounded-2xl mb-8 shadow-lg overflow-hidden flex items-center justify-center p-2 border border-white/20">
          <img
            src="/logo-sekolah.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <form className="w-full space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-white/10 text-white placeholder-white/40 outline-none border border-white/10 focus:border-white/30"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-white/10 text-white placeholder-white/40 outline-none border border-white/10 focus:border-white/30"
            required
          />
          <button
            type="submit"
            className="w-full py-4 mt-4 bg-[#1e1b4b] hover:bg-indigo-900 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            Masuk
          </button>
        </form>
        <p className="mt-8 text-sm text-white/80">
          Belum punya akun?{" "}
          <button
            onClick={onSwitch}
            className="text-blue-400 font-bold hover:underline"
          >
            Buat akun
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
