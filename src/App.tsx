import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Beranda from "./Beranda";
import Laporan from "./Laporan";
import Konsultasi from "./Konsultasi";
import BerandaAdmin from "./BerandaAdmin";
import BerandaKepsek from "./BerandaKepsek";
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

  // State kunci untuk mengingat halaman asal (Beranda/Riwayat)
  const [previousPage, setPreviousPage] = useState<string>("beranda");

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

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
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(savedUser);

    if (role === "admin") {
      setCurrentPage("admin_beranda");
    } else if (role === "kepala sekolah") {
      setCurrentPage("kepsek_beranda");
    } else {
      setCurrentPage("beranda");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setCurrentPage("login");
  };

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
            setPreviousPage("beranda");
            setSelectedData(item);
            setCurrentPage("detail_laporan");
          }}
          onLihatDetailKonsultasi={(item: any) => {
            setPreviousPage("beranda");
            setSelectedData(item);
            setCurrentPage("detail_konsultasi");
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
            setPreviousPage("riwayat_laporan");
            setSelectedData(item);
            setCurrentPage("detail_laporan");
          }}
        />
      )}

      {currentPage === "riwayat_konsultasi" && (
        <RiwayatKonsultasi
          onBack={() => setCurrentPage("beranda")}
          // PERBAIKAN: Menggunakan onDetail agar sinkron dengan file RiwayatKonsultasi.tsx
          onLihatDetail={(item: any) => {
            setPreviousPage("riwayat_konsultasi");
            setSelectedData(item);
            setCurrentPage("detail_konsultasi");
          }}
        />
      )}

      {/* --- DETAIL SISWA (DENGAN SMART BACK) --- */}
      {currentPage === "detail_laporan" && (
        <DetailLaporan
          onBack={() => {
            if (user?.role === "admin" || user?.role === "kepala sekolah") {
              setCurrentPage("admin_lihat_laporan");
            } else {
              setCurrentPage(previousPage);
            }
          }}
          selectedData={selectedData}
        />
      )}

      {currentPage === "detail_konsultasi" && (
        <DetailKonsultasi
          onBack={() => {
            if (user?.role === "admin" || user?.role === "kepala sekolah") {
              setCurrentPage("admin_lihat_konsultasi");
            } else {
              setCurrentPage(previousPage);
            }
          }}
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

      {/* --- PANEL MONITORING --- */}
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