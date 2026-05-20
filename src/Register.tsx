import React, { useState } from "react";

interface Props {
  onSwitch: () => void;
}

interface FormErrors {
  nama?: string;
  kelas?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register: React.FC<Props> = ({ onSwitch }) => {
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // State untuk show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── Validasi ───────────────────────────────────────────────────────────────

  const validateNama = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return "Nama lengkap wajib diisi.";
    if (trimmed.length < 3) return "Nama minimal 3 karakter.";
    if (trimmed.length > 60) return "Nama maksimal 60 karakter.";
    if (!/^[a-zA-Z\s.,'-]+$/.test(trimmed))
      return "Nama hanya boleh mengandung huruf dan karakter umum (titik, koma, apostrof).";
    if (!/[a-zA-Z]{2,}/.test(trimmed))
      return "Masukkan nama lengkap yang valid.";
    return undefined;
  };

  const validateKelas = (value: string): string | undefined => {
    if (!value) return "Kelas wajib dipilih.";
    if (!["7", "8", "9"].includes(value)) return "Pilih kelas yang tersedia.";
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return "Email wajib diisi.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmed)) return "Format email tidak valid.";
    if (trimmed.length > 100) return "Email terlalu panjang.";
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return "Password wajib diisi.";
    if (value.length < 8) return "Password minimal 8 karakter.";
    if (value.length > 64) return "Password maksimal 64 karakter.";
    if (!/[A-Z]/.test(value))
      return "Password harus mengandung minimal 1 huruf besar.";
    if (!/[a-z]/.test(value))
      return "Password harus mengandung minimal 1 huruf kecil.";
    if (!/[0-9]/.test(value))
      return "Password harus mengandung minimal 1 angka.";
    if (/^(.)\1+$/.test(value))
      return "Password tidak boleh berupa karakter yang sama semua.";
    return undefined;
  };

  const validateConfirmPassword = (
    value: string,
    passValue: string,
  ): string | undefined => {
    if (!value) return "Konfirmasi password wajib diisi.";
    if (value !== passValue) return "Konfirmasi password tidak cocok.";
    return undefined;
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {
      nama: validateNama(nama),
      kelas: validateKelas(kelas),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  // ─── Handler per field (validasi real-time saat blur) ────────────────────────

  const handleBlurNama = () =>
    setErrors((e) => ({ ...e, nama: validateNama(nama) }));
  const handleBlurEmail = () =>
    setErrors((e) => ({ ...e, email: validateEmail(email) }));
  const handleBlurPassword = () => {
    setErrors((e) => ({
      ...e,
      password: validatePassword(password),
      confirmPassword: confirmPassword
        ? validateConfirmPassword(confirmPassword, password)
        : e.confirmPassword,
    }));
  };
  const handleBlurConfirmPassword = () =>
    setErrors((e) => ({
      ...e,
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    }));

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          email: email.trim().toLowerCase(),
          password,
          kelas,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // PERBAIKAN: Mengedukasi siswa baru agar tahu bahwa akun mereka berstatus PENDING dan butuh persetujuan Guru BK
        alert("Akun berhasil didaftarkan! Silakan hubungi Admin / Guru BK di sekolah untuk proses aktivasi akun Anda.");
        onSwitch(); // Otomatis mengembalikan layar ke form Login
      } else {
        alert(
          data.message ||
            "Pendaftaran gagal. Pastikan database dbtridharma sudah siap.",
        );
      }
    } catch {
      alert("Server tidak merespon di port 8080.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Helper class ─────────────────────────────────────────────────────────────

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-6 py-3.5 rounded-2xl bg-white/10 text-white placeholder-white/30 outline-none border transition-all ${
      errors[field]
        ? "border-red-400 bg-red-500/10"
        : "border-white/10 focus:border-white/40 focus:bg-white/20"
    }`;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1e3a8a]">
      {/* Tag style untuk menyembunyikan scrollbar tanpa merusak layout */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Dekorasi Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>

      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl w-[90%] max-w-[450px] border border-white/20 flex flex-col items-center relative z-10 max-h-[95vh] overflow-y-auto hide-scrollbar">
        <div className="mb-8 text-center">
          <h1 className="text-white font-black text-4xl tracking-tighter italic uppercase">
            Daftar Akun
          </h1>
          <p className="text-white/60 text-[10px] mt-2 font-bold uppercase tracking-[0.3em]">
            SMP Tridharma Manado
          </p>
        </div>

        <form className="w-full space-y-4" onSubmit={handleRegister} noValidate>
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
              onBlur={handleBlurNama}
              className={inputClass("nama")}
              maxLength={60}
              autoComplete="name"
            />
            {errors.nama && (
              <p className="text-red-300 text-[10px] font-semibold ml-4 mt-1">
                {errors.nama}
              </p>
            )}
          </div>

          {/* Input Kelas */}
          <div className="space-y-1">
            <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
              Kelas
            </label>
            <div className="relative">
              <select
                value={kelas}
                onChange={(e) => {
                  setKelas(e.target.value);
                  setErrors((err) => ({
                    ...err,
                    kelas: validateKelas(e.target.value),
                  }));
                }}
                className={`${inputClass("kelas")} appearance-none cursor-pointer`}
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
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                ▼
              </div>
            </div>
            {errors.kelas && (
              <p className="text-red-300 text-[10px] font-semibold ml-4 mt-1">
                {errors.kelas}
              </p>
            )}
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
              onBlur={handleBlurEmail}
              className={inputClass("email")}
              maxLength={100}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-300 text-[10px] font-semibold ml-4 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Input Password */}
          <div className="space-y-1">
            <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Buat password aman"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handleBlurPassword}
                className={`${inputClass("password")} pr-14`}
                maxLength={64}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-xs font-bold uppercase tracking-wider transition-colors select-none"
              >
                {showPassword ? "Sembunyi" : "Lihat"}
              </button>
            </div>

            {/* Checklist syarat password */}
            {password.length > 0 && (
              <div className="mt-2 ml-1 space-y-1">
                {[
                  {
                    ok: password.length >= 8 && password.length <= 64,
                    label: "8–64 karakter",
                  },
                  {
                    ok: /[A-Z]/.test(password),
                    label: "Minimal 1 huruf besar (A-Z)",
                  },
                  {
                    ok: /[a-z]/.test(password),
                    label: "Minimal 1 huruf kecil (a-z)",
                  },
                  {
                    ok: /[0-9]/.test(password),
                    label: "Minimal 1 angka (0-9)",
                  },
                  {
                    ok: !/^(.)\1+$/.test(password),
                    label: "Tidak boleh karakter yang sama semua",
                  },
                ].map(({ ok, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-black transition-colors ${
                        ok ? "text-green-300" : "text-red-400"
                      }`}
                    >
                      {ok ? "✓" : "✗"}
                    </span>
                    <span
                      className={`text-[10px] font-semibold transition-colors ${
                        ok ? "text-green-300" : "text-red-300/80"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}

                {!validatePassword(password) && (
                  <div className="mt-1 inline-flex items-center gap-1 bg-green-500/20 border border-green-400/40 rounded-full px-3 py-0.5">
                    <span className="text-green-300 text-[10px] font-black uppercase tracking-wider">
                      ✓ Password Kuat
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Konfirmasi Password */}
          <div className="space-y-1">
            <label className="text-white/70 text-[10px] font-black uppercase tracking-widest ml-4">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={handleBlurConfirmPassword}
                className={`${inputClass("confirmPassword")} pr-14`}
                maxLength={64}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-xs font-bold uppercase tracking-wider transition-colors select-none"
              >
                {showConfirmPassword ? "Sembunyi" : "Lihat"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-300 text-[10px] font-semibold ml-4 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 bg-white text-[#1e3a8a] font-black rounded-2xl shadow-xl transition-all hover:bg-gray-100 active:scale-95 uppercase tracking-[0.2em] text-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
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