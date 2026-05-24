import React, { useState } from "react";

interface Props {
  onBack: () => void;
}

const SECURITY_QUESTIONS = [
  "Siapa nama lengkap ibu kandungmu?",
  "Di SD mana kamu bersekolah dulu?",
  "Apa nama hewan peliharaan pertamamu?",
  "Apa nama kota kelahiranmu?",
  "Siapa nama guru SD favoritmu?",
];

const LupaPassword: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 — cari akun berdasarkan email
  const handleCariAkun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/forgot-password/question?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (data.success) {
        setSecurityQuestion(data.security_question);
        setStep(2);
      } else {
        alert(data.message || "Email tidak ditemukan.");
      }
    } catch {
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verifikasi jawaban keamanan
  const handleVerifikasiJawaban = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, security_answer: securityAnswer }),
      });
      const data = await res.json();
      if (data.success) {
        setUserId(data.id);
        setStep(3);
      } else {
        alert(data.message || "Jawaban keamanan salah.");
      }
    } catch {
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — reset password baru
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password minimal 8 karakter!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, new_password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Password berhasil diubah! Silakan login dengan password baru.");
        onBack();
      } else {
        alert("Gagal mengubah password. Coba lagi.");
      }
    } catch {
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1e3a8a]">
      {/* Dekorasi Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/20 rounded-full -mr-20 -mb-20 blur-3xl"></div>

      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl w-[90%] max-w-[450px] border border-white/20 flex flex-col items-center relative z-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-white font-black text-3xl tracking-tighter italic uppercase">
            Lupa Password
          </h1>
          <p className="text-white/60 text-[10px] mt-2 font-bold uppercase tracking-[0.3em]">
            Verifikasi identitas akunmu
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === s
                    ? "bg-white text-[#1e3a8a]"
                    : step > s
                    ? "bg-white/40 text-white"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-8 transition-all ${
                    step > s ? "bg-white/40" : "bg-white/10"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ============ STEP 1: Cari Akun ============ */}
        {step === 1 && (
          <form className="w-full space-y-4" onSubmit={handleCariAkun}>
            <div className="space-y-1">
              <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
                Email Akunmu
              </label>
              <input
                type="email"
                placeholder="Masukkan email yang terdaftar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-3.5 rounded-2xl bg-white/10 text-white placeholder-white/30 outline-none border border-white/10 focus:border-white/40 focus:bg-white/20 transition-all"
                required
              />
            </div>
            <p className="text-white/40 text-[10px] text-center px-4">
              Masukkan email yang kamu daftarkan. Kami akan menampilkan pertanyaan keamananmu.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-white text-[#1e3a8a] font-black rounded-2xl shadow-xl transition-all hover:bg-gray-100 active:scale-95 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
            >
              {loading ? "Mencari..." : "Cari Akun →"}
            </button>
          </form>
        )}

        {/* ============ STEP 2: Jawab Pertanyaan Keamanan ============ */}
        {step === 2 && (
          <form className="w-full space-y-4" onSubmit={handleVerifikasiJawaban}>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">
                Pertanyaan Keamanan
              </p>
              <p className="text-white font-semibold text-sm leading-snug">
                {securityQuestion}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
                Jawabanmu
              </label>
              <input
                type="text"
                placeholder="Ketik jawabanmu di sini"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="w-full px-6 py-3.5 rounded-2xl bg-white/10 text-white placeholder-white/30 outline-none border border-white/10 focus:border-white/40 focus:bg-white/20 transition-all"
                required
              />
            </div>
            <p className="text-white/40 text-[10px] text-center px-4">
              Jawaban tidak membedakan huruf besar/kecil.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-white text-[#1e3a8a] font-black rounded-2xl shadow-xl transition-all hover:bg-gray-100 active:scale-95 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Verifikasi →"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 text-white/50 font-bold text-xs uppercase tracking-widest hover:text-white transition-all"
            >
              ← Kembali
            </button>
          </form>
        )}

        {/* ============ STEP 3: Reset Password ============ */}
        {step === 3 && (
          <form className="w-full space-y-4" onSubmit={handleResetPassword}>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
              <p className="text-green-300 text-xs font-black uppercase tracking-widest">
                ✓ Identitas Terverifikasi
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
                Password Baru (min 8 karakter)
              </label>
              <input
                type="password"
                placeholder="Buat password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-6 py-3.5 rounded-2xl bg-white/10 text-white placeholder-white/30 outline-none border border-white/10 focus:border-white/40 focus:bg-white/20 transition-all"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1">
              <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-6 py-3.5 rounded-2xl bg-white/10 text-white placeholder-white/30 outline-none border border-white/10 focus:border-white/40 focus:bg-white/20 transition-all"
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-white text-[#1e3a8a] font-black rounded-2xl shadow-xl transition-all hover:bg-gray-100 active:scale-95 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Password Baru ✓"}
            </button>
          </form>
        )}

        {/* Link kembali ke login */}
        <p className="mt-8 text-xs text-white/60 font-medium uppercase tracking-widest">
          Ingat passwordmu?{" "}
          <button
            onClick={onBack}
            className="text-white border-b border-white hover:text-blue-200 hover:border-blue-200 transition-all ml-1 font-black"
          >
            Masuk
          </button>
        </p>
      </div>
    </div>
  );
};

export default LupaPassword;
