import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Beranda from "./Beranda";
import Laporan from "./Laporan";
import Konsultasi from "./Konsultasi";
import BerandaAdmin from "./BerandaAdmin";
import BerandaKepsek from "./BerandaKepsek"; // Import halaman baru Kepsek
import RiwayatLaporan from "./RiwayatLaporan";
import RiwayatKonsultasi from "./RiwayatKonsultasi";
import DetailLaporan from "./DetailLaporan";
import DetailKonsultasi from "./DetailKonsultasi";
import AdminLihatLaporan from "./AdminLihatLaporan";
import AdminDetailLaporan from "./AdminDetailLaporan";
import AdminLihatKonsultasi from "./AdminLihatKonsultasi";
import AdminDetailKonsultasi from "./AdminDetailKonsultasi";

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<string>("login");
  const [selectedData, setSelectedData] = useState<any>(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // Tentukan halaman beranda berdasarkan role saat aplikasi dimuat
      if (parsedUser.role === "admin") {
        setCurrentPage("admin_beranda");
      } else if (parsedUser.role === "kepala sekolah") {
        setCurrentPage("kepsek_beranda");
      } else {
        setCurrentPage("beranda");
      }
    } else {
      setCurrentPage("login");
    }
  }, []);

  const handleLogin = (role: string) => {
    const savedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    setUser(savedUser);

    // Navigasi otomatis setelah login berdasarkan role
    if (role === "admin") {
      setCurrentPage("admin_beranda");
    } else if (role === "kepala sekolah") {
      setCurrentPage("kepsek_beranda");
    } else {
      setCurrentPage("beranda");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setCurrentPage("login");
  };

  // Proteksi: Jika belum login, hanya boleh lihat Login atau Register
  if (!user && currentPage !== "register") {
    return (
      <Login
        onSwitch={() => setCurrentPage("register")}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="App">
      {/* --- ROUTING SISWA --- */}
      {currentPage === "beranda" && (
        <Beranda
          onLogout={handleLogout}
          onTambahLaporan={() => setCurrentPage("laporan")}
          onGoKonsultasi={() => setCurrentPage("konsultasi")}
          onGoRiwayat={() => setCurrentPage("riwayat_konsultasi")}
          onGoRiwayatLapor={() => setCurrentPage("riwayat_laporan")}
          onLihatDetail={(item: any) => {
            setSelectedData(item);
            setCurrentPage("detail_laporan");
          }}
        />
      )}

      {currentPage === "laporan" && (
        <Laporan onBack={() => setCurrentPage("beranda")} />
      )}

      {currentPage === "konsultasi" && (
        <Konsultasi
          onBack={() => setCurrentPage("beranda")}
          onSent={() => setCurrentPage("beranda")}
        />
      )}

      {currentPage === "riwayat_laporan" && (
        <RiwayatLaporan
          onBack={() => setCurrentPage("beranda")}
          onLihatDetail={(item: any) => {
            setSelectedData(item);
            setCurrentPage("detail_laporan");
          }}
        />
      )}

      {currentPage === "riwayat_konsultasi" && (
        <RiwayatKonsultasi
          onBack={() => setCurrentPage("beranda")}
          onLihatDetail={(item: any) => {
            setSelectedData(item);
            setCurrentPage("detail_konsultasi");
          }}
        />
      )}

      {/* --- DETAIL (DIPAKAI SEMUA ROLE) --- */}
      {currentPage === "detail_laporan" && (
        <DetailLaporan
          onBack={() => {
            if (user?.role === "admin" || user?.role === "kepala sekolah") {
              setCurrentPage("admin_lihat_laporan");
            } else {
              setCurrentPage("riwayat_laporan");
            }
          }}
          selectedData={selectedData}
        />
      )}

      {currentPage === "detail_konsultasi" && (
        <DetailKonsultasi
          onBack={() => setCurrentPage("riwayat_konsultasi")}
          selectedData={selectedData}
        />
      )}

      {/* --- ROUTING ADMIN --- */}
      {currentPage === "admin_beranda" && (
        <BerandaAdmin
          onLogout={handleLogout}
          onGoLaporan={() => setCurrentPage("admin_lihat_laporan")}
          onGoKonsultasi={() => setCurrentPage("admin_lihat_konsultasi")}
        />
      )}

      {/* --- ROUTING KEPALA SEKOLAH --- */}
      {currentPage === "kepsek_beranda" && (
        <BerandaKepsek
          onLogout={handleLogout}
          onGoLaporan={() => setCurrentPage("admin_lihat_laporan")}
          onGoKonsultasi={() => setCurrentPage("admin_lihat_konsultasi")}
        />
      )}

      {/* --- PANEL MONITORING (ADMIN & KEPSEK) --- */}
      {currentPage === "admin_lihat_laporan" && (
        <AdminLihatLaporan
          onBack={() => {
            setCurrentPage(
              user.role === "admin" ? "admin_beranda" : "kepsek_beranda",
            );
          }}
          onDetail={(item: any) => {
            setSelectedData(item);
            setCurrentPage("admin_detail_laporan");
          }}
        />
      )}

      {currentPage === "admin_detail_laporan" && (
        <AdminDetailLaporan
          onBack={() => setCurrentPage("admin_lihat_laporan")}
          selectedData={selectedData}
        />
      )}

      {currentPage === "admin_lihat_konsultasi" && (
        <AdminLihatKonsultasi
          onBack={() => {
            setCurrentPage(
              user.role === "admin" ? "admin_beranda" : "kepsek_beranda",
            );
          }}
          onDetail={(item: any) => {
            setSelectedData(item);
            setCurrentPage("admin_detail_konsultasi");
          }}
        />
      )}

      {currentPage === "admin_detail_konsultasi" && (
        <AdminDetailKonsultasi
          onBack={() => setCurrentPage("admin_lihat_konsultasi")}
          selectedData={selectedData}
        />
      )}

      {/* --- AUTH --- */}
      {currentPage === "register" && (
        <Register onSwitch={() => setCurrentPage("login")} />
      )}
    </div>
  );
};

export default App;
